import hmac

from fastapi import Header, HTTPException, status

from app.core.config import get_settings


async def verify_service_token(
    x_service_token: str | None = Header(default=None, alias="X-Service-Token"),
) -> None:
    settings = get_settings()

    if not settings.service_token:
        if settings.is_production:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SERVICE_TOKEN is not configured.",
            )
        return

    if not x_service_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing service token.",
        )

    if not hmac.compare_digest(x_service_token, settings.service_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid service token.",
        )

