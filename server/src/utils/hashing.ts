import crypto from 'crypto';

/**
 * Generate a stable hash of requirements object
 * Used to create requirements_hash for attestation matching
 */
export function hashRequirements(requirements: any[]): string {
  // Sort by ID to ensure consistent ordering
  const sorted = [...requirements].sort((a, b) => {
    const idA = a.id || String(requirements.indexOf(a));
    const idB = b.id || String(requirements.indexOf(b));
    return idA.localeCompare(idB);
  });

  // Stringify with stable ordering
  const canonical = JSON.stringify(sorted);
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Generate hash of evidence submission
 * Includes all files, URLs, and metadata
 */
export function hashEvidence(evidence: any): string {
  // Normalize evidence structure
  const normalized = {
    escrowAddress: evidence.escrowAddress,
    milestoneId: evidence.milestoneId,
    files: Array.isArray(evidence.files) ? evidence.files.sort() : [],
    urls: Array.isArray(evidence.urls) ? evidence.urls.sort() : [],
    screenshots: Array.isArray(evidence.screenshots) ? evidence.screenshots.sort() : [],
    metadata: evidence.metadata ? JSON.stringify(evidence.metadata) : '',
    submittedAt: evidence.submittedAt,
  };

  const canonical = JSON.stringify(normalized);
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Generate nonce for replay protection
 * Used in attestation to prevent double-spending
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Verify nonce has not been used before
 * (This would check against a database of used nonces)
 */
export function isNonceValid(nonce: string, usedNonces: Set<string>): boolean {
  if (usedNonces.has(nonce)) {
    return false; // Already used
  }
  return true;
}

export function markNonceAsUsed(nonce: string, usedNonces: Set<string>): void {
  usedNonces.add(nonce);
}
