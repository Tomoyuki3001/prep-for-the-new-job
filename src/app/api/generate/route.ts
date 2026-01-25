import { NextResponse } from 'next/server';
import { AISuggestedTask } from '@/types/type';

export async function POST(request: Request) {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (prompt.length > 100) {
        return NextResponse.json({ error: 'Prompt must be less than 100 characters' }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const isCleaningTask = prompt.toLowerCase().includes('clean');

    const mockResponse: AISuggestedTask = {
        title: `AI Plan: ${prompt}`,
        priority: isCleaningTask ? 'low' : 'high',
        subtasks: [
            `Initial research on ${prompt}`,
            `Establish a budget`,
            `Execute main steps`
        ],
        estimatedMinutes: isCleaningTask ? 30 : 120,
    };

    return NextResponse.json(mockResponse);
}