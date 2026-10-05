import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import { env } from './env';

let evaluatorKeypair: Keypair | null = null;

export function initializeEvaluatorKeypair(): Keypair {
  if (evaluatorKeypair) return evaluatorKeypair;

  // Try to load from environment variable first
  if (env.evaluatorKeypair) {
    try {
      const keyArray = JSON.parse(env.evaluatorKeypair);
      evaluatorKeypair = Keypair.fromSecretKey(new Uint8Array(keyArray));
      console.log('✓ Evaluator keypair loaded from PROOFLY_EVALUATOR_KEYPAIR environment variable');
      return evaluatorKeypair;
    } catch (err) {
      console.error('Failed to parse PROOFLY_EVALUATOR_KEYPAIR:', err);
    }
  }

  // Try to load from file path
  if (fs.existsSync(env.evaluatorKeypairPath)) {
    try {
      const keyArray = JSON.parse(fs.readFileSync(env.evaluatorKeypairPath, 'utf8'));
      evaluatorKeypair = Keypair.fromSecretKey(new Uint8Array(keyArray));
      console.log('✓ Evaluator keypair loaded from file:', env.evaluatorKeypairPath);
      return evaluatorKeypair;
    } catch (err) {
      console.error('Failed to load keypair from file:', env.evaluatorKeypairPath, err);
    }
  }

  // Generate a new keypair for development
  evaluatorKeypair = Keypair.generate();
  console.warn('⚠️  Generated new evaluator keypair for development');
  console.warn('   Public key:', evaluatorKeypair.publicKey.toBase58());
  console.warn('   Set PROOFLY_EVALUATOR_KEYPAIR environment variable to:', JSON.stringify(Array.from(evaluatorKeypair.secretKey)));

  return evaluatorKeypair;
}

export function getEvaluatorKeypair(): Keypair {
  if (!evaluatorKeypair) {
    throw new Error('Evaluator keypair not initialized. Call initializeEvaluatorKeypair first.');
  }
  return evaluatorKeypair;
}

export function getEvaluatorConfig() {
  return {
    MODEL_VERSION: env.evaluatorModelVersion,
    EVALUATOR_VERSION: env.evaluatorVersion,
    AI_TIMEOUT_MS: env.aiEvaluationTimeoutMs,
    MAX_RETRIES: env.aiMaxRetries,
    RETRY_DELAY_MS: env.aiRetryDelayMs,
  };
}
