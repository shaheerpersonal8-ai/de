import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { createAttestation, validateAttestation } from '../utils/attestation';
import { Keypair } from '@solana/web3.js';

const router = Router();

// In-memory storage (replace with database in production)
const attestationStore = new Map<string, any>();

// Load evaluator keypair from environment (in production, use secure key management)
let evaluatorKeypair: Keypair | null = null;
if (process.env.PROOFLY_EVALUATOR_KEYPAIR) {
  try {
    const key = JSON.parse(process.env.PROOFLY_EVALUATOR_KEYPAIR);
    evaluatorKeypair = Keypair.fromSecretKey(new Uint8Array(key));
  } catch (err) {
    console.warn('Failed to load evaluator keypair from environment');
  }
}

// POST /api/attestation/sign — Create and sign attestation
router.post('/sign', (req: Request, res: Response) => {
  try {
    if (!evaluatorKeypair) {
      throw new AppError(500, 'Evaluator keypair not configured');
    }

    const {
      evaluation_result,
      escrow_address,
      milestone_address,
      nonce,
    } = req.body;

    if (!evaluation_result || !escrow_address || !milestone_address || nonce === undefined) {
      throw new AppError(400, 'Missing required fields');
    }

    // Only sign PASS attestations
    if (evaluation_result.decision !== 'PASS') {
      throw new AppError(400, `Cannot sign non-PASS decisions (got ${evaluation_result.decision})`);
    }

    // Create attestation
    const attestation = createAttestation(
      evaluation_result,
      escrow_address,
      milestone_address,
      evaluatorKeypair,
      nonce
    );

    attestationStore.set(`${escrow_address}-${milestone_address}`, attestation);

    res.status(201).json({
      success: true,
      attestation,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to sign attestation', err);
  }
});

// POST /api/attestation/validate — Validate an attestation
router.post('/validate', (req: Request, res: Response) => {
  try {
    const {
      attestation,
      expected_requirements_hash,
      expected_evidence_hash,
      expected_evaluator,
    } = req.body;

    if (
      !attestation ||
      !expected_requirements_hash ||
      !expected_evidence_hash ||
      !expected_evaluator
    ) {
      throw new AppError(400, 'Missing required fields');
    }

    const { valid, errors } = validateAttestation(
      attestation,
      expected_requirements_hash,
      expected_evidence_hash,
      expected_evaluator
    );

    res.json({
      success: true,
      valid,
      errors,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Validation failed', err);
  }
});

// GET /api/attestation/:escrow/:milestone — Retrieve attestation
router.get('/:escrow/:milestone', (req: Request, res: Response) => {
  try {
    const { escrow, milestone } = req.params;
    const key = `${escrow}-${milestone}`;
    const attestation = attestationStore.get(key);

    if (!attestation) {
      throw new AppError(404, `Attestation not found`);
    }

    res.json({
      success: true,
      data: attestation,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to retrieve attestation', err);
  }
});

export default router;
