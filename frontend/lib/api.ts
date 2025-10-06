export async function transcribeAudio(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/audio/transcribe", {
    method: "POST",
    body: formData,
  })
  return res.json()
}
