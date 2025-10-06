"use client"
import { useState } from "react"

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string>("")

  const handleUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/audio/transcribe", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    setResult(data.transcript)
  }

  return (
    <div>
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} className="btn mt-2">Transcribe</button>
      {result && <div className="mt-4"><b>Transcript:</b> {result}</div>}
    </div>
  )
}
