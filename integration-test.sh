#!/bin/bash

# Integration Test Script
# Starts Docker services and runs integration tests against the live API

set -e  # Exit on any error

echo "Starting Integration Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    
    if result=$(eval "$test_command" 2>/dev/null); then
        if [[ "$result" == *"$expected_result"* ]]; then
            echo -e "${GREEN}PASS: $test_name${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}FAIL: $test_name${NC}"
            echo "Expected: $expected_result"
            echo "Got: $result"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    else
        echo -e "${RED}FAIL: $test_name (command failed)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to wait for service
wait_for_service() {
    local url="$1"
    local service_name="$2"
    local max_attempts=30
    local attempt=1
    
    echo "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "$service_name is ready"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}ERROR: $service_name failed to start within $((max_attempts * 2)) seconds${NC}"
    return 1
}

# Cleanup function
cleanup() {
    echo "Cleaning up..."
    docker compose down --volumes --remove-orphans > /dev/null 2>&1
}

# Set up cleanup trap
trap cleanup EXIT

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Build and start services
echo "Building application..."
docker compose build --quiet app

echo "Starting services..."
docker compose up -d

# Wait for services to be ready
wait_for_service "http://localhost:3002/health" "Application"

# Give the worker a moment to start
sleep 3

echo "Running integration tests..."

# Test 1: Health check
run_test "Health check endpoint" \
         "curl -s http://localhost:3002/health" \
         '{"ok":true}'

# Test 2: Upload document
echo "Testing document upload..."
UPLOAD_RESULT=$(curl -s -X POST http://localhost:3002/documents \
    -H "content-type: application/json" \
    -d '{
        "filename": "test-invoice.png",
        "dtype": "invoice", 
        "contentBase64": "aGVsbG8gd29ybGQ="
    }')

if [[ "$UPLOAD_RESULT" == *'"status":"uploaded"'* ]]; then
    echo -e "${GREEN}PASS: Document upload${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Extract document ID
    DOC_ID=$(echo "$UPLOAD_RESULT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Document ID: $DOC_ID"
    
    # Test 3: Check document status (wait for processing)
    echo "Waiting for document processing..."
    for i in {1..10}; do
        sleep 2
        STATUS_RESULT=$(curl -s "http://localhost:3002/documents/$DOC_ID")
        STATUS=$(echo "$STATUS_RESULT" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        echo "Status check $i: $STATUS"
        
        if [[ "$STATUS" == "validated" ]]; then
            echo -e "${GREEN}PASS: Document processing pipeline${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            
            # Test 4: Verify metadata extraction
            if [[ "$STATUS_RESULT" == *'"metadata":'* ]] && [[ "$STATUS_RESULT" == *'"invoiceNumber":'* ]]; then
                echo -e "${GREEN}PASS: Metadata extraction${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                echo -e "${RED}FAIL: Metadata extraction${NC}"
                TESTS_FAILED=$((TESTS_FAILED + 1))
            fi
            
            # Test 5: Verify OCR text
            if [[ "$STATUS_RESULT" == *'"ocrText":'* ]]; then
                echo -e "${GREEN}PASS: OCR processing${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                echo -e "${RED}FAIL: OCR processing${NC}"
                TESTS_FAILED=$((TESTS_FAILED + 1))
            fi
            break
        elif [[ "$STATUS" == "failed" ]]; then
            echo -e "${RED}FAIL: Document processing pipeline (status: failed)${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            break
        fi
    done
    
    if [[ "$STATUS" != "validated" ]] && [[ "$STATUS" != "failed" ]]; then
        echo -e "${RED}FAIL: Document processing pipeline (timeout)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${RED}FAIL: Document upload${NC}"
    echo "Upload result: $UPLOAD_RESULT"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 6: Invalid document type
run_test "Invalid document type rejection" \
         "curl -s -X POST http://localhost:3002/documents -H 'content-type: application/json' -d '{\"filename\":\"test.png\",\"dtype\":\"invalid\",\"contentBase64\":\"dGVzdA==\"}'" \
         '"error":"Invalid request"'

# Test 7: Missing required fields
run_test "Missing required fields rejection" \
         "curl -s -X POST http://localhost:3002/documents -H 'content-type: application/json' -d '{\"filename\":\"test.png\"}'" \
         '"error":"Invalid request"'

# Test 8: Non-existent document
run_test "Non-existent document 404" \
         "curl -s http://localhost:3002/documents/non-existent-id" \
         '"error":"Not found"'

# Print test results
echo ""
echo "Test Results:"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All integration tests passed${NC}"
    exit 0
else
    echo -e "${RED}Some integration tests failed${NC}"
    exit 1
fi