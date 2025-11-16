import { Router, Request, Response } from 'express';
import { getAccountInfo, isValidSolanaAddress } from '../config/solana.js';

const router = Router();

// GET /solana/account/:address - Get account information
router.get('/account/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    // Validate address format
    if (!isValidSolanaAddress(address)) {
      return res.status(400).json({
        error: 'Invalid Solana address format',
        address,
      });
    }
    
    // Get account info
    const accountInfo = await getAccountInfo(address);
    
    if (!accountInfo) {
      return res.status(404).json({
        error: 'Account not found',
        address,
      });
    }
    
    res.json(accountInfo);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch account information',
      message: error.message,
    });
  }
});

export default router;
