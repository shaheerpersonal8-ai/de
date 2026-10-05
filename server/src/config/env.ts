import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

interface EnvConfig {
  // Server
  port: number;
  nodeEnv: 'development' | 'staging' | 'production';
  serverName: string;

  // Solana
  solanaRpcUrl: string;
  solanaNetwork: string;
  prooflyProgramId: string;
  solanaCommitment: 'confirmed' | 'finalized';

  // Evaluator
  evaluatorKeypair: string | null;
  evaluatorKeypairPath: string;
  evaluatorModelVersion: string;
  evaluatorVersion: string;
  aiEvaluationTimeoutMs: number;
  aiMaxRetries: number;
  aiRetryDelayMs: number;

  // OpenAI
  openaiApiKey: string | null;
  openaiModel: string;
  openaiTemperature: number;
  openaiMaxTokens: number;
  openaiTimeoutMs: number;

  // Database
  mongodbUri: string;
  mongodbDatabase: string;

  // Authentication
  jwtSecret: string;
  jwtExpiry: string;

  // CORS & Security
  corsOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;

  // Logging
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  auditLoggingEnabled: boolean;
  auditLogRetentionDays: number;

  // Attestation
  attestationExpiryHours: number;
  attestationNonceMin: number;

  // Feature Flags
  useMockAiEvaluation: boolean;
  enableAuditLogs: boolean;
  enableSignatureVerification: boolean;
  enableDeterministicChecks: boolean;
}

function getStringEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
}

function getNumberEnv(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

function getBooleanEnv(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? value.toLowerCase() === 'true' : defaultValue!;
}

function getArrayEnv(key: string, defaultValue?: string[]): string[] {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? value.split(',').map(v => v.trim()) : defaultValue || [];
}

function getOptionalStringEnv(key: string): string | null {
  return process.env[key] || null;
}

/**
 * Parse evaluator keypair from JSON string
 */
function parseEvaluatorKeypair(): string | null {
  const keypairJson = getOptionalStringEnv('PROOFLY_EVALUATOR_KEYPAIR');
  if (keypairJson) {
    try {
      const keyArray = JSON.parse(keypairJson);
      if (Array.isArray(keyArray) && keyArray.length === 64) {
        return keypairJson;
      }
    } catch (err) {
      console.warn('Invalid PROOFLY_EVALUATOR_KEYPAIR format, will fall back to file');
    }
  }
  return null;
}

/**
 * Load and parse environment configuration
 */
export function loadEnvConfig(): EnvConfig {
  return {
    // Server
    port: getNumberEnv('PORT', 3000),
    nodeEnv: (getStringEnv('NODE_ENV', 'development') as 'development' | 'staging' | 'production'),
    serverName: getStringEnv('SERVER_NAME', 'proofly-server'),

    // Solana
    solanaRpcUrl: getStringEnv('SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
    solanaNetwork: getStringEnv('SOLANA_NETWORK', 'devnet'),
    prooflyProgramId: getStringEnv('PROOFLY_PROGRAM_ID', 'G9Fc28faoqwHW6BMCskBPbzLTF3Cu7j4SZAbVJxgwgAG'),
    solanaCommitment: (getStringEnv('SOLANA_COMMITMENT', 'confirmed') as 'confirmed' | 'finalized'),

    // Evaluator
    evaluatorKeypair: parseEvaluatorKeypair(),
    evaluatorKeypairPath: getStringEnv('EVALUATOR_KEYPAIR_PATH', path.join(process.env.HOME || '', '.config/solana/evaluator.json')),
    evaluatorModelVersion: getStringEnv('EVALUATOR_MODEL_VERSION', 'gpt-4-turbo'),
    evaluatorVersion: getStringEnv('EVALUATOR_VERSION', '1.0.0'),
    aiEvaluationTimeoutMs: getNumberEnv('AI_EVALUATION_TIMEOUT_MS', 30000),
    aiMaxRetries: getNumberEnv('AI_MAX_RETRIES', 3),
    aiRetryDelayMs: getNumberEnv('AI_RETRY_DELAY_MS', 1000),

    // OpenAI
    openaiApiKey: getOptionalStringEnv('OPENAI_API_KEY'),
    openaiModel: getStringEnv('OPENAI_MODEL', 'gpt-4-turbo'),
    openaiTemperature: parseFloat(getStringEnv('OPENAI_TEMPERATURE', '0.3')),
    openaiMaxTokens: getNumberEnv('OPENAI_MAX_TOKENS', 2000),
    openaiTimeoutMs: getNumberEnv('OPENAI_TIMEOUT_MS', 30000),

    // Database
    mongodbUri: getStringEnv('MONGODB_URI', 'mongodb://localhost:27017/proofly'),
    mongodbDatabase: getStringEnv('MONGODB_DATABASE', 'proofly'),

    // Authentication
    jwtSecret: getStringEnv('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production'),
    jwtExpiry: getStringEnv('JWT_EXPIRY', '24h'),

    // CORS & Security
    corsOrigins: getArrayEnv('CORS_ORIGINS', ['http://localhost:3000', 'http://localhost:5173']),
    rateLimitWindowMs: getNumberEnv('RATE_LIMIT_WINDOW_MS', 900000),
    rateLimitMaxRequests: getNumberEnv('RATE_LIMIT_MAX_REQUESTS', 100),

    // Logging
    logLevel: (getStringEnv('LOG_LEVEL', 'info') as 'trace' | 'debug' | 'info' | 'warn' | 'error'),
    auditLoggingEnabled: getBooleanEnv('AUDIT_LOGGING_ENABLED', true),
    auditLogRetentionDays: getNumberEnv('AUDIT_LOG_RETENTION_DAYS', 90),

    // Attestation
    attestationExpiryHours: getNumberEnv('ATTESTATION_EXPIRY_HOURS', 24),
    attestationNonceMin: getNumberEnv('ATTESTATION_NONCE_MIN', 1),

    // Feature Flags
    useMockAiEvaluation: getBooleanEnv('USE_MOCK_AI_EVALUATION', true),
    enableAuditLogs: getBooleanEnv('ENABLE_AUDIT_LOGS', true),
    enableSignatureVerification: getBooleanEnv('ENABLE_SIGNATURE_VERIFICATION', true),
    enableDeterministicChecks: getBooleanEnv('ENABLE_DETERMINISTIC_CHECKS', true),
  };
}

/**
 * Singleton instance of environment config
 */
let envConfig: EnvConfig | null = null;

/**
 * Get the environment config (lazy load)
 */
export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    envConfig = loadEnvConfig();
  }
  return envConfig;
}

/**
 * Validate required production variables
 */
export function validateProductionEnv(): void {
  const env = getEnvConfig();

  if (env.nodeEnv === 'production') {
    const required = [
      'evaluatorKeypair',
      'openaiApiKey',
      'jwtSecret',
      'mongodbUri',
    ];

    const missing = required.filter(key => {
      const val = (env as any)[key];
      return !val || val === 'your-super-secret-jwt-key-change-this-in-production';
    });

    if (missing.length > 0) {
      throw new Error(
        `Missing or invalid production environment variables: ${missing.join(', ')}. ` +
        `Please set these in your .env file or environment.`
      );
    }
  }
}

/**
 * Export default config instance
 */
export const env = getEnvConfig();
