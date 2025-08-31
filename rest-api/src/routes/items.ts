import { Router, Request, Response, NextFunction } from 'express';
import { ItemService, ParsedItem } from '../services/ItemService';
import { PriceCheckService, PriceCheckResult } from '../services/PriceCheckService';
import { 
  validateParseItem, 
  validatePriceCheck, 
  validateAnalyzeItem,
  handleValidationErrors 
} from '../middleware/validation';
import { createApiError, ApiError } from '../middleware/errorHandler';
import { 
  ApiResponse, 
  ParseItemRequest, 
  PriceCheckRequest, 
  AnalyzeItemRequest,
  ApiErrorCode 
} from '../types/api';

const router = Router();

/**
 * POST /api/v1/items/parse
 * Parse item text into structured data
 */
router.post('/parse', 
  validateParseItem,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request: ParseItemRequest = req.body;
      
      // Clean the item text
      const cleanedItemText = ItemService.cleanItemText(request.itemText);
      
      // Validate item text format
      if (!ItemService.validateItemText(cleanedItemText)) {
        throw createApiError(
          'Invalid item text format',
          ApiErrorCode.ITEM_PARSE_ERROR,
          400,
          'Item text should contain sections separated by dashes'
        );
      }
      
      // Parse the item
      const parseResult = ItemService.parseItem({ itemText: cleanedItemText });
      
      if (parseResult.isErr()) {
        throw createApiError(
          'Failed to parse item',
          ApiErrorCode.ITEM_PARSE_ERROR,
          400,
          parseResult.error
        );
      }
      
      const parsedItem = parseResult.value;
      
      const response: ApiResponse<{ item: ParsedItem }> = {
        success: true,
        data: {
          item: parsedItem
        },
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/items/price-check
 * Get price estimates and trade listings for an item
 */
router.post('/price-check',
  validatePriceCheck,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request: PriceCheckRequest = req.body;
      
      // First parse the item
      const cleanedItemText = ItemService.cleanItemText(request.itemText);
      
      if (!ItemService.validateItemText(cleanedItemText)) {
        throw createApiError(
          'Invalid item text format',
          ApiErrorCode.ITEM_PARSE_ERROR,
          400,
          'Item text should contain sections separated by dashes'
        );
      }
      
      const parseResult = ItemService.parseItem({ itemText: cleanedItemText });
      
      if (parseResult.isErr()) {
        throw createApiError(
          'Failed to parse item for price checking',
          ApiErrorCode.ITEM_PARSE_ERROR,
          400,
          parseResult.error
        );
      }
      
      const parsedItem = parseResult.value;
      
      // Use PriceCheckService to get actual price data
      const priceCheckOptions = {
        league: request.league || 'Standard',
        onlineOnly: request.onlineOnly ?? true,
        maxResults: 50
      };

      // Validate that the item can be price checked
      const validationResult = PriceCheckService.validatePriceCheckRequest(parsedItem);
      if (validationResult.isErr()) {
        throw createApiError(
          'Item cannot be price checked',
          ApiErrorCode.INVALID_REQUEST,
          400,
          validationResult.error
        );
      }

      // Perform price check
      const priceCheckResult = await PriceCheckService.checkPrice(parsedItem, priceCheckOptions);
      
      if (priceCheckResult.isErr()) {
        throw createApiError(
          'Price check failed',
          ApiErrorCode.EXTERNAL_API_ERROR,
          500,
          priceCheckResult.error
        );
      }

      const priceData = priceCheckResult.value;
      
      const response: ApiResponse<{
        item: ParsedItem;
        priceCheck: PriceCheckResult;
      }> = {
        success: true,
        data: {
          item: parsedItem,
          priceCheck: priceData
        },
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/items/analyze
 * Comprehensive item analysis (parsing + price checking + market data)
 */
router.post('/analyze',
  validateAnalyzeItem,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request: AnalyzeItemRequest = req.body;
      
      // First parse the item
      const cleanedItemText = ItemService.cleanItemText(request.itemText);
      
      if (!ItemService.validateItemText(cleanedItemText)) {
        throw createApiError(
          'Invalid item text format',
          ApiErrorCode.ITEM_PARSE_ERROR,
          400,
          'Item text should contain sections separated by dashes'
        );
      }
      
      const parseResult = ItemService.parseItem({ itemText: cleanedItemText });
      
      if (parseResult.isErr()) {
        throw createApiError(
          'Failed to parse item for analysis',
          ApiErrorCode.ITEM_PARSE_ERROR,
          400,
          parseResult.error
        );
      }
      
      const parsedItem = parseResult.value;
      
      // Perform comprehensive analysis including price checking
      let priceData: PriceCheckResult | undefined;
      
      if (request.includeMarketData) {
        const priceCheckOptions = {
          league: request.league || 'Standard',
          onlineOnly: true,
          maxResults: 100
        };

        const priceCheckResult = await PriceCheckService.checkPrice(parsedItem, priceCheckOptions);
        
        if (priceCheckResult.isOk()) {
          priceData = priceCheckResult.value;
        }
        // Don't fail the entire analysis if price check fails, just log and continue
        else {
          console.warn('Price check failed during analysis:', priceCheckResult.error);
        }
      }
      
      const response: ApiResponse<{
        item: ParsedItem;
        priceAnalysis?: PriceCheckResult;
        marketData?: any;
        similarItems?: any[];
        recommendations?: any;
      }> = {
        success: true,
        data: {
          item: parsedItem,
          priceAnalysis: priceData,
          marketData: request.includeMarketData ? {
            totalListings: priceData?.listings.length || 0,
            priceStats: priceData?.priceStats,
            searchFilters: priceData?.searchFilters
          } : undefined,
          similarItems: request.includeSimilarItems ? [] : undefined, // TODO: Implement similar items search
          recommendations: priceData && priceData.priceStats ? {
            quickSell: priceData.priceStats.median ? Math.round(priceData.priceStats.median * 0.9 * 100) / 100 : null,
            fairPrice: priceData.priceStats.median || null,
            highPrice: priceData.priceStats.median ? Math.round(priceData.priceStats.median * 1.1 * 100) / 100 : null,
            currency: priceData.priceStats.currency
          } : null
        },
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/items/leagues
 * Get available leagues from trade API
 */
router.get('/leagues', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaguesResult = await PriceCheckService.getLeagues();
    
    if (leaguesResult.isErr()) {
      throw createApiError(
        'Failed to fetch leagues',
        ApiErrorCode.EXTERNAL_API_ERROR,
        500,
        leaguesResult.error
      );
    }

    const response: ApiResponse<{
      leagues: Array<{ id: string; text: string }>;
      rateLimits: any;
    }> = {
      success: true,
      data: {
        leagues: leaguesResult.value,
        rateLimits: PriceCheckService.getRateLimitStatus(),
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/items/test-connection
 * Test trade API connectivity
 */
router.get('/test-connection', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connectionResult = await PriceCheckService.testConnection();
    
    const response: ApiResponse<{
      connected: boolean;
      rateLimits: any;
      error?: string;
    }> = {
      success: true,
      data: {
        connected: connectionResult.isOk(),
        rateLimits: PriceCheckService.getRateLimitStatus(),
        error: connectionResult.isErr() ? connectionResult.error : undefined,
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;