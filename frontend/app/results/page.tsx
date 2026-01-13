'use client';
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ResultCard from '../../components/ResultCard';

interface Result {
    id: number;
    task_type: string;
    input_text?: string;
    input_filename?: string;
    output_text?: string;
    processing_time_seconds?: number;
    model_used?: string;
    status: string;
    created_at: string;
}

export default function ResultsPage() {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<string>('all');

    // Fetch results on mount
    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            // Hardcoded user_id=1 for now as per guide
            const res = await fetch('http://localhost:8000/api/v1/users/1/results');
            if (!res.ok) throw new Error('Failed to fetch results');
            const data = await res.json();
            setResults(data);
        } catch (err) {
            setError('Could not load history. Ensure backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this result?")) return;

        try {
            const res = await fetch(`http://localhost:8000/api/v1/results/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setResults(results.filter(r => r.id !== id));
            }
        } catch (e) {
            alert("Failed to delete result");
        }
    };

    const filteredResults = filter === 'all'
        ? results
        : results.filter(r => r.task_type === filter);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Task History</h1>
                        <p className="text-slate-600 mt-1">View your past generations and transcriptions</p>
                    </div>

                    <div className="mt-4 md:mt-0 flex space-x-2">
                        {['all', 'generation', 'transcription', 'summarization'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === type
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 text-lg">No results found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredResults.map(result => (
                            <ResultCard key={result.id} result={result} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
