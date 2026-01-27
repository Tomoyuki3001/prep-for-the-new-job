import { NextResponse } from 'next/server';
import { AISuggestedTask } from '@/types/type';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const FORBIDDEN_KEYWORDS = ['steal', 'hack', 'bomb', 'illegal'];

let requestCount = 0;

setInterval(() => {
  requestCount = 0;
}, 60000);

export async function POST(request: Request) {
  if (requestCount >= 5) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  requestCount++;

  const { prompt } = await request.json();
  const isDangerous = FORBIDDEN_KEYWORDS.some(word => prompt.toLowerCase().includes(word));

  if (isDangerous) {
    return NextResponse.json({ error: 'Dangerous prompt detected' }, { status: 403 });
  }

  // const systemInstructions = `
  //   You are an expert Task Architect.
  //   The user will provide a goal. Your job is to break it down into a structured plan.

  //   CRITICAL RULES:
  //   1. Only output valid JSON.
  //   2. Use this exact structure:
  //      {
  //        "title": "String",
  //        "priority": "high" | "medium" | "low",
  //        "subtasks": ["string", "string", "string"],
  //        "estimatedMinutes": number
  //      }
  //   3. Do not include any conversational text like "Here is your plan."
  // `;

// const { text } = await generateText({
//   model: openai('gpt-4o-mini'),
//   system: systemInstructions,
//   prompt: prompt,
  // });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  return new Response(JSON.stringify({ message: "System prompt configured!" }));
}