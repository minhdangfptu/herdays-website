from dataclasses import dataclass
from enum import Enum

from app.services.text_utils import normalize_text


class UserIntent(str, Enum):
    health_information = "health_information"
    medical_risk = "medical_risk"
    app_feature = "app_feature"
    product_discovery = "product_discovery"
    contact_support = "contact_support"
    blog_navigation = "blog_navigation"
    smalltalk = "smalltalk"
    unknown = "unknown"


@dataclass(slots=True)
class IntentAssessment:
    name: UserIntent
    confidence: float
    reasons: list[str]


INTENT_PATTERNS: tuple[tuple[UserIntent, tuple[str, ...], float], ...] = (
    (
        UserIntent.contact_support,
        (
            "gap tu van",
            "tu van vien",
            "lien he",
            "hotline",
            "can ho tro",
            "noi chuyen voi nguoi",
            "nhan vien",
        ),
        0.9,
    ),
    (
        UserIntent.app_feature,
        (
            "theo doi",
            "nhac lich",
            "nhac minh",
            "du doan",
            "lich chu ky",
            "ghi lai",
            "nhat ky",
            "app",
            "ung dung",
        ),
        0.85,
    ),
    (
        UserIntent.product_discovery,
        (
            "box",
            "san pham",
            "goi y",
            "nen mua",
            "phu hop",
            "custom",
            "tuy chinh",
            "giam kho chiu",
            "cham soc",
        ),
        0.85,
    ),
    (
        UserIntent.blog_navigation,
        (
            "bai viet",
            "tai lieu",
            "doc them",
            "nguon",
            "kien thuc",
            "chu de",
        ),
        0.8,
    ),
    (
        UserIntent.medical_risk,
        (
            "trieu chung",
            "co sao khong",
            "nguy hiem",
            "bat thuong",
            "dau",
            "ra mau",
            "sot",
            "kho tho",
            "ngua",
            "viem",
        ),
        0.75,
    ),
    (
        UserIntent.health_information,
        (
            "la gi",
            "la nhu the nao",
            "giai thich",
            "tim hieu",
            "ivf",
            "pcos",
            "kinh nguyet",
            "chu ky",
            "rong kinh",
            "rung trung",
            "mang thai",
            "thu thai",
            "sinh san",
        ),
        0.8,
    ),
    (
        UserIntent.smalltalk,
        (
            "xin chao",
            "chao",
            "cam on",
            "thanks",
            "thank you",
            "tam biet",
        ),
        0.7,
    ),
)


class IntentService:
    def assess(self, message: str) -> IntentAssessment:
        normalized = normalize_text(message)

        for intent, patterns, confidence in INTENT_PATTERNS:
            matches = [pattern for pattern in patterns if pattern in normalized]
            if matches:
                return IntentAssessment(
                    name=intent,
                    confidence=confidence,
                    reasons=[f"matched:{match}" for match in matches[:3]],
                )

        return IntentAssessment(
            name=UserIntent.unknown,
            confidence=0.2,
            reasons=[],
        )
