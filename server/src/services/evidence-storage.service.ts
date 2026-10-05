import * as crypto from 'crypto';
import { MerkleTree } from '../utils/merkle-tree';
import { encryptionManager } from '../config/encryption';
import { ipfsAdapter } from '../adapters/ipfs-adapter';
import { arweaveAdapter } from '../adapters/arweave-adapter';
import { env } from '../config/env';
import { AuditLogService } from '../models/audit-log.model';
import { Evidence } from '../types';

export interface PrivateEvidence extends Evidence {
  isPrivate: boolean;
  encrypted?: {
    iv: string;
    ciphertext: string;
    tag: string;
  };
}

export interface EvidenceBundle {
  id: string;
  milestone_id: string;
  escrow_address: string;
  evidence_list: PrivateEvidence[];
  merkle_root: string;
  evidence_hashes: string[];
  storage_proofs: {
    ipfs?: { hash: string; url: string };
    arweave?: { transactionId: string; contentHash: string };
  };
  created_at: number;
  updated_at: number;
}

/**
 * Comprehensive evidence storage manager
 * Handles IPFS/Arweave integration, merkle trees, and encryption
 */
export class EvidenceStorageManager {
  /**
   * Process and store evidence with integrity verification
   */
  static async storeEvidenceBundle(
    milestoneId: string,
    escrowAddress: string,
    evidenceItems: Evidence[],
    privateEvidenceIds?: string[]
  ): Promise<EvidenceBundle> {
    const startTime = Date.now();
    const bundleId = `evidence-bundle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Process each evidence item
      const processedEvidence: PrivateEvidence[] = [];
      const evidenceHashes: string[] = [];

      for (const evidence of evidenceItems) {
        const isPrivate = privateEvidenceIds?.includes(evidence.id) ?? false;

        // Create hash of evidence content
        const contentHash = crypto
          .createHash('sha256')
          .update(JSON.stringify(evidence), 'utf8')
          .digest('hex');

        evidenceHashes.push(contentHash);

        // Encrypt if private
        let processedItem: PrivateEvidence = {
          ...evidence,
          isPrivate,
        };

        if (isPrivate && env.privateEvidenceEncryptionEnabled) {
          const encrypted = encryptionManager.encrypt(
            JSON.stringify(evidence),
            `${escrowAddress}${milestoneId}`
          );
          processedItem.encrypted = encrypted;
          // Don't store original content if encrypted
          processedItem.content = '[ENCRYPTED]';
        }

        processedEvidence.push(processedItem);
      }

      // Build merkle tree for integrity verification
      const merkleTree = new MerkleTree(evidenceHashes);
      const merkleRoot = merkleTree.getRoot();

      const storageProofs: EvidenceBundle['storage_proofs'] = {};

      // Store on IPFS if enabled
      if (env.evidenceStorageMode === 'ipfs' || env.evidenceStorageMode === 'hybrid') {
        try {
          const ipfsAvailable = await ipfsAdapter.isAvailable();
          if (ipfsAvailable) {
            const bundleData = JSON.stringify({
              milestone_id: milestoneId,
              escrow_address: escrowAddress,
              evidence_list: processedEvidence,
              merkle_root: merkleRoot,
              created_at: Date.now(),
            });

            const ipfsResult = await ipfsAdapter.uploadFile(
              `${bundleId}.json`,
              bundleData,
              { milestone_id: milestoneId, escrow_address: escrowAddress }
            );

            storageProofs.ipfs = {
              hash: ipfsResult.hash,
              url: ipfsResult.url,
            };

            // Pin for persistence if enabled
            await ipfsAdapter.pinContent(ipfsResult.hash, {
              milestone_id: milestoneId,
              escrow_address: escrowAddress,
            });
          }
        } catch (err) {
          console.warn('[EvidenceStorage] IPFS upload failed, continuing with other methods:', err);
        }
      }

      // Store on Arweave if enabled
      if (env.evidenceStorageMode === 'arweave' || env.evidenceStorageMode === 'hybrid') {
        try {
          const arweaveAvailable = await arweaveAdapter.isAvailable();
          if (arweaveAvailable) {
            const bundleData = JSON.stringify({
              milestone_id: milestoneId,
              escrow_address: escrowAddress,
              evidence_list: processedEvidence,
              merkle_root: merkleRoot,
              created_at: Date.now(),
            });

            const arweaveResult = await arweaveAdapter.uploadData(bundleData, 'application/json', {
              milestone_id: milestoneId,
              escrow_address: escrowAddress,
            });

            storageProofs.arweave = {
              transactionId: arweaveResult.transactionId,
              contentHash: arweaveResult.contentHash,
            };
          }
        } catch (err) {
          console.warn('[EvidenceStorage] Arweave upload failed, continuing with other methods:', err);
        }
      }

      // Create evidence bundle
      const bundle: EvidenceBundle = {
        id: bundleId,
        milestone_id: milestoneId,
        escrow_address: escrowAddress,
        evidence_list: processedEvidence,
        merkle_root: merkleRoot,
        evidence_hashes: evidenceHashes,
        storage_proofs: storageProofs,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      };

      // Log successful storage
      AuditLogService.log({
        action: 'EVIDENCE_BUNDLE_STORED',
        milestone_id: milestoneId,
        escrow_address: escrowAddress,
        evaluator_pubkey: 'system',
        status: 'SUCCESS',
        details: {
          bundle_id: bundleId,
          evidence_count: evidenceItems.length,
          private_evidence_count: privateEvidenceIds?.length || 0,
          merkle_root: merkleRoot,
          storage_methods: Object.keys(storageProofs),
        },
        duration_ms: Date.now() - startTime,
        model_version: env.evaluatorModelVersion,
        evaluator_version: env.evaluatorVersion,
      });

      return bundle;
    } catch (error: any) {
      console.error('[EvidenceStorage] Storage failed:', error.message);

      AuditLogService.log({
        action: 'EVIDENCE_BUNDLE_STORAGE_FAILED',
        milestone_id: milestoneId,
        escrow_address: escrowAddress,
        evaluator_pubkey: 'system',
        status: 'ERROR',
        error_message: error.message,
        details: { bundle_id: bundleId },
        duration_ms: Date.now() - startTime,
        model_version: env.evaluatorModelVersion,
        evaluator_version: env.evaluatorVersion,
      });

      throw error;
    }
  }

  /**
   * Verify integrity of evidence bundle using merkle proof
   */
  static verifyEvidenceIntegrity(bundle: EvidenceBundle, evidenceId: string): boolean {
    try {
      const evidence = bundle.evidence_list.find(e => e.id === evidenceId);
      if (!evidence) return false;

      // Recompute hash
      const contentHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(evidence), 'utf8')
        .digest('hex');

      // Find hash index
      const hashIndex = bundle.evidence_hashes.indexOf(contentHash);
      if (hashIndex === -1) return false;

      // Verify using merkle root (simplified - production would use proof path)
      const merkleTree = new MerkleTree(bundle.evidence_hashes);
      return merkleTree.getRoot() === bundle.merkle_root;
    } catch (err) {
      console.error('[EvidenceStorage] Verification failed:', err);
      return false;
    }
  }

  /**
   * Decrypt private evidence
   */
  static decryptPrivateEvidence(evidence: PrivateEvidence, escrowAddress: string, milestoneId: string): Evidence {
    if (!evidence.encrypted) {
      throw new Error('Evidence is not encrypted');
    }

    const decrypted = encryptionManager.decrypt(evidence.encrypted, `${escrowAddress}${milestoneId}`);
    return JSON.parse(decrypted);
  }

  /**
   * Get storage proof for evidence bundle
   */
  static getStorageProof(bundle: EvidenceBundle): {
    ipfsHash?: string;
    ipfsUrl?: string;
    arweaveTransactionId?: string;
  } {
    return {
      ipfsHash: bundle.storage_proofs.ipfs?.hash,
      ipfsUrl: bundle.storage_proofs.ipfs?.url,
      arweaveTransactionId: bundle.storage_proofs.arweave?.transactionId,
    };
  }
}
