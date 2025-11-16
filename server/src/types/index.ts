export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  solana?: {
    connected: boolean;
    network?: string;
    error?: string;
  };
}

export interface AccountInfoResponse {
  address: string;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
  data: {
    length: number;
    base64: string;
  } | null;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}
