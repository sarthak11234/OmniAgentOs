'use client';

import { useState } from 'react';

interface SummarizationResult {
  original_length: number;
  summary: string;
  summary_length: number;
}

export default function TextSummarizer() {
  const [text, setText] = useState('');
  const [maxLength, setMaxLength] = useState(150);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummarizationResult | null>(null);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Please enter text to summarize');
      return;
    }

    if (text.trim().length < 50) {
      setError('Text must be at least 50 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/v1/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          max_length: maxLength,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      setText(''); // Clear input on success
    } catch (err) {
      console.error('Summarize error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const compressionRatio = result ? ((1 - result.summary_length / result.original_length) * 100).toFixed(1) : 0;

  return (
    <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
      <h2>Text Summarization</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>Summarize text using BART model</p>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Text to Summarize
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here (at least 50 characters)..."
          disabled={loading}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            opacity: loading ? 0.6 : 1,
          }}
        />
        <small style={{ color: '#999', marginTop: '0.25rem', display: 'block' }}>
          Character count: {text.length}
        </small>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Max Summary Length: {maxLength}
        </label>
        <input
          type="range"
          min="30"
          max="300"
          value={maxLength}
          onChange={(e) => setMaxLength(parseInt(e.target.value))}
          disabled={loading}
          style={{ width: '100%' }}
        />
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading || text.trim().length < 50}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: loading || text.trim().length < 50 ? '#ccc' : '#009900',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || text.trim().length < 50 ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        {loading ? 'Summarizing...' : 'Summarize Text'}
      </button>

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e6ffe6', borderRadius: '4px', borderLeft: '4px solid #009900' }}>
          <h3 style={{ marginTop: 0 }}>Summary Results</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <strong>Original Length:</strong> {result.original_length} characters
            </div>
            <div>
              <strong>Summary Length:</strong> {result.summary_length} characters
            </div>
            <div>
              <strong>Compression:</strong> {compressionRatio}%
            </div>
          </div>
          <div>
            <strong>Summary:</strong>
            <p style={{ margin: '0.5rem 0', padding: '0.75rem', backgroundColor: 'white', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
              {result.summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
