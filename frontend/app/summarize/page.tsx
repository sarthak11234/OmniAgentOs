"use client"
import React, { useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function SummarizationPage() {
    const [text, setText] = useState("")
    const [result, setResult] = useState<string>("")
    const [error, setError] = useState<string>("")
    const [loading, setLoading] = useState(false)

    const handleSummarize = async () => {
        if (!text.trim()) {
            setError("Please enter some text to summarize")
            return
        }

        if (text.length < 50) {
            setError("Text is too short to summarize. Please enter at least 50 characters.")
            return
        }

        setError("")
        setLoading(true)
        setResult("")

        try {
            const res = await fetch("/api/v1/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: text }),
            })

            if (!res.ok) {
                let errorMessage = `Server error: ${res.status}`
                try {
                    const errorData = await res.json()
                    if (errorData.detail) {
                        errorMessage = errorData.detail
                    }
                } catch (e) {
                    // If response is not JSON, use default message
                }
                throw new Error(errorMessage)
            }

            const data = await res.json()
            setResult(data.summary || "No summary generated")
        } catch (e) {
            setError(`Summarization failed: ${e instanceof Error ? e.message : "Unknown error"}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Text Summarization</h1>
                        <p className="text-slate-600 text-lg">Condense long articles and documents using the BART AI Agent</p>
                    </div>

                    {/* Input Card */}
                    <div className="bg-white border-2 border-slate-200 rounded-xl p-8 mb-6">
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-900 mb-3">
                                Enter text to summarize
                            </label>
                            <textarea
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value)
                                    setError("")
                                }}
                                placeholder="Paste your article or document content here..."
                                className="w-full h-64 p-4 border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:ring-0 transition-colors resize-none"
                            />
                            <p className="text-right text-sm text-slate-500 mt-2">
                                {text.length} characters
                            </p>
                        </div>

                        <button
                            onClick={handleSummarize}
                            disabled={!text.trim() || loading}
                            className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Summerizing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                    </svg>
                                    Summarize Text
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
                            <div className="mt-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-start gap-3 mb-4">
                                    <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-purple-900">Summary Result</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-purple-200">
                                    <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">{result}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-3">About Summarization</h3>
                        <p className="text-slate-600 text-sm mb-4">
                            The Summarization Agent uses the BART model (Distilled) to extract key information and
                            create concise summaries of long text documents.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Optimized for fast performance on local hardware</span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
