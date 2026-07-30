import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { esChat } from "@/lib/es-engine";
import { safeJsonParse } from "@/lib/utils";
import crypto from "crypto";

interface RewriteFallbackItem {
  sentence: string;
  bannedWords: string[];
  hints: Record<string, string>;
}

const REWRITE_FALLBACK_POOL: RewriteFallbackItem[] = [
  {
    sentence: "The old car was very slow and made a bad noise.",
    bannedWords: ["old", "very", "slow", "bad"],
    hints: {
      "old": "vintage, ancient, weathered, classic",
      "very": "exceptionally, immensely, extremely",
      "slow": "sluggish, unhurried, leisurely",
      "bad": "dreadful, harsh, unpleasant, terrible"
    }
  },
  {
    sentence: "She was really happy because she got a good score on the test.",
    bannedWords: ["really", "happy", "good"],
    hints: {
      "really": "truly, genuinely, remarkably",
      "happy": "ecstatic, thrilled, overjoyed, elated",
      "good": "outstanding, stellar, exemplary, brilliant"
    }
  },
  {
    sentence: "The big dog ran across the nice green park.",
    bannedWords: ["big", "nice", "green"],
    hints: {
      "big": "gigantic, massive, colossal, huge",
      "nice": "picturesque, delightful, charming, pleasant",
      "green": "verdant, lush, emerald"
    }
  },
  {
    sentence: "He ate a very small meal at the cheap restaurant.",
    bannedWords: ["very", "small", "cheap"],
    hints: {
      "very": "exceedingly, extraordinarily",
      "small": "tiny, modest, miniature, subtle",
      "cheap": "affordable, budget-friendly, economical"
    }
  },
  {
    sentence: "It was a sad movie with a really bad ending.",
    bannedWords: ["sad", "really", "bad"],
    hints: {
      "sad": "melancholic, heartbreaking, tragic, somber",
      "really": "exceptionally, deeply, immensely",
      "bad": "disappointing, dismal, tragic, abysmal"
    }
  }
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const randomFallback = REWRITE_FALLBACK_POOL[Math.floor(Math.random() * REWRITE_FALLBACK_POOL.length)];
    let content = randomFallback.sentence;
    let parsedData: { bannedWords: string[]; hints: Record<string, string> } = {
      bannedWords: randomFallback.bannedWords,
      hints: randomFallback.hints
    };

    const systemPrompt = `You are an expert English teacher generating a "Write Out" (sentence rewrite) exercise.
Return ONLY a JSON object:
{
  "sentence": "A simple sentence containing 2-4 basic adjectives/adverbs (e.g. good, bad, happy, big, small, fast, slow, very, really).",
  "bannedWords": ["banned1", "banned2", "banned3"],
  "hints": {
    "banned1": "synonym1, synonym2, synonym3",
    "banned2": "synonym1, synonym2, synonym3",
    "banned3": "synonym1, synonym2, synonym3"
  }
}`;

    const topics = [
      "a rainy afternoon at home",
      "a mountain hiking adventure",
      "buying a new pair of shoes",
      "cooking a delicious meal",
      "a busy day at work",
      "a concert in the city",
      "a quiet evening by the beach",
      "learning a new language"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const userPrompt = `Create a unique rewrite challenge sentence about "${randomTopic}" with 3 basic words to ban and vocabulary hints for each.`;

    try {
      const aiResponse = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);

      if (aiResponse) {
        const data = safeJsonParse<{ sentence?: string; bannedWords?: string[]; hints?: Record<string, string> }>(aiResponse);
        if (data?.sentence && Array.isArray(data?.bannedWords) && data.bannedWords.length > 0 && data?.hints) {
          content = data.sentence.trim();
          parsedData = {
            bannedWords: data.bannedWords,
            hints: data.hints
          };
        }
      }
    } catch (err) {
      console.warn("[ES-ENGINE] generate-rewrite-prompt AI failed, using diverse pool fallback:", err);
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
