# API Documentation

The API is built with Hono and exposes endpoints for document upload and retrieval.

## Endpoints

### POST /documents

Upload a document for processing.

**Request:**
```json
{
  "filename": "invoice-001.png",
  "dtype": "invoice" | "receipt" | "contract", 
  "contentBase64": "base64-encoded-file-content"
}
```

**Response:** HTTP 202 Accepted
```json
{
  "id": "uuid-v4-document-id",
  "status": "uploaded"
}
```

**Validation:**
- Request payload validated using Zod (`UploadSchema`)
- `filename` must be a non-empty string
- `dtype` must be one of: `invoice`, `receipt`, `contract`
- `contentBase64` must be valid base64-encoded content

### GET /documents/:id

Retrieve document status and processed data.

**Response:** HTTP 200 OK
```json
{
  "id": "uuid-v4-document-id",
  "filename": "invoice-001.png",
  "dtype": "invoice",
  "status": "validated",
  "metadata": {
    "invoiceNumber": "INV-20250913-4147",
    "customerName": "ACME GmbH", 
    "total": 123.45,
    "currency": "EUR",
    "invoiceDate": "2025-09-13",
    "sourceLanguage": "en",
    "ocrConfidence": 0.98,
    "processedAt": "2025-09-13T13:02:15.475Z"
  },
  "ocrText": "Extracted OCR text content..."
}
```

### GET /health

Health check endpoint for monitoring.

**Response:** HTTP 200 OK
```json
{
  "ok": true
}
```

## Status Flow

Documents progress through these statuses as specified in the task requirements:

1. `uploaded` - Document received and queued for processing
2. `processing` - Worker has started processing the document  
3. `validated` - OCR and metadata extraction completed successfully (final success state)
4. `failed` - Processing failed at any step (validation errors, OCR errors, etc.)

## Error Responses

- **400 Bad Request**: Invalid request payload (returns Zod validation `issues`)
- **404 Not Found**: Document ID not found
- **500 Internal Server Error**: Server errors during processing

## Example Usage

```bash
# Upload a document
curl -X POST http://localhost:3002/documents \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "invoice-001.png",
    "dtype": "invoice",
    "contentBase64": "aGVsbG8gd29ybGQ="
  }'

# Check document status  
curl http://localhost:3002/documents/<document-id>

# Health check
curl http://localhost:3002/health
```
