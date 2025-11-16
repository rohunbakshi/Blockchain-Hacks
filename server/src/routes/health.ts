import { Router, Request, Response } from 'express';
import { verifyConnection, getNetworkInfo } from '../config/solana.js';
import { HealthCheckResponse } from '../types/index.js';

const router = Router();

// GET /health - Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    const solanaStatus = await verifyConnection();
    const networkInfo = getNetworkInfo();
    
    const response: HealthCheckResponse = {
      status: solanaStatus.connected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      solana: {
        connected: solanaStatus.connected,
        network: networkInfo.network,
        ...(solanaStatus.error && { error: solanaStatus.error }),
      },
    };
    
    const statusCode = solanaStatus.connected ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      solana: {
        connected: false,
        error: error.message || 'Unknown error',
      },
    });
  }
});

export default router;
