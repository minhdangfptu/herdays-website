from app.schemas.chat import ChatRequest
from app.schemas.chat import ChatHistoryMessage
from app.services.chat_service import build_ctas, should_retrieve_context
from app.services.intent import IntentService, UserIntent
from app.services.prompt_builder import build_chat_messages


def test_intent_detects_health_information() -> None:
    intent = IntentService().assess("ivf la gi")

    assert intent.name == UserIntent.health_information


def test_intent_detects_app_feature() -> None:
    intent = IntentService().assess("nhac lich uong thuoc cho minh")

    assert intent.name == UserIntent.app_feature


def test_intent_detects_product_discovery() -> None:
    intent = IntentService().assess("goi y box phu hop cho chu ky")

    assert intent.name == UserIntent.product_discovery


def test_intent_drives_app_cta() -> None:
    request = ChatRequest(userMessage="nhac lich cho minh")
    intent = IntentService().assess(request.user_message)
    ctas = build_ctas(request, [], intent)

    assert len(ctas) == 1
    assert ctas[0].type.value == "app_fallback"


def test_intent_drives_contact_support_cta() -> None:
    request = ChatRequest(userMessage="toi muon gap tu van vien")
    intent = IntentService().assess(request.user_message)
    ctas = build_ctas(request, [], intent)

    assert len(ctas) == 1
    assert ctas[0].type.value == "contact_support"


def test_app_feature_does_not_retrieve_knowledge_context() -> None:
    intent = IntentService().assess("nhac lich cho minh")

    assert should_retrieve_context(intent) is False


def test_health_information_retrieves_knowledge_context() -> None:
    intent = IntentService().assess("ivf la gi")

    assert should_retrieve_context(intent) is True


def test_app_feature_prompt_drops_previous_medical_history() -> None:
    request = ChatRequest(
        userMessage="nhac lich cho minh",
        history=[
            ChatHistoryMessage(role="user", content="ivf la gi"),
            ChatHistoryMessage(role="assistant", content="IVF la thu tinh trong ong nghiem."),
        ],
    )
    intent = IntentService().assess(request.user_message)
    messages = build_chat_messages(request, [], intent)

    assert len(messages) == 2
    assert "IVF la thu tinh trong ong nghiem" not in messages[-1]["content"]
