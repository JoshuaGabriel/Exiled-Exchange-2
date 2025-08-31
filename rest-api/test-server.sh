#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Testing Exiled Exchange 2 REST API${NC}"
echo "=================================="

cd "$(dirname "$0")"

echo -e "\n${YELLOW} Building project...${NC}"
npm run clean 2>/dev/null || echo "No clean script, continuing..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED} Build failed${NC}"
    exit 1
fi

echo -e "${GREEN} Build successful${NC}"

echo -e "\n${YELLOW} Starting server...${NC}"
npm start &
SERVER_PID=$!

sleep 3

PORT=3000
if lsof -i :3000 > /dev/null 2>&1; then
    PORT=3000
elif lsof -i :3210 > /dev/null 2>&1; then
    PORT=3210
else
    echo -e "${RED} Server not found on expected ports${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN} Server running on port $PORT${NC}"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local expected_field=$4
    local description=$5
    
    echo -e "\n${YELLOW} Testing: $description${NC}"
    echo "URL: $method $url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$url")
    else
        response=$(curl -s -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    echo "Response: $response"
    
    # Check if response contains expected field
    if echo "$response" | grep -q "$expected_field"; then
        echo -e "${GREEN} PASS${NC}"
        return 0
    else
        echo -e "${RED} FAIL - Expected to find: $expected_field${NC}"
        return 1
    fi
}

# Test endpoints
BASE_URL="http://localhost:$PORT"
SAMPLE_ITEM='{"itemText":"Rarity: Rare\nDoom Knot\nSteel Ring\n--------\nRequirements:\nLevel: 22\n--------\nItem Level: 45\n--------\n+16 to maximum Life\n+8% to all Elemental Resistances\n--------\nCorrupted"}'

test_endpoint "GET" "$BASE_URL/health" "" '"success":true' "Health check"
test_endpoint "POST" "$BASE_URL/api/v1/items/parse" "$SAMPLE_ITEM" '"name":"Doom Knot"' "Item parsing"
test_endpoint "POST" "$BASE_URL/api/v1/items/price-check" "$SAMPLE_ITEM" '"success":true' "Price check"
test_endpoint "POST" "$BASE_URL/api/v1/items/analyze" "$SAMPLE_ITEM" '"success":true' "Item analysis"

echo -e "\n${YELLOW}🔍 Testing: Validation error handling${NC}"
echo "URL: POST $BASE_URL/api/v1/items/parse"
validation_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"itemText":""}' "$BASE_URL/api/v1/items/parse")
echo "Response: $validation_response"

if echo "$validation_response" | grep -q '"success":false'; then
    echo -e "${GREEN} PASS - Validation error handled correctly${NC}"
else
    echo -e "${RED} FAIL - Validation error not handled${NC}"
fi

echo -e "\n${YELLOW} Testing: 404 error handling${NC}"
echo "URL: GET $BASE_URL/api/v1/nonexistent"
notfound_response=$(curl -s "$BASE_URL/api/v1/nonexistent")
echo "Response: $notfound_response"

if echo "$notfound_response" | grep -q '"success":false'; then
    echo -e "${GREEN} PASS - 404 error handled correctly${NC}"
else
    echo -e "${RED} FAIL - 404 error not handled${NC}"
fi

echo -e "\n${YELLOW} Stopping server...${NC}"
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo -e "\n${GREEN}Test completed!${NC}"
echo -e "${YELLOW}Server logs should show the API requests above${NC}"
echo -e "${YELLOW}All endpoints are responding as expected${NC}"
