from app.schemas.chat import SafetyAssessment, SafetyLevel
from app.services.text_utils import normalize_text


URGENT_TERMS = (
    "tu tu",
    "muon chet",
    "tu lam hai",
    "bang huyet",
    "chay mau nhieu",
    "ra mau nhieu",
    "dau bung du doi",
    "dau bung rat nang",
    "ngat",
    "ngat xiu",
    "kho tho",
    "co giat",
    "sot cao",
    "thai may giam",
    "khong thay thai may",
    "vo oi",
    "nuoc oi",
    "dau nguc",
    "mang thai ra mau",
)

CAUTION_TERMS = (
    "ke don",
    "don thuoc",
    "lieu dung",
    "uong thuoc",
    "dat thuoc",
    "pha thai",
    "nghi nhiem trung",
    "duong tinh",
    "xet nghiem",
    "ivf",
    "tiem thuoc",
)

PROMPT_INJECTION_TERMS = (
    "ignore previous",
    "ignore all previous",
    "bo qua huong dan",
    "bo qua tat ca",
    "system prompt",
    "developer message",
    "reveal prompt",
    "in prompt",
    "xoa bo quy tac",
    "khong can tuan thu",
)


class SafetyService:
    def assess(self, message: str) -> SafetyAssessment:
        normalized = normalize_text(message)

        injection_reasons = [term for term in PROMPT_INJECTION_TERMS if term in normalized]
        if injection_reasons:
            return SafetyAssessment(
                level=SafetyLevel.blocked,
                reasons=[f"prompt_injection:{reason}" for reason in injection_reasons],
                recommended_action="refuse_instruction_override",
            )

        urgent_reasons = [term for term in URGENT_TERMS if term in normalized]
        if urgent_reasons:
            return SafetyAssessment(
                level=SafetyLevel.urgent,
                reasons=[f"urgent_health:{reason}" for reason in urgent_reasons],
                recommended_action="medical_escalation",
            )

        caution_reasons = [term for term in CAUTION_TERMS if term in normalized]
        if caution_reasons:
            return SafetyAssessment(
                level=SafetyLevel.caution,
                reasons=[f"medical_caution:{reason}" for reason in caution_reasons],
                recommended_action="grounded_general_information",
            )

        return SafetyAssessment(level=SafetyLevel.safe)
