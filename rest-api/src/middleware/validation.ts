import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiErrorCode } from '../types/api';

export const validateParseItem = [
  body('itemText')
    .isString()
    .notEmpty()
    .withMessage('itemText is required and must be a non-empty string')
    .isLength({ min: 10, max: 50000 })
    .withMessage('itemText must be between 10 and 50000 characters'),
];

export const validatePriceCheck = [
  body('itemText')
    .isString()
    .notEmpty()
    .withMessage('itemText is required and must be a non-empty string')
    .isLength({ min: 10, max: 50000 })
    .withMessage('itemText must be between 10 and 50000 characters'),
  
  body('league')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('league must be a valid string'),
    
  body('options.includeListings')
    .optional()
    .isBoolean()
    .withMessage('options.includeListings must be a boolean'),
    
  body('options.includePrediction')
    .optional()
    .isBoolean()
    .withMessage('options.includePrediction must be a boolean'),
    
  body('options.maxResults')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('options.maxResults must be between 1 and 100'),
    
  body('filters.online')
    .optional()
    .isBoolean()
    .withMessage('filters.online must be a boolean'),
    
  body('filters.maxPrice')
    .optional()
    .isNumeric()
    .withMessage('filters.maxPrice must be a number'),
];

export const validateAnalyzeItem = [
  body('itemText')
    .isString()
    .notEmpty()
    .withMessage('itemText is required and must be a non-empty string')
    .isLength({ min: 10, max: 50000 })
    .withMessage('itemText must be between 10 and 50000 characters'),
    
  body('league')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('league must be a valid string'),
    
  body('includeMarketData')
    .optional()
    .isBoolean()
    .withMessage('includeMarketData must be a boolean'),
    
  body('includeSimilarItems')
    .optional()
    .isBoolean()
    .withMessage('includeSimilarItems must be a boolean'),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.INVALID_REQUEST,
        message: 'Validation failed',
        details: errors.array().map(err => `${err.param}: ${err.msg}`).join(', ')
      },
      timestamp: new Date().toISOString()
    };
    
    return res.status(400).json(response);
  }
  
  next();
};