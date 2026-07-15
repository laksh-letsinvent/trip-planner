# Build context is the repo root (see docker-compose.yml) because this
# image needs both api/ and crew/ — api/main.py imports crew/'s modules
# directly via sys.path rather than installing crew as a package.
FROM python:3.12-slim

RUN pip install --no-cache-dir uv

WORKDIR /app

# Install deps first so this layer only rebuilds when dependencies change.
# api/pyproject.toml already lists the same crewai/pydantic/dotenv stack
# crew/'s modules need, so one uv sync covers both.
COPY api/pyproject.toml api/uv.lock ./api/
RUN cd api && uv sync --frozen --no-dev

COPY api/ ./api/
COPY crew/ ./crew/

WORKDIR /app/api
ENV PATH="/app/api/.venv/bin:$PATH"

EXPOSE 8000

# guards.py's daily counter assumes a single process, so this stays 1 worker.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/docs')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
