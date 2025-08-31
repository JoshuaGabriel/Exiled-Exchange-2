import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiErrorCode } from '../types/api';

export interface ApiError extends Error {
  code?: ApiErrorCode;
  statusCode?: number;
  details?: string;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('API Error:', error);
  
  const statusCode = error.statusCode || 500;
  const code = error.code || ApiErrorCode.INTERNAL_ERROR;
  
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message: error.message || 'Internal server error',
      details: error.details
    },
    timestamp: new Date().toISOString()
  };
  
  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: ApiErrorCode.INVALID_REQUEST,
      message: `Route ${req.method} ${req.path} not found`
    },
    timestamp: new Date().toISOString()
  };
  
  res.status(404).json(response);
};

export const createApiError = (
  message: string,
  code: ApiErrorCode = ApiErrorCode.INTERNAL_ERROR,
  statusCode: number = 500,
  details?: string
): ApiError => {
  const error = new Error(message) as ApiError;
  error.code = code;
  error.statusCode = statusCode;
  error.details = details;
  return error;
};