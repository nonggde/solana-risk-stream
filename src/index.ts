import http from 'node:http';
import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { assessTransaction } from './risk.js';
import { SolamiBlurStream } from './solami.js';

const rpcUrl = process.env.SOLAMI_RPC_URL || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const port = Number(process.env.PORT || 8787);
const connection = new Connection(rpcUrl, { commitment: 'confirmed', confirmTransactionInitialTimeout: 20_000 });
const solami = new SolamiBlurStream();

async function latestBlock(): Promise<{ slot: number; blockhash: string }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const slot = await connection.getSlot('confirmed');
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      return { slot, blockhash };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('RPC request failed after retries');
}

function toRiskInput(signature: string, tx: ParsedTransactionWithMeta): Parameters<typeof assessTransaction>[0] {
  const accountKeys = tx.transaction.message.accountKeys.map(account => account.pubkey.toBase58());
  const writableAccounts = tx.transaction.message.accountKeys
    .filter(account => account.writable)
    .map(account => account.pubkey.toBase58());
  const programIds = tx.transaction.message.instructions
    .map(instruction => 'programId' in instruction ? instruction.programId.toBase58() : '')
    .filter(Boolean);
  const pre = tx.meta?.preBalances ?? [];
  const post = tx.meta?.postBalances ?? [];
  const lamportsMoved = pre.reduce((max, value, index) => Math.max(max, Math.abs(value - (post[index] ?? value))), 0);
  return {
    signature,
    slot: tx.slot,
    accountKeys,
    programIds,
    writableAccounts,
    lamportsMoved,
    error: tx.meta?.err ? JSON.stringify(tx.meta.err) : null
  };
}

async function recentTransactions(address: string) {
  const publicKey = new PublicKey(address);
  const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 8 }, 'confirmed');
  const rows = [];
  for (const item of signatures) {
    if (!item.signature) continue;
    const parsed = await connection.getParsedTransaction(item.signature, { maxSupportedTransactionVersion: 0 });
    if (parsed) rows.push({ signature: item.signature, slot: item.slot, confirmationStatus: item.confirmationStatus, report: assessTransaction(toRiskInput(item.signature, parsed)) });
  }
  return { address: publicKey.toBase58(), count: rows.length, rows };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('content-type', 'application/json; charset=utf-8');
  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Solana Risk Stream</title><style>body{font-family:system-ui;background:#0d1117;color:#e6edf3;max-width:900px;margin:40px auto;padding:0 20px}button{background:#14f195;border:0;padding:10px 16px;border-radius:8px;font-weight:700}input{width:100%;box-sizing:border-box;background:#161b22;color:#e6edf3;border:1px solid #30363d;padding:10px;border-radius:8px;margin:12px 0}pre{background:#161b22;padding:16px;border-radius:8px;overflow:auto}.muted{color:#8b949e}.card{border:1px solid #30363d;padding:16px;border-radius:10px;margin-top:16px}</style></head><body><h1>Solana Risk Stream</h1><p class="muted">Read-only mainnet monitoring prototype</p><div class="card"><label>Solana address to inspect</label><input id="address" value="11111111111111111111111111111111"><button id="scan">Scan recent transactions</button></div><pre id="out">Ready.</pre><script>const out=document.querySelector('#out');document.querySelector('#scan').onclick=async()=>{const a=document.querySelector('#address').value.trim();out.textContent='Loading...';try{const r=await fetch('/api/recent?address='+encodeURIComponent(a));out.textContent=JSON.stringify(await r.json(),null,2)}catch(e){out.textContent=String(e)}};</script></body></html>`);
    return;
  }
  if (req.method === 'GET' && req.url === '/health') {
    res.end(JSON.stringify({ ok: true, network: 'solana-mainnet', rpcConfigured: Boolean(process.env.SOLAMI_RPC_URL || process.env.SOLANA_RPC_URL), solami: solami.getStatus() }));
    return;
  }
  if (req.method === 'GET' && req.url === '/api/solami') {
    res.end(JSON.stringify(solami.getStatus()));
    return;
  }
  if (req.method === 'POST' && req.url === '/api/solami/start') {
    res.end(JSON.stringify(solami.start({ type: 'swap' })));
    return;
  }
  if (req.method === 'GET' && req.url === '/api/latest') {
    try {
      res.end(JSON.stringify(await latestBlock()));
    } catch (error) {
      res.statusCode = 502;
      res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'RPC request failed' }));
    }
    return;
  }
  if (req.method === 'GET' && req.url?.startsWith('/api/recent')) {
    try {
      const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
      const address = url.searchParams.get('address') ?? '';
      res.end(JSON.stringify(await recentTransactions(address)));
    } catch (error) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unable to read recent transactions' }));
    }
    return;
  }
  if (req.method === 'POST' && req.url === '/api/audit') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const report = assessTransaction(JSON.parse(body));
        res.end(JSON.stringify(report));
      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Invalid JSON' }));
      }
    });
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ ok: false, error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`Solana Risk Stream listening on http://localhost:${port}`);
});
