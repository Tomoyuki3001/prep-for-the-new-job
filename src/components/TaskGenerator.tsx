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

            setResult({
                title: `Plan for: ${input}`,
                priority: 'medium',
                subtasks: [],
                estimatedMinutes: 45
            });

            const finalTasks = ["Research ideas", "Create a budget", "Execute the plan"]

            for (const task of finalTasks) {
                await new Promise(res => setTimeout(res, 600));
                setResult(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        subtasks: [...prev.subtasks, task]
                    };
                });
            }

            await new Promise(res => setTimeout(res, 500));
            const finalPriority = input.toLowerCase().includes('clean') ? 'low' : 'high';
            setResult(prev => prev ? { ...prev, priority: finalPriority } : prev);
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
        <div style={{ padding: '20px' }}>
            <form onSubmit={handleGenerate}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What do you want to do?"
                    style={{ padding: '10px', width: '300px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
                <button
                type="submit"
                disabled={loading}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginLeft: '10px' }}>
                    {loading ? "AI is thinking..." : "Generate Plan"}
                </button>
            </form>

            {result && (
                <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '15px' }}>
                    <h3>{result.title}</h3>
                    <p>Priority: <strong>{result.priority}</strong></p>
                    <ul>
                        {result.subtasks.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                    <small>Estimated time: {result.estimatedMinutes} mins</small>
                    <button
                    className='ml-2 bg-blue-500 text-white p-2 rounded-md'
                    onClick={() => handleFormatResult(result)}
                    >
                        {copied ? "Copied!" : "Copy Plan"}
                    </button>
                </div>
            )}
            {error && (
                <div style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>
                    {error}
                </div>
            )}
        </div>
    );
};