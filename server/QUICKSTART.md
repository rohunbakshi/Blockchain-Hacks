# Quick Start Guide

Get the minimal backend running in 3 steps:

## Step 1: Install Dependencies

```bash
cd server
npm install
```

## Step 2: Set Up Environment

Create a `.env` file in the `server/` directory:

```env
PORT=3001
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

## Step 3: Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Test It Works

1. **Health Check:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Get Account Info:**
   ```bash
   curl http://localhost:3001/solana/account/11111111111111111111111111111111
   ```

3. **Root Endpoint:**
   ```bash
   curl http://localhost:3001/
   ```

## From Root Directory

You can also run the backend from the project root:

```bash
npm run dev:backend
```

## What's Next?

This minimal backend is ready for Solana program development. You can now:

1. Develop and test Solana programs
2. Use the account reading endpoint to verify program state
3. Extend with transaction submission endpoints
4. Add program instruction calling when ready

See `server/README.md` for full documentation.
