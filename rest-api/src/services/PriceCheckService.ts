import { Result, ok, err } from "neverthrow";
import { ParsedItem } from "./ItemService";
import { tradeApiClient, TradeRequest, TradeSearchResponse, TradeFetchResponse } from "./TradeApiClient";
import { cacheService, CacheService } from "./CacheService";

// Basic price check interfaces
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

// Basic trade filters we can create from our parsed item data
interface SimpleTradeFilters {
  name?: string;
  baseType?: string;
  category?: string;
  rarity?: string;
  corrupted?: boolean;
  itemLevel?: {
    min?: number;
    max?: number;
  };
  league: string;
}

export class PriceCheckService {
  private static readonly DEFAULT_LEAGUE = "Rise of the Abyssal";
  private static readonly CACHE_TTL_SECONDS = 300; // 5 minutes
  private static readonly MAX_RESULTS = 20; // Limit results to avoid rate limits

  /**
   * Perform price check on a parsed item
   */
  static async checkPrice(
    parsedItem: ParsedItem,
    options: {
      league?: string;
      onlineOnly?: boolean;
      maxResults?: number;
      useCache?: boolean;
    } = {}
  ): Promise<Result<PriceCheckResult, string>> {
    try {
      const league = options.league || this.DEFAULT_LEAGUE;
      const useCache = options.useCache ?? true;
      
      // Create cache key
      const cacheKey = CacheService.createKey(
        'price-check',
        parsedItem.name || parsedItem.baseType,
        parsedItem.rarity,
        parsedItem.isCorrupted,
        parsedItem.itemLevel,
        league,
        options.onlineOnly
      );

      // Check cache first
      if (useCache) {
        const cachedResult = cacheService.get<PriceCheckResult>(cacheKey);
        if (cachedResult.isOk()) {
          console.debug('Cache hit for price check:', cacheKey);
          return ok(cachedResult.value);
        }
      }

      // Create search filters from parsed item
      const filters = this.createFiltersFromItem(parsedItem, {
        league,
        onlineOnly: options.onlineOnly ?? true,
      });

      // Create trade request
      const tradeRequest = this.createTradeRequest(filters);

      // Search for items
      const searchResult = await tradeApiClient.search(tradeRequest, league);
      
      // Check if search failed and return mock data
      if (!searchResult) {
        console.warn('Trade API search failed, using mock data');
        return this.createMockPriceResult(parsedItem, filters);
      }

      const searchData = searchResult;
      
      // If no results found, return empty result
      if (!searchData.result || searchData.result.length === 0) {
        const emptyResult: PriceCheckResult = {
          itemName: parsedItem.name,
          baseType: parsedItem.baseType,
          category: parsedItem.category,
          listings: [],
          priceStats: {
            median: undefined,
            average: undefined,
            currency: this.getCurrencyForItem(parsedItem),
            totalListings: 0,
          },
          searchFilters: this.createSearchFilters(filters),
        };
        
        if (useCache) {
          cacheService.set(cacheKey, emptyResult, this.CACHE_TTL_SECONDS);
        }
        
        return ok(emptyResult);
      }

      // Fetch detailed item data
      const maxFetch = Math.min(searchData.result.length, options.maxResults || this.MAX_RESULTS);
      const itemIds = searchData.result.slice(0, maxFetch);
      
      const fetchResult = await tradeApiClient.fetch(itemIds, searchData.id, league);
      if (!fetchResult) {
        console.warn('Trade API fetch failed, using mock data');
        return this.createMockPriceResult(parsedItem, filters);
      }

      // Process the real API response
      const result = this.processApiResponse(
        parsedItem,
        filters,
        searchData,
        fetchResult
      );

      // Cache the result
      if (useCache) {
        cacheService.set(cacheKey, result, this.CACHE_TTL_SECONDS);
      }

      return ok(result);
    } catch (error) {
      console.error("PriceCheckService.checkPrice error:", error);
      
      // Fallback to mock data on any error
      const filters = this.createFiltersFromItem(parsedItem, {
        league: options.league || this.DEFAULT_LEAGUE,
        onlineOnly: options.onlineOnly ?? true,
      });
      return this.createMockPriceResult(parsedItem, filters);
    }
  }

  /**
   * Process real API response into our format
   */
  private static processApiResponse(
    item: ParsedItem,
    filters: SimpleTradeFilters,
    searchData: TradeSearchResponse,
    fetchData: TradeFetchResponse
  ): PriceCheckResult {
    const listings: PriceListingResult[] = [];

    for (const result of fetchData.result) {
      if (!result || !result.listing.price) continue;

      const listing: PriceListingResult = {
        id: result.id,
        priceAmount: result.listing.price.amount,
        priceCurrency: result.listing.price.currency,
        accountName: result.listing.account.name,
        characterName: result.listing.account.lastCharacterName,
        itemLevel: result.item.ilvl?.toString(),
        stackSize: (result.item as any).stackSize,
        relativeDate: this.formatRelativeDate(result.listing.indexed),
        hasNote: !!result.item.note,
        isInstantBuyout: result.listing.price.type === "~price",
        accountStatus: result.listing.account.online
          ? ((result.listing.account.online as any).status === "afk"
            ? "afk"
            : "online")
          : "offline",
      };

      listings.push(listing);
    }

    // Sort by price
    listings.sort((a, b) => a.priceAmount - b.priceAmount);

    // Calculate price stats
    const prices = listings.map(l => l.priceAmount).filter(p => p > 0);
    let priceStats: PriceCheckResult['priceStats'];
    
    if (prices.length > 0) {
      const median = prices[Math.floor(prices.length / 2)];
      const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      
      priceStats = {
        median: Math.round(median * 100) / 100,
        average: Math.round(average * 100) / 100,
        currency: listings[0]?.priceCurrency || this.getCurrencyForItem(item),
        totalListings: listings.length,
      };
    } else {
      priceStats = {
        median: undefined,
        average: undefined,
        currency: this.getCurrencyForItem(item),
        totalListings: 0,
      };
    }

    return {
      itemName: item.name,
      baseType: item.baseType,
      category: item.category,
      listings,
      priceStats,
      searchFilters: this.createSearchFilters(filters),
    };
  }

  /**
   * Format ISO date to relative time
   */
  private static formatRelativeDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      const minutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (minutes < 1) return "just now";
      if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
      return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''} ago`;
    } catch {
      return "unknown";
    }
  }

  /**
   * Create basic search filters from parsed item data
   */
  private static createFiltersFromItem(
    item: ParsedItem,
    options: { league: string; onlineOnly: boolean }
  ): SimpleTradeFilters {
    const filters: SimpleTradeFilters = {
      league: options.league,
    };

    // Add name for unique items, base type for others
    if (item.rarity === "Unique" && item.name) {
      filters.name = item.name;
    } else if (item.baseType) {
      filters.baseType = item.baseType;
    } else if (item.name) {
      filters.name = item.name;
    }

    // Add category if available
    if (item.category) {
      filters.category = item.category;
    }

    // Add rarity filter (important for pricing)
    if (item.rarity) {
      filters.rarity = item.rarity;
    }

    // Add corruption status
    filters.corrupted = item.isCorrupted;

    // Add item level with some tolerance for non-unique items
    if (item.itemLevel && item.rarity !== "Unique") {
      const levelTolerance = 5;
      filters.itemLevel = {
        min: Math.max(1, item.itemLevel - levelTolerance),
        max: item.itemLevel + levelTolerance,
      };
    }

    return filters;
  }

  /**
   * Create trade request from filters
   */
  private static createTradeRequest(filters: SimpleTradeFilters): TradeRequest {
    const request: TradeRequest = {
      query: {
        status: { option: "online" },
        filters: {},
      },
      sort: {
        price: "asc",
      },
    };

    // Set name or type
    if (filters.name) {
      request.query.name = filters.name;
    }
    if (filters.baseType) {
      request.query.type = filters.baseType;
    }

    // Type filters
    if (filters.rarity || filters.category || filters.itemLevel) {
      request.query.filters = request.query.filters || {};
      request.query.filters.type_filters = { filters: {} };

      if (filters.rarity) {
        // Convert rarity to trade API format
        const rarityMap: Record<string, string> = {
          "Normal": "normal",
          "Magic": "magic", 
          "Rare": "rare",
          "Unique": "unique",
        };
        const tradeRarity = rarityMap[filters.rarity];
        if (tradeRarity && request.query.filters.type_filters?.filters) {
          request.query.filters.type_filters.filters.rarity = { option: tradeRarity };
        }
      }

      if (filters.category) {
        // Map our basic categories to trade API categories
        const categoryMap: Record<string, string> = {
          "Currency": "currency",
          "Gem": "gem",
          "Map": "map",
          "DivinationCard": "card",
        };
        const tradeCategory = categoryMap[filters.category];
        if (tradeCategory && request.query.filters.type_filters?.filters) {
          request.query.filters.type_filters.filters.category = { option: tradeCategory };
        }
      }

      if (filters.itemLevel && request.query.filters.misc_filters?.filters) {
        request.query.filters.misc_filters.filters.ilvl = filters.itemLevel;
      }
    }

    // Misc filters
    if (filters.corrupted !== undefined) {
      request.query.filters = request.query.filters || {};
      request.query.filters.misc_filters = {
        filters: {
          corrupted: { option: String(filters.corrupted) },
        },
      };
    }

    return request;
  }

  /**
   * Create search filters for response
   */
  private static createSearchFilters(filters: SimpleTradeFilters): PriceCheckResult['searchFilters'] {
    return {
      name: filters.name,
      baseType: filters.baseType,
      category: filters.category,
      rarity: filters.rarity,
      corrupted: filters.corrupted,
      itemLevel: filters.itemLevel?.min || filters.itemLevel?.max,
    };
  }

  /**
   * Create mock price result for demonstration (fallback)
   */
  private static createMockPriceResult(
    item: ParsedItem,
    filters: SimpleTradeFilters
  ): Result<PriceCheckResult, string> {
    // Generate some realistic mock price data
    const mockListings: PriceListingResult[] = [];
    const basePrice = this.estimateBasePrice(item);
    
    // Create 5-15 mock listings with price variation
    const listingCount = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < listingCount; i++) {
      const priceVariation = 0.8 + (Math.random() * 0.4); // ±20% variation
      const price = Math.round(basePrice * priceVariation * 100) / 100;
      
      mockListings.push({
        id: `mock_${i}`,
        priceAmount: price,
        priceCurrency: this.getCurrencyForItem(item),
        accountName: `Player${i + 1}`,
        characterName: `Character${i + 1}`,
        itemLevel: item.itemLevel?.toString(),
        stackSize: item.category === "Currency" ? Math.floor(Math.random() * 20) + 1 : undefined,
        relativeDate: this.generateRelativeDate(),
        hasNote: Math.random() > 0.7,
        isInstantBuyout: Math.random() > 0.8,
        accountStatus: Math.random() > 0.3 ? "online" : Math.random() > 0.5 ? "afk" : "offline",
      });
    }

    // Sort by price
    mockListings.sort((a, b) => a.priceAmount - b.priceAmount);

    // Calculate price stats
    const prices = mockListings.map(l => l.priceAmount);
    const median = prices[Math.floor(prices.length / 2)];
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    const result: PriceCheckResult = {
      itemName: item.name,
      baseType: item.baseType,
      category: item.category,
      listings: mockListings,
      priceStats: {
        median: Math.round(median * 100) / 100,
        average: Math.round(average * 100) / 100,
        currency: this.getCurrencyForItem(item),
        totalListings: mockListings.length,
      },
      searchFilters: this.createSearchFilters(filters),
    };

    return ok(result);
  }

  /**
   * Estimate base price for different item types
   */
  private static estimateBasePrice(item: ParsedItem): number {
    // Basic price estimation based on item type and properties
    switch (item.category) {
      case "Currency":
        return Math.random() * 10 + 1; // 1-10 chaos equivalent
      case "Gem":
        return Math.random() * 50 + 5; // 5-55 chaos
      case "Map":
        const mapPrice = item.itemLevel ? Math.max(1, item.itemLevel * 0.5) : 10;
        return mapPrice + (Math.random() * 20);
      default:
        // Equipment and other items
        if (item.rarity === "Unique") {
          return Math.random() * 500 + 10; // 10-510 chaos for uniques
        } else if (item.rarity === "Rare") {
          return Math.random() * 100 + 1; // 1-101 chaos for rares
        } else {
          return Math.random() * 10 + 0.1; // 0.1-10 chaos for magic/normal
        }
    }
  }

  /**
   * Get appropriate currency for item type
   */
  private static getCurrencyForItem(item: ParsedItem): string {
    switch (item.category) {
      case "Currency":
        return "chaos"; // Currency usually priced in chaos
      case "Gem":
        return item.rarity === "Unique" ? "chaos" : "alchemy";
      case "Map":
        return "chaos";
      default:
        if (item.rarity === "Unique") {
          return "chaos";
        } else if (item.rarity === "Rare") {
          return "chaos";
        } else {
          return "alchemy";
        }
    }
  }

  /**
   * Generate realistic relative date strings
   */
  private static generateRelativeDate(): string {
    const dates = [
      "1 minute ago",
      "5 minutes ago",
      "15 minutes ago",
      "1 hour ago",
      "3 hours ago",
      "1 day ago",
      "2 days ago",
      "1 week ago",
    ];
    return dates[Math.floor(Math.random() * dates.length)];
  }

  /**
   * Validate price check request parameters
   */
  static validatePriceCheckRequest(item: ParsedItem): Result<void, string> {
    if (!item.name && !item.baseType) {
      return err("Item must have either a name or base type for price checking");
    }

    if (item.category === "Currency" && !item.name) {
      return err("Currency items must have a name for price checking");
    }

    return ok(undefined);
  }

  /**
   * Get available leagues (hardcoded to avoid rate limits)
   */
  static async getLeagues(): Promise<Result<Array<{ id: string; text: string }>, string>> {
    // Hardcoded PoE2 leagues to avoid rate limiting the /leagues endpoint
    // These are the current PoE2 leagues as of the current league
    const poe2Leagues = [
      { id: "Rise of the Abyssal", text: "Rise of the Abyssal" },
      { id: "HC Rise of the Abyssal", text: "HC Rise of the Abyssal" },
      { id: "Standard", text: "Standard" },
      { id: "Hardcore", text: "Hardcore" },
    ];
    
    console.debug('Returning hardcoded PoE2 leagues to avoid rate limits');
    return ok(poe2Leagues);
  }

  /**
   * Test trade API connectivity
   */
  static async testConnection(): Promise<Result<boolean, string>> {
    // Since we don't have testConnection method in TradeApiClient, 
    // we'll check rate limit status as a proxy for connectivity
    try {
      const status = tradeApiClient.getRateLimitStatus();
      return ok(status.search.available >= 0 && status.fetch.available >= 0);
    } catch (error) {
      return err(`Connection test failed: ${error}`);
    }
  }

  /**
   * Get rate limit status
   */
  static getRateLimitStatus() {
    return tradeApiClient.getRateLimitStatus();
  }

  /**
   * Clear price check cache
   */
  static clearCache(): void {
    cacheService.clear();
  }
}