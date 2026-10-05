import { getEnvConfig } from '../config/env';
import { getEvaluatorKeypair } from '../config/evaluator';
import { Keypair } from '@solana/web3.js';

const config = getEnvConfig();

export function initializeEvaluatorKeypair(): Keypair {
  // Try from env config first
  if (config.evaluatorKeypair) {
    try {
      const keyArray = JSON.parse(config.evaluatorKeypair);
      return Keypair.fromSecretKey(new Uint8Array(keyArray));
    } catch (err) {
      console.error('Failed to parse evaluator keypair from env config:', err);
    }
  }

  // Try from file path
  const fs = require('fs');
  if (fs.existsSync(config.evaluatorKeypairPath)) {
    try {
      const keyArray = JSON.parse(fs.readFileSync(config.evaluatorKeypairPath, 'utf8'));
      console.log('✓ Evaluator keypair loaded from file:', config.evaluatorKeypairPath);
      return Keypair.fromSecretKey(new Uint8Array(keyArray));
    } catch (err) {
      console.error('Failed to load keypair from file:', err);
    }
  }

  // Generate new keypair for development
  const keypair = Keypair.generate();
  console.warn('⚠ Generated new evaluator keypair for development');
  console.warn('Public key:', keypair.publicKey.toBase58());
  return keypair;
}

export function getEvaluatorConfig() {
  return {
    MODEL_VERSION: config.evaluatorModelVersion,
    EVALUATOR_VERSION: config.evaluatorVersion,
    AI_TIMEOUT_MS: config.aiEvaluationTimeoutMs,
    MAX_RETRIES: config.aiMaxRetries,
    RETRY_DELAY_MS: config.aiRetryDelayMs,
  };
}
