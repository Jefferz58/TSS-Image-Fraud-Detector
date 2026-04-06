import React from 'react';
import { C, F, card } from './theme';

const phases = [
  { num: 1, label: 'Standalone Tool', detail: 'Manual agent use', active: true },
  { num: 2, label: 'Chrome Extension', detail: 'Auto-runs on MSD case page', active: false },
  { num: 3, label: 'Backend API Hook', detail: 'Scores images at upload time', active: false },
  { num: 4, label: 'Full MSD Integration', detail: 'Fraud score on every attachment', active: false },
];

export default function Roadmap() {
  return (
    <div data-testid="msd-roadmap" style={{
      ...card, padding: '24px', margin: '32px 32px 0',
      backgroundColor: '#1e1e1e', borderColor: '#2a2a2a',
    }}>
      <div style={{ fontFamily: F.ui, fontSize: '14px', fontWeight: '600', color: C.gray, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        MSD Integration Roadmap
      </div>
      <div style={{ display: 'flex', position: 'relative' }}>
        {phases.map((p, i) => (
          <div key={p.num} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
            {/* Connector line */}
            {i < phases.length - 1 && (
              <div style={{
                position: 'absolute', top: '14px', left: '50%', right: '-50%',
                height: '2px', backgroundColor: p.active ? C.red : '#333',
                zIndex: 0,
              }} />
            )}
            {/* Circle */}
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              margin: '0 auto 10px', position: 'relative', zIndex: 1,
              backgroundColor: p.active ? C.red : '#333',
              color: p.active ? C.white : C.darkGray,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: F.ui, fontSize: '13px', fontWeight: '700',
            }}>
              {p.active ? '\u2713' : p.num}
            </div>
            <div style={{
              fontFamily: F.ui, fontSize: '13px', fontWeight: '600',
              color: p.active ? C.white : C.gray, marginBottom: '2px',
            }}>
              Phase {p.num}{p.active ? ' \u2713' : ''}
            </div>
            <div style={{ fontFamily: F.ui, fontSize: '12px', color: p.active ? C.gray : C.darkGray, fontWeight: '500' }}>
              {p.label}
            </div>
            <div style={{ fontFamily: F.ui, fontSize: '11px', color: C.darkGray, marginTop: '3px', lineHeight: 1.4, padding: '0 8px' }}>
              {p.detail}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        fontFamily: F.ui, fontSize: '11px', color: C.darkGray, marginTop: '24px',
        lineHeight: 1.6, fontStyle: 'italic',
      }}>
        Phase 3&ndash;4 mirrors existing virus scan pipeline &mdash; images scored discreetly at upload time without customer awareness, per standard fraud prevention practice.
      </div>
    </div>
  );
}
