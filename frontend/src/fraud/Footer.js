import React from 'react';
import { C, F } from './theme';

export default function Footer() {
  return (
    <footer data-testid="app-footer" style={{
      textAlign: 'center',
      padding: '24px 32px',
      marginTop: '32px',
      borderTop: `1px solid ${C.border}`,
    }}>
      <div style={{ fontFamily: F.ui, fontSize: '12px', color: C.darkGray, lineHeight: 1.6 }}>
        Lenovo Premier Technical Support &middot; TSS Fraud Detection Tools &middot; www.lenovo.com/us/en/premier-support
      </div>
    </footer>
  );
}
