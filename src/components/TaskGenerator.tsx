import React, { useState } from 'react';
import { AISuggestedTask } from '@/types/type';

export const TaskGenerator = () => {
    const [input, setInput] = useState("");
    const [result, setResult] = useState<AISuggestedTask | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        await new Promise(res => setTimeout(res, 800));

        const finalTasks = ["Research ideas", "Create a budget", "Execute the plan"]

        setResult({
            title: `Plan for: ${input}`,
            priority: 'medium',
            subtasks: [],
            estimatedMinutes: 45
        });

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

        setLoading(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            <form onSubmit={handleGenerate}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What do you want to do?"
                    style={{ padding: '10px', width: '300px' }}
                />
                <button type="submit" disabled={loading}>
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