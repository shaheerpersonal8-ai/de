export interface Requirement {
  id: string;
  type: 'deployment' | 'feature' | 'visual' | 'test' | 'api' | 'other';
  description: string;
  mandatory: boolean;
  validation_type: 'deterministic' | 'ai' | 'manual';
  details?: Record<string, any>;
}

export interface RequirementsSpec {
  milestone_id: string;
  escrow_address: string;
  requirements: Requirement[];
  release_policy: ReleasePolicy;
  created_at: number;
  canonicalized_at?: number;
  requirements_hash?: string;
}

export interface ReleasePolicy {
  required_pass_rate: number; // 0.0 to 1.0
  min_confidence: number; // 0.0 to 1.0
  human_review_below: number; // confidence threshold for review
}

export interface Evidence {
  id: string;
  milestone_id: string;
  type: 'url' | 'repository' | 'screenshot' | 'file' | 'text';
  content: string; // URL, repo link, file path, or text content
  metadata?: Record<string, any>;
  submitted_at: number;
  submitted_by: string; // wallet address
}

export interface EvidenceSubmission {
  milestone_id: string;
  escrow_address: string;
  freelancer_address: string;
  evidence_items: Evidence[];
}

export interface EvaluationResult {
  milestone_id: string;
  requirements_hash: string;
  decision: 'PASS' | 'FAIL' | 'NEEDS_REVIEW';
  confidence: number;
  requirements: RequirementEvaluation[];
  uncertainties: string[];
  model_version: string;
  evaluator_version: string;
  evaluated_at: number;
  evidence_hash: string;
}

export interface RequirementEvaluation {
  id: string;
  decision: 'PASS' | 'FAIL' | 'UNCERTAIN';
  confidence: number;
  evidence_ids: string[];
  reason: string;
  details?: Record<string, any>;
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

export interface VerifiedReputation {
  wallet: string;
  role: 'client' | 'freelancer';
  escrow: string;
  milestone: string;
  amount: number;
  completed_at: number;
  verification_method: string;
  evidence_hash: string;
  counterparty: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  details: Record<string, any>;
  timestamp: number;
  status: 'success' | 'error';
}
