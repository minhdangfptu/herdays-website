from dataclasses import dataclass
from typing import Any

from openai import AsyncOpenAI, OpenAIError

from app.core.config import Settings
from app.schemas.chat import TokenUsage


class ProviderError(RuntimeError):
    pass


@dataclass(slots=True)
class ModelResult:
    text: str
    model: str
    usage: TokenUsage


class OpenAIProvider:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client = (
            AsyncOpenAI(
                api_key=settings.openai_api_key,
                timeout=settings.openai_timeout_seconds,
            )
            if settings.openai_api_key
            else None
        )

    @property
    def is_configured(self) -> bool:
        return self._client is not None

    async def generate_text(self, messages: list[dict[str, str]]) -> ModelResult:
        if not self._client:
            return ModelResult(text="", model="fallback", usage=TokenUsage())

        try:
            response = await self._client.responses.create(
                model=self.settings.openai_model,
                input=messages,
            )
        except OpenAIError as exc:
            raise ProviderError("OpenAI text generation failed.") from exc

        return ModelResult(
            text=extract_output_text(response),
            model=getattr(response, "model", self.settings.openai_model),
            usage=extract_usage(response),
        )

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        if not self._client:
            return []

        try:
            response = await self._client.embeddings.create(
                model=self.settings.openai_embedding_model,
                input=texts,
            )
        except OpenAIError as exc:
            raise ProviderError("OpenAI embedding generation failed.") from exc

        return [item.embedding for item in response.data]


def extract_output_text(response: Any) -> str:
    output_text = getattr(response, "output_text", None)
    if output_text:
        return str(output_text).strip()

    output = getattr(response, "output", None) or []
    parts: list[str] = []

    for item in output:
        content = get_value(item, "content") or []
        for block in content:
            text = get_value(block, "text")
            if text:
                parts.append(str(text))

    return "\n".join(parts).strip()


def extract_usage(response: Any) -> TokenUsage:
    usage = getattr(response, "usage", None)
    if not usage:
        return TokenUsage()

    input_tokens = get_value(usage, "input_tokens") or get_value(usage, "prompt_tokens")
    output_tokens = get_value(usage, "output_tokens") or get_value(usage, "completion_tokens")
    total_tokens = get_value(usage, "total_tokens")

    return TokenUsage(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
    )


def get_value(value: Any, key: str) -> Any:
    if isinstance(value, dict):
        return value.get(key)
    return getattr(value, key, None)

