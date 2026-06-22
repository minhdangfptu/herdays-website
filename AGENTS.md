# Repository Guidelines

## Project Structure & Module Organization

This repository contains two independent Node.js packages:

- `frontend/` is a React 19 application built with Vite. UI code lives in `frontend/src/`, static files in `frontend/public/`, and imported images in `frontend/src/assets/`.
- `backend/` is an Express API backed by MongoDB/Mongoose. `backend/src/server.js` is the entry point. Keep HTTP routing in `routes/`, request/response handling in `controllers/`, business logic in `services/`, persistence schemas in `models/`, and external integrations in `providers/`.
- `.github/` contains CI/CD workflows. `dev/rules.md` documents the team's detailed coding rules.

## Build, Test, and Development Commands

Run commands from the relevant package directory after `npm ci` (Node.js 20 is used in CI; the backend requires Node 18+).

```bash
cd frontend && npm run dev      # Vite development server
cd frontend && npm run build    # production bundle in dist/
cd frontend && npm run lint     # ESLint checks for JS/JSX
cd frontend && npm run preview  # serve the built bundle locally
cd backend && npm run dev       # API with nodemon reloads
cd backend && npm start         # API without file watching
cd backend && npm run lint      # ESLint checks under src/
```

## Coding Style & Naming Conventions

Use ES modules and follow the style already present in each package: two-space indentation, single quotes, `camelCase` variables/functions, and `PascalCase` React components. Name event callbacks `handleSubmit`-style and booleans with `is`, `has`, or `can`. Prefer early returns and small, single-purpose components. Backend controllers should delegate business logic to services and pass async errors to `next(error)`. Run the package lint command before submitting changes.

## Testing Guidelines

No test framework or coverage threshold is configured yet; the backend `npm test` script intentionally fails. When adding tests, use `*.test.js` or `*.test.jsx`, keep them beside the module or in a package-level `tests/` directory, and add a working package script. Until then, lint both packages, build the frontend, and manually exercise affected API routes and UI states.

## Commit & Pull Request Guidelines

Recent history uses short prefixes such as `feat!:`, `update:`, and imperative maintenance messages. Prefer concise, scoped subjects, for example `feat: add OTP resend endpoint` or `fix: reject expired refresh tokens`. Pull requests should explain behavior changes, list validation performed, link the relevant issue, and include screenshots for visible UI changes. Keep unrelated refactors separate.

## Security & Configuration

Never commit `.env`, credentials, tokens, or hard-coded service URLs. Keep user-scoped database queries constrained by the authenticated user ID, validate all request bodies, and document newly required environment variables without recording their values.
