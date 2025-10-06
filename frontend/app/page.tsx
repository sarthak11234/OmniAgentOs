import FileUploader from '../components/FileUploader'

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">OmniAgentOS Dashboard</h1>
      <FileUploader />
      {/* Task/result views here */}
    </main>
  )
}
