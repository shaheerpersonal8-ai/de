import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { EvaluationResult } from '../types';
import { getEvaluatorKeypair } from '../config/evaluator-env';
import { env } from '../config/env';
import { AuditLogService } from '../models/audit-log.model';
import { AttestationPayload, AttestationPayloadSchema, validateEvaluationResult } from '../schemas/evaluation.schema';

const MAX_RETRIES = env.aiMaxRetries;
const RETRY_DELAY_MS = env.aiRetryDelayMs;

export class EvaluatorService {
  private static keypair: Keypair | null = null;

  static getKeypair(): Keypair {
    if (!this.keypair) {
      this.keypair = getEvaluatorKeypair();
    }
    return this.keypair;
  }

  static getPublicKeyBase58(): string {
    return this.getKeypair().publicKey.toBase58();
  }

  /**
   * Create a signed attestation from evaluation result
   * Validates structure, signs with evaluator keypair, logs audit trail
   */
  static async createSignedAttestation(
    evaluationResult: EvaluationResult,
    escrowAddress: string,
    milestoneAddress: string,
    nonce: number
  ): Promise<{ attestation: AttestationPayload; signature: string }> {
    const startTime = Date.now();
    const auditDetails: Record<string, any> = {};

    try {
      // Validate evaluation result structure
      const validated = validateEvaluationResult(evaluationResult);
      auditDetails.evaluation_validated = true;

      // Map decision to on-chain format (1=PASS, 2=FAIL, 3=NEEDS_REVIEW)
      let decisionCode: 1 | 2 | 3 = 3;
      if (validated.decision === 'PASS') decisionCode = 1;
      else if (validated.decision === 'FAIL') decisionCode = 2;

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + env.attestationExpiryHours * 3600;

      // Create attestation payload
      const attestation: AttestationPayload = {
        escrow: escrowAddress,
        milestone: milestoneAddress,
        requirements_hash: validated.requirements_hash,
        evidence_hash: validated.evidence_hash,
        decision: decisionCode,
        evaluator: this.getPublicKeyBase58(),
        issued_at: now,
        expires_at: expiresAt,
        nonce,
        model_version: env.evaluatorModelVersion,
        evaluator_version: env.evaluatorVersion,
      };

      // Validate attestation payload schema
      const validatedAttestation = AttestationPayloadSchema.parse(attestation);
      auditDetails.attestation_validated = true;

      // Sign the attestation
      const signature = this.signAttestation(validatedAttestation);
      auditDetails.signature_created = true;

      // Log successful attestation creation
      if (env.enableAuditLogs) {
        AuditLogService.log({
          action: 'ATTESTATION_CREATED',
          milestone_id: milestoneAddress,
          escrow_address: escrowAddress,
          evaluator_pubkey: this.getPublicKeyBase58(),
          status: 'SUCCESS',
          details: auditDetails,
          duration_ms: Date.now() - startTime,
          model_version: env.evaluatorModelVersion,
          evaluator_version: env.evaluatorVersion,
        });
      }

      return {
        attestation: validatedAttestation,
        signature,
      };
    } catch (error: any) {
      if (env.enableAuditLogs) {
        AuditLogService.log({
          action: 'ATTESTATION_FAILED',
          milestone_id: milestoneAddress,
          escrow_address: escrowAddress,
          evaluator_pubkey: this.getPublicKeyBase58(),
          status: 'ERROR',
          details: auditDetails,
          error_message: error.message,
          duration_ms: Date.now() - startTime,
          model_version: env.evaluatorModelVersion,
          evaluator_version: env.evaluatorVersion,
        });
      }
      throw error;
    }
  }

  /**
   * Sign attestation payload with evaluator keypair using Ed25519
   */
  private static signAttestation(payload: AttestationPayload): string {
    const canonical = JSON.stringify(payload, Object.keys(payload).sort());
    const messageBytes = Buffer.from(canonical, 'utf8');
    const keypair = this.getKeypair();
    const signatureBytes = nacl.sign.detached(messageBytes, keypair.secretKey);
    return Buffer.from(signatureBytes).toString('hex');
  }

  /**
   * Verify attestation signature
   */
  static verifyAttestationSignature(payload: AttestationPayload, signature: string): boolean {
    try {
      const canonical = JSON.stringify(payload, Object.keys(payload).sort());
      const messageBytes = Buffer.from(canonical, 'utf8');
      const signatureBytes = Buffer.from(signature, 'hex');
      const publicKeyBuffer = this.getKeypair().publicKey.toBuffer();

      const verified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBuffer);

      if (verified && env.enableAuditLogs) {
        AuditLogService.log({
          action: 'SIGNATURE_VERIFIED',
          milestone_id: payload.milestone,
          escrow_address: payload.escrow,
          evaluator_pubkey: payload.evaluator,
          status: 'SUCCESS',
          details: { verification_result: 'valid' },
          duration_ms: 0,
          model_version: payload.model_version,
          evaluator_version: payload.evaluator_version,
        });
      }

      return verified;
    } catch (error) {
      if (env.enableAuditLogs) {
        AuditLogService.log({
          action: 'SIGNATURE_VERIFIED',
          milestone_id: payload.milestone,
          escrow_address: payload.escrow,
          evaluator_pubkey: payload.evaluator,
          status: 'ERROR',
          details: { verification_result: 'invalid' },
          error_message: 'Signature verification failed',
          duration_ms: 0,
          model_version: env.evaluatorModelVersion,
          evaluator_version: env.evaluatorVersion,
        });
      }
      return false;
    }
  }
}
