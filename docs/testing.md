# Testing

The project includes both unit tests and comprehensive integration tests.

## Unit Tests

Unit tests are implemented with Vitest and test individual components in isolation:

```bash
npm test
```

**Current unit test coverage:**
- OCR simulation (`simulateOCR`)
- Metadata extraction (`extractMetadata`)  
- Zod validation schemas (`validateByType`, `UploadSchema`)
- Queue job processing (`processJob`) with mocked dependencies

## Integration Tests

Comprehensive integration tests run against real Docker services:

```bash
npm run test:integration
# or
./integration-test.sh
```

**Integration test coverage:**
- Full Docker container deployment
- Real Redis queue and persistence
- Complete document processing pipeline
- HTTP API endpoints (POST /documents, GET /documents/:id, GET /health)
- Error handling and validation
- End-to-end document workflow (upload → queue → process → persist)

**What integration tests verify:**
- Document upload with validation
- Queue processing with real Redis
- OCR simulation and metadata extraction
- Document status transitions
- Error responses (400, 404, 500)
- Real HTTP request/response cycle

## Test Strategy

**Unit Tests** - Fast, isolated testing of business logic:
- Mock external dependencies (Redis, file system)
- Test individual functions and modules
- Validate schemas and transformations

**Integration Tests** - End-to-end validation:
- Real Docker services (Redis + App)
- Actual HTTP requests via curl
- Complete pipeline verification
- Production-like environment

## Running Tests

```bash
# Unit tests only
npm test

# Integration tests only  
npm run test:integration

# Both (recommended for CI/CD)
npm test && npm run test:integration
```

## Test Infrastructure

- **Unit**: Vitest with mocked dependencies
- **Integration**: Docker Compose + bash script with curl
- **Services**: Redis container + application container
- **Cleanup**: Automatic Docker container cleanup after tests
- **CI Ready**: Exit codes and colored output for automation

## Development Testing

For local development, you can also run services manually:

```bash
# Start development environment
./start-dev.sh

# Test endpoints manually
curl -X POST http://localhost:3002/documents \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.png","dtype":"invoice","contentBase64":"dGVzdA=="}'

curl http://localhost:3002/documents/<id>

# Stop development environment  
./stop-dev.sh
```

