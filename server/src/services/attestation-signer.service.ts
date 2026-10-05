import nacl from 'tweetnacl';
import { Keypair, PublicKey } from '@solana/web3.js';
import { hashRequirements, generateNonce } from '../utils/hashing.js';

export interface AttestationPayload {
  escrowAddress: string;
  milestone: {
    index: number;
    amount: number;
    requirementsHash: string;
    evidenceHash: string;
  };
  evaluation: {
    passed: boolean;
    confidenceScore: number;
    deterministic: DeterministicResult[];
    aiResult: AIEvaluationResult;
  };
  policy: {
    requiredPassRate: number;
    minConfidence: number;
    decision: 'auto_release' | 'manual_review' | 'hold';
  };
  evaluator: {
    version: string;
    modelVersion: string;
  };
  nonce: string;
  issuedAt: number;
  expiresAt: number;
}

export interface DeterministicResult {
  name: string;
  passed: boolean;
  evidence: string;
}

export interface AIEvaluationResult {
  passed: boolean;
  confidenceScore: number;
  reasoning: string;
  checks: Array<{
    name: string;
    passed: boolean;
    details: string;
  }>;
}

/**
 * Sign an attestation payload with evaluator keypair
 * Returns signature that Solana program can verify
 */
export function signAttestation(
  payload: AttestationPayload,
  evaluatorKeypair: Keypair
): { signature: string; signatureBytes: Uint8Array } {
  // Convert payload to canonical JSON
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const messageBytes = Buffer.from(canonical, 'utf8');

  // Sign with evaluator keypair
  const signatureBytes = nacl.sign.detached(messageBytes, evaluatorKeypair.secretKey);
  const signature = Buffer.from(signatureBytes).toString('hex');

  return { signature, signatureBytes };
}

/**
 * Verify attestation signature was signed by expected evaluator
 */
export function verifyAttestationSignature(
  payload: AttestationPayload,
  signature: string,
  evaluatorPublicKey: PublicKey
): boolean {
  try {
    const canonical = JSON.stringify(payload, Object.keys(payload).sort());
    const messageBytes = Buffer.from(canonical, 'utf8');
    const signatureBytes = Buffer.from(signature, 'hex');

    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      evaluatorPublicKey.toBuffer()
    );
  } catch (error) {
    return false;
  }
}

/**
 * Create attestation payload from evaluation results
 */
export function createAttestationPayload(
  escrowAddress: string,
  milestone: {
    index: number;
    amount: number;
    requirements: any[];
    evidenceHash: string;
  },
  evaluation: {
    deterministic: DeterministicResult[];
    ai: AIEvaluationResult;
    policyDecision: 'auto_release' | 'manual_review' | 'hold';
  },
  evaluatorVersion = 'v1.0.0',
  modelVersion = 'gpt-4-turbo'
): AttestationPayload {
  const requirementsHash = hashRequirements(milestone.requirements);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 86400 * 7; // 7 days

  return {
    escrowAddress,
    milestone: {
      index: milestone.index,
      amount: milestone.amount,
      requirementsHash,
      evidenceHash: milestone.evidenceHash,
    },
    evaluation: {
      passed: evaluation.ai.passed && evaluation.deterministic.every((c) => c.passed),
      confidenceScore: evaluation.ai.confidenceScore,
      deterministic: evaluation.deterministic,
      aiResult: evaluation.ai,
    },
    policy: {
      requiredPassRate: 1.0,
      minConfidence: 0.9,
      decision: evaluation.policyDecision,
    },
    evaluator: {
      version: evaluatorVersion,
      modelVersion,
    },
    nonce: generateNonce(),
    issuedAt: now,
    expiresAt,
  };
}

/**
 * Validate attestation payload structure
 */
export function validateAttestationPayload(payload: any): boolean {
  const required = [
    'escrowAddress',
    'milestone',
    'evaluation',
    'policy',
    'evaluator',
    'nonce',
    'issuedAt',
    'expiresAt',
  ];

  for (const field of required) {
    if (!(field in payload)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Validate milestone structure
  const m = payload.milestone;
  if (!m.index !== undefined || !m.amount || !m.requirementsHash || !m.evidenceHash) {
    console.error('Invalid milestone structure');
    return false;
  }

  // Validate evaluation structure
  const e = payload.evaluation;
  if (typeof e.passed !== 'boolean' || typeof e.confidenceScore !== 'number') {
    console.error('Invalid evaluation structure');
    return false;
  }

  // Validate expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.expiresAt < now) {
    console.error('Attestation has expired');
    return false;
  }

  return true;
}
