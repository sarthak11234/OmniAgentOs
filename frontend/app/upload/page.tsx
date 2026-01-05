"use client"
import React, { useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Max size: 100MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      return
    }

    setError("")
    setLoading(true)
    setResult("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/v1/audio/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
      setResult(data.transcript || "No transcript received")
    } catch (e) {
      setError(`Upload failed: ${e instanceof Error ? e.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const fileSize = file ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : ""

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Upload & Process Files</h1>
            <p className="text-slate-600 text-lg">Upload audio files for transcription using the Audio Agent</p>
          </div>

          {/* Upload Card */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-8 mb-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Select Audio File
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null)
                    setError("")
                    setResult("")
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-slate-900 mb-1">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </span>
                  <span className="text-sm text-slate-500">
                    {file ? `Size: ${fileSize}` : "Audio files (MP3, WAV, etc.) up to 100MB"}
                  </span>
                </label>
              </div>
            </div>

            {file && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-600">{fileSize}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Transcribe Audio
                </>
              )}
            </button>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-green-900">Transcript</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-slate-900 whitespace-pre-wrap">{result}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">About Audio Transcription</h3>
            <p className="text-slate-600 text-sm mb-4">
              The Audio Transcription Agent uses Whisper models to convert speech to text. 
              Supported formats include MP3, WAV, FLAC, and other common audio formats.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Maximum file size: 100MB</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
