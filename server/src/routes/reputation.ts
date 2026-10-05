import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { VerifiedReputation } from '../types';

const router = Router();

// In-memory storage (replace with database in production)
const reputationStore = new Map<string, VerifiedReputation[]>();

// POST /api/reputation/record — Record a verified reputation event
router.post('/record', (req: Request, res: Response) => {
  try {
    const {
      wallet,
      role,
      escrow,
      milestone,
      amount,
      completed_at,
      verification_method,
      evidence_hash,
      counterparty,
    } = req.body;

    if (
      !wallet ||
      !role ||
      !escrow ||
      !milestone ||
      amount === undefined ||
      !completed_at ||
      !verification_method ||
      !evidence_hash ||
      !counterparty
    ) {
      throw new AppError(400, 'Missing required fields');
    }

    if (!['client', 'freelancer'].includes(role)) {
      throw new AppError(400, 'Role must be client or freelancer');
    }

    const event: VerifiedReputation = {
      wallet,
      role,
      escrow,
      milestone,
      amount,
      completed_at,
      verification_method,
      evidence_hash,
      counterparty,
    };

    if (!reputationStore.has(wallet)) {
      reputationStore.set(wallet, []);
    }
    reputationStore.get(wallet)!.push(event);

    res.status(201).json({
      success: true,
      message: 'Reputation event recorded',
      event,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to record reputation event', err);
  }
});

// GET /api/reputation/profile/:wallet — Get reputation profile
router.get('/profile/:wallet', (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const events = reputationStore.get(wallet) || [];

    const totalAmount = events.reduce((sum, e) => sum + e.amount, 0);
    const completedCount = events.length;
    const clientEvents = events.filter(e => e.role === 'client').length;
    const freelancerEvents = events.filter(e => e.role === 'freelancer').length;

    res.json({
      success: true,
      wallet,
      stats: {
        verified_completions: completedCount,
        total_amount_verified: totalAmount,
        as_client: clientEvents,
        as_freelancer: freelancerEvents,
      },
      events: events.sort((a, b) => b.completed_at - a.completed_at),
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to retrieve reputation profile', err);
  }
});

export default router;
