"use client"
import React, { useEffect, useState } from 'react'
import FileUploader from '../components/FileUploader'
import TextGenerator from '../components/TextGenerator'
import TextSummarizer from '../components/TextSummarizer'

export default function Home() {
  const [health, setHealth] = useState<string | null>(null)
  const [ready, setReady] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const r1 = await fetch('/api/v1/health/health')
      const d1 = await r1.json()
      const r2 = await fetch('/api/v1/health/ready')
      const d2 = await r2.json()
      setHealth(d1.status ?? JSON.stringify(d1))
      setReady(String(d2.ready))
    } catch (e) {
      setHealth('error')
      setReady('error')
    }
    setLoading(false)
  }

  useEffect(() => { fetchStatus() }, [])

  return (
    <main className="p-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="text-3xl font-bold mb-8">🤖 OmniAgentOS Dashboard</h1>

      {/* Status Section */}
      <section className="p-4 bg-white rounded shadow mb-8">
        <h2 className="font-semibold mb-4">Backend Health</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <strong>Health Status:</strong>
            <p style={{ color: health === 'ok' ? '#009900' : '#cc0000', fontWeight: 'bold' }}>
              {loading ? 'loading...' : health}
            </p>
          </div>
          <div>
            <strong>System Ready:</strong>
            <p style={{ color: ready === 'true' ? '#009900' : '#cc0000', fontWeight: 'bold' }}>
              {loading ? 'loading...' : ready}
            </p>
          </div>
        </div>
        <button 
          onClick={fetchStatus} 
          className="px-3 py-1 bg-blue-600 text-white rounded mt-4"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </section>

      {/* Audio Transcription */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🎵 Audio Transcription</h2>
        <FileUploader />
      </section>

      {/* Text Generation */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📝 Text Generation</h2>
        <TextGenerator />
      </section>

      {/* Text Summarization */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📊 Text Summarization</h2>
        <TextSummarizer />
      </section>
    </main>
  )
}
