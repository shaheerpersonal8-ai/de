import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Connection, PublicKey } from '@solana/web3.js';
import requirementsRouter from './routes/requirements';
import evidenceRouter from './routes/evidence';
import evaluationRouter from './routes/evaluation';
import attestationRouter from './routes/attestation';
import reputationRouter from './routes/reputation';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { env, validateProductionEnv } from './config/env';
import { initializeEvaluatorKeypair } from './config/evaluator-env';

const app = express();

// Validate production environment before starting
if (env.nodeEnv === 'production') {
  validateProductionEnv();
}

// Initialize evaluator keypair early
const evaluatorKeypair = initializeEvaluatorKeypair();
console.log('✓ Evaluator keypair initialized');
console.log('  Public key:', evaluatorKeypair.publicKey.toBase58());

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting with env config
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  message: 'Too many requests from this IP',
});
app.use(limiter);

// Logging
app.use(requestLogger);

// Initialize Solana connection with env config
export const connection = new Connection(env.solanaRpcUrl, env.solanaCommitment);
console.log('✓ Solana connection initialized');
console.log('  RPC URL:', env.solanaRpcUrl);
console.log('  Network:', env.solanaNetwork);
console.log('  Commitment:', env.solanaCommitment);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    server: env.serverName,
  });
});

// Server info endpoint
app.get('/info', (req: Request, res: Response) => {
  res.json({
    server: env.serverName,
    environment: env.nodeEnv,
    solana: {
      network: env.solanaNetwork,
      rpc: env.solanaRpcUrl,
      programId: env.prooflyProgramId,
    },
    evaluator: {
      version: env.evaluatorVersion,
      modelVersion: env.evaluatorModelVersion,
      publicKey: evaluatorKeypair.publicKey.toBase58(),
    },
    features: {
      mockAiEvaluation: env.useMockAiEvaluation,
      auditLogs: env.enableAuditLogs,
      signatureVerification: env.enableSignatureVerification,
      determinisicChecks: env.enableDeterministicChecks,
    },
  });
});

// Routes
app.use('/api/requirements', requirementsRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/evaluate', evaluationRouter);
app.use('/api/attestation', attestationRouter);
app.use('/api/reputation', reputationRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(env.port, () => {
  console.log(`\n🚀 Proofly API Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Port: ${env.port}`);
  console.log(`  Environment: ${env.nodeEnv}`);
  console.log(`  Server Name: ${env.serverName}`);
  console.log(`  📡 Solana Network: ${env.solanaNetwork}`);
  console.log(`  ⛓️  RPC: ${env.solanaRpcUrl}`);
  console.log(`  🔐 Evaluator: ${evaluatorKeypair.publicKey.toBase58()}`);
  console.log(`  📊 Model Version: ${env.evaluatorModelVersion}`);
  console.log(`  🎯 Evaluator Version: ${env.evaluatorVersion}`);
  console.log(`  🔄 Rate Limit: ${env.rateLimitMaxRequests} requests per ${env.rateLimitWindowMs / 1000 / 60} minutes`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
