import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { esChat } from "@/lib/es-engine";
import { safeJsonParse } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const systemPrompt = `You are an English teacher generating a sentence rewrite exercise.
Respond ONLY with a valid JSON object. Do not include markdown formatting or backticks.
Format:
{
  "sentence": "The weather was very good and I felt happy.",
  "bannedWords": ["good", "happy", "very"],
  "hints": {
    "good": "splendid, pleasant, delightful, gorgeous",
    "happy": "thrilled, joyful, ecstatic, elated",
    "very": "incredibly, exceptionally, exceedingly"
  }
}`;

    const topics = [
      "a trip to the park",
      "eating dinner",
      "a rainy day",
      "going to the movies",
      "a birthday party",
      "a long walk",
      "waking up early",
      "playing a game",
      "a tired student",
      "a fast car"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `Generate a simple, slightly boring sentence about ${randomTopic} that uses 2 to 3 common "basic" adjectives or adverbs (like good, bad, nice, very, really, happy, sad, big, small).
Then list those basic words as bannedWords, and provide 3-4 advanced vocabulary alternatives for each banned word as hints.`;

    let content = "The weather was very good and I felt happy.";
    let parsedData: { bannedWords: string[]; hints: Record<string, string> } = {
      bannedWords: ["good", "happy", "very"],
      hints: {
        "good": "splendid, pleasant, delightful, gorgeous",
        "happy": "thrilled, joyful, ecstatic, elated",
        "very": "incredibly, exceptionally, exceedingly"
      }
    };

    try {
      const aiResponse = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]);

      if (aiResponse) {
        const data = safeJsonParse<{ sentence?: string; bannedWords?: string[]; hints?: Record<string, string> }>(aiResponse);
        if (data?.sentence && data?.bannedWords && data?.hints) {
          content = data.sentence;
          parsedData = {
            bannedWords: data.bannedWords,
            hints: data.hints
          };
        }
      }
    } catch (err) {
      console.warn("[ES-ENGINE] generate-rewrite-prompt AI failed, using fallback:", err);
    }

    const challengeId = `rewrite-dynamic-${crypto.randomUUID()}`;
    
    // Save to DB
    // @ts-ignore
    const dynamicChallenge = await db.stage1Content.create({
      data: {
        id: challengeId,
        type: "WRITING",
        title: "Write out",
        content,
        difficulty: "hard",
        questions: JSON.stringify([parsedData])
      }
    });

    return NextResponse.json({
      id: dynamicChallenge.id,
      type: "WRITING",
      title: "Write out",
      content,
      difficulty: "hard",
      questions: [parsedData]
    });
  } catch (error: any) {
    console.error("Failed to generate dynamic rewrite prompt:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
