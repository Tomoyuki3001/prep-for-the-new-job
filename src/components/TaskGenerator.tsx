import React, { useState } from 'react';
import { AISuggestedTask } from '@/types/type';

export const TaskGenerator = () => {
    const [input, setInput] = useState("");
    const [result, setResult] = useState<AISuggestedTask | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchWithTry = async (url: string, options: any, retryCounts: number = 3) => {
        try {
            return await fetch(url, options);
        } catch (error) {
            if (retryCounts > 0) {
                console.log(`Retrying... ${retryCounts} attempts left`);
                await new Promise(res => setTimeout(res, 1000));
                return fetchWithTry(url, options, retryCounts - 1);
            } else {
                console.error('Max retries reached. Giving up.', error);
                throw error;
            }
        }
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (input.trim() === '') {
                setLoading(false);
                setError('Please enter a valid prompt');
                setTimeout(() => setError(null), 3000);
                return;
            }

            const response = await fetchWithTry('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: input }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error || "An unexpected error occurred");
                return;
            }

            setResult(JSON.parse((await response.json()).message as string));
        } catch (error) {
            console.error('Error generating plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormatResult = async (result: AISuggestedTask) => {
        if (!result) return '';
        const formattedResult = `
        Title: ${result.title}
        Subtasks: ${result.subtasks.join(', ')}
        `;

        try {
            await navigator.clipboard.writeText(formattedResult);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy plan to clipboard:', error);
        }
    }

    return (
        <div className='flex flex-col items-center justify-center'>
            <h1 className='text-2xl font-bold'>Task Generator</h1>
            <p className='text-gray-500'>Hello! Please enter a goal and let the AI generate a plan for you.</p>
            <form onSubmit={handleGenerate}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What do you want to do?"
                    className='mt-2 p-2 w-80 border border-gray-300 rounded-md'
                />
                <button
                type="submit"
                disabled={loading}
                className='mt-2 p-2 w-32 ml-2 border border-gray-300 rounded-md bg-blue-500 text-white cursor-pointer'
                >
                    {loading ? "AI is thinking..." : "Generate Plan"}
                </button>
            </form>

            {result && (
                <div className='mt-4 border border-gray-300 rounded-md p-4'>
                    <h3>{result.title}</h3>
                    <p>Priority: <strong>{result.priority}</strong></p>
                    <ul>
                        {result.subtasks.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                    <small>Estimated time: {result.estimatedMinutes} mins</small>
                    <button
                    className='ml-2 bg-blue-500 text-white p-2 rounded-md cursor-pointer'
                    onClick={() => handleFormatResult(result)}
                    >
                        {copied ? "Copied!" : "Copy Plan"}
                    </button>
                </div>
            )}
            {error && (
                <div className='mt-2 text-red-500 font-bold'>
                    {error}
                </div>
            )}
        </div>
    );
};
