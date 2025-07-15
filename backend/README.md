# PromptHub Backend (Flask + PostgreSQL)

This backend provides authentication (JWT), user management, and prompt APIs for the PromptHub app.

## Features
- User registration & login (JWT auth)
- PostgreSQL database
- Modular Flask app structure

## Structure
- `app/` — Main Flask app
  - `models.py` — SQLAlchemy models
  - `routes/` — API route blueprints
  - `auth/` — Auth logic (JWT, registration, login)
  - `db.py` — DB connection
  - `config.py` — Config (env, secret, DB URL)
- `migrations/` — Alembic migrations
- `tests/` — Unit tests
- `run.py` — App entry point

## Quickstart
1. `pip install -r requirements.txt`
2. Set up `.env` (see `.env.example`)
3. `flask db upgrade`
4. `flask run` 