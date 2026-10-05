import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { EvidenceStorageManager, EvidenceBundle } from '../services/evidence-storage.service';
import { env } from '../config/env';
import { AuditLogService } from '../models/audit-log.model';

const router = Router();

const evidenceStore = new Map<string, EvidenceBundle>();

// POST /api/evidence/store — Store evidence with integrity verification
router.post('/store', async (req: Request, res: Response) => {
  try {
    const { milestone_id, escrow_address, evidence_items, private_evidence_ids } = req.body;

    if (!milestone_id || !escrow_address || !evidence_items || !Array.isArray(evidence_items)) {
      throw new AppError(
        400,
        'Missing required fields: milestone_id, escrow_address, evidence_items (array)'
      );
    }

    if (evidence_items.length === 0) {
      throw new AppError(400, 'evidence_items cannot be empty');
    }

    const startTime = Date.now();

    // Store evidence bundle with integrity verification
    const bundle = await EvidenceStorageManager.storeEvidenceBundle(
      milestone_id,
      escrow_address,
      evidence_items,
      private_evidence_ids
    );

    // Store locally for retrieval
    evidenceStore.set(bundle.id, bundle);

    AuditLogService.log({
      action: 'EVIDENCE_STORED_VIA_API',
      milestone_id,
      escrow_address,
      evaluator_pubkey: 'system',
      status: 'SUCCESS',
      details: {
        bundle_id: bundle.id,
        evidence_count: evidence_items.length,
        merkle_root: bundle.merkle_root,
        storage_methods: Object.keys(bundle.storage_proofs),
      },
      duration_ms: Date.now() - startTime,
      model_version: env.evaluatorModelVersion,
      evaluator_version: env.evaluatorVersion,
    });

    res.status(201).json({
      success: true,
      bundle: {
        id: bundle.id,
        milestone_id: bundle.milestone_id,
        escrow_address: bundle.escrow_address,
        merkle_root: bundle.merkle_root,
        evidence_count: bundle.evidence_list.length,
        private_evidence_count: bundle.evidence_list.filter(e => e.isPrivate).length,
        storage_proofs: bundle.storage_proofs,
        created_at: bundle.created_at,
      },
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to store evidence', err);
  }
});

// GET /api/evidence/:bundleId — Retrieve evidence bundle
router.get('/:bundleId', (req: Request, res: Response) => {
  try {
    const { bundleId } = req.params;
    const bundle = evidenceStore.get(bundleId);

    if (!bundle) {
      throw new AppError(404, `Evidence bundle not found: ${bundleId}`);
    }

    res.json({
      success: true,
      bundle: {
        id: bundle.id,
        milestone_id: bundle.milestone_id,
        escrow_address: bundle.escrow_address,
        evidence_count: bundle.evidence_list.length,
        merkle_root: bundle.merkle_root,
        storage_proofs: bundle.storage_proofs,
        created_at: bundle.created_at,
      },
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to retrieve evidence bundle', err);
  }
});

// POST /api/evidence/verify — Verify evidence integrity
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { bundle_id, evidence_id } = req.body;

    if (!bundle_id || !evidence_id) {
      throw new AppError(400, 'Missing required fields: bundle_id, evidence_id');
    }

    const bundle = evidenceStore.get(bundle_id);
    if (!bundle) {
      throw new AppError(404, `Evidence bundle not found: ${bundle_id}`);
    }

    const isValid = EvidenceStorageManager.verifyEvidenceIntegrity(bundle, evidence_id);

    AuditLogService.log({
      action: 'EVIDENCE_INTEGRITY_VERIFIED',
      milestone_id: bundle.milestone_id,
      escrow_address: bundle.escrow_address,
      evaluator_pubkey: 'system',
      status: isValid ? 'SUCCESS' : 'ERROR',
      details: {
        bundle_id,
        evidence_id,
        valid: isValid,
        merkle_root: bundle.merkle_root,
      },
      duration_ms: 0,
      model_version: env.evaluatorModelVersion,
      evaluator_version: env.evaluatorVersion,
    });

    res.json({
      success: true,
      valid: isValid,
      merkle_root: bundle.merkle_root,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Verification failed', err);
  }
});

// POST /api/evidence/decrypt-private — Decrypt private evidence
router.post('/decrypt-private', (req: Request, res: Response) => {
  try {
    if (!env.privateEvidenceEncryptionEnabled) {
      throw new AppError(400, 'Private evidence decryption is disabled');
    }

    const { bundle_id, evidence_id, escrow_address, milestone_id } = req.body;

    if (!bundle_id || !evidence_id || !escrow_address || !milestone_id) {
      throw new AppError(
        400,
        'Missing required fields: bundle_id, evidence_id, escrow_address, milestone_id'
      );
    }

    const bundle = evidenceStore.get(bundle_id);
    if (!bundle) {
      throw new AppError(404, `Evidence bundle not found: ${bundle_id}`);
    }

    const evidence = bundle.evidence_list.find(e => e.id === evidence_id);
    if (!evidence) {
      throw new AppError(404, `Evidence not found in bundle: ${evidence_id}`);
    }

    if (!evidence.isPrivate || !evidence.encrypted) {
      throw new AppError(400, 'Evidence is not encrypted or is not marked as private');
    }

    const decrypted = EvidenceStorageManager.decryptPrivateEvidence(
      evidence,
      escrow_address,
      milestone_id
    );

    AuditLogService.log({
      action: 'PRIVATE_EVIDENCE_DECRYPTED',
      milestone_id,
      escrow_address,
      evaluator_pubkey: 'system',
      status: 'SUCCESS',
      details: {
        bundle_id,
        evidence_id,
      },
      duration_ms: 0,
      model_version: env.evaluatorModelVersion,
      evaluator_version: env.evaluatorVersion,
    });

    res.json({
      success: true,
      evidence: decrypted,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Decryption failed', err);
  }
});

// GET /api/evidence/storage-proof/:bundleId — Get storage proof
router.get('/storage-proof/:bundleId', (req: Request, res: Response) => {
  try {
    const { bundleId } = req.params;
    const bundle = evidenceStore.get(bundleId);

    if (!bundle) {
      throw new AppError(404, `Evidence bundle not found: ${bundleId}`);
    }

    const proof = EvidenceStorageManager.getStorageProof(bundle);

    res.json({
      success: true,
      bundle_id: bundle.id,
      storage_proof: proof,
      storage_methods: Object.keys(bundle.storage_proofs),
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to retrieve storage proof', err);
  }
});

export default router;
