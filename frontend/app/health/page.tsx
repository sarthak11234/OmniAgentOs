"use client"
import React, { useEffect, useState } from 'react'

export default function HealthPage() {
  const [health, setHealth] = useState<string | null>(null)
  const [ready, setReady] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const r1 = await fetch('/api/v1/health/health')
      const d1 = await r1.json()
      const r2 = await fetch('/api/v1/health/ready')
      const d2 = await r2.json()
      setHealth(d1.status ?? JSON.stringify(d1))
      setReady(String(d2.ready))
    } catch (e) {
      setError('Failed to fetch status')
    }
    setLoading(false)
  }

  useEffect(() => { fetchStatus() }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Backend Health</h1>
      <div className="mb-3"><strong>Health:</strong> {loading ? 'loading...' : (error ? error : health)}</div>
      <div className="mb-3"><strong>Ready:</strong> {loading ? 'loading...' : (error ? error : ready)}</div>
      <button onClick={fetchStatus} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
    </div>
  )
}
