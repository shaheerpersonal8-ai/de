import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { EvaluatorService } from '../services/evaluator-service';
import { AuditLogService } from '../models/audit-log.model';
import { validateEvaluationResult } from '../schemas/evaluation.schema';

const router = Router();

const attestationStore = new Map<string, any>();

router.post('/sign', async (req: Request, res: Response) => {
  try {
    const {
      evaluation_result,
      escrow_address,
      milestone_address,
      nonce,
    } = req.body;

    if (!evaluation_result || !escrow_address || !milestone_address || nonce === undefined) {
      throw new AppError(400, 'Missing required fields: evaluation_result, escrow_address, milestone_address, nonce');
    }

    if (!Number.isInteger(nonce) || nonce <= 0) {
      throw new AppError(400, 'nonce must be a positive integer');
    }

    if (evaluation_result.decision !== 'PASS') {
      throw new AppError(400, `Cannot sign non-PASS decisions (got ${evaluation_result.decision})`);
    }

    // Validate evaluation result schema
    try {
      validateEvaluationResult(evaluation_result);
    } catch (err: any) {
      throw new AppError(400, `Invalid evaluation result: ${err.message}`);
    }

    const startTime = Date.now();

    // Create signed attestation
    const { attestation, signature } = await EvaluatorService.createSignedAttestation(
      evaluation_result,
      escrow_address,
      milestone_address,
      nonce
    );

    // Store attestation
    attestationStore.set(`${escrow_address}-${milestone_address}`, {
      attestation,
      signature,
    });

    // Verify signature
    const isValid = EvaluatorService.verifyAttestationSignature(attestation, signature);
    if (!isValid) {
      throw new AppError(500, 'Failed to verify attestation signature');
    }

    AuditLogService.log({
      action: 'ATTESTATION_SIGNED',
      milestone_id: milestone_address,
      escrow_address,
      evaluator_pubkey: EvaluatorService.getPublicKeyBase58(),
      status: 'SUCCESS',
      details: { decision: attestation.decision, nonce: attestation.nonce },
      duration_ms: Date.now() - startTime,
      model_version: attestation.model_version,
      evaluator_version: attestation.evaluator_version,
    });

    res.status(201).json({
      success: true,
      attestation,
      signature,
      evaluator: EvaluatorService.getPublicKeyBase58(),
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to sign attestation', err);
  }
});

router.post('/verify', (req: Request, res: Response) => {
  try {
    const { attestation, signature } = req.body;

    if (!attestation || !signature) {
      throw new AppError(400, 'Missing required fields: attestation, signature');
    }

    const isValid = EvaluatorService.verifyAttestationSignature(attestation, signature);

    res.json({
      success: true,
      valid: isValid,
      evaluator: EvaluatorService.getPublicKeyBase58(),
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Verification failed', err);
  }
});

router.get('/:escrow/:milestone', (req: Request, res: Response) => {
  try {
    const { escrow, milestone } = req.params;
    const key = `${escrow}-${milestone}`;
    const attestationData = attestationStore.get(key);

    if (!attestationData) {
      throw new AppError(404, `Attestation not found`);
    }

    res.json({
      success: true,
      attestation: attestationData.attestation,
      signature: attestationData.signature,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to retrieve attestation', err);
  }
});

export default router;
