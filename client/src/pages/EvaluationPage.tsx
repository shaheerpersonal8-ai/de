import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useProoflyFlow } from '../hooks/useProoflyFlow';

export default function EvaluationPage() {
  const { publicKey } = useWallet();
  const { runFlow, loading, error, result } = useProoflyFlow();

  const handleRunFlow = async () => {
    try {
      await runFlow(publicKey);
    } catch (err) {
      console.error('Flow execution failed:', err);
    }
  };

  return (
    <div className="page-stack">
      <div className="panel">
        <h1>Proofly Evaluation Flow</h1>
        <p className="lede">
          Requirements → Evidence → Evaluation → Attestation → Ready for On-Chain Release
        </p>
        <div className="action-row">
          <button className="primary-button" onClick={handleRunFlow} disabled={loading}>
            {loading ? '⏳ Running flow...' : '▶ Run complete flow'}
          </button>
        </div>
        {publicKey && (
          <p className="muted" style={{ marginTop: 12 }}>
            Wallet: <code>{publicKey}</code>
          </p>
        )}
        {error && (
          <div style={{ color: '#d32f2f', marginTop: 12, padding: 12, backgroundColor: '#ffebee', borderRadius: 4 }}>
            ⚠️ Error: {error}
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="panel">
            <h2>✓ Flow Completed Successfully</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div>
                <strong>Milestone ID</strong>
                <code style={{ display: 'block', marginTop: 4, fontSize: '0.75rem', wordBreak: 'break-all', backgroundColor: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                  {result.milestone_id}
                </code>
              </div>
              <div>
                <strong>Requirements Hash</strong>
                <code style={{ display: 'block', marginTop: 4, fontSize: '0.75rem', wordBreak: 'break-all', backgroundColor: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                  {result.step1_requirements.requirements_hash?.slice(0, 48)}...
                </code>
              </div>
              <div>
                <strong>Evidence Hash</strong>
                <code style={{ display: 'block', marginTop: 4, fontSize: '0.75rem', wordBreak: 'break-all', backgroundColor: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                  {result.step2_evidence.evidence_hash?.slice(0, 48)}...
                </code>
              </div>
              <div>
                <strong>Evaluation Decision</strong>
                <p style={{ display: 'block', marginTop: 4, fontSize: '1rem', fontWeight: 'bold', color: result.summary.evaluation_decision === 'PASS' ? '#2e7d32' : '#f57c00' }}>
                  {result.summary.evaluation_decision || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Step 1: Requirements ({result.summary.requirements_count})</h3>
            {result.step1_requirements.success ? (
              <div style={{ color: '#2e7d32', marginBottom: 12 }}>✓ Requirements created and canonicalized</div>
            ) : (
              <div style={{ color: '#d32f2f' }}>✗ Failed to create requirements</div>
            )}
            {result.step1_requirements.requirements_hash && (
              <small style={{ color: '#666' }}>Hash: {result.step1_requirements.requirements_hash.slice(0, 32)}...</small>
            )}
          </div>

          <div className="panel">
            <h3>Step 2: Evidence ({result.summary.evidence_count})</h3>
            {result.step2_evidence.success ? (
              <div style={{ color: '#2e7d32', marginBottom: 12 }}>✓ Evidence submitted and hashed</div>
            ) : (
              <div style={{ color: '#d32f2f' }}>✗ Failed to submit evidence</div>
            )}
          </div>

          <div className="panel">
            <h3>Step 3: Evaluation Results</h3>
            {result.step3_evaluation.success && result.step3_evaluation.evaluation ? (
              <>
                <div style={{ color: '#2e7d32', marginBottom: 12 }}>✓ Evaluation complete</div>
                <strong>Requirements Results:</strong>
                <div style={{ marginTop: 12 }}>
                  {result.step3_evaluation.evaluation.requirements?.map((req: any) => (
                    <div key={req.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{req.id}: {req.reason}</strong>
                        <span style={{ fontWeight: 'bold', color: req.decision === 'PASS' ? '#2e7d32' : '#f57c00' }}>
                          {req.decision}
                        </span>
                      </div>
                      <small style={{ color: '#666' }}>
                        Confidence: {(req.confidence * 100).toFixed(0)}% | Evidence: {req.evidence_ids?.join(', ')}
                      </small>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: '#d32f2f' }}>✗ Evaluation failed</div>
            )}
          </div>

          <div className="panel">
            <h3>Step 4: Attestation</h3>
            {result.step4_attestation ? (
              <>
                <div style={{ color: '#2e7d32', marginBottom: 12 }}>✓ Attestation signed successfully</div>
                <div style={{ fontSize: '0.875rem' }}>
                  <p><strong>Evaluator:</strong> <code>{result.step4_attestation.attestation?.evaluator?.slice(0, 20)}...</code></p>
                  <p><strong>Decision:</strong> {result.step4_attestation.attestation?.decision === 1 ? 'PASS (1)' : result.step4_attestation.attestation?.decision === 2 ? 'FAIL (2)' : 'NEEDS_REVIEW (3)'}</p>
                  <p><strong>Nonce:</strong> {result.step4_attestation.attestation?.nonce}</p>
                  <p><strong>Expires:</strong> {new Date(result.step4_attestation.attestation?.expires_at * 1000).toLocaleString()}</p>
                </div>
              </>
            ) : result.summary.evaluation_decision !== 'PASS' ? (
              <div style={{ color: '#f57c00' }}>⚠ No attestation created (decision was {result.summary.evaluation_decision})</div>
            ) : (
              <div style={{ color: '#d32f2f' }}>✗ Failed to sign attestation</div>
            )}
          </div>

          <div className="panel" style={{ backgroundColor: '#f5f5f5' }}>
            <h3>Summary</h3>
            <ul style={{ lineHeight: 1.8, fontSize: '0.875rem' }}>
              <li>✓ Requirements created with hash: <code>{result.step1_requirements.requirements_hash?.slice(0, 20)}...</code></li>
              <li>✓ Evidence submitted ({result.summary.evidence_count} items) with hash: <code>{result.step2_evidence.evidence_hash?.slice(0, 20)}...</code></li>
              <li>✓ Evaluated {result.summary.requirements_count} requirements → Decision: <strong>{result.summary.evaluation_decision}</strong></li>
              <li>{result.summary.attestation_signed ? '✓' : '○'} Attestation {result.summary.attestation_signed ? 'signed and ready for on-chain release' : 'not applicable'}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
