// API Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  timestamp: string;
}

// Item parsing request
export interface ParseItemRequest {
  itemText: string;
}

// Price check request
export interface PriceCheckRequest {
  itemText: string;
  league?: string;
  options?: {
    includeListings?: boolean;
    includePrediction?: boolean;
    maxResults?: number;
  };
  filters?: {
    online?: boolean;
    maxPrice?: number;
    currency?: string;
    listed?: string;
  };
}

// Analyze item request (combines parsing and price checking)
export interface AnalyzeItemRequest {
  itemText: string;
  league?: string;
  includeMarketData?: boolean;
  includeSimilarItems?: boolean;
}

// Error codes
export enum ApiErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  ITEM_PARSE_ERROR = 'ITEM_PARSE_ERROR',
  PRICE_CHECK_ERROR = 'PRICE_CHECK_ERROR',
  TRADE_API_ERROR = 'TRADE_API_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// League info
export interface League {
  id: string;
  text: string;
  hardcore: boolean;
  realm: string;
}

// Price prediction
export interface PricePrediction {
  min: number;
  max: number;
  confidence: number;
  currency: string;
  explanation: Array<{
    name: string;
    contrib: number;
  }>;
}

// Market summary
export interface MarketSummary {
  total: number;
  showing: number;
  averagePrice?: number;
  medianPrice?: number;
}