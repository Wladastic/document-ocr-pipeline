# Architecture

This prototype is a compact, modular document processing pipeline designed for clarity, simplicity, and production-readiness.

## High-level Components

- **API**: Built with Hono for modern TypeScript-first web framework with excellent performance
- **Storage**: Local filesystem for document files, modular design allows easy swapping to S3 or other backends
- **Queue**: Simple Redis-based queue using Redis lists (LPUSH/BRPOPLPUSH) - no external frameworks needed
- **Persistence**: Document metadata stored as JSON in Redis at keys `doc:<id>` 
- **OCR**: Returns mock results as specified (simulated OCR only)
- **Extraction**: Simple metadata extraction per document type (invoice, receipt, contract)
- **Validation**: Zod schemas for runtime type safety and validation

## Design Principles

- **Single responsibility**: Modules are small and focused, making them easy to test and replace
- **Redis-first**: Uses Redis for both queuing and persistence as suggested in the task requirements
- **Simplicity**: No external queue frameworks - just Redis lists and TypeScript
- **Testability**: All components are unit tested, plus comprehensive integration tests
- **Docker-ready**: Full containerization with docker-compose for easy deployment

## Operational Flow

1. Client uploads document to `POST /documents` (JSON with base64 payload)
2. API stores file, creates Redis record with `status=uploaded`, enqueues job to Redis list
3. Worker picks up job via `BRPOPLPUSH`, sets `status=processing`, runs OCR, extracts metadata, validates
4. On success: `status=validated`, then `ocrText` and `metadata` saved, finally `status=persisted`
5. On validation errors: `status=failed` and job handling depends on implementation

## Technology Stack

- **Runtime**: Node.js 20 with TypeScript
- **Web Framework**: Hono (lightweight, modern, TypeScript-first)
- **Database**: Redis (JSON document storage + queue)
- **Queue**: Redis lists (LPUSH/BRPOPLPUSH pattern)
- **Validation**: Zod schemas
- **Development**: Vite for fast TypeScript execution
- **Testing**: Vitest for unit tests + Docker-based integration tests
- **Deployment**: Docker + docker-compose

## Key Architectural Decisions

- **Redis for Everything**: Simplified infrastructure - one Redis instance handles both persistence and queuing
- **Lightweight Dependencies**: Minimal external dependencies to reduce complexity and align with task requirements
- **TypeScript Throughout**: Full type safety from API to database layer
- **Integration Testing**: Real end-to-end tests against Docker containers, not just unit tests


