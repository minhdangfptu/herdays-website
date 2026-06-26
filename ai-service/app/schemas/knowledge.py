from enum import Enum

from pydantic import Field

from app.schemas.base import CamelModel


class KnowledgeSourceType(str, Enum):
    blog = "blog"
    document = "document"


class KnowledgeStatus(str, Enum):
    published = "published"
    approved = "approved"
    draft = "draft"
    archived = "archived"
    unpublished = "unpublished"


class KnowledgeDocumentInput(CamelModel):
    source_id: str = Field(min_length=1, max_length=120)
    source_type: KnowledgeSourceType
    title: str = Field(min_length=1, max_length=240)
    url: str | None = Field(default=None, max_length=500)
    status: KnowledgeStatus
    content: str = Field(min_length=1)
    target_statuses: list[str] = Field(default_factory=list, max_length=12)
    tags: list[str] = Field(default_factory=list, max_length=30)
    version: str | None = Field(default=None, max_length=80)


class KnowledgeUpsertRequest(CamelModel):
    documents: list[KnowledgeDocumentInput] = Field(min_length=1, max_length=50)


class KnowledgeDeleteRequest(CamelModel):
    source_ids: list[str] = Field(min_length=1, max_length=100)


class KnowledgeMutationResult(CamelModel):
    accepted_documents: int
    skipped_documents: int
    chunk_count: int
    warnings: list[str] = Field(default_factory=list)

