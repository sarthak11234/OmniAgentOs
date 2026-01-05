"use client"
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

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

  const healthStatus = health === 'ok'
  const readyStatus = ready === 'true'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">System Health</h1>
            <p className="text-slate-600 text-lg">Monitor backend status and system readiness</p>
          </div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Health Status Card */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Health Status</h2>
                <div className={`w-4 h-4 rounded-full ${healthStatus ? 'bg-green-500' : 'bg-red-500'} ${loading ? 'animate-pulse' : ''}`}></div>
              </div>
              {loading ? (
                <p className="text-slate-500">Checking...</p>
              ) : error ? (
                <p className="text-red-600 font-medium">{error}</p>
              ) : (
                <div>
                  <p className={`text-2xl font-bold ${healthStatus ? 'text-green-600' : 'text-red-600'}`}>
                    {healthStatus ? 'Healthy' : 'Unhealthy'}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">Status: {health}</p>
                </div>
              )}
            </div>

            {/* Ready Status Card */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">System Ready</h2>
                <div className={`w-4 h-4 rounded-full ${readyStatus ? 'bg-green-500' : 'bg-yellow-500'} ${loading ? 'animate-pulse' : ''}`}></div>
              </div>
              {loading ? (
                <p className="text-slate-500">Checking...</p>
              ) : error ? (
                <p className="text-red-600 font-medium">{error}</p>
              ) : (
                <div>
                  <p className={`text-2xl font-bold ${readyStatus ? 'text-green-600' : 'text-yellow-600'}`}>
                    {readyStatus ? 'Ready' : 'Not Ready'}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">Ready: {ready}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">System Status</h3>
                <p className="text-sm text-slate-600">Check backend connectivity and service availability</p>
              </div>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Status
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">About System Health</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <strong>Health Status:</strong> Indicates whether the backend API is responding to requests.
              </p>
              <p>
                <strong>System Ready:</strong> Indicates whether the system is ready to process requests, 
                including ML model availability.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
