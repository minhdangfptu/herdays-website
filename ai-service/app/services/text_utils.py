import re
import unicodedata


def compact_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value)
    ascii_text = decomposed.encode("ascii", "ignore").decode("ascii")
    return compact_text(ascii_text.lower())


def excerpt(value: str, limit: int = 260) -> str:
    cleaned = compact_text(value)
    if len(cleaned) <= limit:
        return cleaned
    return f"{cleaned[: limit - 3].rstrip()}..."

