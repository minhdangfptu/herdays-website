from enum import Enum
from typing import Any, Literal

from pydantic import Field, field_validator

from app.schemas.base import CamelModel


class SessionType(str, Enum):
    guest = "guest"
    member = "member"


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"


class SafetyLevel(str, Enum):
    safe = "safe"
    caution = "caution"
    urgent = "urgent"
    blocked = "blocked"


class CallToActionType(str, Enum):
    shop_customize = "shop_customize"
    app_fallback = "app_fallback"
    contact_support = "contact_support"


class UserContext(CamelModel):
    session_type: SessionType = SessionType.guest
    target_status: str | None = Field(default=None, max_length=80)
    age_group: str | None = Field(default=None, max_length=40)
    personalization_consent: bool = False
    quiz_summary: dict[str, Any] | None = None

    @field_validator("quiz_summary")
    @classmethod
    def reject_sensitive_quiz_fields(cls, value: dict[str, Any] | None) -> dict[str, Any] | None:
        if value is None:
            return value

        sensitive_key = find_sensitive_key(value)
        if sensitive_key:
            raise ValueError(f"quizSummary contains disallowed PII key: {sensitive_key}")
        return value


class ChatHistoryMessage(CamelModel):
    role: MessageRole
    content: str = Field(min_length=1, max_length=2000)


class KnowledgeFilters(CamelModel):
    target_statuses: list[str] = Field(default_factory=list, max_length=8)
    tags: list[str] = Field(default_factory=list, max_length=20)
    limit: int | None = Field(default=None, ge=1, le=20)


class ProductCandidate(CamelModel):
    product_id: str = Field(min_length=1, max_length=120)
    name: str = Field(min_length=1, max_length=200)
    target_statuses: list[str] = Field(default_factory=list, max_length=12)
    recommendation_tags: list[str] = Field(default_factory=list, max_length=30)
    benefits: list[str] = Field(default_factory=list, max_length=12)
    price: float | None = Field(default=None, ge=0)
    currency: str = Field(default="VND", max_length=8)
    is_active: bool = True
    is_customizable: bool = False
    in_stock: bool = True
    customize_url: str | None = Field(default=None, max_length=400)


class ChatRequest(CamelModel):
    conversation_id: str | None = Field(default=None, max_length=120)
    user_message: str = Field(min_length=1, max_length=8000)
    language: Literal["vi"] = "vi"
    user_context: UserContext = Field(default_factory=UserContext)
    history: list[ChatHistoryMessage] = Field(default_factory=list, max_length=20)
    memory_summary: str | None = Field(default=None, max_length=2000)
    knowledge_filters: KnowledgeFilters = Field(default_factory=KnowledgeFilters)
    product_candidates: list[ProductCandidate] = Field(default_factory=list, max_length=20)


class SafetyAssessment(CamelModel):
    level: SafetyLevel
    reasons: list[str] = Field(default_factory=list)
    recommended_action: str | None = None


class Citation(CamelModel):
    source_id: str
    source_type: str
    title: str
    url: str | None = None
    excerpt: str | None = None
    score: float | None = None


class ProductRecommendation(CamelModel):
    product_id: str
    title: str
    reason: str
    benefits: list[str] = Field(default_factory=list)
    customize_url: str | None = None
    confidence: float = Field(ge=0, le=1)


class CallToAction(CamelModel):
    type: CallToActionType
    label: str
    url: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class TokenUsage(CamelModel):
    input_tokens: int | None = None
    output_tokens: int | None = None
    total_tokens: int | None = None


class ChatResponse(CamelModel):
    answer: str
    safety: SafetyAssessment
    citations: list[Citation] = Field(default_factory=list)
    recommended_products: list[ProductRecommendation] = Field(default_factory=list)
    ctas: list[CallToAction] = Field(default_factory=list)
    usage: TokenUsage = Field(default_factory=TokenUsage)
    model: str
    needs_human_support: bool = False


SENSITIVE_KEY_PARTS = (
    "email",
    "phone",
    "address",
    "token",
    "password",
    "fullname",
    "firstname",
    "lastname",
    "birthdate",
    "dateofbirth",
    "userid",
    "memberid",
    "customerid",
    "identity",
)


def find_sensitive_key(value: Any) -> str | None:
    if isinstance(value, dict):
        for key, child in value.items():
            normalized = str(key).lower().replace("_", "").replace("-", "")
            if any(part in normalized for part in SENSITIVE_KEY_PARTS):
                return str(key)

            match = find_sensitive_key(child)
            if match:
                return match

    if isinstance(value, list):
        for child in value:
            match = find_sensitive_key(child)
            if match:
                return match

    return None
