'use client';

import { useState } from 'react';

interface GenerationResult {
  prompt: string;
  generated_text: string;
}

export default function TextGenerator() {
  const [prompt, setPrompt] = useState('');
  const [maxLength, setMaxLength] = useState(256);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/v1/text/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          max_length: maxLength,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate text: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      setPrompt(''); // Clear input on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
      <h2>Text Generation</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>Generate text using GPT-2 model</p>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          disabled={loading}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            opacity: loading ? 0.6 : 1,
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Max Length: {maxLength}
        </label>
        <input
          type="range"
          min="50"
          max="500"
          value={maxLength}
          onChange={(e) => setMaxLength(parseInt(e.target.value))}
          disabled={loading}
          style={{ width: '100%' }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: loading ? '#ccc' : '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        {loading ? 'Generating...' : 'Generate Text'}
      </button>

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e6f3ff', borderRadius: '4px', borderLeft: '4px solid #0066cc' }}>
          <h3 style={{ marginTop: 0 }}>Generated Text</h3>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Prompt:</strong>
            <p style={{ margin: '0.5rem 0', fontStyle: 'italic', color: '#333' }}>{result.prompt}</p>
          </div>
          <div>
            <strong>Generated:</strong>
            <p style={{ margin: '0.5rem 0', padding: '0.75rem', backgroundColor: 'white', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
              {result.generated_text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
