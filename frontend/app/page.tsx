"use client"
import React, { useEffect, useState } from 'react'
import FileUploader from '../components/FileUploader'

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
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">OmniAgentOS Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">Upload</h2>
          <FileUploader />
        </section>

        <section className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">Backend Health</h2>
          <div className="mb-2"><strong>Health:</strong> {loading ? 'loading...' : health}</div>
          <div className="mb-2"><strong>Ready:</strong> {loading ? 'loading...' : ready}</div>
          <div className="flex gap-2">
            <button onClick={fetchStatus} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
          </div>
        </section>
      </div>
    </main>
  )
}
