"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">OmniAgentOS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/tasks"
              className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Tasks
            </Link>
            <Link
              href="/upload"
              className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Upload
            </Link>
            <Link
              href="/health"
              className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              System Health
            </Link>
          </div>


          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm">
                    <span className="text-white font-semibold text-sm">{user.username?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block px-4 py-2 text-slate-700 hover:text-slate-900 font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col space-y-2">
              <Link
                href="/tasks"
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Tasks
              </Link>
              <Link
                href="/upload"
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Upload
              </Link>
              <Link
                href="/health"
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                System Health
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

