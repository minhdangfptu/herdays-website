from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(BASE_DIR / ".env",),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "HERDAYs AI Service"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8090

    service_token: str | None = None

    openai_api_key: str | None = None
    openai_model: str = "gpt-4.1-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_timeout_seconds: float = 30

    mongodb_uri: str | None = None
    mongodb_db_name: str = "HerDay"
    mongodb_vector_collection: str = "knowledge_chunks"
    mongodb_vector_index: str = "knowledge_vector_index"
    rag_top_k: int = Field(default=5, ge=1, le=20)

    max_user_message_chars: int = Field(default=2000, ge=100, le=8000)

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()

