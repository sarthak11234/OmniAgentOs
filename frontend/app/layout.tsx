import '../styles/globals.css'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const HealthBadge = dynamic(() => import('../components/HealthBadge'), { ssr: false })

export const metadata = {
  title: 'OmniAgentOS',
}

const pollInterval = parseInt(process.env.NEXT_PUBLIC_HEALTH_INTERVAL || '5000')

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="p-4 bg-white border-b">
          <nav className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex gap-4 items-center">
              <Link href="/" className="font-semibold">Home</Link>
              <Link href="/health" className="text-sm text-slate-600">Backend Health</Link>
            </div>
            <div>
              <HealthBadge pollingInterval={pollInterval} />
            </div>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto">{children}</main>
      </body>
    </html>
  )
}
