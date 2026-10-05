import { z } from 'zod';

export const RequirementEvaluationSchema = z.object({
  id: z.string(),
  decision: z.enum(['PASS', 'FAIL', 'UNCERTAIN']),
  confidence: z.number().min(0).max(1),
  evidence_ids: z.array(z.string()),
  reason: z.string(),
  details: z.record(z.any()).optional(),
});

export const EvaluationResultSchema = z.object({
  milestone_id: z.string(),
  requirements_hash: z.string().regex(/^[a-f0-9]{64}$/),
  evidence_hash: z.string().regex(/^[a-f0-9]{64}$/),
  decision: z.enum(['PASS', 'FAIL', 'NEEDS_REVIEW']),
  confidence: z.number().min(0).max(1),
  requirements: z.array(RequirementEvaluationSchema),
  uncertainties: z.array(z.string()),
  model_version: z.string(),
  evaluator_version: z.string(),
  evaluated_at: z.number(),
});

export const AttestationPayloadSchema = z.object({
  escrow: z.string(),
  milestone: z.string(),
  requirements_hash: z.string().regex(/^[a-f0-9]{64}$/),
  evidence_hash: z.string().regex(/^[a-f0-9]{64}$/),
  decision: z.number().int().min(1).max(3),
  evaluator: z.string(),
  issued_at: z.number(),
  expires_at: z.number(),
  nonce: z.number().positive(),
  model_version: z.string(),
  evaluator_version: z.string(),
});

export type RequirementEvaluation = z.infer<typeof RequirementEvaluationSchema>;
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
export type AttestationPayload = z.infer<typeof AttestationPayloadSchema>;

export function validateEvaluationResult(data: unknown): EvaluationResult {
  return EvaluationResultSchema.parse(data);
}

export function validateAttestationPayload(data: unknown): AttestationPayload {
  return AttestationPayloadSchema.parse(data);
}
