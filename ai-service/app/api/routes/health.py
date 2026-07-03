from fastapi import APIRouter

from app.core.config import get_settings


router = APIRouter(tags=["health"])


def get_health_payload() -> dict[str, str]:
    settings = get_settings()
    return {
        "status": "running",
        "service": settings.app_name,
        "environment": settings.app_env,
    }


@router.get("/")
async def root_health_check() -> dict[str, str]:
    return get_health_payload()


@router.get("/health")
async def health_check() -> dict[str, str]:
    return get_health_payload()

