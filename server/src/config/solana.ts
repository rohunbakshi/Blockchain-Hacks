import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

// Get Solana RPC URL from environment or use default devnet
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const NETWORK = process.env.SOLANA_NETWORK || 'devnet';

// Initialize Solana connection
export const connection = new Connection(RPC_URL, 'confirmed');

// Get network info
export const getNetworkInfo = () => {
  return {
    rpcUrl: RPC_URL,
    network: NETWORK,
  };
};

// Verify Solana connection
export async function verifyConnection(): Promise<{
  connected: boolean;
  network?: string;
  error?: string;
}> {
  try {
    const version = await connection.getVersion();
    const slot = await connection.getSlot();
    
    return {
      connected: true,
      network: NETWORK,
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Failed to connect to Solana RPC',
    };
  }
}

// Validate Solana address
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Get account info
export async function getAccountInfo(address: string) {
  try {
    const publicKey = new PublicKey(address);
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    if (!accountInfo) {
      return null;
    }
    
    return {
      address: address,
      lamports: accountInfo.lamports,
      owner: accountInfo.owner.toBase58(),
      executable: accountInfo.executable,
      rentEpoch: accountInfo.rentEpoch,
      data: accountInfo.data.length > 0 ? {
        length: accountInfo.data.length,
        // For binary data, return base64 encoded
        base64: Buffer.from(accountInfo.data).toString('base64'),
      } : null,
    };
  } catch (error: any) {
    throw new Error(`Failed to get account info: ${error.message}`);
  }
}
