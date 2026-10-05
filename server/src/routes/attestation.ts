import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { createAttestation, validateAttestation } from '../utils/attestation';
import { Keypair } from '@solana/web3.js';

const router = Router();

const attestationStore = new Map<string, any>();

let evaluatorKeypair: Keypair | null = null;
if (process.env.PROOFLY_EVALUATOR_KEYPAIR) {
  try {
    const key = JSON.parse(process.env.PROOFLY_EVALUATOR_KEYPAIR);
    evaluatorKeypair = Keypair.fromSecretKey(new Uint8Array(key));
  } catch (err) {
    console.warn('Failed to load evaluator keypair from environment');
  }
}

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

    if (!evaluation_result.requirements_hash || !evaluation_result.evidence_hash) {
      throw new AppError(400, 'Evaluation result is missing requirements_hash or evidence_hash');
    }

    if (evaluation_result.decision !== 'PASS') {
      throw new AppError(400, `Cannot sign non-PASS decisions (got ${evaluation_result.decision})`);
    }

    const attestation = createAttestation(
      evaluation_result,
      escrow_address,
      milestone_address,
      evaluatorKeypair,
      Number(nonce)
    );

    const verification = validateAttestation(
      attestation,
      evaluation_result.requirements_hash,
      evaluation_result.evidence_hash,
      evaluatorKeypair.publicKey.toBase58()
    );

    if (!verification.valid) {
      throw new AppError(400, `Attestation validation failed: ${verification.errors.join(', ')}`);
    }

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

