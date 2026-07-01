import logging

from app.core.config import Settings
from app.schemas.chat import (
    CallToAction,
    CallToActionType,
    ChatRequest,
    ChatResponse,
    Citation,
    ProductCandidate,
    ProductRecommendation,
    SafetyLevel,
    TokenUsage,
)
from app.services.openai_provider import OpenAIProvider, ProviderError
from app.services.intent import IntentAssessment, IntentService, UserIntent
from app.services.prompt_builder import build_chat_messages
from app.services.retrieval import KnowledgeChunkResult, KnowledgeRepository
from app.services.safety import SafetyService
from app.services.text_utils import excerpt, normalize_text


logger = logging.getLogger(__name__)


class ChatService:
    def __init__(
        self,
        settings: Settings,
        safety_service: SafetyService,
        provider: OpenAIProvider,
        repository: KnowledgeRepository,
    ) -> None:
        self.settings = settings
        self.safety_service = safety_service
        self.provider = provider
        self.repository = repository
        self.intent_service = IntentService()

    async def respond(self, request: ChatRequest) -> ChatResponse:
        safety = self.safety_service.assess(request.user_message)
        intent = self.intent_service.assess(request.user_message)

        if safety.level == SafetyLevel.blocked:
            return ChatResponse(
                answer=(
                    "Mình không thể thực hiện yêu cầu thay đổi quy tắc hoặc tiết lộ "
                    "hướng dẫn nội bộ. Bạn có thể hỏi mình về nội dung HERDAYs cần hỗ trợ."
                ),
                safety=safety,
                model="rule-based",
            )

        if safety.level == SafetyLevel.urgent:
            return ChatResponse(
                answer=(
                    "Những dấu hiệu bạn mô tả có thể cần được hỗ trợ y tế sớm. "
                    "Vui lòng liên hệ cơ sở y tế gần nhất hoặc dịch vụ cấp cứu tại nơi bạn sống. "
                    "Mình sẽ không đưa gợi ý sản phẩm trong tình huống này."
                ),
                safety=safety,
                ctas=[
                    CallToAction(
                        type=CallToActionType.contact_support,
                        label="Tìm hỗ trợ y tế",
                        metadata={"reason": "urgent_health_signal"},
                    )
                ],
                model="rule-based",
                needs_human_support=True,
            )

        chunks = await self.retrieve_context(request, intent)
        citations = build_citations(chunks)

        model_result = None
        if self.provider.is_configured:
            messages = build_chat_messages(request, chunks, intent)
            try:
                model_result = await self.provider.generate_text(messages)
            except ProviderError as exc:
                logger.warning("OpenAI text generation failed; using fallback answer.", exc_info=exc)
                model_result = None

        answer = (
            model_result.text
            if model_result and model_result.text
            else build_fallback_answer(request, citations, safety.level)
        )

        recommendations = []
        if should_recommend_products(safety.level, intent):
            recommendations = recommend_products(request)

        return ChatResponse(
            answer=answer,
            safety=safety,
            citations=citations,
            recommended_products=recommendations,
            ctas=build_ctas(request, recommendations, intent),
            usage=model_result.usage if model_result else TokenUsage(),
            model=model_result.model if model_result else "fallback",
            needs_human_support=safety.level == SafetyLevel.caution,
        )

    async def retrieve_context(
        self,
        request: ChatRequest,
        intent: IntentAssessment,
    ) -> list[KnowledgeChunkResult]:
        if not should_retrieve_context(intent):
            return []

        if not self.provider.is_configured or not self.repository.is_configured:
            return []

        try:
            embeddings = await self.provider.embed_texts([request.user_message])
        except ProviderError as exc:
            logger.warning("OpenAI embedding generation failed; skipping knowledge retrieval.", exc_info=exc)
            return []

        if not embeddings:
            return []

        limit = request.knowledge_filters.limit or self.settings.rag_top_k
        try:
            return await self.repository.search(
                query_embedding=embeddings[0],
                filters=request.knowledge_filters,
                limit=limit,
                query_text=request.user_message,
            )
        except Exception:
            logger.exception("Knowledge retrieval failed; returning no context.")
            return []


def build_citations(chunks: list[KnowledgeChunkResult]) -> list[Citation]:
    citations: list[Citation] = []
    seen: set[str] = set()

    for chunk in chunks:
        key = f"{chunk.source_type}:{chunk.source_id}"
        if key in seen:
            continue

        seen.add(key)
        citations.append(
            Citation(
                source_id=chunk.source_id,
                source_type=chunk.source_type,
                title=chunk.title,
                url=chunk.url,
                excerpt=excerpt(chunk.content),
                score=chunk.score,
            )
        )

    return citations[:5]


def build_fallback_answer(
    request: ChatRequest,
    citations: list[Citation],
    safety_level: SafetyLevel,
) -> str:
    if citations:
        source_titles = ", ".join(citation.title for citation in citations[:3])
        caution_prefix = (
            "Nội dung bạn hỏi có yếu tố y tế cần thận trọng. "
            if safety_level == SafetyLevel.caution
            else ""
        )
        return (
            f"{caution_prefix}Mình tìm thấy một số nguồn HERDAYs liên quan nhưng hiện chưa thể tạo "
            f"câu trả lời AI đầy đủ. Bạn có thể xem thêm: {source_titles}."
        )

    if safety_level == SafetyLevel.caution:
        return (
            "Nội dung bạn hỏi có yếu tố y tế cần thận trọng. Mình có thể cung cấp "
            "thông tin chung, nhưng bạn nên trao đổi với bác sĩ hoặc cơ sở y tế để "
            "được hướng dẫn phù hợp với tình trạng cá nhân."
        )

    if citations:
        source_titles = ", ".join(citation.title for citation in citations[:3])
        return (
            "Mình tìm thấy một số nguồn HERDAYs liên quan nhưng hiện chưa thể tạo "
            f"câu trả lời AI đầy đủ. Bạn có thể xem thêm: {source_titles}."
        )

    return (
        "Mình chưa có đủ dữ liệu HERDAYs đã duyệt để trả lời chắc chắn câu hỏi này. "
        "Bạn có thể hỏi theo cách cụ thể hơn hoặc xem các bài viết chính thức trên website."
    )


def recommend_products(request: ChatRequest) -> list[ProductRecommendation]:
    scored_products: list[tuple[float, ProductCandidate, str]] = []
    normalized_message = normalize_text(request.user_message)
    normalized_target = normalize_text(request.user_context.target_status or "")

    for product in request.product_candidates:
        if not product.is_active or not product.in_stock:
            continue
        if not product.is_customizable or not product.customize_url:
            continue

        score = 0.2
        reasons: list[str] = []
        product_targets = [normalize_text(item) for item in product.target_statuses]

        if normalized_target and normalized_target in product_targets:
            score += 0.4
            reasons.append("phù hợp với hành trình hiện tại")

        tag_hits = [
            tag
            for tag in product.recommendation_tags
            if normalize_text(tag) and normalize_text(tag) in normalized_message
        ]
        if tag_hits:
            score += min(0.3, len(tag_hits) * 0.1)
            reasons.append("khớp với nhu cầu bạn vừa chia sẻ")

        benefit_hits = [
            benefit
            for benefit in product.benefits
            if normalize_text(benefit) and normalize_text(benefit) in normalized_message
        ]
        if benefit_hits:
            score += 0.1

        if score < 0.3:
            continue

        reason = "Box này " + " và ".join(reasons) if reasons else "Box này có thể phù hợp."
        scored_products.append((min(score, 1), product, reason))

    scored_products.sort(key=lambda item: item[0], reverse=True)

    return [
        ProductRecommendation(
            product_id=product.product_id,
            title=product.name,
            reason=reason,
            benefits=product.benefits[:4],
            customize_url=product.customize_url,
            confidence=score,
        )
        for score, product, reason in scored_products[:3]
    ]


def should_recommend_products(safety_level: SafetyLevel, intent: IntentAssessment) -> bool:
    return safety_level == SafetyLevel.safe and intent.name == UserIntent.product_discovery


def should_retrieve_context(intent: IntentAssessment) -> bool:
    return intent.name in {
        UserIntent.health_information,
        UserIntent.medical_risk,
        UserIntent.product_discovery,
        UserIntent.blog_navigation,
        UserIntent.unknown,
    }


def build_ctas(
    request: ChatRequest,
    recommendations: list[ProductRecommendation],
    intent: IntentAssessment,
) -> list[CallToAction]:
    ctas: list[CallToAction] = []

    if recommendations and recommendations[0].customize_url:
        ctas.append(
            CallToAction(
                type=CallToActionType.shop_customize,
                label="Tùy chỉnh Box",
                url=recommendations[0].customize_url,
                metadata={"productId": recommendations[0].product_id},
            )
        )

    if intent.name == UserIntent.app_feature:
        ctas.append(
            CallToAction(
                type=CallToActionType.app_fallback,
                label="Mở HERDAYs app",
                metadata={"destination": "app_fallback"},
            )
        )

    if intent.name == UserIntent.contact_support:
        ctas.append(
            CallToAction(
                type=CallToActionType.contact_support,
                label="Liên hệ hỗ trợ",
                metadata={"reason": "user_requested_support"},
            )
        )

    return ctas

