import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const FORBIDDEN_KEYWORDS = ['steal', 'hack', 'bomb', 'illegal'];
const ai = new GoogleGenAI({});

const systemInstructions = `
    You are an expert Task Architect.
    The user will provide a goal. Your job is to break it down into a structured plan.

    CRITICAL RULES:
    1. Only output valid JSON.
    2. Use this exact structure:
       {
         "title": "String",
         "priority": "high" | "medium" | "low",
         "subtasks": ["string", "string", "string"],
         "estimatedMinutes": number
       }
    3. Do not include any conversational text like "Here is your plan."
    4. For estimatedMinutes: Calculate a realistic time estimate based on:
       - The complexity of each subtask
       - The number of subtasks (typically 5-15 minutes per subtask for simple tasks, 15-30 for medium, 30-60+ for complex)
       - The overall scope of the goal
       - Do NOT default to 45 minutes. Provide a thoughtful estimate that varies based on the actual task complexity.
  `;

async function main(prompt: string) {
  let responseText = '';
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  for await (const chunk of response) {
    responseText += chunk.text;
  }
  return responseText;
}

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

  const result = await main(systemInstructions + prompt);
  return NextResponse.json({ message: result });
}