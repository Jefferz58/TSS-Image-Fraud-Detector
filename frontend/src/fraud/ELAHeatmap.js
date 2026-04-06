import React, { useRef, useState, useCallback, useEffect } from 'react';
import { C, F, card } from './theme';

const thermalColor = (t) => {
  if (t < 0.125) {
    const f = t / 0.125;
    return [0, 0, Math.round(51 + f * 204)];
  } else if (t < 0.25) {
    const f = (t - 0.125) / 0.125;
    return [0, Math.round(f * 255), 255];
  } else if (t < 0.375) {
    const f = (t - 0.25) / 0.125;
    return [0, 255, Math.round(255 * (1 - f))];
  } else if (t < 0.5) {
    const f = (t - 0.375) / 0.125;
    return [Math.round(f * 255), 255, 0];
  } else if (t < 0.625) {
    const f = (t - 0.5) / 0.125;
    return [255, Math.round(255 - f * 119), 0];
  } else if (t < 0.75) {
    const f = (t - 0.625) / 0.125;
    return [255, Math.round(136 - f * 136), 0];
  } else {
    const f = (t - 0.75) / 0.25;
    return [255, Math.round(f * 255), Math.round(f * 255)];
  }
};

export default function ELAHeatmap({ imageDataUrl }) {
  const origCanvasRef = useRef(null);
  const elaCanvasRef = useRef(null);
  const [sensitivity, setSensitivity] = useState(10);
  const [generated, setGenerated] = useState(false);
  const [processing, setProcessing] = useState(false);

  const runELA = useCallback(() => {
    if (!imageDataUrl) return;
    setProcessing(true);

    const img = new Image();
    img.onload = () => {
      const w = img.width;
      const h = img.height;

      const origCanvas = origCanvasRef.current;
      if (!origCanvas) return;
      origCanvas.width = w;
      origCanvas.height = h;
      const origCtx = origCanvas.getContext('2d');
      origCtx.drawImage(img, 0, 0);
      const origData = origCtx.getImageData(0, 0, w, h);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0);
      const jpegUrl = tempCanvas.toDataURL('image/jpeg', 0.75);

      const compImg = new Image();
      compImg.onload = () => {
        const compCanvas = document.createElement('canvas');
        compCanvas.width = w;
        compCanvas.height = h;
        const compCtx = compCanvas.getContext('2d');
        compCtx.drawImage(compImg, 0, 0);
        const compData = compCtx.getImageData(0, 0, w, h);

        const elaCanvas = elaCanvasRef.current;
        if (!elaCanvas) return;
        elaCanvas.width = w;
        elaCanvas.height = h;
        const elaCtx = elaCanvas.getContext('2d');
        const output = elaCtx.createImageData(w, h);

        for (let i = 0; i < origData.data.length; i += 4) {
          const dr = Math.abs(origData.data[i] - compData.data[i]);
          const dg = Math.abs(origData.data[i + 1] - compData.data[i + 1]);
          const db = Math.abs(origData.data[i + 2] - compData.data[i + 2]);
          const diff = (dr + dg + db) / 3;
          const amplified = Math.min(255, diff * sensitivity);
          const normalized = amplified / 255;
          const [r, g, b] = thermalColor(normalized);
          output.data[i] = r;
          output.data[i + 1] = g;
          output.data[i + 2] = b;
          output.data[i + 3] = 255;
        }
        elaCtx.putImageData(output, 0, 0);
        setGenerated(true);
        setProcessing(false);
      };
      compImg.src = jpegUrl;
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, sensitivity]);

  useEffect(() => {
    if (generated) runELA();
  }, [sensitivity]); // eslint-disable-line react-hooks/exhaustive-deps

  const LEGEND = [
    { color: '#000033', label: 'No change' },
    { color: '#0000ff', label: 'Low' },
    { color: '#00ffff', label: 'Med-Low' },
    { color: '#00ff00', label: 'Medium' },
    { color: '#ffff00', label: 'Med-High' },
    { color: '#ff8800', label: 'High' },
    { color: '#ff0000', label: 'Very High' },
    { color: '#ffffff', label: 'Maximum' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {!generated && (
        <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
          <div style={{ color: C.gray, fontFamily: F.ui, fontSize: '14px', marginBottom: '16px' }}>
            Error Level Analysis compares the original image against a re-compressed version to detect tampering.
          </div>
          <button
            data-testid="run-ela-btn"
            onClick={runELA}
            disabled={processing}
            style={{
              fontFamily: F.ui, fontSize: '14px', fontWeight: '600',
              padding: '10px 28px', borderRadius: '6px',
              backgroundColor: C.red, color: C.white,
              border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {processing ? 'Processing...' : 'Run ELA Heatmap'}
          </button>
        </div>
      )}

      {generated && (
        <>
          {/* Sensitivity Slider */}
          <div data-testid="sensitivity-control" style={{ ...card, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: F.ui, fontSize: '13px', color: C.gray }}>
                Sensitivity: <span style={{ color: C.white, fontWeight: '600' }}>{sensitivity}x</span>
              </span>
              <span style={{ fontFamily: F.ui, fontSize: '11px', color: C.darkGray }}>Range: 1 &ndash; 20</span>
            </div>
            <input
              data-testid="sensitivity-slider"
              type="range" min="1" max="20" value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              style={{ width: '100%', accentColor: C.red }}
            />
          </div>

          {/* Side-by-side canvases */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ ...card, padding: '10px' }}>
              <div style={{ fontFamily: F.ui, fontSize: '11px', color: C.gray, marginBottom: '6px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Original
              </div>
              <canvas ref={origCanvasRef} data-testid="ela-original-canvas" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
            </div>
            <div style={{ ...card, padding: '10px' }}>
              <div style={{ fontFamily: F.ui, fontSize: '11px', color: C.gray, marginBottom: '6px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ELA Heatmap
              </div>
              <canvas ref={elaCanvasRef} data-testid="ela-heatmap-canvas" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Color Legend */}
          <div data-testid="ela-legend" style={{ ...card, padding: '12px' }}>
            <div style={{ fontFamily: F.ui, fontSize: '11px', color: C.gray, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color Legend</div>
            <div style={{ display: 'flex', borderRadius: '4px', overflow: 'hidden', height: '18px' }}>
              {LEGEND.map(({ color }) => (
                <div key={color} style={{ flex: 1, backgroundColor: color }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontFamily: F.ui, fontSize: '10px', color: C.darkGray }}>No change / Clean</span>
              <span style={{ fontFamily: F.ui, fontSize: '10px', color: C.darkGray }}>Maximum difference / Likely tampered</span>
            </div>
          </div>

          {/* Note */}
          <div data-testid="ela-note" style={{
            fontFamily: F.ui, fontSize: '12px', color: C.darkGray,
            fontStyle: 'italic', lineHeight: 1.5, padding: '0 4px',
          }}>
            Bright regions indicate areas with different compression history &mdash; a common indicator of AI-generated or pasted content.
          </div>
        </>
      )}

      {/* Hidden canvases before generation */}
      {!generated && (
        <>
          <canvas ref={origCanvasRef} style={{ display: 'none' }} />
          <canvas ref={elaCanvasRef} style={{ display: 'none' }} />
        </>
      )}
    </div>
  );
}
