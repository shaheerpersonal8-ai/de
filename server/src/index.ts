import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Connection, PublicKey } from '@solana/web3.js';
import requirementsRouter from './routes/requirements';
import evidenceRouter from './routes/evidence';
import evaluationRouter from './routes/evaluation';
import attestationRouter from './routes/attestation';
import reputationRouter from './routes/reputation';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Logging
app.use(requestLogger);

// Initialize Solana connection
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
export const connection = new Connection(RPC_URL, 'confirmed');

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

app.listen(PORT, () => {
  console.log(`\n🚀 Proofly API running on port ${PORT}`);
  console.log(`📡 Solana RPC: ${RPC_URL}`);
  console.log(`⛓️  Network: ${process.env.SOLANA_NETWORK || 'devnet'}\n`);
});
