# Solana Risk Stream

A small, runnable Solana mainnet monitoring prototype for hackathon evaluation. It reads the latest slot through a configurable RPC endpoint and exposes deterministic transaction-risk scoring for downstream stream adapters.

## Run

```powershell
npm install
Copy-Item .env.example .env
npm run typecheck
npm test
npm run dev
```

Then open `http://localhost:8787/` for the dashboard, `http://localhost:8787/health` for a health check, and `http://localhost:8787/api/latest` for the latest slot.

With the server running, `npm run demo` prints a reproducible health + risk report for a local demo payload.

To inspect recent transactions for a Solana address:

```text
GET /api/recent?address=11111111111111111111111111111111
```

Solami Blur stream status is available at `GET /api/solami`. When `SOLAMI_API_KEY` is set, `POST /api/solami/start` opens a read-only WebSocket subscription for decoded swap events.

## Sponsor adapter

Set `SOLAMI_RPC_URL` and `SOLAMI_API_KEY` in `.env` when using Solami infrastructure. The app keeps the RPC adapter separate so the same audit engine can consume RPC, Yellowstone gRPC, Mirage WebSocket, or webhook events without changing risk rules. The public Solana RPC is useful for a smoke test, but sponsor infrastructure should be used for a judged live demo.

## Scope

This prototype is read-only. It does not sign, broadcast, or custody transactions.
