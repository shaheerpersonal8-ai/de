import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { evaluateEvidence } from '../utils/evaluator';

const router = Router();

// In-memory storage (replace with database in production)
const evaluationStore = new Map<string, any>();

// POST /api/evaluate/run — Run evaluation on submitted evidence
router.post('/run', async (req: Request, res: Response) => {
  try {
    const {
      milestone_id,
      requirements_hash,
      evidence_items,
      requirements,
      release_policy,
    } = req.body;

    if (
      !milestone_id ||
      !requirements_hash ||
      !evidence_items ||
      !requirements ||
      !release_policy
    ) {
      throw new AppError(400, 'Missing required fields');
    }

    // Run evaluation
    const evaluation = await evaluateEvidence(
      milestone_id,
      requirements_hash,
      evidence_items,
      requirements,
      release_policy
    );

    // Store evaluation
    evaluationStore.set(milestone_id, evaluation);

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Evaluation failed', err);
  }
});

// GET /api/evaluate/:milestone_id — Retrieve evaluation result
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

export default router;
