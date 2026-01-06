"use client"
import React, { useState, useEffect } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const router = useRouter()

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
                const res = await fetch('/api/v1/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!res.ok) {
                    throw new Error('Failed to fetch profile')
                }

                const data = await res.json()
                setUser(data)
            } catch (e) {
                setError('Could not load profile data')
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [router])

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Card */}
                    <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
                        {/* Header / Banner */}
                        <div className="bg-purple-600 h-32 relative">
                            <div className="absolute -bottom-12 left-8">
                                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400">
                                        {user?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-16 pb-8 px-8">
                            {loading ? (
                                <div className="flex items-center space-x-2 text-slate-500">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Loading profile...</span>
                                </div>
                            ) : error ? (
                                <div className="text-red-600 font-medium">{error}</div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900">{user?.username}</h1>
                                            <p className="text-slate-500">{user?.email}</p>
                                        </div>
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                            Active
                                        </span>
                                    </div>

                                    <div className="mt-8 border-t border-slate-100 pt-8">
                                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Details</h2>
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <dt className="text-sm font-medium text-slate-500">User ID</dt>
                                                <dd className="mt-1 text-sm text-slate-900">{user?.id || 'N/A'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-slate-500">Email</dt>
                                                <dd className="mt-1 text-sm text-slate-900">{user?.email}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-slate-500">Plan</dt>
                                                <dd className="mt-1 text-sm text-slate-900">Free Tier (Local)</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-slate-500">Role</dt>
                                                <dd className="mt-1 text-sm text-slate-900">User</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
