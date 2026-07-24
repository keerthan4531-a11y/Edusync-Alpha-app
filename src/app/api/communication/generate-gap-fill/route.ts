import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { esChat } from "@/lib/es-engine";

const GAP_FALLBACK_POOL = [
  {
    fullText: "I usually wake up at 7 AM. For breakfast, I like to eat cereal and drink a cup of coffee.",
    correctAnswers: ["wake", "cereal"],
    displaySegments: [
      { type: "text", value: "I usually " },
      { type: "gap", id: 1 },
      { type: "text", value: " up at 7 AM. For breakfast, I like to eat " },
      { type: "gap", id: 2 },
      { type: "text", value: " and drink a cup of coffee." }
    ]
  },
  {
    fullText: "Every weekend, Liam likes to visit the library to borrow mystery books and read peacefully.",
    correctAnswers: ["library", "mystery"],
    displaySegments: [
      { type: "text", value: "Every weekend, Liam likes to visit the " },
      { type: "gap", id: 1 },
      { type: "text", value: " to borrow " },
      { type: "gap", id: 2 },
      { type: "text", value: " books and read peacefully." }
    ]
  },
  {
    fullText: "Cooking fresh pasta with garlic sauce is my absolute favorite hobby on Sunday evenings.",
    correctAnswers: ["pasta", "hobby"],
    displaySegments: [
      { type: "text", value: "Cooking fresh " },
      { type: "gap", id: 1 },
      { type: "text", value: " with garlic sauce is my absolute favorite " },
      { type: "gap", id: 2 },
      { type: "text", value: " on Sunday evenings." }
    ]
  },
  {
    fullText: "They decided to travel to Tokyo next summer to explore historical temples and modern tech.",
    correctAnswers: ["Tokyo", "temples"],
    displaySegments: [
      { type: "text", value: "They decided to travel to " },
      { type: "gap", id: 1 },
      { type: "text", value: " next summer to explore historical " },
      { type: "gap", id: 2 },
      { type: "text", value: " and modern tech." }
    ]
  }
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topics = [
      "traveling to a new city", "school projects", "hobbies and free time",
      "technology and gadgets", "favorite foods and cooking", "sports and exercise",
      "nature and the environment", "music and concerts", "movies and entertainment",
      "daily morning routines", "hanging out with friends", "shopping for clothes",
      "pets and animals", "the weather and seasons", "holidays and vacations"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const seed = Date.now() + Math.floor(Math.random() * 10000);

    const systemPrompt = "You are an English language teacher creating a listening gap-fill exercise for students.";
    const prompt = `Seed: ${seed}
Topic: ${randomTopic}

Generate a short, high-quality listening comprehension passage (1-2 sentences) about ${randomTopic}.
Break the passage into a sequence of displaySegments where exactly 2 key single words are replaced by "gap" elements.

CRITICAL: Return ONLY a raw valid JSON object with no markdown code blocks using this exact schema:
{
  "fullText": "Full passage text...",
  "correctAnswers": ["word1", "word2"],
  "displaySegments": [
    { "type": "text", "value": "Prefix text " },
    { "type": "gap", "id": 1 },
    { "type": "text", "value": " middle text " },
    { "type": "gap", "id": 2 },
    { "type": "text", "value": " suffix text." }
  ]
}`;

    const randomFallback = GAP_FALLBACK_POOL[Math.floor(Math.random() * GAP_FALLBACK_POOL.length)];
    let gapData = randomFallback;

    try {
      const aiResponse = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]);

      if (aiResponse) {
        const cleaned = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.fullText && Array.isArray(parsed.correctAnswers) && Array.isArray(parsed.displaySegments)) {
            gapData = parsed;
          }
        }
      }
    } catch (err) {
      console.warn("[ES-ENGINE] generate-gap-fill AI failed, using fallback pool:", err);
    }

    return NextResponse.json(gapData);
  } catch (error: any) {
    console.error("Failed to generate dynamic gap fill:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

