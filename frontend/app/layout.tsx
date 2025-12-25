import '../styles/globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'OmniAgentOS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="p-4 bg-white border-b">
          <nav className="max-w-4xl mx-auto flex gap-4">
            <Link href="/" className="font-semibold">Home</Link>
            <Link href="/health" className="text-sm text-slate-600">Backend Health</Link>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto">{children}</main>
      </body>
    </html>
  )
}
