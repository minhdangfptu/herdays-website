import pytest
from pydantic import ValidationError

from app.schemas.chat import ChatRequest, Citation, SafetyLevel, UserContext
from app.services.chat_service import build_fallback_answer, recommend_products


def test_user_context_rejects_sensitive_quiz_summary() -> None:
    with pytest.raises(ValidationError):
        UserContext(quiz_summary={"email": "user@example.com"})


def test_recommend_products_filters_inactive_and_uncustomizable_items() -> None:
    request = ChatRequest(
        userMessage="Mình muốn box cho chu kỳ và sản phẩm giảm khó chịu",
        userContext={"targetStatus": "cycle"},
        productCandidates=[
            {
                "productId": "cycle-box",
                "name": "Cycle Care Box",
                "targetStatuses": ["cycle"],
                "recommendationTags": ["giảm khó chịu"],
                "benefits": ["Hỗ trợ chu kỳ"],
                "isActive": True,
                "isCustomizable": True,
                "inStock": True,
                "customizeUrl": "/shop/boxes/cycle-box/customize?source=chatbot",
            },
            {
                "productId": "inactive-box",
                "name": "Inactive Box",
                "targetStatuses": ["cycle"],
                "isActive": False,
                "isCustomizable": True,
                "inStock": True,
                "customizeUrl": "/shop/boxes/inactive-box/customize?source=chatbot",
            },
        ],
    )

    recommendations = recommend_products(request)

    assert len(recommendations) == 1
    assert recommendations[0].product_id == "cycle-box"


def test_chat_request_defaults_to_safe_session_context() -> None:
    request = ChatRequest(userMessage="HERDAYs có bài viết nào về chu kỳ không?")

    assert request.user_context.session_type.value == "guest"
    assert SafetyLevel.safe.value == "safe"


def test_caution_fallback_keeps_retrieved_citations_visible() -> None:
    request = ChatRequest(userMessage="ivf la gi")
    answer = build_fallback_answer(
        request,
        [
            Citation(
                sourceId="blog:ivf",
                sourceType="blog",
                title="IVF basics",
                excerpt="IVF overview",
            )
        ],
        SafetyLevel.caution,
    )

    assert "IVF basics" in answer
