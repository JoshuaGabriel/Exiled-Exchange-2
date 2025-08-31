import { Router, Request, Response, NextFunction } from 'express';
import { ItemService, ParsedItem } from '../services/ItemService';
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
      
      // TODO: Implement price checking logic using shared trade modules
      // For now, return the parsed item with placeholder price data
      
      const response: ApiResponse<{
        item: ParsedItem;
        listings?: any[];
        prediction?: any;
        summary?: any;
      }> = {
        success: true,
        data: {
          item: parsedItem,
          listings: [], // TODO: Implement actual price checking
          prediction: null, // TODO: Implement price prediction
          summary: {
            total: 0,
            showing: 0,
            averagePrice: null,
            medianPrice: null
          }
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
      
      // TODO: Implement comprehensive analysis
      // - Market data analysis
      // - Similar items comparison
      // - Price trends
      // - Rarity assessment
      
      const response: ApiResponse<{
        item: ParsedItem;
        marketData?: any;
        similarItems?: any[];
        priceAnalysis?: any;
        recommendations?: any;
      }> = {
        success: true,
        data: {
          item: parsedItem,
          marketData: request.includeMarketData ? {} : undefined, // TODO: Implement
          similarItems: request.includeSimilarItems ? [] : undefined, // TODO: Implement
          priceAnalysis: null, // TODO: Implement
          recommendations: null // TODO: Implement
        },
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;