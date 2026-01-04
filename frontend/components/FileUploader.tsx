"use client"
import { useState } from "react"

export default function FileUploader() {
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

  const fileSize = file ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : "No file"

  return (
    <div>
      <input 
        type="file" 
        accept="audio/*"
        onChange={e => {
          setFile(e.target.files?.[0] || null)
          setError("")
          setResult("")
        }} 
      />
      {file && <div className="text-sm text-slate-600 mt-2">File: {file.name} ({fileSize})</div>}
      <button 
        onClick={handleUpload} 
        disabled={!file || loading}
        className="btn mt-2 disabled:opacity-50"
      >
        {loading ? "Transcribing..." : "Transcribe"}
      </button>
      {error && <div className="mt-4 text-red-600"><b>Error:</b> {error}</div>}
      {result && <div className="mt-4 text-green-600"><b>Transcript:</b> {result}</div>}
    </div>
  )
}
