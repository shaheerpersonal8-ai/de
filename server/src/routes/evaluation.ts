import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { AIEvaluationWithRetry } from '../services/ai-evaluation-with-retry';
import { EvaluatorService } from '../services/evaluator-service';
import { AuditLogService } from '../models/audit-log.model';

const router = Router();

const evaluationStore = new Map<string, any>();

router.post('/run', async (req: Request, res: Response) => {
  try {
    const {
      milestone_id,
      requirements_hash,
      evidence_items,
      requirements,
      release_policy,
      escrow_address,
    } = req.body;

    if (
      !milestone_id ||
      !requirements_hash ||
      !evidence_items ||
      !requirements ||
      !release_policy ||
      !escrow_address
    ) {
      throw new AppError(400, 'Missing required fields: milestone_id, requirements_hash, evidence_items, requirements, release_policy, escrow_address');
    }

    if (!/^[a-f0-9]{64}$/.test(requirements_hash)) {
      throw new AppError(400, 'requirements_hash must be a valid 256-bit hex string');
    }

    const startTime = Date.now();

    // Run evaluation with timeout and retry logic
    const evaluation = await AIEvaluationWithRetry.evaluateWithTimeout(
      milestone_id,
      requirements_hash,
      evidence_items,
      requirements,
      release_policy,
      escrow_address
    );

    // Store evaluation
    evaluationStore.set(milestone_id, evaluation);

    // Log successful evaluation
    AuditLogService.log({
      action: 'EVALUATION_COMPLETED',
      milestone_id,
      escrow_address,
      evaluator_pubkey: EvaluatorService.getPublicKeyBase58(),
      status: 'SUCCESS',
      details: { decision: evaluation.decision, confidence: evaluation.confidence },
      duration_ms: Date.now() - startTime,
      model_version: evaluation.model_version,
      evaluator_version: evaluation.evaluator_version,
    });

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Evaluation failed', err);
  }
});

router.get('/:milestone_id', (req: Request, res: Response) => {
  try {
    const { milestone_id } = req.params;
    const evaluation = evaluationStore.get(milestone_id);

    if (!evaluation) {
      throw new AppError(404, `Evaluation not found for milestone ${milestone_id}`);
    }

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to retrieve evaluation', err);
  }
});

router.get('/audit/:milestone_id', (req: Request, res: Response) => {
  try {
    const { milestone_id } = req.params;
    const logs = AuditLogService.getLogs(milestone_id);

    res.json({
      success: true,
      milestone_id,
      audit_logs: logs,
      total_events: logs.length,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to retrieve audit logs', err);
  }
});

router.get('/audit/recent/:limit', (req: Request, res: Response) => {
  try {
    const { limit } = req.params;
    const limitNum = Math.min(parseInt(limit) || 100, 1000);
    const logs = AuditLogService.getRecentLogs(limitNum);

    res.json({
      success: true,
      audit_logs: logs,
      total_events: logs.length,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to retrieve recent audit logs', err);
  }
});

export default router;
