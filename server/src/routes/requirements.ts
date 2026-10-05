import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { computeRequirementsHash, canonicalizeRequirements } from '../utils/hash';
import { RequirementsSpec, Requirement } from '../types';

const router = Router();

// In-memory storage (replace with database in production)
const requirementsStore = new Map<string, RequirementsSpec>();

// POST /api/requirements — Create and canonicalize requirements
router.post('/create', (req: Request, res: Response) => {
  try {
    const { milestone_id, escrow_address, requirements, release_policy } = req.body;

    if (!milestone_id || !escrow_address || !requirements || !release_policy) {
      throw new AppError(400, 'Missing required fields');
    }

    if (!Array.isArray(requirements) || requirements.length === 0) {
      throw new AppError(400, 'Requirements must be a non-empty array');
    }

    // Validate release policy
    if (
      release_policy.required_pass_rate < 0 ||
      release_policy.required_pass_rate > 1 ||
      release_policy.min_confidence < 0 ||
      release_policy.min_confidence > 1
    ) {
      throw new AppError(400, 'Invalid release policy values');
    }

    const spec: RequirementsSpec = {
      milestone_id,
      escrow_address,
      requirements,
      release_policy,
      created_at: Math.floor(Date.now() / 1000),
    };

    // Canonicalize and hash
    const canonical = canonicalizeRequirements(spec);
    const requirements_hash = computeRequirementsHash(spec);

    spec.canonicalized_at = Math.floor(Date.now() / 1000);
    spec.requirements_hash = requirements_hash;

    requirementsStore.set(milestone_id, spec);

    res.status(201).json({
      success: true,
      milestone_id,
      requirements_hash,
      canonical,
      requirements_count: requirements.length,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to create requirements', err);
  }
});

// GET /api/requirements/:milestone_id — Retrieve requirements
router.get('/:milestone_id', (req: Request, res: Response) => {
  try {
    const { milestone_id } = req.params;
    const spec = requirementsStore.get(milestone_id);

    if (!spec) {
      throw new AppError(404, `Requirements not found for milestone ${milestone_id}`);
    }

    res.json({
      success: true,
      data: spec,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to retrieve requirements', err);
  }
});

// POST /api/requirements/validate — Validate requirements format
router.post('/validate', (req: Request, res: Response) => {
  try {
    const { requirements, release_policy } = req.body;

    if (!Array.isArray(requirements)) {
      throw new AppError(400, 'Requirements must be an array');
    }

    const validTypes = ['deployment', 'feature', 'visual', 'test', 'api', 'other'];
    const validValidationTypes = ['deterministic', 'ai', 'manual'];
    const errors: string[] = [];

    requirements.forEach((req: any, idx: number) => {
      if (!req.id) errors.push(`Requirement ${idx}: missing id`);
      if (!validTypes.includes(req.type)) errors.push(`Requirement ${idx}: invalid type`);
      if (!req.description) errors.push(`Requirement ${idx}: missing description`);
      if (!validValidationTypes.includes(req.validation_type)) errors.push(`Requirement ${idx}: invalid validation_type`);
    });

    if (errors.length > 0) {
      throw new AppError(400, 'Validation errors', { errors });
    }

    res.json({
      success: true,
      message: 'Requirements are valid',
      count: requirements.length,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Validation failed', err);
  }
});

export default router;
