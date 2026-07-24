import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { esChat } from "@/lib/es-engine";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const systemPrompt = "You are a creative prompt engineer for an image generation AI.";
    const topics = [
      "a futuristic cyberpunk cafe in the rain",
      "a peaceful reading nook in a giant ancient library",
      "a magical glowing forest at twilight",
      "a steampunk city floating in the clouds",
      "a cozy log cabin in snowy mountains",
      "an underwater city with glowing coral",
      "a bustling spaceport on a desert planet",
      "a retro 1980s arcade filled with neon lights",
      "a serene Japanese garden in autumn",
      "a grand medieval castle during a festival"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `Generate a single short, highly descriptive sentence describing ${randomTopic}.
Do not include any extra text. Just the description. For example: "A cozy futuristic cafe in a rainy cyberpunk city with neon lights reflecting on the wet pavement."`;

    let content = `A beautiful and descriptive scene of ${randomTopic}.`;

    try {
      const aiResponse = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]);

      if (aiResponse && aiResponse.trim().length > 5) {
        content = aiResponse.replace(/["']/g, "").trim();
      }
    } catch (err) {
      console.warn("[ES-ENGINE] generate-image-prompt AI failed, using fallback:", err);
    }

    const encodedPrompt = encodeURIComponent(content);
    // Pollinations free API for image generation
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=400&nologo=true`;

    const challengeId = `writing-image-dynamic-${crypto.randomUUID()}`;
    
    // Save the challenge. We store the description in `content` for the AI evaluator to read, 
    // and the `imageUrl` in the JSON `questions` field for the frontend to render.
    // @ts-ignore
    const dynamicChallenge = await db.stage1Content.create({
      data: {
        id: challengeId,
        type: "WRITING",
        title: "Write about",
        content, 
        difficulty: "medium",
        questions: JSON.stringify([{ imageUrl }])
      }
    });

    return NextResponse.json({
      id: dynamicChallenge.id,
      type: "WRITING",
      title: "Write about",
      content,
      difficulty: "medium",
      questions: [{ imageUrl }]
    });
  } catch (error: any) {
    console.error("Failed to generate dynamic image prompt:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
