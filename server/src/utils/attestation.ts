import nacl from 'tweetnacl';
import { Keypair, PublicKey } from '@solana/web3.js';
import { Attestation, EvaluationResult } from '../types';

const ATTESTATION_EXPIRY_HOURS = 24;

function canonicalizeAttestation(attestation: Omit<Attestation, 'signature'>): string {
  return JSON.stringify({
    escrow: attestation.escrow,
    milestone: attestation.milestone,
    requirements_hash: attestation.requirements_hash,
    evidence_hash: attestation.evidence_hash,
    decision: attestation.decision,
    issued_at: attestation.issued_at,
    expires_at: attestation.expires_at,
    nonce: attestation.nonce,
  }, Object.keys({
    escrow: attestation.escrow,
    milestone: attestation.milestone,
    requirements_hash: attestation.requirements_hash,
    evidence_hash: attestation.evidence_hash,
    decision: attestation.decision,
    issued_at: attestation.issued_at,
    expires_at: attestation.expires_at,
    nonce: attestation.nonce,
  }).sort());
}

export function createAttestation(
  evaluationResult: EvaluationResult,
  escrowAddress: string,
  milestoneAddress: string,
  evaluatorKeypair: Keypair,
  nonce: number
): Attestation {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + ATTESTATION_EXPIRY_HOURS * 3600;

  let decisionCode: 1 | 2 | 3 = 3;
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

  const payload = canonicalizeAttestation(attestation);
  const signatureBytes = nacl.sign.detached(Buffer.from(payload, 'utf8'), evaluatorKeypair.secretKey);
  attestation.signature = Buffer.from(signatureBytes).toString('hex');

  return attestation;
}

export function verifyAttestationSignature(
  attestation: Attestation,
  expectedEvaluator: string
): boolean {
  if (!attestation.signature) return false;

  try {
    const publicKey = new PublicKey(expectedEvaluator);
    const payload = canonicalizeAttestation(attestation);
    const signatureBytes = Buffer.from(attestation.signature, 'hex');

    return nacl.sign.detached.verify(
      Buffer.from(payload, 'utf8'),
      signatureBytes,
      publicKey.toBuffer()
    );
  } catch {
    return false;
  }
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
  if (attestation.signature && !verifyAttestationSignature(attestation, expectedEvaluator)) {
    errors.push('Invalid signature');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

