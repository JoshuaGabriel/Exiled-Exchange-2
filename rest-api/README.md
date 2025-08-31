# Exiled Exchange 2 REST API

REST API server that exposes Exiled Exchange 2's core functionality for remote access.

## Quick Start

```bash
npm install
npm run dev
curl http://localhost:3210/health
```
### Endpoints so far
- `POST /api/v1/items/parse` - Parse item text into structured data
- `POST /api/v1/items/price-check` - Get price estimates and trade listings
- `POST /api/v1/items/analyze` - Comprehensive item analysis

## Example Usage

### Parse Item
```bash
curl -X POST http://localhost:3210/api/v1/items/parse \
  -H "Content-Type: application/json" \
  -d '{
    "itemText": "Rarity: Rare\nDoom Knot\nSteel Ring\n--------\nRequirements:\nLevel: 22\n--------\nItem Level: 45\n--------\n+16 to maximum Life\n+8% to all Elemental Resistances\n--------\nCorrupted"
  }'
```

### Price Check Item
```bash
curl -X POST http://localhost:3210/api/v1/items/price-check \
  -H "Content-Type: application/json" \
  -d '{
    "itemText": "Rarity: Rare\nDoom Knot\nSteel Ring\n--------\nRequirements:\nLevel: 22\n--------\nItem Level: 45\n--------\n+16 to maximum Life\n+8% to all Elemental Resistances\n--------\nCorrupted",
    "league": "Standard",
    "options": {
      "includeListings": true,
      "maxResults": 20
    }
  }'
```

## Build & Deploy

```bash
npm run build
npm start
```
