const baseUrl = process.env.DEMO_URL || 'http://127.0.0.1:8787';

async function main() {
  const health = await fetch(`${baseUrl}/health`).then(response => response.json());
  const audit = await fetch(`${baseUrl}/api/audit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      signature: 'demo-signature-' + 'a'.repeat(50),
      slot: 0,
      accountKeys: ['DemoWallet1111111111111111111111111111111111'],
      programIds: [],
      writableAccounts: []
    })
  }).then(response => response.json());
  console.log(JSON.stringify({ health, audit }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
