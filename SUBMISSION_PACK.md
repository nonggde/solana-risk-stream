# Submission pack

## Project

**Solana Risk Stream** — a read-only Solana mainnet monitor that turns recent transaction/account activity into deterministic PASS/WARN/BLOCK risk reports.

## Current evidence

- Local TypeScript typecheck passes.
- Local Vitest suite passes.
- Read-only Solana RPC adapter is implemented.
- Optional Solami Blur WebSocket adapter is implemented and remains disabled until `SOLAMI_API_KEY` is supplied.
- No signing, transaction broadcast, custody, or user funds are involved.

## Tracks

| Track | Fit | Missing evidence |
|---|---|---|
| Solami | Strong after key + live stream demo | Solami key, public repo, 2–3 minute mainnet demo |
| RPC Fast | Possible after RPC Fast endpoint access | RPC Fast access/form, public repo, infrastructure usage proof, required community posts |
| AI × Solana | Possible if an AI-facing workflow is added | AI feature, public repo, track-specific submission fields |
| Meteora DBC | Not yet eligible | A real Meteora DBC/DAMM v2 integration and mainnet deployment |
| Region-only tracks | Unknown/blocked | Country eligibility, Colosseum registration, and any local/demo-day requirements |

## Next external prerequisites

1. Create a free Solami account and generate an API key.
2. Put the key only in a local `.env` file.
3. Run the live stream demo and record 2–3 minutes.
4. Publish the repository and README.
5. Submit only to tracks whose requirements are actually satisfied.
