import { createHash } from 'crypto';
import { RequirementsSpec, Evidence } from '../types';

export function sha256Hash(data: string | Buffer): string {
  return createHash('sha256')
    .update(data)
    .digest('hex');
}

export function canonicalizeRequirements(spec: RequirementsSpec): string {
  // Sort requirements by ID for consistency
  const sorted = {
    requirements: spec.requirements
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(r => ({
        id: r.id,
        type: r.type,
        description: r.description,
        mandatory: r.mandatory,
        validation_type: r.validation_type,
      })),
    release_policy: spec.release_policy,
  };

  return JSON.stringify(sorted, null, 0);
}

export function computeRequirementsHash(spec: RequirementsSpec): string {
  const canonical = canonicalizeRequirements(spec);
  return sha256Hash(canonical);
}

export function computeEvidenceHash(evidence: Evidence[]): string {
  const sorted = evidence
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(e => ({
      id: e.id,
      type: e.type,
      content: e.content,
      metadata: e.metadata,
    }));

  return sha256Hash(JSON.stringify(sorted, null, 0));
}

export function verifyHashMatch(
  expectedHash: string,
  actualHash: string
): boolean {
  return expectedHash === actualHash;
}
