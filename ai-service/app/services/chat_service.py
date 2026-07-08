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

        recommendations = []
        is_product_request = should_recommend_products(safety.level, intent)
        is_caremode_list_request = wants_caremode_box_list(request.user_message)
        if is_product_request:
            recommendations = recommend_products(
                request,
                include_all_matching=is_caremode_list_request,
            )

        answer = (
            build_product_recommendation_answer(recommendations)
            if recommendations
            else build_empty_box_answer(request, is_caremode_list_request)
            if is_product_request
            else (
                model_result.text
                if model_result and model_result.text
                else build_fallback_answer(request, citations, safety.level)
            )
        )

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


def clean_product_benefit(value: str) -> str:
    benefit = value.strip()
    if benefit.lower().startswith("category:"):
        return f"nhóm {benefit.split(':', 1)[1].strip()}"
    if benefit.lower().startswith("includes:"):
        return f"có {benefit.split(':', 1)[1].strip()}"
    return benefit


TARGET_STATUS_ALIASES: dict[str, tuple[str, ...]] = {
    "periodTracking": (
        "periodtracking",
        "period",
        "chu ky",
        "kinh nguyet",
        "ngay dau",
        "ky kinh",
        "cham soc ky kinh",
        "giam dau",
        "ve sinh ca nhan",
    ),
    "pregnant": (
        "pregnant",
        "pregnancy",
        "mang thai",
        "thai ky",
        "bau",
    ),
    "tryingToConceive": (
        "tryingtoconceive",
        "fertility",
        "thu thai",
        "co thai",
        "sinh san",
    ),
    "ivf": ("ivf",),
    "partner": ("partner", "nguoi than", "ban doi"),
    "relatives": ("relatives", "nguoi than", "ban doi"),
}


def wants_caremode_box_list(message: str) -> bool:
    normalized = normalize_text(message)
    has_list_signal = any(
        pattern in normalized
        for pattern in (
            "tat ca",
            "danh sach",
            "liet ke",
            "xem cac",
            "xem tat ca",
            "co nhung box",
            "cac box",
        )
    )
    has_caremode_signal = any(
        pattern in normalized
        for pattern in ("caremode", "care mode", "mode cua toi", "phu hop voi toi")
    )
    return has_list_signal and (has_caremode_signal or "box" in normalized)


def candidate_search_text(product: ProductCandidate) -> str:
    return " ".join(
        [
            product.name,
            *product.target_statuses,
            *product.recommendation_tags,
            *product.benefits,
        ]
    )


def matches_target_status(product: ProductCandidate, target_status: str | None) -> bool:
    if not target_status:
        return True

    aliases = TARGET_STATUS_ALIASES.get(target_status, (target_status,))
    normalized_text = normalize_text(candidate_search_text(product))
    return any(normalize_text(alias) in normalized_text for alias in aliases)


def build_empty_box_answer(request: ChatRequest, is_caremode_list_request: bool) -> str:
    available_count = sum(
        1
        for product in request.product_candidates
        if product.is_active and product.in_stock and product.is_customizable and product.customize_url
    )

    if available_count == 0:
        return "Hiện chưa có box nào trong hệ thống."

    if is_caremode_list_request:
        return "Hiện chưa có box nào trong caremode của bạn trong hệ thống."

    return "Hiện chưa có box phù hợp với nhu cầu này trong hệ thống."


def build_product_recommendation_answer(
    recommendations: list[ProductRecommendation],
) -> str:
    primary = recommendations[0]
    benefit_items = [
        clean_product_benefit(benefit)
        for benefit in primary.benefits
        if benefit and benefit.strip()
    ][:3]
    benefit_sentence = (
        f" Box này hỗ trợ {', '.join(benefit_items)}."
        if benefit_items and "hỗ trợ" not in primary.reason.lower()
        else ""
    )

    if len(recommendations) == 1:
        return (
            f"Mình gợi ý {primary.title} cho nhu cầu của bạn. "
            f"{primary.reason}{benefit_sentence} "
            "Bạn có thể bấm Xem box để xem chi tiết hoặc Tùy chỉnh box để chỉnh lại theo nhu cầu."
        )

    other_titles = ", ".join(item.title for item in recommendations[1:])
    return (
        f"Mình tìm thấy {len(recommendations)} box phù hợp. "
        f"Ưu tiên đầu tiên là {primary.title}: {primary.reason}{benefit_sentence} "
        f"Các lựa chọn khác gồm {other_titles}; bạn có thể so sánh trong các thẻ bên dưới."
    )


def recommend_products(
    request: ChatRequest,
    include_all_matching: bool = False,
) -> list[ProductRecommendation]:
    scored_products: list[tuple[float, ProductCandidate, str]] = []
    normalized_message = normalize_text(request.user_message)
    normalized_target = normalize_text(request.user_context.target_status or "")

    for product in request.product_candidates:
        if not product.is_active or not product.in_stock:
            continue
        if not product.is_customizable or not product.customize_url:
            continue
        if include_all_matching and not matches_target_status(product, request.user_context.target_status):
            continue

        score = 0.35
        reasons: list[str] = []

        if normalized_target and matches_target_status(product, request.user_context.target_status):
            score += 0.4
            reasons.append("phù hợp với caremode hiện tại của bạn")

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

        if reasons:
            reason = "Box này " + " và ".join(reasons) + "."
        else:
            support_items = [
                clean_product_benefit(benefit)
                for benefit in product.benefits
                if benefit and benefit.strip()
            ][:2]
            reason = (
                f"Box này hỗ trợ {', '.join(support_items)}."
                if support_items
                else "Box này là lựa chọn phù hợp để bạn xem thêm."
            )
        scored_products.append((min(score, 1), product, reason))

    scored_products.sort(key=lambda item: item[0], reverse=True)
    limit = len(scored_products) if include_all_matching else 3

    return [
        ProductRecommendation(
            product_id=product.product_id,
            title=product.name,
            reason=reason,
            benefits=product.benefits[:4],
            price=product.price,
            currency=product.currency,
            thumbnail=product.thumbnail,
            detail_url=product.detail_url,
            customize_url=product.customize_url,
            confidence=score,
        )
        for score, product, reason in scored_products[:limit]
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

