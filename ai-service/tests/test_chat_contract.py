import pytest
from pydantic import ValidationError

from app.schemas.chat import ChatRequest, Citation, SafetyLevel, UserContext
from app.services.chat_service import (
    build_empty_box_answer,
    build_fallback_answer,
    build_product_recommendation_answer,
    recommend_products,
)


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
                "price": 199000,
                "isActive": True,
                "isCustomizable": True,
                "inStock": True,
                "thumbnail": "https://example.com/cycle-box.png",
                "detailUrl": "/product-detail/box/cycle-box",
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
    assert recommendations[0].price == 199000
    assert recommendations[0].thumbnail == "https://example.com/cycle-box.png"
    assert recommendations[0].detail_url == "/product-detail/box/cycle-box"


def test_recommend_products_returns_available_box_for_generic_purchase_intent() -> None:
    request = ChatRequest(
        userMessage="minh muon mua do",
        productCandidates=[
            {
                "productId": "gift-box",
                "name": "Gift Box",
                "isActive": True,
                "isCustomizable": True,
                "inStock": True,
                "detailUrl": "/product-detail/box/gift-box",
                "customizeUrl": "/box-customize/gift-box",
            },
        ],
    )

    recommendations = recommend_products(request)

    assert len(recommendations) == 1
    assert recommendations[0].product_id == "gift-box"
    assert "lựa chọn phù hợp" in recommendations[0].reason


def test_product_recommendation_answer_names_the_box() -> None:
    request = ChatRequest(
        userMessage="minh muon mua do",
        productCandidates=[
            {
                "productId": "gift-box",
                "name": "Gift Box",
                "benefits": ["Cham soc co ban", "Includes: San pham A"],
                "isActive": True,
                "isCustomizable": True,
                "inStock": True,
                "customizeUrl": "/box-customize/gift-box",
            },
        ],
    )
    recommendations = recommend_products(request)

    answer = build_product_recommendation_answer(recommendations)

    assert "Gift Box" in answer
    assert "Box này hỗ trợ" in answer
    assert "Xem box" in answer


def test_recommend_products_can_return_all_matching_caremode_boxes() -> None:
    request = ChatRequest(
        userMessage="xem tat ca box trong caremode cua toi",
        userContext={"targetStatus": "periodTracking"},
        productCandidates=[
            {
                "productId": "period-box-1",
                "name": "Period Box 1",
                "targetStatuses": ["Chăm sóc kỳ kinh"],
                "isActive": True,
                "isCustomizable": True,
                "inStock": True,
                "customizeUrl": "/box-customize/period-box-1",
            },
            {
                "productId": "period-box-2",
                "name": "Period Box 2",
                "recommendationTags": ["ngay dau"],
                "isActive": True,
                "isCustomizable": True,
                "inStock": True,
                "customizeUrl": "/box-customize/period-box-2",
            },
            {
                "productId": "pregnancy-box",
                "name": "Pregnancy Box",
                "targetStatuses": ["mang thai"],
                "isActive": True,
                "isCustomizable": True,
                "inStock": True,
                "customizeUrl": "/box-customize/pregnancy-box",
            },
        ],
    )

    recommendations = recommend_products(request, include_all_matching=True)

    assert [item.product_id for item in recommendations] == ["period-box-1", "period-box-2"]


def test_empty_box_answer_reports_no_boxes_in_system() -> None:
    request = ChatRequest(
        userMessage="goi y box",
        productCandidates=[],
    )

    answer = build_empty_box_answer(request, is_caremode_list_request=False)

    assert answer == "Hiện chưa có box nào trong hệ thống."


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
