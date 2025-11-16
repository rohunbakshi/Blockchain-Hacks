import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import solanaRouter from './routes/solana.js';
import { ErrorResponse } from './types/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/solana', solanaRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Blockchain Credential Hub API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      solana: {
        account: '/solana/account/:address',
      },
    },
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const errorResponse: ErrorResponse = {
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  };
  
  res.status(500).json(errorResponse);
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Solana RPC: ${process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

export default app;
