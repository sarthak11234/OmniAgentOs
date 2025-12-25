"use client"
import React, { useEffect, useState } from 'react'

type Props = {
  pollingInterval?: number
}

export default function HealthBadge({ pollingInterval = 5000 }: Props) {
  const [ready, setReady] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReady = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/health/ready')
      const d = await res.json()
      setReady(Boolean(d.ready))
    } catch (e) {
      setReady(false)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReady()
    const t = setInterval(fetchReady, pollingInterval)
    return () => clearInterval(t)
  }, [pollingInterval])

  const color = ready === null ? 'bg-gray-300' : ready ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} aria-hidden />
      <div className="text-sm text-slate-700">{loading ? 'checking...' : (ready ? 'ready' : 'not ready')}</div>
    </div>
  )
}
