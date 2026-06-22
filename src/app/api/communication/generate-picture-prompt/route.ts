import { NextResponse } from 'next/server';
import { turboRace } from '@/lib/turbo-race';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await turboRace([
      {
        role: 'system',
        content: "You are an imaginative artist. Generate a single highly vivid and creative sentence describing a random scene (e.g. nature, sci-fi, cozy, etc.) for an AI image generator. Return ONLY valid JSON in the format: { \"prompt\": \"your creative sentence here\" }"
      },
      {
        role: 'user',
        content: prompt || "Give me a random scene prompt."
      }
    ], 0.9);

    let finalPrompt = "";
    try {
      const match = response.response.match(/```json\n([\s\S]*?)\n```/) || response.response.match(/\{[\s\S]*\}/);
      const jsonString = match ? (match[1] || match[0]) : response.response;
      const parsed = JSON.parse(jsonString);
      finalPrompt = parsed.prompt || parsed.scene || parsed.description || "";
    } catch (e) {
      finalPrompt = response.response;
    }

    if (!finalPrompt || finalPrompt.length < 5) {
      throw new Error("Empty response from Turbo Race Engine");
    }

    return NextResponse.json({ prompt: finalPrompt });
  } catch (error: any) {
    console.error('[Generate-Picture-Prompt] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
