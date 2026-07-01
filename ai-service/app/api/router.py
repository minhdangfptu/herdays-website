from fastapi import APIRouter

from app.api.routes import chat, knowledge


api_router = APIRouter(prefix="/v1")
api_router.include_router(chat.router)
api_router.include_router(knowledge.router)

