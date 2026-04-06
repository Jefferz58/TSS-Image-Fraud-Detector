import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Header from '@/fraud/Header';
import UploadCard from '@/fraud/UploadCard';
import AnalysisResults from '@/fraud/AnalysisResults';
import ELAHeatmap from '@/fraud/ELAHeatmap';
import Roadmap from '@/fraud/Roadmap';
import Footer from '@/fraud/Footer';
import { C, F, card } from '@/fraud/theme';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const generateCaseId = () => {
  const ts = Date.now().toString();
  return `TSS-${ts.slice(-8)}`;
};

function App() {
  const [caseId, setCaseId] = useState(generateCaseId);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [agentNotes, setAgentNotes] = useState('');
  const [activeTab, setActiveTab] = useState('ai');

  const handleFileSelect = useCallback((file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or WEBP.');
      return;
    }
    setMediaType(file.type);
    setAnalysisResult(null);
    setError(null);
    setActiveTab('ai');

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImageDataUrl(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!imageBase64) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setActiveTab('ai');

    try {
      const response = await axios.post(`${API}/analyze`, {
        image_base64: imageBase64,
        media_type: mediaType,
      });
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setAnalysisResult(response.data);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Analysis failed';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageBase64, mediaType]);

  const clearAll = useCallback(() => {
    setImageDataUrl('');
    setImageBase64('');
    setMediaType('');
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setError(null);
    setAgentNotes('');
    setActiveTab('ai');
    setCaseId(generateCaseId());
  }, []);

  const hasImage = !!imageDataUrl;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: F.ui }}>
      <Header caseId={caseId} />

      {!hasImage ? (
        <div>
          <UploadCard onFileSelect={handleFileSelect} />
          {/* Agent Notes below upload */}
          <div style={{ maxWidth: '540px', margin: '16px auto 0', padding: '0 16px' }}>
            <div style={{ fontFamily: F.ui, fontSize: '12px', color: C.gray, marginBottom: '6px' }}>
              Agent Notes
            </div>
            <textarea
              data-testid="agent-notes"
              value={agentNotes}
              onChange={(e) => setAgentNotes(e.target.value)}
              placeholder="Add observations about this submission..."
              style={{
                width: '100%', minHeight: '80px', padding: '12px',
                backgroundColor: C.surface, color: C.white,
                border: `1px solid ${C.border}`, borderRadius: '8px',
                fontFamily: F.ui, fontSize: '14px', resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '24px', padding: '24px 32px',
          maxWidth: '1440px', margin: '0 auto',
        }}>
          {/* Left Column — Image + Buttons + Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Image Preview */}
            <div data-testid="image-preview" style={{ ...card, padding: '10px' }}>
              <img
                src={imageDataUrl}
                alt="Uploaded for analysis"
                style={{ width: '100%', borderRadius: '6px', display: 'block' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                data-testid="run-analysis-btn"
                onClick={runAnalysis}
                disabled={isAnalyzing}
                style={{
                  flex: 1, padding: '12px',
                  backgroundColor: C.red, color: C.white,
                  border: 'none', borderRadius: '8px',
                  fontFamily: F.ui, fontSize: '14px', fontWeight: '600',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  opacity: isAnalyzing ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
              </button>
              <button
                data-testid="clear-btn"
                onClick={clearAll}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent', color: C.gray,
                  border: `1px solid ${C.border}`, borderRadius: '8px',
                  fontFamily: F.ui, fontSize: '14px', fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>

            {/* Agent Notes */}
            <div>
              <div style={{ fontFamily: F.ui, fontSize: '12px', color: C.gray, marginBottom: '6px' }}>
                Agent Notes
              </div>
              <textarea
                data-testid="agent-notes-results"
                value={agentNotes}
                onChange={(e) => setAgentNotes(e.target.value)}
                placeholder="Add observations about this submission..."
                style={{
                  width: '100%', minHeight: '100px', padding: '12px',
                  backgroundColor: C.surface, color: C.white,
                  border: `1px solid ${C.border}`, borderRadius: '8px',
                  fontFamily: F.ui, fontSize: '14px', resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Right Column — Results with Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Tab Bar */}
            <div style={{
              display: 'flex', borderRadius: '8px', overflow: 'hidden',
              border: `1px solid ${C.border}`, backgroundColor: C.bg,
            }}>
              {[
                { key: 'ai', label: 'AI Analysis' },
                { key: 'ela', label: 'ELA Heatmap' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  data-testid={`tab-${key}`}
                  onClick={() => setActiveTab(key)}
                  style={{
                    flex: 1, padding: '11px',
                    backgroundColor: activeTab === key ? C.surface : 'transparent',
                    color: activeTab === key ? C.white : C.gray,
                    border: 'none',
                    borderBottom: activeTab === key ? `2px solid ${C.red}` : '2px solid transparent',
                    fontFamily: F.ui, fontSize: '14px', fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'ai' ? (
              <AnalysisResults
                result={analysisResult}
                isLoading={isAnalyzing}
                error={error}
                caseId={caseId}
                agentNotes={agentNotes}
              />
            ) : (
              <ELAHeatmap imageDataUrl={imageDataUrl} />
            )}
          </div>
        </div>
      )}

      <Roadmap />
      <Footer />
    </div>
  );
}

export default App;
