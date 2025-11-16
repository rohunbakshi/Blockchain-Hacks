# Blockchain Credential Hub - Backend Server

Minimal backend API for Solana smart contract development and testing.

## Features

- Express.js server with TypeScript
- Solana RPC integration via `@solana/web3.js`
- Health check endpoint with Solana connection verification
- Account reading endpoint for Solana addresses
- CORS enabled for frontend integration
- Error handling middleware

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Solana RPC endpoint (defaults to devnet)

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```
PORT=3001
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

3. Start development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001` (or PORT from .env)

## Available Endpoints

### Health Check
- **GET** `/health`
  - Verifies Solana RPC connection
  - Returns connection status and network info

### Solana Account
- **GET** `/solana/account/:address`
  - Fetches account information for a given Solana address
  - Returns account data, lamports, owner, etc.

### Root
- **GET** `/`
  - Returns API information and available endpoints

## Development

```bash
# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `SOLANA_NETWORK` | Network name | `devnet` |

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── solana.ts       # Solana connection configuration
│   ├── routes/
│   │   ├── health.ts       # Health check routes
│   │   └── solana.ts       # Solana-related routes
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   └── index.ts            # Main server file
├── dist/                   # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Next Steps

This minimal backend provides the foundation for Solana program development. Future enhancements:

- Transaction submission endpoints
- Program instruction calling
- Anchor program integration
- Institution keypair management
- Credential commitment storage endpoints
- Attestation signing endpoints

## Testing

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Test account reading:
```bash
curl http://localhost:3001/solana/account/11111111111111111111111111111111
```

## License

Private - All rights reserved
