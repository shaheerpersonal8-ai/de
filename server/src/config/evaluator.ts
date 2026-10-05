import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

const EVALUATOR_CONFIG = {
  MODEL_VERSION: 'gpt-4-turbo',
  EVALUATOR_VERSION: '1.0.0',
  AI_TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
};

let evaluatorKeypair: Keypair | null = null;

export function initializeEvaluatorKeypair(): Keypair {
  if (evaluatorKeypair) return evaluatorKeypair;

  // Try to load from environment variable first
  if (process.env.PROOFLY_EVALUATOR_KEYPAIR) {
    try {
      const keyArray = JSON.parse(process.env.PROOFLY_EVALUATOR_KEYPAIR);
      evaluatorKeypair = Keypair.fromSecretKey(new Uint8Array(keyArray));
      console.log('✓ Evaluator keypair loaded from environment');
      return evaluatorKeypair;
    } catch (err) {
      console.error('Failed to parse PROOFLY_EVALUATOR_KEYPAIR:', err);
    }
  }

  // Try to load from file
  const keypairPath = process.env.EVALUATOR_KEYPAIR_PATH || path.join(process.env.HOME || '', '.config/solana/evaluator.json');
  if (fs.existsSync(keypairPath)) {
    try {
      const keyArray = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      evaluatorKeypair = Keypair.fromSecretKey(new Uint8Array(keyArray));
      console.log('✓ Evaluator keypair loaded from file:', keypairPath);
      return evaluatorKeypair;
    } catch (err) {
      console.error('Failed to load keypair from file:', keypairPath, err);
    }
  }

  // Generate a new keypair for development
  evaluatorKeypair = Keypair.generate();
  console.warn('⚠ Generated new evaluator keypair for development. Save this in production:');
  console.warn('  Public key:', evaluatorKeypair.publicKey.toBase58());
  console.warn('  Set PROOFLY_EVALUATOR_KEYPAIR environment variable to:', JSON.stringify(Array.from(evaluatorKeypair.secretKey)));

  return evaluatorKeypair;
}

export function getEvaluatorKeypair(): Keypair {
  if (!evaluatorKeypair) {
    throw new Error('Evaluator keypair not initialized. Call initializeEvaluatorKeypair first.');
  }
  return evaluatorKeypair;
}

export function getEvaluatorConfig() {
  return EVALUATOR_CONFIG;
}
