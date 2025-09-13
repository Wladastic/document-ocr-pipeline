# Deployment

This document covers deployment options for the Document Processing Pipeline.

## Local Development

### Quick Start

```bash
# One-command startup
./start-dev.sh
```

### Manual Setup

```bash
# Copy environment configuration
cp .env.example .env

# Start Redis
docker compose up -d redis

# Install dependencies
npm install

# Start development server
npm run dev
```

## Docker Deployment

### Full Docker Compose

Deploy both Redis and the application using Docker:

```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up --build -d

# View application logs
docker compose logs -f app

# View all logs
docker compose logs -f

# Stop services
docker compose down
```

### Production Considerations

For production deployment, consider:

**Environment Variables:**
- Set `REDIS_URL` to production Redis instance
- Configure `PORT` for load balancer requirements
- Set `STORAGE_DIR` to persistent volume mount
- Adjust `WORKER_TIMEOUT` based on document processing requirements

**Infrastructure:**
- Use managed Redis service (AWS ElastiCache, Google Memory Store, etc.)
- Mount persistent volumes for document storage
- Implement health checks and monitoring
- Configure log aggregation
- Set up container orchestration (Kubernetes, Docker Swarm)

**Security:**
- Enable Redis authentication
- Use TLS for Redis connections
- Implement API authentication/authorization
- Sanitize uploaded filenames
- Validate file types and sizes
- Set up network security groups

### Docker Configuration

**Services:**
- `redis`: Redis 7 Alpine with health checks
- `app`: Node.js 20 Alpine with application

**Ports:**
- Application: 3002 (configurable via `PORT` env var)
- Redis: 6379 (internal Docker network)

**Volumes:**
- `redis-data`: Persistent Redis storage
- `./storage`: Document file storage

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `PORT` | `3002` | HTTP server port |
| `STORAGE_DIR` | `./storage` | Document storage directory |
| `WORKER_TIMEOUT` | `5000` | Worker processing timeout (ms) |

## Health Checks

The application provides health endpoints for monitoring:

- `GET /health` - Application health status
- Redis health check via `redis-cli ping`

## Scaling Considerations

**Horizontal Scaling:**
- Multiple application instances can share the same Redis
- Queue processing is distributed automatically
- Use load balancer for HTTP requests

**Vertical Scaling:**
- Increase container memory/CPU limits
- Adjust `WORKER_TIMEOUT` for larger documents
- Monitor Redis memory usage

**Storage Scaling:**
- Consider object storage (S3, GCS) for file storage
- Implement Redis clustering for high availability
- Use Redis persistence for data durability

## Monitoring and Logging

**Application Logs:**
- Structured logging with timestamps
- Request/response logging
- Error tracking and alerting

**Metrics to Monitor:**
- Document processing throughput
- Queue depth and processing time
- Redis memory usage and connection count
- HTTP response times and error rates
- Container resource utilization

## Backup and Recovery

**Redis Data:**
- Configure Redis persistence (RDB + AOF)
- Regular Redis backups
- Point-in-time recovery capability

**Document Files:**
- Regular file system backups
- Consider versioning for document storage
- Disaster recovery procedures