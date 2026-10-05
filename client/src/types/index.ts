export interface Requirement {
  id: string;
  type: 'deployment' | 'feature' | 'visual' | 'test' | 'api' | 'other';
  description: string;
  mandatory: boolean;
  validation_type: 'deterministic' | 'ai' | 'manual';
}

export interface ReleasePolicy {
  required_pass_rate: number;
  min_confidence: number;
  human_review_below: number;
}

export interface RequirementsSpec {
  milestone_id: string;
  escrow_address: string;
  requirements: Requirement[];
  release_policy: ReleasePolicy;
  requirements_hash?: string;
  created_at?: number;
  canonicalized_at?: number;
}

export interface Evidence {
  id: string;
  type: 'url' | 'repository' | 'screenshot' | 'file' | 'text';
  content: string;
  metadata?: Record<string, any>;
  submitted_at?: number;
  submitted_by?: string;
}

export interface EvidenceSubmission {
  milestone_id: string;
  escrow_address: string;
  freelancer_address: string;
  evidence_items: Evidence[];
  submitted_at?: number;
  evidence_hash?: string;
}

export interface RequirementEvaluation {
  id: string;
  decision: 'PASS' | 'FAIL' | 'UNCERTAIN';
  confidence: number;
  evidence_ids: string[];
  reason: string;
  details?: Record<string, any>;
}

export interface EvaluationResult {
  milestone_id: string;
  requirements_hash: string;
  evidence_hash: string;
  decision: 'PASS' | 'FAIL' | 'NEEDS_REVIEW';
  confidence: number;
  requirements: RequirementEvaluation[];
  uncertainties: string[];
  model_version: string;
  evaluator_version: string;
  evaluated_at: number;
}

export interface Attestation {
  escrow: string;
  milestone: string;
  requirements_hash: string;
  evidence_hash: string;
  decision: 1 | 2 | 3; // 1=Pass, 2=Fail, 3=NeedsReview
  evaluator: string;
  issued_at: number;
  expires_at: number;
  nonce: number;
  signature?: string;
}

export interface ProoflyApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
