$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$artifactDir = Join-Path $repo 'demo'
$tempDir = 'D:\Codex\temp\solana-risk-stream-video'
New-Item -ItemType Directory -Force -Path $artifactDir, $tempDir | Out-Null

$health = Invoke-RestMethod 'http://127.0.0.1:8787/health'
$latest = Invoke-RestMethod 'http://127.0.0.1:8787/api/latest'
$audit = Invoke-RestMethod 'http://127.0.0.1:8787/api/audit' -Method Post -ContentType 'application/json' -Body (@{
  signature = ('demo-' + ('a' * 50))
  slot = [int]$latest.slot
  accountKeys = @('DemoWallet1111111111111111111111111111111111')
  programIds = @()
  writableAccounts = @()
} | ConvertTo-Json)

$slides = @(
  @(
    'SOLANA RISK STREAM'
    ''
    'A read-only, real-time risk monitor'
    'for Solana mainnet activity'
    ''
    'Solami RPC  |  mainnet  |  open source'
    'github.com/nonggde/solana-risk-stream'
  ),
  @(
    'LIVE MAINNET CHECK'
    ''
    ("Latest confirmed slot: {0}" -f $latest.slot)
    ("Latest blockhash: {0}" -f $latest.blockhash)
    ("RPC configured: {0}" -f $health.rpcConfigured)
    ("Solami configured: {0}" -f $health.solami.configured)
    ''
    'No signing, custody, or transaction broadcast.'
  ),
  @(
    'DETERMINISTIC RISK AUDIT'
    ''
    ("Status: {0}" -f $audit.status)
    ("Score: {0}" -f $audit.score)
    ''
    'Signals include failed transactions, large SOL movement,'
    'token write fan-out, and unusual account fan-out.'
    ''
    'The same rules can consume RPC, WebSocket, or webhook data.'
  ),
  @(
    'HOW TO RUN'
    ''
    '1. Copy .env.example to .env'
    '2. Add your own Solami RPC URL and key'
    '3. npm install && npm run dev'
    '4. Open /api/latest or the local dashboard'
    ''
    'Built for builders, traders, and security teams.'
  )
)

$font = 'C:/Windows/Fonts/segoeui.ttf'
$concat = Join-Path $tempDir 'concat.txt'
$concatLines = @()
for ($i = 0; $i -lt $slides.Count; $i++) {
  $textName = "slide-{0}.txt" -f $i
  $textPath = Join-Path $tempDir $textName
  $slides[$i] | Set-Content -Encoding utf8 -Path $textPath
  $outPath = Join-Path $tempDir ("slide-{0}.mp4" -f $i)
  Copy-Item -LiteralPath $textPath -Destination (Join-Path $artifactDir $textName) -Force
  $textEscaped = ("demo/{0}" -f $textName)
  & ffmpeg -y -hide_banner -loglevel error `
    -f lavfi -i 'color=c=0x0d1117:s=1280x720:r=30' -t 30 `
    -vf "drawtext=fontfile='C\:/Windows/Fonts/segoeui.ttf':textfile=$($textEscaped):fontcolor=white:fontsize=38:line_spacing=16:x=70:y=70" `
    -c:v libx264 -pix_fmt yuv420p -movflags +faststart $outPath
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for slide $i" }
  $concatLines += "file '$outPath'"
}
$concatLines | Set-Content -Encoding ascii -Path $concat

$videoPath = Join-Path $artifactDir 'solana-risk-stream-demo.mp4'
& ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $concat -c copy -movflags +faststart $videoPath
if ($LASTEXITCODE -ne 0) { throw 'ffmpeg concat failed' }

Write-Output ("Created {0} ({1} bytes)" -f $videoPath, (Get-Item $videoPath).Length)
