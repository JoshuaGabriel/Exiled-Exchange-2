import { Result, ok, err } from "neverthrow";
import { ParsedItem } from "./ItemService";

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

// Simplified trade request structure
interface SimpleTradeRequest {
  query: {
    status: { option: "online" | "any" };
    name?: string;
    type?: string;
    filters: {
      type_filters?: {
        filters: {
          rarity?: { option?: string };
          category?: { option?: string };
          ilvl?: { min?: number; max?: number };
        };
      };
      misc_filters?: {
        filters: {
          corrupted?: { option?: string };
        };
      };
    };
  };
  sort: {
    price: "asc";
  };
}

export class PriceCheckService {
  private static readonly TRADE_API_BASE = "https://www.pathofexile.com/api/trade2";
  private static readonly DEFAULT_LEAGUE = "Standard";

  /**
   * Perform price check on a parsed item
   */
  static async checkPrice(
    parsedItem: ParsedItem,
    options: {
      league?: string;
      onlineOnly?: boolean;
      maxResults?: number;
    } = {}
  ): Promise<Result<PriceCheckResult, string>> {
    try {
      // Create search filters from parsed item
      const filters = this.createFiltersFromItem(parsedItem, {
        league: options.league || this.DEFAULT_LEAGUE,
        onlineOnly: options.onlineOnly ?? true,
      });

      // Create trade request
      const tradeRequest = this.createTradeRequest(filters);

      // Mock/simulate price check for now since we need to handle CORS and proxy setup
      // In production, this would make actual API calls through a proxy
      const mockResult = this.createMockPriceResult(parsedItem, filters);

      return ok(mockResult);
    } catch (error) {
      console.error("PriceCheckService.checkPrice error:", error);
      return err(`Failed to check price: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  private static createTradeRequest(filters: SimpleTradeFilters): SimpleTradeRequest {
    const request: SimpleTradeRequest = {
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
      request.query.filters.type_filters = { filters: {} };

      if (filters.rarity) {
        // Convert rarity to trade API format
        const rarityMap: Record<string, string> = {
          "Normal": "nonunique",
          "Magic": "nonunique", 
          "Rare": "nonunique",
          "Unique": "unique",
        };
        const tradeRarity = rarityMap[filters.rarity];
        if (tradeRarity) {
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
        if (tradeCategory) {
          request.query.filters.type_filters.filters.category = { option: tradeCategory };
        }
      }

      if (filters.itemLevel) {
        request.query.filters.type_filters.filters.ilvl = filters.itemLevel;
      }
    }

    // Misc filters
    if (filters.corrupted !== undefined) {
      request.query.filters.misc_filters = {
        filters: {
          corrupted: { option: String(filters.corrupted) },
        },
      };
    }

    return request;
  }

  /**
   * Create mock price result for demonstration
   * In production, this would process real API responses
   */
  private static createMockPriceResult(
    item: ParsedItem,
    filters: SimpleTradeFilters
  ): PriceCheckResult {
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
        itemLevel: item.itemLevel?.toString(),
        stackSize: item.category === "Currency" ? Math.floor(Math.random() * 20) + 1 : undefined,
        relativeDate: this.generateRelativeDate(),
        hasNote: Math.random() > 0.7,
        isInstantBuyout: Math.random() > 0.8,
      });
    }

    // Sort by price
    mockListings.sort((a, b) => a.priceAmount - b.priceAmount);

    // Calculate price stats
    const prices = mockListings.map(l => l.priceAmount);
    const median = prices[Math.floor(prices.length / 2)];
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    return {
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
      searchFilters: {
        name: filters.name,
        baseType: filters.baseType,
        category: filters.category,
        rarity: filters.rarity,
        corrupted: filters.corrupted,
        itemLevel: item.itemLevel,
      },
    };
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
}