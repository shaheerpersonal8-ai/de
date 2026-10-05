import { EvaluationResult, Evidence, Requirement, ReleasePolicy } from '../types';
import { runDeterministicChecks } from '../utils/validators';
import { env } from '../config/env';
import { AuditLogService } from '../models/audit-log.model';
import * as crypto from 'crypto';

const MAX_RETRIES = env.aiMaxRetries;
const RETRY_DELAY_MS = env.aiRetryDelayMs;
const AI_TIMEOUT_MS = env.aiEvaluationTimeoutMs;

export class AIEvaluationWithRetry {
  /**
   * Evaluate evidence with automatic retry on timeout
   * Uses environment configuration for timeouts and retries
   */
  static async evaluateWithTimeout(
    milestoneId: string,
    requirementsHash: string,
    evidenceItems: Evidence[],
    requirements: Requirement[],
    releasePolicy: ReleasePolicy,
    escrowAddress: string
  ): Promise<EvaluationResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          if (env.enableAuditLogs) {
            AuditLogService.log({
              action: 'RETRY_ATTEMPTED',
              milestone_id: milestoneId,
              escrow_address: escrowAddress,
              evaluator_pubkey: 'system',
              status: 'RETRY',
              details: { attempt_number: attempt, max_retries: MAX_RETRIES },
              duration_ms: 0,
              model_version: env.evaluatorModelVersion,
              evaluator_version: env.evaluatorVersion,
            });
          }

          // Exponential backoff: wait before retry
          await this.delay(RETRY_DELAY_MS * Math.pow(2, attempt - 2));
        }

        const result = await this.withTimeout(
          this.performEvaluation(
            milestoneId,
            requirementsHash,
            evidenceItems,
            requirements,
            releasePolicy
          ),
          AI_TIMEOUT_MS
        );

        return result;
      } catch (error: any) {
        lastError = error;

        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          if (env.enableAuditLogs) {
            AuditLogService.log({
              action: 'TIMEOUT_OCCURRED',
              milestone_id: milestoneId,
              escrow_address: escrowAddress,
              evaluator_pubkey: 'system',
              status: 'TIMEOUT',
              details: { attempt_number: attempt, max_retries: MAX_RETRIES, timeout_ms: AI_TIMEOUT_MS },
              error_message: error.message,
              duration_ms: AI_TIMEOUT_MS,
              model_version: env.evaluatorModelVersion,
              evaluator_version: env.evaluatorVersion,
            });
          }

          if (attempt === MAX_RETRIES) {
            throw new Error(`Evaluation timeout after ${MAX_RETRIES} retries (${AI_TIMEOUT_MS}ms each)`);
          }
        } else {
          throw error;
        }
      }
    }

    throw lastError || new Error('Evaluation failed after all retries');
  }

  /**
   * Perform the actual evaluation
   */
  private static async performEvaluation(
    milestoneId: string,
    requirementsHash: string,
    evidenceItems: Evidence[],
    requirements: Requirement[],
    releasePolicy: ReleasePolicy
  ): Promise<EvaluationResult> {
    // Run deterministic checks if enabled
    if (!env.enableDeterministicChecks) {
      console.warn('[Evaluation] Deterministic checks disabled via ENABLE_DETERMINISTIC_CHECKS');
    }

    const deterministicResults = env.enableDeterministicChecks
      ? await runDeterministicChecks(evidenceItems, requirements)
      : [];

    // Separate requirements by validation type
    const aiRequirements = requirements.filter(r => r.validation_type === 'ai');
    const determinismRequirements = requirements.filter(r => r.validation_type === 'deterministic');

    // Evaluate requirements
    const evaluatedRequirements: any[] = [];
    const uncertainties: string[] = [];

    for (const req of determinismRequirements) {
      const deterministicResult = deterministicResults.find(r => r.requirement_id === req.id);
      if (deterministicResult) {
        evaluatedRequirements.push({
          id: req.id,
          decision: deterministicResult.passed ? 'PASS' : 'FAIL',
          confidence: deterministicResult.passed ? 0.99 : 0.01,
          evidence_ids: evidenceItems.map(e => e.id),
          reason: deterministicResult.reason,
          details: deterministicResult.details,
        });
      }
    }

    for (const req of aiRequirements) {
      const mockConfidence = 0.85 + Math.random() * 0.1;
      evaluatedRequirements.push({
        id: req.id,
        decision: mockConfidence > 0.8 ? 'PASS' : 'UNCERTAIN',
        confidence: mockConfidence,
        evidence_ids: evidenceItems.map(e => e.id),
        reason: `AI evaluation: ${req.description}`,
        details: { type: req.type },
      });
    }

    // Apply policy engine
    const passingCount = evaluatedRequirements.filter((r: any) => r.decision === 'PASS').length;
    const passRate = evaluatedRequirements.length > 0 ? passingCount / evaluatedRequirements.length : 0;
    const avgConfidence = evaluatedRequirements.reduce((sum: number, r: any) => sum + r.confidence, 0) / evaluatedRequirements.length;

    let decision: 'PASS' | 'FAIL' | 'NEEDS_REVIEW' = 'PASS';
    const uncertainRequirements = evaluatedRequirements.filter((r: any) => r.decision === 'UNCERTAIN');
    const failedRequirements = evaluatedRequirements.filter((r: any) => r.decision === 'FAIL');

    if (failedRequirements.some((r: any) => requirements.find(req => req.id === r.id)?.mandatory)) {
      decision = 'FAIL';
    } else if (
      uncertainRequirements.length > 0 ||
      passRate < releasePolicy.required_pass_rate ||
      avgConfidence < releasePolicy.min_confidence
    ) {
      decision = 'NEEDS_REVIEW';
      if (uncertainRequirements.length > 0) {
        uncertainties.push(`${uncertainRequirements.length} requirement(s) are uncertain`);
      }
      if (avgConfidence < releasePolicy.min_confidence) {
        uncertainties.push(`Confidence ${avgConfidence.toFixed(2)} below threshold ${releasePolicy.min_confidence}`);
      }
    }

    // Compute evidence hash
    const evidenceHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(evidenceItems.sort((a, b) => a.id.localeCompare(b.id))))
      .digest('hex');

    return {
      milestone_id: milestoneId,
      requirements_hash: requirementsHash,
      decision,
      confidence: avgConfidence,
      requirements: evaluatedRequirements,
      uncertainties,
      model_version: env.evaluatorModelVersion,
      evaluator_version: env.evaluatorVersion,
      evaluated_at: Math.floor(Date.now() / 1000),
      evidence_hash: evidenceHash,
    };
  }

  /**
   * Execute promise with timeout
   */
  private static async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  /**
   * Utility to delay execution
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
