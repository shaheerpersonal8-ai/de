import { useState } from 'react';
import * as api from '../services/prooflyApi';

export interface FlowResult {
  milestone_id: string;
  escrow_address: string;
  step1_requirements: any;
  step2_evidence: any;
  step3_evaluation: any;
  step4_attestation: any | null;
  summary: {
    requirements_count: number;
    evidence_count: number;
    evaluation_decision: string;
    attestation_signed: boolean;
  };
}

export function useProoflyFlow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FlowResult | null>(null);

  const runFlow = async (publicKey: string | null) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const milestoneId = 'milestone-' + Math.random().toString(36).slice(2, 9);
      const escrowAddress = 'escrow-' + Math.random().toString(36).slice(2, 9);
      const freelancerAddress = publicKey || 'freelancer-' + Math.random().toString(36).slice(2, 9);

      const requirements = [
        {
          id: 'R1',
          type: 'deployment',
          description: 'Deployed URL is reachable',
          mandatory: true,
          validation_type: 'deterministic',
        },
        {
          id: 'R2',
          type: 'feature',
          description: 'Home, Pricing and Contact exist in the page',
          mandatory: true,
          validation_type: 'ai',
        },
        {
          id: 'R3',
          type: 'visual',
          description: 'Approved logo is present',
          mandatory: true,
          validation_type: 'ai',
        },
      ];

      const releasePolicy = {
        required_pass_rate: 1.0,
        min_confidence: 0.9,
        human_review_below: 0.9,
      };

      const evidenceItems = [
        { id: 'E1', type: 'url', content: 'https://example.com', metadata: { status: 200 } },
        { id: 'E2', type: 'repository', content: 'https://github.com/example/demo' },
        { id: 'E3', type: 'screenshot', content: 'data:image/png;base64,iVBORw0KGgoAAAANS...' },
      ];

      // Step 1: Create requirements
      console.log('[1/4] Creating requirements...');
      const reqResult = await api.createRequirements(
        milestoneId,
        escrowAddress,
        requirements,
        releasePolicy
      );

      if (!reqResult.success) {
        throw new Error('Failed to create requirements');
      }

      // Step 2: Submit evidence
      console.log('[2/4] Submitting evidence...');
      const evidenceResult = await api.submitEvidence(
        milestoneId,
        escrowAddress,
        freelancerAddress,
        evidenceItems
      );

      if (!evidenceResult.success) {
        throw new Error('Failed to submit evidence');
      }

      // Step 3: Run evaluation
      console.log('[3/4] Running evaluation...');
      const evaluationResult = await api.runEvaluation(
        milestoneId,
        reqResult.requirements_hash,
        evidenceItems,
        requirements,
        releasePolicy
      );

      if (!evaluationResult.success) {
        throw new Error('Failed to run evaluation');
      }

      // Step 4: Sign attestation (only if PASS)
      console.log('[4/4] Signing attestation...');
      let attestationResult = null;
      if (evaluationResult.evaluation?.decision === 'PASS') {
        attestationResult = await api.signAttestation(
          evaluationResult.evaluation,
          escrowAddress,
          milestoneId,
          Math.floor(Math.random() * 1000000)
        );
      }

      const flowResult: FlowResult = {
        milestone_id: milestoneId,
        escrow_address: escrowAddress,
        step1_requirements: reqResult,
        step2_evidence: evidenceResult,
        step3_evaluation: evaluationResult,
        step4_attestation: attestationResult,
        summary: {
          requirements_count: requirements.length,
          evidence_count: evidenceItems.length,
          evaluation_decision: evaluationResult.evaluation?.decision,
          attestation_signed: attestationResult ? true : false,
        },
      };

      setResult(flowResult);
      return flowResult;
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong';
      setError(errorMessage);
      console.error('Flow error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { runFlow, loading, error, result };
}
