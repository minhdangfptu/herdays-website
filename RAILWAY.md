# Railway deployment

Deploy all three applications as separate services in the same Railway project
and environment. Use these exact service names so the reference-variable examples
below can be pasted without modification:

- `frontend`
- `backend`
- `ai-service`

Connect the same GitHub repository and branch to each service.

## Service settings

| Service | Root Directory | Config File Path | Public domain |
| --- | --- | --- | --- |
| `frontend` | `/frontend` | `/frontend/railway.json` | Generate one |
| `backend` | `/backend` | `/backend/railway.json` | Generate one |
| `ai-service` | `/ai-service` | `/ai-service/railway.json` | Do not generate one |

The config files define the Railpack builder, production start command,
healthcheck, and restart policy. Leave the Build Command and Start Command fields
in the Railway dashboard empty so config-as-code remains the single source of
truth.

## Variables

Railway injects `PORT`; do not define it manually for `frontend` or `backend`.
Set `PORT=8090` on `ai-service` so the backend can use a stable private-network
port.

### `frontend`

```dotenv
VITE_BACKEND_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
VITE_GOOGLE_CLIENT_ID=<google-oauth-client-id>
VITE_FACEBOOK_APP_ID=<facebook-app-id>
VITE_FACEBOOK_GRAPH_VERSION=v23.0
```

`VITE_*` values are public and embedded into the browser bundle. Never put a
client secret in a `VITE_*` variable.

### `backend`

```dotenv
NODE_ENV=production
FRONTEND_URL=https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
BACKEND_PRODUCTION_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
AI_SERVICE_URL=http://${{ai-service.RAILWAY_PRIVATE_DOMAIN}}:8090
AI_SERVICE_TOKEN=${{shared.AI_SERVICE_TOKEN}}
AI_SERVICE_TIMEOUT_MS=30000

MONGODB_URI=<mongodb-connection-string>
MONGODB_DB_NAME=HerDay
JWT_SECRET=<long-random-secret>
REFRESH_TOKEN_SECRET=<different-long-random-secret>
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
RESET_TOKEN_EXPIRES_IN=10m
OTP_EXPIRES_IN_MINUTES=5
BCRYPT_SALT_ROUNDS=10
```

Copy the remaining integration variables from `backend/.env` when the associated
feature is used: Google/Facebook OAuth, SMTP, Cloudinary, Twilio, and Redis. Keep
their real values only in Railway Variables, never in Git.

### `ai-service`

```dotenv
PORT=8090
APP_ENV=production
SERVICE_TOKEN=${{shared.AI_SERVICE_TOKEN}}
OPENAI_API_KEY=<openai-api-key>
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_TIMEOUT_SECONDS=30
MONGODB_URI=<mongodb-connection-string>
MONGODB_DB_NAME=HerDay
MONGODB_VECTOR_COLLECTION=knowledge_chunks
MONGODB_VECTOR_INDEX=knowledge_vector_index
RAG_TOP_K=5
MAX_USER_MESSAGE_CHARS=2000
```

Create `AI_SERVICE_TOKEN` once under Project Settings > Shared Variables, use a
long random value, and share it with `backend` and `ai-service`. The MongoDB and
OpenAI variables are optional only if deterministic fallback responses without
RAG are acceptable.

## Deployment order

1. Create all three empty services and apply the service settings above.
2. Create the shared token and add each service's variables.
3. Deploy `ai-service`, then `backend`, then `frontend`.
4. Generate public domains for `backend` and `frontend` only.
5. Redeploy `backend` and `frontend` after the domains exist so their reference
   variables are resolved and the Vite bundle receives the backend URL at build
   time.

Verify these URLs after deployment:

- `https://<backend-domain>/herdays-api/status`
- `https://<frontend-domain>/`

The AI service is intentionally reachable only from the backend through
Railway's private network. Its `/health` route is still used by Railway during
deployment.
