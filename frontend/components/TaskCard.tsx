type Task = {
  id: number
  type: string
  status: string
  result?: string
}

export default function TaskCard({ task }: { task: Task }) {
  return (
    <div className="border rounded p-4 mb-2">
      <div><b>Type:</b> {task.type}</div>
      <div><b>Status:</b> {task.status}</div>
      {task.result && <div><b>Result:</b> {task.result}</div>}
    </div>
  )
}
