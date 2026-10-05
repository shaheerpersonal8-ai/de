import { DeterministicCheck } from '../services/deterministic-checks.service.js';

export interface EvaluationPolicy {
  requiredPassRate: number; // 0.0 to 1.0 (percentage of requirements that must pass)
  minConfidence: number; // 0.0 to 1.0 (minimum AI confidence for auto release)
  humanReviewBelowConfidence: number; // Threshold below which human review is required
}

export type PolicyDecision = 'auto_release' | 'manual_review' | 'hold';

/**
 * Apply policy engine to evaluation results
 * Decides whether to auto-release, request manual review, or hold
 */
export function applyPolicy(
  deterministic: DeterministicCheck[],
  aiConfidence: number,
  requirementCount: number,
  policy: EvaluationPolicy
): PolicyDecision {
  // Count deterministic passes
  const deterministicPasses = deterministic.filter((c) => c.passed).length;
  const deterministicPassRate = deterministicPasses / deterministic.length || 1.0;

  // Rule 1: Deterministic check failed
  if (deterministicPassRate < 1.0) {
    return 'hold';
  }

  // Rule 2: AI confidence too low for auto-release
  if (aiConfidence < policy.minConfidence) {
    // But if AI confidence is not critically low, request manual review
    if (aiConfidence >= policy.humanReviewBelowConfidence) {
      return 'manual_review';
    } else {
      return 'hold';
    }
  }

  // Rule 3: All checks pass and confidence is high
  return 'auto_release';
}

/**
 * Get default policy for new escrows
 */
export function getDefaultPolicy(): EvaluationPolicy {
  return {
    requiredPassRate: 1.0, // All requirements must pass
    minConfidence: 0.9, // 90% confidence for auto-release
    humanReviewBelowConfidence: 0.75, // Below 75% confidence = hold
  };
}

/**
 * Explain policy decision in human terms
 */
export function explainPolicyDecision(
  decision: PolicyDecision,
  deterministicPassRate: number,
  aiConfidence: number,
  policy: EvaluationPolicy
): string {
  switch (decision) {
    case 'auto_release':
      return `All deterministic checks passed (${(deterministicPassRate * 100).toFixed(0)}%) and AI confidence is high (${(aiConfidence * 100).toFixed(0)}% > ${(policy.minConfidence * 100).toFixed(0)}%). Funds will be automatically released.`;

    case 'manual_review':
      return `AI confidence is moderate (${(aiConfidence * 100).toFixed(0)}% between ${(policy.humanReviewBelowConfidence * 100).toFixed(0)}-${(policy.minConfidence * 100).toFixed(0)}%). A human reviewer must verify before release.`;

    case 'hold':
      if (deterministicPassRate < 1.0) {
        return `Deterministic checks failed (${(deterministicPassRate * 100).toFixed(0)}%). Funds are held pending manual review.`;
      } else {
        return `AI confidence is too low (${(aiConfidence * 100).toFixed(0)}% < ${(policy.humanReviewBelowConfidence * 100).toFixed(0)}%). Funds are held pending manual review.`;
      }

    default:
      return 'Unknown policy decision';
  }
}
