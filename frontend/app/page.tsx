"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error('Error parsing user data')
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Welcome Banner Section */}
      {user && (
        <section className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">{user.username?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.username}</h1>
                <p className="text-slate-600 mt-1">Continue your AI agent journey</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              OmniAgentOS
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-purple-100 leading-relaxed">
              A modular, multi-modal AI operating system for orchestrating specialized agents.
              Built for developers who need production-grade AI infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {!user && (
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-slate-100 transition-colors shadow-lg text-center"
                >
                  Get Started
                </Link>
              )}
              <Link
                href="/upload"
                className="px-8 py-4 bg-purple-800 text-white rounded-lg font-semibold hover:bg-purple-900 transition-colors shadow-lg text-center border-2 border-purple-500"
              >
                Upload & Process
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Available Agents Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Available AI Agents</h2>
              <p className="text-slate-600 text-lg">Specialized agents for different tasks</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Text Intelligence Agent */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-purple-400 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Text Intelligence Agent</h3>
                <p className="text-slate-600 mb-4">
                  Advanced language understanding and generation powered by Llama 3.1 and Mixtral models.
                </p>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold">Models:</span> Llama 3.1, Mixtral
                </div>
              </div>

              {/* Audio Transcription Agent */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-purple-400 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Audio Transcription Agent</h3>
                <p className="text-slate-600 mb-4">
                  High-accuracy speech-to-text conversion using Whisper models for real-time and batch processing.
                </p>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold">Models:</span> Whisper
                </div>
              </div>

              {/* Summarization Agent */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-purple-400 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Summarization Agent</h3>
                <p className="text-slate-600 mb-4">
                  Extractive and abstractive summarization using BART and Pegasus for document compression.
                </p>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold">Models:</span> BART, Pegasus
                </div>
              </div>
            </div>
          </section>

          {/* How It Works - Workflow Section */}
          <section className="mb-16 bg-slate-50 rounded-2xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How OmniAgentOS Works</h2>
              <p className="text-slate-600 text-lg">Understanding the system workflow</p>
            </div>

            {/* Workflow Diagram */}
            <div className="max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center mb-8">
                <div className="flex-shrink-0 w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 md:mb-0 md:mr-6">
                  1
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">User Input</h3>
                  <p className="text-slate-600">
                    Upload files (audio, text) or provide text input through the web interface or API endpoints.
                  </p>
                  <Link href="/upload" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold">
                    Try Upload →
                  </Link>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-8">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center mb-8">
                <div className="flex-shrink-0 w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 md:mb-0 md:mr-6">
                  2
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">OmniAgent Core</h3>
                  <p className="text-slate-600">
                    The central intelligence layer analyzes input type, intent, and determines which specialized agent is needed.
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-8">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center mb-8">
                <div className="flex-shrink-0 w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 md:mb-0 md:mr-6">
                  3
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Agent Router</h3>
                  <p className="text-slate-600">
                    Routes the task to the appropriate specialized agent (Text, Audio, Summarization) based on capability matching.
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-8">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row items-center mb-8">
                <div className="flex-shrink-0 w-20 h-20 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 md:mb-0 md:mr-6">
                  4
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 border-2 border-orange-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Specialized Agent Processing</h3>
                  <p className="text-slate-600 mb-4">
                    The selected agent processes the input using Hugging Face models and returns results.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded text-center">Text Agent</div>
                    <div className="bg-green-50 p-2 rounded text-center">Audio Agent</div>
                    <div className="bg-purple-50 p-2 rounded text-center">Summarize Agent</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-8">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-shrink-0 w-20 h-20 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 md:mb-0 md:mr-6">
                  5
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 border-2 border-teal-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Unified Output</h3>
                  <p className="text-slate-600 mb-4">
                    Results are returned to the user and stored in the database. View your task history and results.
                  </p>
                  <Link href="/tasks" className="inline-block mt-4 text-teal-600 hover:text-teal-700 font-semibold">
                    View Tasks →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* System Architecture Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">System Architecture</h2>
              <p className="text-slate-600 text-lg">Built with modern, production-grade technologies</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">🤗</div>
                <p className="font-semibold text-slate-900">Hugging Face</p>
                <p className="text-sm text-slate-600 mt-1">AI Models</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <p className="font-semibold text-slate-900">FastAPI</p>
                <p className="text-sm text-slate-600 mt-1">Backend</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">▲</div>
                <p className="font-semibold text-slate-900">Next.js 14</p>
                <p className="text-sm text-slate-600 mt-1">Frontend</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">🐘</div>
                <p className="font-semibold text-slate-900">PostgreSQL</p>
                <p className="text-sm text-slate-600 mt-1">Database</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">🐳</div>
                <p className="font-semibold text-slate-900">Docker</p>
                <p className="text-sm text-slate-600 mt-1">Deployment</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">🎨</div>
                <p className="font-semibold text-slate-900">Tailwind</p>
                <p className="text-sm text-slate-600 mt-1">Styling</p>
              </div>
            </div>
          </section>

          {/* Quick Actions Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Get Started</h2>
              <p className="text-slate-600 text-lg">Start using OmniAgentOS</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/upload"
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-xl hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Upload Files</h3>
                <p className="text-blue-100">Upload audio files for transcription or text files for processing</p>
              </Link>

              <Link
                href="/results"
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-xl hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">View Results</h3>
                <p className="text-purple-100">Check your task history and view processing results</p>
              </Link>

              <Link
                href="/health"
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-xl hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">System Health</h3>
                <p className="text-green-100">Monitor backend status and system readiness</p>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
