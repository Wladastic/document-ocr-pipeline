#!/bin/bash

# Stop Redis and clean up
echo "Stopping Document Processing Pipeline..."

# Stop Redis container
echo "Stopping Redis container..."
docker compose down redis

echo "Cleanup complete"