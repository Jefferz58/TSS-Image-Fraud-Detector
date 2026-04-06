export const C = {
  bg: '#1a1a1a',
  surface: '#242424',
  border: '#333333',
  red: '#e2231a',
  white: '#ffffff',
  gray: '#999999',
  darkGray: '#666666',
  verdictLegit: '#22c55e',
  verdictSusp: '#f59e0b',
  verdictLikely: '#f97316',
  verdictConfirm: '#e2231a',
  pass: '#22c55e',
  warn: '#f59e0b',
  fail: '#ef4444',
};

export const F = {
  ui: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'Consolas', 'Courier New', monospace",
};

export const card = {
  backgroundColor: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: '8px',
};

export const getVerdictColor = (verdict) => {
  switch (verdict) {
    case 'LEGITIMATE': return C.verdictLegit;
    case 'SUSPICIOUS': return C.verdictSusp;
    case 'LIKELY_AI_ALTERED': return C.verdictLikely;
    case 'CONFIRMED_AI_ALTERED': return C.verdictConfirm;
    default: return C.gray;
  }
};

export const getScoreColor = (score) => {
  if (score <= 30) return C.verdictLegit;
  if (score <= 60) return C.verdictSusp;
  if (score <= 85) return C.verdictLikely;
  return C.verdictConfirm;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'PASS': return C.pass;
    case 'WARNING': return C.warn;
    case 'FAIL': return C.fail;
    default: return C.gray;
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'PASS': return '\u2713';
    case 'WARNING': return '\u26A0';
    case 'FAIL': return '\u2717';
    default: return '\u2022';
  }
};
