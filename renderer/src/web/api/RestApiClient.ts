import { Result, ok, err } from "neverthrow";
import { ParsedItem } from "@/parser";

export interface RestApiConfig {
  baseUrl: string;
  timeout?: number;
}

export interface ParseItemRequest {
  itemText: string;
}

export interface ParseItemResponse {
  success: boolean;
  data: {
    item: ParsedItem;
  };
  timestamp: string;
}

export interface PriceCheckRequest {
  itemText: string;
  league?: string;
  onlineOnly?: boolean;
}

export interface PriceListingResult {
  id: string;
  priceAmount: number;
  priceCurrency: string;
  accountName: string;
  itemLevel?: string;
  stackSize?: number;
  relativeDate: string;
  hasNote: boolean;
  isInstantBuyout: boolean;
  accountStatus: "offline" | "online" | "afk";
  characterName: string;
}

export interface PriceCheckResult {
  itemName: string;
  baseType?: string;
  category?: string;
  listings: PriceListingResult[];
  priceStats?: {
    median?: number;
    average?: number;
    currency: string;
    totalListings: number;
  };
  searchFilters: {
    name?: string;
    baseType?: string;
    category?: string;
    rarity?: string;
    corrupted?: boolean;
    itemLevel?: number;
  };
}

export interface PriceCheckResponse {
  success: boolean;
  data: {
    item: ParsedItem;
    priceCheck: PriceCheckResult;
  };
  timestamp: string;
}

export interface AnalyzeItemRequest {
  itemText: string;
  league?: string;
  includeMarketData?: boolean;
  includeSimilarItems?: boolean;
}

export interface AnalyzeItemResponse {
  success: boolean;
  data: {
    item: ParsedItem;
    priceAnalysis?: PriceCheckResult;
    marketData?: {
      totalListings: number;
      priceStats?: {
        median?: number;
        average?: number;
        currency: string;
        totalListings: number;
      };
      searchFilters?: any;
    };
    similarItems?: any[];
    recommendations?: {
      quickSell: number | null;
      fairPrice: number | null;
      highPrice: number | null;
      currency: string;
    };
  };
  timestamp: string;
}

export interface LeaguesResponse {
  success: boolean;
  data: {
    leagues: Array<{ id: string; text: string }>;
    rateLimits: any;
  };
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
  timestamp: string;
}

export class RestApiClient {
  private config: RestApiConfig;

  constructor(config: RestApiConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Result<T, string>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiError;
        return err(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        const errorData = data as ApiError;
        return err(errorData.error?.message || 'Unknown API error');
      }

      return ok(data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return err('Request timeout');
        }
        return err(error.message);
      }
      return err('Unknown error occurred');
    }
  }

  async parseItem(request: ParseItemRequest): Promise<Result<ParsedItem, string>> {
    const result = await this.makeRequest<ParseItemResponse>('/api/v1/items/parse', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return result.map(response => response.data.item);
  }

  async priceCheck(request: PriceCheckRequest): Promise<Result<{ item: ParsedItem; priceCheck: PriceCheckResult }, string>> {
    const result = await this.makeRequest<PriceCheckResponse>('/api/v1/items/price-check', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return result.map(response => response.data);
  }

  async analyzeItem(request: AnalyzeItemRequest): Promise<Result<AnalyzeItemResponse['data'], string>> {
    const result = await this.makeRequest<AnalyzeItemResponse>('/api/v1/items/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return result.map(response => response.data);
  }

  async getLeagues(): Promise<Result<Array<{ id: string; text: string }>, string>> {
    const result = await this.makeRequest<LeaguesResponse>('/api/v1/items/leagues');
    return result.map(response => response.data.leagues);
  }

  async testConnection(): Promise<Result<boolean, string>> {
    try {
      const result = await this.makeRequest<{ success: boolean; data: { connected: boolean } }>('/api/v1/items/test-connection');
      return result.map(response => response.data.connected);
    } catch {
      return err('Failed to connect to REST API');
    }
  }

  async getHealth(): Promise<Result<{ status: string; uptime: number }, string>> {
    const result = await this.makeRequest<{ success: boolean; data: { status: string; uptime: number } }>('/health');
    return result.map(response => response.data);
  }
}

// Default instance for the application
export const restApiClient = new RestApiClient({
  baseUrl: 'http://192.168.1.94:3000',
});

// Export function to update the base URL if needed
export function updateApiBaseUrl(baseUrl: string) {
  Object.assign(restApiClient, new RestApiClient({ baseUrl }));
}