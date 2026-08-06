from dataclasses import dataclass
from datetime import UTC, datetime
import logging
import re
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import Settings
from app.schemas.chat import KnowledgeFilters
from app.services.text_utils import normalize_text


logger = logging.getLogger(__name__)

LEXICAL_STOP_WORDS = {
    "ai",
    "ban",
    "bi",
    "cho",
    "co",
    "cua",
    "dang",
    "den",
    "duoc",
    "gai",
    "gi",
    "giup",
    "hay",
    "khong",
    "la",
    "lam",
    "minh",
    "mot",
    "nen",
    "nhu",
    "thang",
    "thi",
    "toi",
    "va",
    "ve",
}
LEXICAL_QUERY_EXPANSIONS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("den thang", ("kinh", "nguyệt")),
    ("toi thang", ("kinh", "nguyệt")),
    ("ky kinh", ("kinh", "nguyệt")),
    ("hanh kinh", ("kinh", "nguyệt")),
)


@dataclass(slots=True)
class KnowledgeChunkResult:
    source_id: str
    source_type: str
    title: str
    url: str | None
    content: str
    score: float | None
    tags: tuple[str, ...] = ()


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
        search_terms = build_search_terms(query_text)
        if not search_terms:
            return []

        tokens = [re.escape(term) for term in search_terms]
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
            {"$sort": {"updatedAt": -1, "createdAt": -1}},
            {"$project": project_fields(score=None)},
            {"$limit": min(max(limit * 40, 100), 200)},
        ]

        chunks = await collect_chunks(self._collection.aggregate(pipeline))
        return rank_lexical_results(chunks, search_terms, limit)

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
    return [re.escape(term) for term in build_search_terms(query_text)]


def build_search_terms(query_text: str) -> list[str]:
    normalized_query = normalize_text(query_text)
    terms: list[str] = []

    for phrase, expansions in LEXICAL_QUERY_EXPANSIONS:
        if phrase in normalized_query:
            terms.extend(expansions)

    raw_tokens = re.findall(r"[\w]+", query_text.casefold(), flags=re.UNICODE)
    for token in raw_tokens:
        normalized_token = normalize_text(token)
        if len(normalized_token) < 3 or normalized_token in LEXICAL_STOP_WORDS:
            continue
        terms.append(token)

    unique_terms: list[str] = []
    seen: set[str] = set()
    for term in terms:
        key = term.casefold()
        if key in seen:
            continue
        seen.add(key)
        unique_terms.append(term)

    return unique_terms[:12]


def tokenize_result_text(value: str) -> set[str]:
    return set(re.findall(r"[\w]+", value.casefold(), flags=re.UNICODE))


def count_term_hits(terms: list[str], value: str) -> int:
    tokens = tokenize_result_text(value)
    return sum(1 for term in terms if term.casefold() in tokens)


def rank_lexical_results(
    chunks: list[KnowledgeChunkResult],
    search_terms: list[str],
    limit: int,
) -> list[KnowledgeChunkResult]:
    best_by_source: dict[str, tuple[int, int, KnowledgeChunkResult]] = {}

    for position, chunk in enumerate(chunks):
        title_hits = count_term_hits(search_terms, chunk.title)
        tag_hits = count_term_hits(search_terms, " ".join(chunk.tags))
        content_hits = count_term_hits(search_terms, chunk.content)
        lexical_score = (title_hits * 6) + (tag_hits * 4) + content_hits
        if lexical_score <= 0:
            continue

        current = best_by_source.get(chunk.source_id)
        if current is None or lexical_score > current[0]:
            chunk.score = float(lexical_score)
            best_by_source[chunk.source_id] = (lexical_score, position, chunk)

    ranked = sorted(
        best_by_source.values(),
        key=lambda item: (-item[0], item[1]),
    )
    return [item[2] for item in ranked[:limit]]


def project_fields(score: Any) -> dict[str, Any]:
    project = {
        "_id": 0,
        "sourceId": 1,
        "sourceType": 1,
        "title": 1,
        "url": 1,
        "content": 1,
        "tags": 1,
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
                tags=tuple(item.get("tags") or ()),
            )
        )
    return chunks
