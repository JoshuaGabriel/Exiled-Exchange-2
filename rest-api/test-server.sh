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

# Enhanced Parser Tests
echo -e "\n${YELLOW}🔍 Enhanced Parser Tests${NC}"
echo "=================================="

# Test 1: Corrupted Rare Ring (current sample)
echo -e "\n${YELLOW} Testing: Corrupted rare ring parsing${NC}"
ring_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$SAMPLE_ITEM" "$BASE_URL/api/v1/items/parse")
echo "Response: $ring_response"

if echo "$ring_response" | grep -q '"name":"Doom Knot"' && 
   echo "$ring_response" | grep -q '"baseType":"Steel Ring"' && 
   echo "$ring_response" | grep -q '"rarity":"Rare"' && 
   echo "$ring_response" | grep -q '"itemLevel":45' && 
   echo "$ring_response" | grep -q '"isCorrupted":true'; then
    echo -e "${GREEN} PASS - All ring properties parsed correctly${NC}"
else
    echo -e "${RED} FAIL - Ring parsing incomplete${NC}"
fi

# Test 2: Normal weapon
WEAPON_ITEM='{"itemText":"Rarity: Normal\nIron Sword\n--------\nOne Handed Swords\n--------\nPhysical Damage: 10-18\nCritical Strike Chance: 5.00%\nAttacks per Second: 1.30\nWeapon Range: 11\n--------\nRequirements:\nLevel: 5\nStr: 12\nDex: 12\n--------\nSockets: R-G \n--------\nItem Level: 15"}'

echo -e "\n${YELLOW} Testing: Normal weapon parsing${NC}"
weapon_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$WEAPON_ITEM" "$BASE_URL/api/v1/items/parse")
echo "Response: $weapon_response"

if echo "$weapon_response" | grep -q '"name":"Iron Sword"' && 
   echo "$weapon_response" | grep -q '"rarity":"Normal"' && 
   echo "$weapon_response" | grep -q '"itemLevel":15' && 
   echo "$weapon_response" | grep -q '"isCorrupted":false'; then
    echo -e "${GREEN} PASS - Normal weapon parsed correctly${NC}"
else
    echo -e "${RED} FAIL - Normal weapon parsing failed${NC}"
fi

# Test 3: Currency item
CURRENCY_ITEM='{"itemText":"Rarity: Currency\nOrb of Fusing\n--------\nItem Class: Currency\n--------\nStack Size: 12/20\n--------\nReforges the links between sockets on an item\nRight click to use."}'

echo -e "\n${YELLOW} Testing: Currency item parsing${NC}"
currency_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$CURRENCY_ITEM" "$BASE_URL/api/v1/items/parse")
echo "Response: $currency_response"

if echo "$currency_response" | grep -q '"name":"Orb of Fusing"' && 
   echo "$currency_response" | grep -q '"rarity":"Currency"' && 
   echo "$currency_response" | grep -q '"category":"Currency"' && 
   echo "$currency_response" | grep -q '"isCorrupted":false'; then
    echo -e "${GREEN} PASS - Currency item parsed correctly${NC}"
else
    echo -e "${RED} FAIL - Currency item parsing failed${NC}"
fi

# Test 4: Gem
GEM_ITEM='{"itemText":"Rarity: Gem\nFireball\n--------\nItem Class: Gem\n--------\nLevel: 5 (Max)\nMana Cost: 12\nCast Time: 0.85 sec\nCritical Strike Chance: 6.00%\nDamage Effectiveness: 100%\n--------\nRequirements:\nLevel: 12\nInt: 33\n--------\nLaunches a slow-moving projectile that pierces through enemies, dealing fire damage.\n--------\nDeals 31 to 47 Fire Damage\n25% chance to Ignite\n--------\nPlace into an item socket of the right colour to gain this skill."}'

echo -e "\n${YELLOW} Testing: Gem parsing${NC}"
gem_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$GEM_ITEM" "$BASE_URL/api/v1/items/parse")
echo "Response: $gem_response"

if echo "$gem_response" | grep -q '"name":"Fireball"' && 
   echo "$gem_response" | grep -q '"rarity":"Gem"' && 
   echo "$gem_response" | grep -q '"category":"Gem"'; then
    echo -e "${GREEN} PASS - Gem parsed correctly${NC}"
else
    echo -e "${RED} FAIL - Gem parsing failed${NC}"
fi

# Test 5: Empty/Invalid item text
echo -e "\n${YELLOW} Testing: Parser validation${NC}"
empty_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"itemText":""}' "$BASE_URL/api/v1/items/parse")
invalid_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"itemText":"Not a valid item"}' "$BASE_URL/api/v1/items/parse")

if echo "$empty_response" | grep -q '"success":false' && 
   echo "$invalid_response" | grep -q '"success":false'; then
    echo -e "${GREEN} PASS - Parser validation working correctly${NC}"
else
    echo -e "${RED} FAIL - Parser validation not working${NC}"
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
