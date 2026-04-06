import React from 'react';
import { C, F } from './theme';

export default function Header({ caseId }) {
  return (
    <header data-testid="app-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 32px',
      backgroundColor: C.surface,
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          backgroundColor: C.red,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          fontWeight: 'bold',
          color: C.white,
          fontFamily: F.ui,
          lineHeight: 1,
        }}>+</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: C.white,
              fontFamily: F.ui,
            }}>TSS Image Fraud Detector</span>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              backgroundColor: C.border,
              borderRadius: '4px',
              color: C.gray,
              fontFamily: F.ui,
            }}>v1.0</span>
          </div>
          <div style={{
            fontSize: '12px',
            color: C.gray,
            fontFamily: F.ui,
            marginTop: '2px',
          }}>Lenovo Premier Support &middot; AI Forensic Analysis Engine</div>
        </div>
      </div>
      <div data-testid="case-id" style={{
        fontFamily: F.mono,
        fontSize: '14px',
        color: C.red,
        fontWeight: '600',
        letterSpacing: '0.5px',
      }}>{caseId}</div>
    </header>
  );
}
