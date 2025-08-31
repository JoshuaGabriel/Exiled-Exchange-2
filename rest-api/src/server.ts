import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { ApiResponse } from './types/api';

// Import routes
import itemRoutes from './routes/items';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet({
  contentSecurityPolicy: false,
}));

// CORS configuration - allow all origins for Steam Deck access
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later'
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  const response: ApiResponse<{ status: string; uptime: number }> = {
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime()
    },
    timestamp: new Date().toISOString()
  };
  res.json(response);
});

app.use('/api/v1/items', itemRoutes);

app.use(express.static('public'));

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`EE2 REST API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Items API: http://localhost:${PORT}/api/v1/items/`);
  console.log(`API Documentation: see restapi.md`);
});

export default app;
