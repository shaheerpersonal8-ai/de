const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options;
  const url = `${API_BASE}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Requirements API
export async function createRequirements(
  milestone_id: string,
  escrow_address: string,
  requirements: any[],
  release_policy: any
) {
  return apiRequest('/api/requirements/create', {
    method: 'POST',
    body: JSON.stringify({
      milestone_id,
      escrow_address,
      requirements,
      release_policy,
    }),
  });
}

export async function getRequirements(milestone_id: string) {
  return apiRequest(`/api/requirements/${milestone_id}`);
}

export async function validateRequirements(requirements: any[], release_policy: any) {
  return apiRequest('/api/requirements/validate', {
    method: 'POST',
    body: JSON.stringify({ requirements, release_policy }),
  });
}

// Evidence API
export async function submitEvidence(
  milestone_id: string,
  escrow_address: string,
  freelancer_address: string,
  evidence_items: any[]
) {
  return apiRequest('/api/evidence/submit', {
    method: 'POST',
    body: JSON.stringify({
      milestone_id,
      escrow_address,
      freelancer_address,
      evidence_items,
    }),
  });
}

export async function getEvidence(milestone_id: string) {
  return apiRequest(`/api/evidence/${milestone_id}`);
}

export async function computeEvidenceHash(evidence_items: any[]) {
  return apiRequest('/api/evidence/hash', {
    method: 'POST',
    body: JSON.stringify({ evidence_items }),
  });
}

// Evaluation API
export async function runEvaluation(
  milestone_id: string,
  requirements_hash: string,
  evidence_items: any[],
  requirements: any[],
  release_policy: any
) {
  return apiRequest('/api/evaluate/run', {
    method: 'POST',
    body: JSON.stringify({
      milestone_id,
      requirements_hash,
      evidence_items,
      requirements,
      release_policy,
    }),
  });
}

export async function getEvaluation(milestone_id: string) {
  return apiRequest(`/api/evaluate/${milestone_id}`);
}

// Attestation API
export async function signAttestation(
  evaluation_result: any,
  escrow_address: string,
  milestone_address: string,
  nonce: number
) {
  return apiRequest('/api/attestation/sign', {
    method: 'POST',
    body: JSON.stringify({
      evaluation_result,
      escrow_address,
      milestone_address,
      nonce,
    }),
  });
}

export async function validateAttestation(
  attestation: any,
  expected_requirements_hash: string,
  expected_evidence_hash: string,
  expected_evaluator: string
) {
  return apiRequest('/api/attestation/validate', {
    method: 'POST',
    body: JSON.stringify({
      attestation,
      expected_requirements_hash,
      expected_evidence_hash,
      expected_evaluator,
    }),
  });
}

export async function getAttestation(escrow: string, milestone: string) {
  return apiRequest(`/api/attestation/${escrow}/${milestone}`);
}

// Reputation API
export async function recordReputation(
  wallet: string,
  role: 'client' | 'freelancer',
  escrow: string,
  milestone: string,
  amount: number,
  evidence_hash: string,
  counterparty: string
) {
  return apiRequest('/api/reputation/record', {
    method: 'POST',
    body: JSON.stringify({
      wallet,
      role,
      escrow,
      milestone,
      amount,
      evidence_hash,
      counterparty,
    }),
  });
}

export async function getReputationProfile(wallet: string) {
  return apiRequest(`/api/reputation/wallet/${wallet}/profile`);
}
