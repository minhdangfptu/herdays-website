from app.schemas.knowledge import (
    KnowledgeDocumentInput,
    KnowledgeMutationResult,
    KnowledgeStatus,
    KnowledgeUpsertRequest,
)
from app.services.openai_provider import OpenAIProvider, ProviderError
from app.services.retrieval import KnowledgeRepository
from app.services.text_utils import compact_text


INDEXABLE_STATUSES = {KnowledgeStatus.published, KnowledgeStatus.approved}


class KnowledgeService:
    def __init__(self, repository: KnowledgeRepository, provider: OpenAIProvider) -> None:
        self.repository = repository
        self.provider = provider

    async def upsert_documents(self, payload: KnowledgeUpsertRequest) -> KnowledgeMutationResult:
        warnings: list[str] = []

        if not self.repository.is_configured:
            return KnowledgeMutationResult(
                accepted_documents=0,
                skipped_documents=len(payload.documents),
                chunk_count=0,
                warnings=["mongodb_not_configured"],
            )

        if not self.provider.is_configured:
            return KnowledgeMutationResult(
                accepted_documents=0,
                skipped_documents=len(payload.documents),
                chunk_count=0,
                warnings=["openai_not_configured"],
            )

        accepted_documents = 0
        skipped_documents = 0
        chunk_count = 0

        for document in payload.documents:
            if document.status not in INDEXABLE_STATUSES:
                skipped_documents += 1
                warnings.append(f"skipped_non_indexable_status:{document.source_id}")
                await self.repository.replace_source_chunks(document.source_id, [])
                continue

            chunks = build_chunks(document)
            try:
                embeddings = await self.provider.embed_texts([chunk["content"] for chunk in chunks])
            except ProviderError:
                skipped_documents += 1
                warnings.append(f"embedding_failed:{document.source_id}")
                continue

            prepared_chunks = [
                {**chunk, "embedding": embedding}
                for chunk, embedding in zip(chunks, embeddings, strict=False)
                if embedding
            ]

            inserted = await self.repository.replace_source_chunks(
                document.source_id,
                prepared_chunks,
            )
            accepted_documents += 1
            chunk_count += inserted

        return KnowledgeMutationResult(
            accepted_documents=accepted_documents,
            skipped_documents=skipped_documents,
            chunk_count=chunk_count,
            warnings=warnings,
        )

    async def delete_documents(self, source_ids: list[str]) -> KnowledgeMutationResult:
        if not self.repository.is_configured:
            return KnowledgeMutationResult(
                accepted_documents=0,
                skipped_documents=len(source_ids),
                chunk_count=0,
                warnings=["mongodb_not_configured"],
            )

        deleted_chunks = await self.repository.delete_sources(source_ids)
        return KnowledgeMutationResult(
            accepted_documents=len(source_ids),
            skipped_documents=0,
            chunk_count=deleted_chunks,
        )


def build_chunks(document: KnowledgeDocumentInput) -> list[dict[str, object]]:
    content = compact_text(document.content)
    text_chunks = chunk_text(content)

    return [
        {
            "sourceId": document.source_id,
            "sourceType": document.source_type.value,
            "title": document.title,
            "url": document.url,
            "status": document.status.value,
            "content": chunk,
            "chunkIndex": index,
            "targetStatuses": document.target_statuses,
            "tags": document.tags,
            "version": document.version,
        }
        for index, chunk in enumerate(text_chunks)
    ]


def chunk_text(value: str, max_chars: int = 1200, overlap: int = 160) -> list[str]:
    if len(value) <= max_chars:
        return [value]

    chunks: list[str] = []
    start = 0

    while start < len(value):
        end = min(start + max_chars, len(value))
        chunk = value[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= len(value):
            break

        start = max(end - overlap, start + 1)

    return chunks

