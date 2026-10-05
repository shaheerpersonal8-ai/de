import { EvaluationResult, RequirementEvaluation, Evidence, Requirement, ReleasePolicy } from '../types';
import { runDeterministicChecks, DeterministicCheckResult } from './validators';

const MODEL_VERSION = 'gpt-4-turbo';
const EVALUATOR_VERSION = '1.0.0';

export async function evaluateEvidence(
  milestoneId: string,
  requirementsHash: string,
  evidenceItems: Evidence[],
  requirements: Requirement[],
  releasePolicy: ReleasePolicy
): Promise<EvaluationResult> {
  const startTime = Date.now();

  // Step 1: Run deterministic checks
  const deterministicResults = await runDeterministicChecks(evidenceItems, requirements);

  // Step 2: Separate requirements by validation type
  const aiRequirements = requirements.filter(r => r.validation_type === 'ai');
  const determinismRequirements = requirements.filter(r => r.validation_type === 'deterministic');

  // Step 3: Evaluate each requirement
  const evaluatedRequirements: RequirementEvaluation[] = [];
  const uncertainties: string[] = [];

  // Process deterministic requirements
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

  // Process AI requirements (mock for now)
  for (const req of aiRequirements) {
    const mockConfidence = 0.85 + Math.random() * 0.1; // 0.85-0.95
    evaluatedRequirements.push({
      id: req.id,
      decision: mockConfidence > 0.8 ? 'PASS' : 'UNCERTAIN',
      confidence: mockConfidence,
      evidence_ids: evidenceItems.map(e => e.id),
      reason: `AI evaluation (mock): ${req.description}`,
      details: { type: req.type },
    });
  }

  // Step 4: Apply policy engine
  const passingCount = evaluatedRequirements.filter(r => r.decision === 'PASS').length;
  const passRate = evaluatedRequirements.length > 0 ? passingCount / evaluatedRequirements.length : 0;
  const avgConfidence = evaluatedRequirements.reduce((sum, r) => sum + r.confidence, 0) / evaluatedRequirements.length;

  // Determine final decision
  let decision: 'PASS' | 'FAIL' | 'NEEDS_REVIEW' = 'PASS';
  const uncertainRequirements = evaluatedRequirements.filter(r => r.decision === 'UNCERTAIN');
  const failedRequirements = evaluatedRequirements.filter(r => r.decision === 'FAIL');

  if (failedRequirements.some(r => requirements.find(req => req.id === r.id)?.mandatory)) {
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

  // Compute evidence hash (simple concatenation + hash)
  const evidenceHash = require('crypto')
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
    model_version: MODEL_VERSION,
    evaluator_version: EVALUATOR_VERSION,
    evaluated_at: Math.floor(Date.now() / 1000),
    evidence_hash: evidenceHash,
  };
}
