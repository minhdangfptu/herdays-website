from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_chat_service
from app.core.config import get_settings
from app.core.security import verify_service_token
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService


router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    dependencies=[Depends(verify_service_token)],
)


@router.post("/respond", response_model=ChatResponse)
async def respond(
    payload: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    settings = get_settings()
    if len(payload.user_message) > settings.max_user_message_chars:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"userMessage exceeds {settings.max_user_message_chars} characters.",
        )

    return await chat_service.respond(payload)

