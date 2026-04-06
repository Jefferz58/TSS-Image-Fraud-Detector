import React, { useState } from 'react';
import { C, F, card, getVerdictColor, getScoreColor, getStatusColor, getStatusIcon } from './theme';

export default function AnalysisResults({ result, isLoading, error, caseId, agentNotes }) {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
        <div data-testid="analysis-spinner" style={{
          width: '40px', height: '40px', margin: '0 auto 16px',
          border: `3px solid ${C.border}`,
          borderTopColor: C.red,
          borderRadius: '50%',
          animation: 'tss-spin 1s linear infinite',
        }} />
        <div style={{ color: C.white, fontFamily: F.ui, fontSize: '16px' }}>Analyzing...</div>
        <div style={{ color: C.gray, fontFamily: F.ui, fontSize: '13px', marginTop: '4px' }}>
          Running AI forensic analysis
        </div>
        <style>{`@keyframes tss-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="error-card" style={{
        ...card, padding: '24px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      }}>
        <div style={{ color: C.fail, fontFamily: F.ui, fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>
          Analysis Error
        </div>
        <div style={{ color: '#fca5a5', fontFamily: F.ui, fontSize: '14px', lineHeight: 1.5 }}>{error}</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div data-testid="analysis-placeholder" style={{ ...card, padding: '48px', textAlign: 'center' }}>
        <div style={{ color: C.gray, fontFamily: F.ui, fontSize: '15px' }}>
          Click &ldquo;Run AI Analysis&rdquo; to analyze the uploaded image
        </div>
      </div>
    );
  }

  const verdictColor = getVerdictColor(result.verdict);
  const scoreColor = getScoreColor(result.fraudRiskScore);

  const handleCopy = () => {
    const ts = new Date(result.analyzedAt).toLocaleString('en-US', {
      dateStyle: 'full', timeStyle: 'long', timeZone: 'UTC'
    });
    const lines = [
      '=== TSS Fraud Detection Report ===',
      `Case ID: ${caseId}`,
      `Analysis Date: ${ts}`,
      `Fraud Risk Score: ${result.fraudRiskScore}/100 (${result.fraudRiskTier})`,
      `Verdict: ${result.verdict}`,
      `Confidence: ${result.confidence}%`,
      `Risk Level: ${result.riskLevel}`,
      '',
      `Summary: ${result.summary}`,
      '',
      `Recommendation: ${result.recommendation}`,
    ];
    if (agentNotes) {
      lines.push('', `Agent Notes: ${agentNotes}`);
    }
    lines.push('================================');
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Verdict Banner */}
      <div data-testid="verdict-banner" style={{
        ...card, padding: '18px', textAlign: 'center',
        borderLeft: `4px solid ${verdictColor}`,
      }}>
        <div style={{
          fontFamily: F.ui, fontSize: '11px', color: C.gray,
          textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px',
        }}>Verdict</div>
        <div style={{
          fontFamily: F.ui, fontSize: '22px', fontWeight: '700', color: verdictColor,
          letterSpacing: '0.5px',
        }}>{result.verdict?.replace(/_/g, ' ')}</div>
      </div>

      {/* Score + Confidence Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div data-testid="fraud-risk-score" style={{ ...card, padding: '18px', textAlign: 'center' }}>
          <div style={{ fontFamily: F.ui, fontSize: '12px', color: C.gray, marginBottom: '4px' }}>Fraud Risk Score</div>
          <div style={{ fontFamily: F.ui, fontSize: '44px', fontWeight: '800', color: scoreColor, lineHeight: 1.1 }}>
            {result.fraudRiskScore}
          </div>
          <div style={{
            fontFamily: F.ui, fontSize: '11px', color: scoreColor, marginTop: '6px',
            padding: '3px 10px', display: 'inline-block',
            backgroundColor: `${scoreColor}18`, borderRadius: '4px',
          }}>{result.fraudRiskTier}</div>
        </div>
        <div data-testid="confidence-card" style={{ ...card, padding: '18px', textAlign: 'center' }}>
          <div style={{ fontFamily: F.ui, fontSize: '12px', color: C.gray, marginBottom: '4px' }}>Confidence</div>
          <div style={{ fontFamily: F.ui, fontSize: '44px', fontWeight: '800', color: C.white, lineHeight: 1.1 }}>
            {result.confidence}<span style={{ fontSize: '20px', fontWeight: '400' }}>%</span>
          </div>
          <div style={{
            fontFamily: F.ui, fontSize: '11px', color: C.gray, marginTop: '6px',
          }}>Risk Level: <span style={{ color: C.white, fontWeight: '600' }}>{result.riskLevel}</span></div>
        </div>
      </div>

      {/* Summary */}
      <div data-testid="summary-card" style={{ ...card, padding: '16px' }}>
        <div style={{ fontFamily: F.ui, fontSize: '12px', color: C.gray, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Summary</div>
        <div style={{ fontFamily: F.ui, fontSize: '14px', color: C.white, lineHeight: 1.6 }}>{result.summary}</div>
      </div>

      {/* Forensic Indicators */}
      <div data-testid="indicators-list" style={{ ...card, padding: '16px' }}>
        <div style={{ fontFamily: F.ui, fontSize: '12px', color: C.gray, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Forensic Indicators
        </div>
        {result.indicators?.map((ind, i) => (
          <div key={i} data-testid={`indicator-${i}`} style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '10px 0',
            borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
              backgroundColor: `${getStatusColor(ind.status)}20`,
              color: getStatusColor(ind.status),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700',
            }}>
              {getStatusIcon(ind.status)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.ui, fontSize: '14px', color: C.white, fontWeight: '500' }}>
                {ind.category}
              </div>
              <div style={{ fontFamily: F.ui, fontSize: '13px', color: C.gray, marginTop: '2px', lineHeight: 1.4 }}>
                {ind.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flagged Elements */}
      {result.flaggedElements?.length > 0 && (
        <div data-testid="flagged-elements" style={{ ...card, padding: '16px' }}>
          <div style={{ fontFamily: F.ui, fontSize: '12px', color: C.gray, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Flagged Elements
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {result.flaggedElements.map((el, i) => (
              <span key={i} data-testid={`flagged-${i}`} style={{
                fontFamily: F.ui, fontSize: '13px',
                padding: '4px 12px', borderRadius: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.25)',
              }}>{el}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div data-testid="recommendation-card" style={{
        ...card, padding: '16px',
        borderLeft: `3px solid ${verdictColor}`,
      }}>
        <div style={{ fontFamily: F.ui, fontSize: '12px', color: C.gray, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          TSS Recommendation
        </div>
        <div style={{ fontFamily: F.ui, fontSize: '14px', color: C.white, lineHeight: 1.6 }}>
          {result.recommendation}
        </div>
      </div>

      {/* Timestamp + Copy */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div data-testid="analysis-timestamp" style={{ fontFamily: F.mono, fontSize: '11px', color: C.darkGray }}>
          Analyzed: {new Date(result.analyzedAt).toLocaleString('en-US', {
            dateStyle: 'full', timeStyle: 'long', timeZone: 'UTC'
          })}
        </div>
        <button
          data-testid="copy-results-btn"
          onClick={handleCopy}
          style={{
            fontFamily: F.ui, fontSize: '13px',
            padding: '7px 18px', borderRadius: '6px',
            backgroundColor: copied ? C.pass : C.border,
            color: C.white, border: 'none', cursor: 'pointer',
            transition: 'background-color 0.2s',
            fontWeight: '500',
          }}
        >
          {copied ? 'Copied!' : 'Copy Report'}
        </button>
      </div>
    </div>
  );
}
