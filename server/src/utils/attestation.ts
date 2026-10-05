import { Keypair, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { createHash } from 'crypto';
import { EvaluationResult, Attestation } from '../types';

const ATTESTATION_EXPIRY_HOURS = 24;

export function createAttestation(
  evaluationResult: EvaluationResult,
  escrowAddress: string,
  milestoneAddress: string,
  evaluatorKeypair: Keypair,
  nonce: number
): Attestation {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + ATTESTATION_EXPIRY_HOURS * 3600;

  // Map decision to on-chain format (1=Pass, 2=Fail, 3=NeedsReview)
  let decisionCode: 1 | 2 | 3 = 3; // Default to NEEDS_REVIEW
  if (evaluationResult.decision === 'PASS') decisionCode = 1;
  else if (evaluationResult.decision === 'FAIL') decisionCode = 2;

  const attestation: Attestation = {
    escrow: escrowAddress,
    milestone: milestoneAddress,
    requirements_hash: evaluationResult.requirements_hash,
    evidence_hash: evaluationResult.evidence_hash,
    decision: decisionCode,
    evaluator: evaluatorKeypair.publicKey.toBase58(),
    issued_at: now,
    expires_at: expiresAt,
    nonce,
  };

  // Sign attestation
  const attestationString = JSON.stringify({
    escrow: attestation.escrow,
    milestone: attestation.milestone,
    requirements_hash: attestation.requirements_hash,
    evidence_hash: attestation.evidence_hash,
    decision: attestation.decision,
    issued_at: attestation.issued_at,
    expires_at: attestation.expires_at,
    nonce: attestation.nonce,
  }, null, 0);

  // Mock signature (in production, use Ed25519)
  const signature = createHash('sha256')
    .update(attestationString + evaluatorKeypair.publicKey.toBase58())
    .digest('hex');

  attestation.signature = signature;

  return attestation;
}

export function validateAttestation(
  attestation: Attestation,
  expectedRequirementsHash: string,
  expectedEvidenceHash: string,
  expectedEvaluator: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const now = Math.floor(Date.now() / 1000);

  if (attestation.requirements_hash !== expectedRequirementsHash) {
    errors.push('Requirements hash mismatch');
  }
  if (attestation.evidence_hash !== expectedEvidenceHash) {
    errors.push('Evidence hash mismatch');
  }
  if (attestation.evaluator !== expectedEvaluator) {
    errors.push('Evaluator mismatch');
  }
  if (now > attestation.expires_at) {
    errors.push('Attestation has expired');
  }
  if (!attestation.signature) {
    errors.push('Missing signature');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
