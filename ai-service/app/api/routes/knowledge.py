from fastapi import APIRouter, Depends

from app.api.deps import get_knowledge_service
from app.core.security import verify_service_token
from app.schemas.knowledge import (
    KnowledgeDeleteRequest,
    KnowledgeMutationResult,
    KnowledgeUpsertRequest,
)
from app.services.knowledge_service import KnowledgeService


router = APIRouter(
    prefix="/knowledge",
    tags=["knowledge"],
    dependencies=[Depends(verify_service_token)],
)


@router.post("/documents", response_model=KnowledgeMutationResult)
async def upsert_documents(
    payload: KnowledgeUpsertRequest,
    service: KnowledgeService = Depends(get_knowledge_service),
) -> KnowledgeMutationResult:
    return await service.upsert_documents(payload)


@router.post("/documents/delete", response_model=KnowledgeMutationResult)
async def delete_documents(
    payload: KnowledgeDeleteRequest,
    service: KnowledgeService = Depends(get_knowledge_service),
) -> KnowledgeMutationResult:
    return await service.delete_documents(payload.source_ids)

