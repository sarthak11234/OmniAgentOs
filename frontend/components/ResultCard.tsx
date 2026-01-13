import React, { useState } from 'react';

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

interface ResultCardProps {
    result: Result;
    onDelete?: (id: number) => void;
}

export default function ResultCard({ result, onDelete }: ResultCardProps) {
    const [expanded, setExpanded] = useState(false);

    // Format date
    const date = new Date(result.created_at).toLocaleString();

    // Get icon based on task type
    const getIcon = () => {
        switch (result.task_type) {
            case 'transcription':
                return (
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                );
            case 'generation':
                return (
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                );
            case 'summarization':
                return (
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </div>
                );
            default:
                return <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>;
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow mb-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    {getIcon()}
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-slate-900 capitalize">{result.task_type}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${result.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {result.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            {date} • {result.model_used} • {result.processing_time_seconds}s
                        </p>
                    </div>
                </div>

                {onDelete && (
                    <button
                        onClick={() => onDelete(result.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Result"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="mt-4 space-y-3">
                {/* Input Section */}
                <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Input</p>
                    {result.input_filename ? (
                        <div className="flex items-center text-slate-700">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 3-2 3-2zm0 0v-4.94A5.56 5.56 0 005.61 7.14M9 19a5.58 5.58 0 013-2.58A5.58 5.58 0 0013.88 9m2.11 0l4.38-4.38" />
                            </svg>
                            {result.input_filename}
                        </div>
                    ) : (
                        <p className="text-slate-700 text-sm line-clamp-2">{result.input_text}</p>
                    )}
                </div>

                {/* Output Section */}
                <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-500 uppercase mb-1">Output</p>
                    <p className={`text-slate-800 text-sm ${expanded ? '' : 'line-clamp-3'}`}>
                        {result.output_text}
                    </p>
                    {result.output_text && result.output_text.length > 150 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-blue-600 text-xs font-medium mt-2 hover:underline focus:outline-none"
                        >
                            {expanded ? 'Show Less' : 'Show More'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
