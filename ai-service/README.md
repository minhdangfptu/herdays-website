# HERDAYs AI Service

FastAPI service for the HERDAYs chatbot. It owns AI orchestration, safety checks,
RAG retrieval, and structured response generation. The browser never calls this
service directly; Express calls it with `X-Service-Token`.

## Local setup

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8090
```

The service can run without OpenAI or MongoDB credentials. In that mode it
returns deterministic fallback answers and skips vector-backed knowledge storage.

## Internal endpoints

- `GET /health`: readiness check.
- `POST /v1/chat/respond`: returns a structured chatbot answer for Express.
- `POST /v1/knowledge/documents`: chunks and stores approved knowledge sources.
- `POST /v1/knowledge/documents/delete`: removes chunks for unpublished sources.

## Data boundary

Do not send access tokens, email, phone number, address, or raw identity fields
to this service. Send only the minimum personalization context required for
answering, such as `targetStatus`, `ageGroup`, and a sanitized quiz summary.

## Environment variables

See `.env.example`. `SERVICE_TOKEN` should match the backend environment value.
`OPENAI_API_KEY` and MongoDB settings are optional during early integration.

