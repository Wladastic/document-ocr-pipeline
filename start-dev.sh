#!/bin/bash

# Start Redis and Development Server
echo "Starting Document Processing Pipeline..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker first."
    exit 1
fi

# Start Redis container
echo "Starting Redis container..."
docker compose up -d redis

# Wait a moment for Redis to be ready
echo "Waiting for Redis to be ready..."
sleep 3

# Check if Redis is responding
if docker compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo "Redis is ready"
else
    echo "WARNING: Redis might not be fully ready yet, but continuing..."
fi

# Start the development server
echo "Starting development server..."
npm run dev