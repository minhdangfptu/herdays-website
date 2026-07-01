from dataclasses import dataclass
from datetime import UTC, datetime
import logging
import re
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import Settings
from app.schemas.chat import KnowledgeFilters


logger = logging.getLogger(__name__)


@dataclass(slots=True)
class KnowledgeChunkResult:
    source_id: str
    source_type: str
    title: str
    url: str | None
    content: str
    score: float | None


class KnowledgeRepository:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client: AsyncIOMotorClient | None = None
        self._collection: Any | None = None

        if settings.mongodb_uri:
            self._client = AsyncIOMotorClient(settings.mongodb_uri)
            database = self._client[settings.mongodb_db_name]
            self._collection = database[settings.mongodb_vector_collection]

    @property
    def is_configured(self) -> bool:
        return self._collection is not None

    async def search(
        self,
        query_embedding: list[float],
        filters: KnowledgeFilters,
        limit: int,
        query_text: str | None = None,
    ) -> list[KnowledgeChunkResult]:
        if self._collection is None:
            return []

        vector_limit = max(limit, 1)
        match_filter = build_match_filter(filters)

        if query_embedding:
            try:
                chunks = await self._vector_search(query_embedding, match_filter, vector_limit)
                if chunks:
                    return chunks
            except Exception:
                logger.exception("MongoDB vector search failed; falling back to lexical search.")

        return await self._lexical_search(query_text or "", match_filter, vector_limit)

    async def _vector_search(
        self,
        query_embedding: list[float],
        match_filter: dict[str, Any],
        limit: int,
    ) -> list[KnowledgeChunkResult]:
        pipeline = [
            {
                "$vectorSearch": {
                    "index": self.settings.mongodb_vector_index,
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": max(100, limit * 10),
                    "limit": min(limit * 4, 50),
                }
            },
            {"$match": match_filter},
            {"$project": project_fields(score={"$meta": "vectorSearchScore"})},
            {"$limit": limit},
        ]

        return await collect_chunks(self._collection.aggregate(pipeline))

    async def _lexical_search(
        self,
        query_text: str,
        match_filter: dict[str, Any],
        limit: int,
    ) -> list[KnowledgeChunkResult]:
        tokens = build_search_tokens(query_text)
        if not tokens:
            return []

        token_filters = [
            {
                "$or": [
                    {"title": {"$regex": token, "$options": "i"}},
                    {"content": {"$regex": token, "$options": "i"}},
                    {"tags": {"$regex": token, "$options": "i"}},
                ]
            }
            for token in tokens
        ]

        pipeline = [
            {"$match": {"$and": [match_filter, {"$or": token_filters}]}},
            {"$addFields": {"titleMatch": {"$regexMatch": {"input": "$title", "regex": tokens[0], "options": "i"}}}},
            {"$sort": {"titleMatch": -1, "updatedAt": -1, "createdAt": -1}},
            {"$project": project_fields(score=None)},
            {"$limit": limit},
        ]

        return await collect_chunks(self._collection.aggregate(pipeline))

    async def replace_source_chunks(self, source_id: str, chunks: list[dict[str, Any]]) -> int:
        if self._collection is None:
            return 0

        now = datetime.now(UTC)
        await self._collection.delete_many({"sourceId": source_id})

        if not chunks:
            return 0

        prepared = [{**chunk, "createdAt": now, "updatedAt": now} for chunk in chunks]
        result = await self._collection.insert_many(prepared)
        return len(result.inserted_ids)

    async def delete_sources(self, source_ids: list[str]) -> int:
        if self._collection is None:
            return 0

        result = await self._collection.delete_many({"sourceId": {"$in": source_ids}})
        return int(result.deleted_count)


def build_match_filter(filters: KnowledgeFilters) -> dict[str, Any]:
    match_filter: dict[str, Any] = {"status": {"$in": ["published", "approved"]}}

    if filters.target_statuses:
        match_filter["$or"] = [
            {"targetStatuses": {"$in": filters.target_statuses}},
            {"targetStatuses": {"$size": 0}},
        ]

    if filters.tags:
        match_filter["tags"] = {"$in": filters.tags}

    return match_filter


def build_search_tokens(query_text: str) -> list[str]:
    raw_tokens = re.findall(r"[\w]+", query_text.lower(), flags=re.UNICODE)
    tokens = []
    for token in raw_tokens:
        if len(token) < 3:
            continue
        escaped = re.escape(token)
        if escaped not in tokens:
            tokens.append(escaped)
    return tokens[:5]


def project_fields(score: Any) -> dict[str, Any]:
    project = {
        "_id": 0,
        "sourceId": 1,
        "sourceType": 1,
        "title": 1,
        "url": 1,
        "content": 1,
    }
    if score is not None:
        project["score"] = score
    return project


async def collect_chunks(cursor: Any) -> list[KnowledgeChunkResult]:
    chunks: list[KnowledgeChunkResult] = []
    async for item in cursor:
        chunks.append(
            KnowledgeChunkResult(
                source_id=item["sourceId"],
                source_type=item["sourceType"],
                title=item["title"],
                url=item.get("url"),
                content=item["content"],
                score=item.get("score"),
            )
        )
    return chunks
