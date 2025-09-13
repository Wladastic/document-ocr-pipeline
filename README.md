**"For Interview Evaluation Only. Do not use in production without written consent."**

A compact TypeScript prototype of a **multi‑stage document processing pipeline**.

## Features

- Upload via HTTP `POST /documents` (JSON with base64 payload)
- Asynchronous processing with **Redis lists** (simple queue)
- **Simulated OCR** (as required)
- **Metadata extraction** for `invoice | receipt | contract`
- **Validation** with **Zod**
- **Persistence and Queue** with **Redis** (as suggested in task)
- **Status**: `uploaded → processing → validated` (or `failed`)
- Query: `GET /documents/:id`

## Why these choices

- Hono: lightweight, modern web framework with excellent TypeScript support
- Redis: simple persistence and queue (as suggested: "use Redis for everything")
- Zod: runtime validation
- No external queue frameworks, just Redis lists for simplicity, but left modular to swap to other solutions easily.

## Run locally

Requirements: Node 20+, Docker (for Redis).

**Quick start:**
```bash
# One-command startup (starts Redis + dev server)
./start-dev.sh
```

**Manual setup:**
```bash
# Copy example env and start Redis (docker-compose ships a redis service)
cp .env.example .env
docker compose up -d redis

# Install dependencies (no migrations needed!)
npm install
```

**Simple setup:**

- Redis stores documents as JSON at keys `doc:<id>`
- Redis lists handle the job queue (`document-processing-queue`)
- No external databases or queue frameworks needed

**Development options:**

Option A — use the startup script (recommended):
```bash
./start-dev.sh  # Starts Redis + dev server
./stop-dev.sh   # Cleanup when done
```

Option B — run API and worker together (single-process):

```bash
npm run dev
```

Option C — run API and worker separately:

```bash
# In one terminal: run the API
npm run dev

# In another terminal: run the worker
npm run worker
```

## Upload example

Upload a sample document (JSON body with `filename`, `dtype`, `contentBase64`):

```bash
curl -X POST http://localhost:3002/documents \
    -H "content-type: application/json" \
    -d '{
        "filename": "invoice-001.png",
        "dtype": "invoice",
        "contentBase64": "aGVsbG8="
    }'
```

Then check the status (replace `<id>`):

```bash
curl http://localhost:3002/documents/<id>
```

You should see the status transition to `validated` with metadata (if processing succeeds).

## Notes & safety

- Request validation: the prototype accepts the upload JSON as-is; consider adding request schema validation on the API level before writing files.

- Filename safety: `filename` is written directly to disk. Avoid using untrusted filenames in production — sanitize or generate safe filenames to prevent path traversal.

- Worker behavior: by default the server process will start a worker (single-process mode). Use `npm run worker` to run the worker separately when you want isolated processes.

- Tests: the repo includes unit tests. Run tests with:

```bash
npm test
```

## Integration Testing

The project includes comprehensive integration tests that run against the real Docker services:

```bash
# Run full integration tests (builds Docker image, starts services, tests API)
npm run test:integration

# Or run directly
./integration-test.sh
```

**What the integration tests cover:**

- Health check endpoint
- Document upload with validation  
- Full document processing pipeline (upload → queue → OCR → extract → validate)
- Metadata extraction verification
- OCR processing verification
- Error handling (invalid requests, missing fields, 404s)

## Docker Deployment

The application can be deployed using Docker:

```bash
# Build and run with Docker Compose
docker compose up --build

# Run in background
docker compose up --build -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

The Docker setup includes:
- **Redis**: Queue and persistence layer
- **App**: Node.js application running on port 3002
- **Health checks**: Redis health monitoring
- **Volumes**: Persistent Redis data and file storage

## Recommended next steps

- Add integration tests that exercise an upload through the queue to persistence.
- Harden input handling (validate upload request and sanitize filenames).
- Add retry logic and dead letter queues for failed jobs.

## Stack

TypeScript, Hono, Redis (queue + storage), Zod • Tests: Vitest

## Documentation

Detailed documentation is available in the `docs/` folder:

- `docs/architecture.md` — architecture and flow
- `docs/api.md` — API endpoints and responses
- `docs/deployment.md` — local deployment steps and production notes
- `docs/testing.md` — testing guidance and next steps
