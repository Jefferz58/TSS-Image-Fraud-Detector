import React, { useRef, useState, useCallback } from 'react';
import { C, F, card } from './theme';

export default function UploadCard({ onFileSelect }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const onDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) onFileSelect(e.dataTransfer.files[0]);
  }, [onFileSelect]);

  return (
    <div
      data-testid="upload-card"
      onClick={() => inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        ...card,
        maxWidth: '540px',
        margin: '80px auto 0',
        padding: '48px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        borderColor: dragging ? C.red : C.border,
        borderStyle: dragging ? 'dashed' : 'solid',
        transition: 'border-color 0.2s ease',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
        data-testid="file-input"
      />
      <div style={{
        width: '64px', height: '64px', margin: '0 auto 20px',
        backgroundColor: '#2a2a2a', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.gray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <div style={{ fontSize: '18px', fontWeight: '600', color: C.white, fontFamily: F.ui, marginBottom: '8px' }}>
        Upload Image for Analysis
      </div>
      <div style={{ fontSize: '14px', color: C.gray, fontFamily: F.ui, marginBottom: '4px' }}>
        Drag and drop or click to select
      </div>
      <div style={{ fontSize: '12px', color: C.darkGray, fontFamily: F.ui }}>
        Accepts JPG, PNG, WEBP
      </div>
    </div>
  );
}
