from functools import lru_cache

from app.core.config import Settings, get_settings
from app.services.chat_service import ChatService
from app.services.knowledge_service import KnowledgeService
from app.services.openai_provider import OpenAIProvider
from app.services.retrieval import KnowledgeRepository
from app.services.safety import SafetyService


@lru_cache
def get_safety_service() -> SafetyService:
    return SafetyService()


@lru_cache
def get_openai_provider() -> OpenAIProvider:
    return OpenAIProvider(get_settings())


@lru_cache
def get_knowledge_repository() -> KnowledgeRepository:
    return KnowledgeRepository(get_settings())


def get_chat_service() -> ChatService:
    settings: Settings = get_settings()
    return ChatService(
        settings=settings,
        safety_service=get_safety_service(),
        provider=get_openai_provider(),
        repository=get_knowledge_repository(),
    )


def get_knowledge_service() -> KnowledgeService:
    return KnowledgeService(
        repository=get_knowledge_repository(),
        provider=get_openai_provider(),
    )

