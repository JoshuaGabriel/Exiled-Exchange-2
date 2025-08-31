import fetch from 'node-fetch';
import { POE2_CATEGORIES } from '../shared/poe2-categories';
import { POE2_STATS } from '../shared/poe2-stats';
import { POE2_CURRENCIES } from '../shared/poe2-currencies';

export interface TradeRequest {
  query: {
    status?: { option: string };
    name?: string;
    type?: string;
    stats?: Array<{
      type: 'and' | 'if' | 'count';
      filters: Array<{
        id: string;
        value?: {
          min?: number;
          max?: number;
          option?: string;
        };
      }>;
    }>;
    filters?: {
      weapon_filters?: {
        filters?: {
          dps?: { min?: number; max?: number };
          pdps?: { min?: number; max?: number };
          edps?: { min?: number; max?: number };
          crit?: { min?: number; max?: number };
          aps?: { min?: number; max?: number };
        };
      };
      armour_filters?: {
        filters?: {
          ar?: { min?: number; max?: number };
          es?: { min?: number; max?: number };
          ev?: { min?: number; max?: number };
          ward?: { min?: number; max?: number };
          block?: { min?: number; max?: number };
        };
      };
      req_filters?: {
        filters?: {
          lvl?: { min?: number; max?: number };
          str?: { min?: number; max?: number };
          dex?: { min?: number; max?: number };
          int?: { min?: number; max?: number };
        };
      };
      socket_filters?: {
        filters?: {
          sockets?: { min?: number; max?: number };
          links?: { min?: number; max?: number };
        };
      };
      misc_filters?: {
        filters?: {
          quality?: { min?: number; max?: number };
          gem_level?: { min?: number; max?: number };
          ilvl?: { min?: number; max?: number };
          corrupted?: { option?: string };
          mirrored?: { option?: string };
          crafted?: { option?: string };
          veiled?: { option?: string };
          enchanted?: { option?: string };
          identified?: { option?: string };
          elder_item?: { option?: string };
          shaper_item?: { option?: string };
          crusader_item?: { option?: string };
          redeemer_item?: { option?: string };
          hunter_item?: { option?: string };
          warlord_item?: { option?: string };
          synthesised_item?: { option?: string };
          fractured_item?: { option?: string };
          influences?: { option?: string };
          replica?: { option?: string };
          alternate_art?: { option?: string };
        };
      };
      trade_filters?: {
        filters?: {
          price?: {
            min?: number;
            max?: number;
            option?: string;
          };
          account?: {
            input?: string;
          };
          sale_type?: {
            option?: string;
          };
          collapse?: {
            option?: string;
          };
        };
      };
      type_filters?: {
        filters?: {
          category?: { option?: string };
          rarity?: { option?: string };
        };
      };
    };
  };
  sort?: {
    price?: string;
    [key: string]: string | undefined;
  };
}

export interface TradeSearchResponse {
  id: string;
  complexity: number;
  result: string[];
  total: number;
  inexact?: boolean;
}

export interface TradeFetchResponse {
  result: Array<{
    id: string;
    listing: {
      method: string;
      indexed: string;
      stash?: {
        name: string;
        x: number;
        y: number;
      };
      whisper: string;
      account: {
        name: string;
        online?: {
          league: string;
        };
        lastCharacterName: string;
        language: string;
      };
      price?: {
        type: string;
        amount: number;
        currency: string;
      };
    };
    item: {
      verified: boolean;
      w: number;
      h: number;
      icon: string;
      league: string;
      id: string;
      name: string;
      typeLine: string;
      baseType: string;
      identified: boolean;
      ilvl: number;
      note?: string;
      forum_note?: string;
      localized?: boolean;
      elder?: boolean;
      shaper?: boolean;
      influences?: any;
      searing?: boolean;
      tangled?: boolean;
      abyssJewel?: boolean;
      delve?: boolean;
      fractured?: boolean;
      synthesised?: boolean;
      sockets?: Array<{
        group: number;
        attr: string;
        sColour: string;
      }>;
      properties?: Array<{
        name: string;
        values: Array<[string, number]>;
        displayMode: number;
        type?: number;
      }>;
      requirements?: Array<{
        name: string;
        values: Array<[string, number]>;
        displayMode: number;
        suffix?: string;
      }>;
      implicitMods?: string[];
      explicitMods?: string[];
      craftedMods?: string[];
      enchantMods?: string[];
      flavourText?: string[];
      frameType: number;
      x?: number;
      y?: number;
      inventoryId?: string;
      socketedItems?: any[];
      additionalProperties?: Array<{
        name: string;
        values: Array<[string, number]>;
        displayMode: number;
        progress?: number;
      }>;
      nextLevelRequirements?: Array<{
        name: string;
        values: Array<[string, number]>;
        displayMode: number;
        suffix?: string;
      }>;
      talismanTier?: number;
      corrupted?: boolean;
      unmodifiable?: boolean;
      cisRaceReward?: boolean;
      seaRaceReward?: boolean;
      thRaceReward?: boolean;
      properties2?: any;
      utilityMods?: string[];
      logbookMods?: Array<{
        name: string;
        faction: {
          id: string;
          name: string;
        };
        mods: string[];
      }>;
      descrText?: string;
      secDescrText?: string;
      incubatedItem?: {
        name: string;
        level: number;
        progress: number;
        total: number;
      };
      scourged?: {
        tier: number;
        level?: number;
        progress?: number;
        total?: number;
      };
      crucible?: {
        layout: string;
        nodes: any;
      };
      ruthless?: boolean;
      replica?: boolean;
    };
  }>;
}

export interface RateLimiter {
  requests: number[];
  windowMs: number;
  maxRequests: number;
  
  canMakeRequest(): boolean;
  makeRequest(): void;
  available: number;
}

export class SimpleRateLimiter implements RateLimiter {
  requests: number[] = [];
  
  constructor(
    public maxRequests: number,
    public windowMs: number
  ) {}
  
  canMakeRequest(): boolean {
    this.cleanup();
    return this.requests.length < this.maxRequests;
  }
  
  makeRequest(): void {
    if (!this.canMakeRequest()) {
      throw new Error('Rate limit exceeded');
    }
    this.requests.push(Date.now());
  }
  
  get available(): number {
    this.cleanup();
    return this.maxRequests - this.requests.length;
  }
  
  private cleanup(): void {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
  }
}

export class TradeApiClient {
  private searchLimiter: RateLimiter;
  private fetchLimiter: RateLimiter;
  private baseUrl: string;

  constructor(
    league: string,
    searchRateLimit = { maxRequests: 5, windowMs: 10000 },
    fetchRateLimit = { maxRequests: 20, windowMs: 10000 }
  ) {
    this.searchLimiter = new SimpleRateLimiter(searchRateLimit.maxRequests, searchRateLimit.windowMs);
    this.fetchLimiter = new SimpleRateLimiter(fetchRateLimit.maxRequests, fetchRateLimit.windowMs);
    this.baseUrl = `https://www.pathofexile.com/api/trade2`;
  }

  /**
   * Search for items using the PoE trade API
   */
  async search(request: TradeRequest, league: string): Promise<TradeSearchResponse> {
    if (!this.searchLimiter.canMakeRequest()) {
      throw new Error('Search rate limit exceeded');
    }

    this.searchLimiter.makeRequest();

    const url = `${this.baseUrl}/search/${encodeURIComponent(league)}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ExiledExchange2-REST-API/1.0.0'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<TradeSearchResponse>;
  }

  /**
   * Fetch specific items by their IDs
   */
  async fetch(itemIds: string[], searchId: string, league: string): Promise<TradeFetchResponse> {
    if (!this.fetchLimiter.canMakeRequest()) {
      throw new Error('Fetch rate limit exceeded');
    }

    this.fetchLimiter.makeRequest();

    const idsParam = itemIds.slice(0, 10).join(','); // Limit to 10 items per request
    const url = `${this.baseUrl}/fetch/${idsParam}?query=${searchId}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ExiledExchange2-REST-API/1.0.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<TradeFetchResponse>;
  }

  /**
   * Create a search request from parsed item data
   */
  createSearchRequest(itemData: any, options: {
    exactName?: boolean;
    includeSimilar?: boolean;
    priceRange?: { min?: number; max?: number; currency?: string };
    onlineOnly?: boolean;
    sortBy?: 'price' | 'name' | 'listed';
  } = {}): TradeRequest {
    const request: TradeRequest = {
      query: {
        status: options.onlineOnly !== false ? { option: 'online' } : undefined,
      },
      sort: options.sortBy === 'price' ? { price: 'asc' } : undefined
    };

    // Set item name/type
    if (itemData.name && options.exactName) {
      request.query.name = itemData.name;
    } else if (itemData.typeLine || itemData.baseType) {
      request.query.type = itemData.typeLine || itemData.baseType;
    }

    // Add category filter if we can determine it
    const category = this.determineCategory(itemData);
    if (category) {
      request.query.filters = request.query.filters || {};
      request.query.filters.type_filters = {
        filters: {
          category: { option: category }
        }
      };
    }

    // Add stat filters from explicit mods
    if (itemData.explicitMods && itemData.explicitMods.length > 0) {
      const statFilters = this.parseStatsFromMods(itemData.explicitMods);
      if (statFilters.length > 0) {
        request.query.stats = [{
          type: 'and',
          filters: statFilters
        }];
      }
    }

    // Add weapon filters
    if (this.isWeapon(itemData)) {
      const weaponFilters = this.extractWeaponFilters(itemData);
      if (Object.keys(weaponFilters).length > 0) {
        request.query.filters = request.query.filters || {};
        request.query.filters.weapon_filters = { filters: weaponFilters };
      }
    }

    // Add armour filters
    if (this.isArmour(itemData)) {
      const armourFilters = this.extractArmourFilters(itemData);
      if (Object.keys(armourFilters).length > 0) {
        request.query.filters = request.query.filters || {};
        request.query.filters.armour_filters = { filters: armourFilters };
      }
    }

    // Add socket filters
    if (itemData.sockets && itemData.sockets.length > 0) {
      const socketFilters = this.extractSocketFilters(itemData);
      if (Object.keys(socketFilters).length > 0) {
        request.query.filters = request.query.filters || {};
        request.query.filters.socket_filters = { filters: socketFilters };
      }
    }

    // Add misc filters
    const miscFilters = this.extractMiscFilters(itemData);
    if (Object.keys(miscFilters).length > 0) {
      request.query.filters = request.query.filters || {};
      request.query.filters.misc_filters = { filters: miscFilters };
    }

    // Add price filters
    if (options.priceRange) {
      request.query.filters = request.query.filters || {};
      request.query.filters.trade_filters = {
        filters: {
          price: {
            min: options.priceRange.min,
            max: options.priceRange.max,
            option: options.priceRange.currency || 'chaos'
          }
        }
      };
    }

    return request;
  }

  private determineCategory(itemData: any): string | undefined {
    const typeLine = itemData.typeLine || itemData.baseType || '';
    
    // Check against PoE2 categories
    for (const [categoryId, categoryData] of Object.entries(POE2_CATEGORIES)) {
      if (categoryData.entries) {
        for (const entry of categoryData.entries) {
          if (entry.text && typeLine.includes(entry.text)) {
            return categoryId;
          }
        }
      }
    }

    // Fallback to basic type detection
    if (typeLine.includes('Bow') || typeLine.includes('Staff') || typeLine.includes('Sword') || 
        typeLine.includes('Axe') || typeLine.includes('Mace') || typeLine.includes('Dagger') ||
        typeLine.includes('Wand') || typeLine.includes('Claw') || typeLine.includes('Sceptre')) {
      return 'weapon';
    }

    if (typeLine.includes('Helmet') || typeLine.includes('Body Armour') || typeLine.includes('Gloves') ||
        typeLine.includes('Boots') || typeLine.includes('Shield')) {
      return 'armour';
    }

    if (typeLine.includes('Ring') || typeLine.includes('Amulet') || typeLine.includes('Belt')) {
      return 'accessory';
    }

    if (typeLine.includes('Jewel')) {
      return 'jewel';
    }

    return undefined;
  }

  private parseStatsFromMods(mods: string[]): Array<{ id: string; value?: { min?: number; max?: number } }> {
    const statFilters: Array<{ id: string; value?: { min?: number; max?: number } }> = [];

    for (const mod of mods) {
      // Try to match against PoE2 stats
      for (const statGroup of POE2_STATS) {
        if (statGroup.entries) {
          for (const statEntry of statGroup.entries) {
            if (statEntry.text) {
              // Create a regex pattern from the stat text
              const pattern = statEntry.text
                .replace(/\{[^}]+\}/g, '([+-]?\\d+(?:\\.\\d+)?)')
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

              const regex = new RegExp(pattern, 'i');
              const match = mod.match(regex);

              if (match) {
                const value = match[1] ? parseFloat(match[1]) : undefined;
                
                if (value !== undefined) {
                  statFilters.push({
                    id: statEntry.id,
                    value: {
                      min: Math.floor(value * 0.9), // Allow 10% variance
                      max: Math.ceil(value * 1.1)
                    }
                  });
                } else {
                  statFilters.push({ id: statEntry.id });
                }
                break;
              }
            }
          }
        }
      }
    }

    return statFilters;
  }

  private isWeapon(itemData: any): boolean {
    const typeLine = itemData.typeLine || itemData.baseType || '';
    return ['Bow', 'Staff', 'Sword', 'Axe', 'Mace', 'Dagger', 'Wand', 'Claw', 'Sceptre'].some(type => 
      typeLine.includes(type)
    );
  }

  private isArmour(itemData: any): boolean {
    const typeLine = itemData.typeLine || itemData.baseType || '';
    return ['Helmet', 'Body Armour', 'Gloves', 'Boots', 'Shield'].some(type => 
      typeLine.includes(type)
    );
  }

  private extractWeaponFilters(itemData: any): any {
    const filters: any = {};
    
    if (itemData.properties) {
      for (const prop of itemData.properties) {
        switch (prop.name) {
          case 'Physical Damage':
            // Extract DPS from weapon properties
            break;
          case 'Critical Strike Chance':
            if (prop.values && prop.values[0]) {
              const critValue = parseFloat(prop.values[0][0].replace('%', ''));
              if (!isNaN(critValue)) {
                filters.crit = { min: Math.floor(critValue * 0.9), max: Math.ceil(critValue * 1.1) };
              }
            }
            break;
          case 'Attacks per Second':
            if (prop.values && prop.values[0]) {
              const apsValue = parseFloat(prop.values[0][0]);
              if (!isNaN(apsValue)) {
                filters.aps = { min: Math.floor(apsValue * 0.9), max: Math.ceil(apsValue * 1.1) };
              }
            }
            break;
        }
      }
    }

    return filters;
  }

  private extractArmourFilters(itemData: any): any {
    const filters: any = {};
    
    if (itemData.properties) {
      for (const prop of itemData.properties) {
        switch (prop.name) {
          case 'Armour':
            if (prop.values && prop.values[0]) {
              const arValue = parseInt(prop.values[0][0]);
              if (!isNaN(arValue)) {
                filters.ar = { min: Math.floor(arValue * 0.9), max: Math.ceil(arValue * 1.1) };
              }
            }
            break;
          case 'Energy Shield':
            if (prop.values && prop.values[0]) {
              const esValue = parseInt(prop.values[0][0]);
              if (!isNaN(esValue)) {
                filters.es = { min: Math.floor(esValue * 0.9), max: Math.ceil(esValue * 1.1) };
              }
            }
            break;
          case 'Evasion Rating':
            if (prop.values && prop.values[0]) {
              const evValue = parseInt(prop.values[0][0]);
              if (!isNaN(evValue)) {
                filters.ev = { min: Math.floor(evValue * 0.9), max: Math.ceil(evValue * 1.1) };
              }
            }
            break;
        }
      }
    }

    return filters;
  }

  private extractSocketFilters(itemData: any): any {
    const filters: any = {};
    
    if (itemData.sockets) {
      const socketCount = itemData.sockets.length;
      const linkGroups = new Set(itemData.sockets.map((s: any) => s.group));
      const maxLinks = Math.max(...Array.from(linkGroups).map(group => 
        itemData.sockets.filter((s: any) => s.group === group).length
      ));

      if (socketCount > 0) {
        filters.sockets = { min: socketCount, max: socketCount };
      }
      
      if (maxLinks > 1) {
        filters.links = { min: maxLinks, max: maxLinks };
      }
    }

    return filters;
  }

  private extractMiscFilters(itemData: any): any {
    const filters: any = {};

    if (itemData.ilvl) {
      filters.ilvl = { min: itemData.ilvl, max: itemData.ilvl };
    }

    if (itemData.corrupted === true) {
      filters.corrupted = { option: 'true' };
    } else if (itemData.corrupted === false) {
      filters.corrupted = { option: 'false' };
    }

    if (itemData.identified === false) {
      filters.identified = { option: 'false' };
    }

    if (itemData.fractured) {
      filters.fractured_item = { option: 'true' };
    }

    if (itemData.synthesised) {
      filters.synthesised_item = { option: 'true' };
    }

    if (itemData.replica) {
      filters.replica = { option: 'true' };
    }

    return filters;
  }

  /**
   * Check rate limiter status
   */
  getRateLimitStatus(): {
    search: { available: number };
    fetch: { available: number };
  } {
    return {
      search: { available: this.searchLimiter.available },
      fetch: { available: this.fetchLimiter.available },
    };
  }
}

// Export a default instance
export const tradeApiClient = new TradeApiClient('Standard');