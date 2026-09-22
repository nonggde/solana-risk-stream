import { PublicKey } from '@solana/web3.js';

export type RiskLevel = 'PASS' | 'WARN' | 'BLOCK';

export interface ParsedTransaction {
  signature: string;
  slot: number;
  accountKeys: string[];
  programIds: string[];
  writableAccounts: string[];
  lamportsMoved?: number;
  error?: string | null;
}

export interface RiskFinding {
  code: string;
  level: RiskLevel;
  message: string;
}

export interface RiskReport {
  decision: RiskLevel;
  score: number;
  findings: RiskFinding[];
}

const SYSTEM_PROGRAM = '11111111111111111111111111111111';
const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export function validateAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function assessTransaction(tx: ParsedTransaction): RiskReport {
  const findings: RiskFinding[] = [];
  let score = 0;

  if (tx.signature.length < 40) {
    findings.push({ code: 'MALFORMED_SIGNATURE', level: 'BLOCK', message: 'Transaction signature is malformed.' });
    score += 100;
  }

  if (tx.error) {
    findings.push({ code: 'TRANSACTION_FAILED', level: 'BLOCK', message: `Transaction failed: ${tx.error}` });
    score += 80;
  }

  if (tx.programIds.includes(TOKEN_PROGRAM) && tx.writableAccounts.length >= 8) {
    findings.push({ code: 'TOKEN_WRITE_FANOUT', level: 'WARN', message: 'Token transaction writes to many accounts; inspect transfer and authority changes.' });
    score += 35;
  }

  if (tx.programIds.includes(SYSTEM_PROGRAM) && (tx.lamportsMoved ?? 0) > 10_000_000_000) {
    findings.push({ code: 'LARGE_SOL_MOVE', level: 'WARN', message: 'Transaction moves more than 10 SOL.' });
    score += 30;
  }

  if (tx.accountKeys.length > 40) {
    findings.push({ code: 'ACCOUNT_FANOUT', level: 'WARN', message: 'Transaction touches an unusually large number of accounts.' });
    score += 20;
  }

  const decision: RiskLevel = score >= 80 ? 'BLOCK' : score >= 25 ? 'WARN' : 'PASS';
  if (findings.length === 0) findings.push({ code: 'NO_HIGH_RISK_SIGNAL', level: 'PASS', message: 'No configured high-risk signal detected.' });
  return { decision, score, findings };
}
