import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { computeEvidenceHash } from '../utils/hash';
import { Evidence, EvidenceSubmission } from '../types';

const router = Router();

// In-memory storage (replace with database/IPFS in production)
const evidenceStore = new Map<string, EvidenceSubmission>();

// POST /api/evidence/submit — Submit evidence for a milestone
router.post('/submit', (req: Request, res: Response) => {
  try {
    const {
      milestone_id,
      escrow_address,
      freelancer_address,
      evidence_items,
    } = req.body;

    if (!milestone_id || !escrow_address || !freelancer_address || !evidence_items) {
      throw new AppError(400, 'Missing required fields');
    }

    if (!Array.isArray(evidence_items) || evidence_items.length === 0) {
      throw new AppError(400, 'Evidence items must be a non-empty array');
    }

    // Validate evidence items
    const validTypes = ['url', 'repository', 'screenshot', 'file', 'text'];
    for (const item of evidence_items) {
      if (!item.id || !item.type || !item.content) {
        throw new AppError(400, 'Each evidence item must have id, type, and content');
      }
      if (!validTypes.includes(item.type)) {
        throw new AppError(400, `Invalid evidence type: ${item.type}`);
      }
    }

    const submission: EvidenceSubmission = {
      milestone_id,
      escrow_address,
      freelancer_address,
      evidence_items: evidence_items.map(e => ({
        ...e,
        submitted_at: e.submitted_at || Math.floor(Date.now() / 1000),
        submitted_by: freelancer_address,
      })),
    };

    // Compute evidence hash
    const evidence_hash = computeEvidenceHash(submission.evidence_items);

    evidenceStore.set(milestone_id, submission);

    res.status(201).json({
      success: true,
      milestone_id,
      evidence_hash,
      evidence_count: evidence_items.length,
      submitted_at: Math.floor(Date.now() / 1000),
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to submit evidence', err);
  }
});

// GET /api/evidence/:milestone_id — Retrieve evidence
router.get('/:milestone_id', (req: Request, res: Response) => {
  try {
    const { milestone_id } = req.params;
    const submission = evidenceStore.get(milestone_id);

    if (!submission) {
      throw new AppError(404, `Evidence not found for milestone ${milestone_id}`);
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to retrieve evidence', err);
  }
});

// POST /api/evidence/hash — Compute evidence hash
router.post('/hash', (req: Request, res: Response) => {
  try {
    const { evidence_items } = req.body;

    if (!Array.isArray(evidence_items)) {
      throw new AppError(400, 'Evidence items must be an array');
    }

    const evidence_hash = computeEvidenceHash(evidence_items);

    res.json({
      success: true,
      evidence_hash,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to compute hash', err);
  }
});

export default router;
