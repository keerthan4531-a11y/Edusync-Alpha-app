import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { esChat } from "@/lib/es-engine";
import { safeJsonParse } from "@/lib/utils";
import crypto from "crypto";

const READING_FALLBACK_POOL = [
  {
    title: "The Lost Key",
    passage: "Sarah was walking down the quiet street when she saw something shiny on the ground. It was an old, ornate key. She wondered what secret door it might open, so she put it carefully in her pocket and hurried home.",
    questions: [
      {
        id: 1,
        question: "What did Sarah find on the ground?",
        options: ["A coin", "An ornate key", "A ring", "A piece of glass"],
        correctIndex: 1
      },
      {
        id: 2,
        question: "How did the key look?",
        options: ["New and plastic", "Old and ornate", "Broken", "Golden"],
        correctIndex: 1
      },
      {
        id: 3,
        question: "Where did Sarah put the key?",
        options: ["In her pocket", "In her bag", "On the ground", "In a box"],
        correctIndex: 0
      }
    ]
  },
  {
    title: "Ocean Exploration",
    passage: "Deep below the surface of the ocean, scientists discovered a glowing species of jellyfish. These creatures emit vibrant blue light to communicate with each other in total darkness. Researchers were amazed by how adaptable sea life can be.",
    questions: [
      {
        id: 1,
        question: "Where did scientists discover the glowing jellyfish?",
        options: ["In a lake", "Deep below the ocean surface", "On a beach", "In a river"],
        correctIndex: 1
      },
      {
        id: 2,
        question: "Why do the jellyfish emit light?",
        options: ["To scare fish", "To communicate with each other", "To produce heat", "To float higher"],
        correctIndex: 1
      },
      {
        id: 3,
        question: "What color light do they emit?",
        options: ["Vibrant blue", "Bright red", "Dark green", "Yellow"],
        correctIndex: 0
      }
    ]
  }
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email && !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let difficulty = "medium";
    try {
      const body = await req.json();
      if (body?.difficulty) difficulty = String(body.difficulty).toLowerCase();
    } catch {}

    const randomFallback = READING_FALLBACK_POOL[Math.floor(Math.random() * READING_FALLBACK_POOL.length)];
    let title = randomFallback.title;
    let passage = randomFallback.passage;
    let parsedQuestions = randomFallback.questions;

    const systemPrompt = `You are an English teacher generating a reading comprehension exercise.
Return ONLY a valid JSON object:
{
  "title": "A Day at the Zoo",
  "passage": "The quick brown fox jumps over the lazy dog. The fox was very hungry and decided to look for food.",
  "questions": [
    {
      "id": 1,
      "question": "What color was the fox?",
      "options": ["Red", "Brown", "Black", "White"],
      "correctIndex": 1
    },
    {
      "id": 2,
      "question": "What was the fox jumping over?",
      "options": ["A fence", "A log", "A lazy dog", "A river"],
      "correctIndex": 2
    },
    {
      "id": 3,
      "question": "How was the fox feeling?",
      "options": ["Tired", "Hungry", "Angry", "Happy"],
      "correctIndex": 1
    }
  ]
}`;

    const topics = [
      "a thrilling adventure in a magical forest",
      "the life cycle of a butterfly",
      "a history of the first airplane",
      "an exciting basketball game",
      "a deep sea exploration submarine",
      "a mysterious haunted house",
      "how solar panels generate electricity",
      "a journey to the planet Mars",
      "the daily routine of a firefighter",
      "a story about finding a lost treasure"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `Generate a ${difficulty} level reading passage (about 4-5 sentences) about ${randomTopic} with a title and 3 multiple-choice comprehension questions with 4 options each.`;

    try {
      const aiResponse = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]);

      if (aiResponse) {
        const data = safeJsonParse<{ title?: string; passage?: string; questions?: any[] }>(aiResponse);
        if (data?.passage && Array.isArray(data?.questions) && data.questions.length >= 3) {
          title = data.title || "Reading Practice";
          passage = data.passage;
          parsedQuestions = data.questions;
        }
      }
    } catch (err) {
      console.warn("[ES-ENGINE] generate-reading-mcq AI call failed, using fallback:", err);
    }

    const challengeId = `reading-dynamic-${crypto.randomUUID()}`;
    
    // Save to DB
    const dynamicChallenge = await db.stage1Content.create({
      data: {
        id: challengeId,
        type: "READING",
        title,
        content: passage,
        difficulty,
        questions: JSON.stringify(parsedQuestions)
      }
    });

    return NextResponse.json({
      id: dynamicChallenge.id,
      type: "READING",
      title,
      content: passage,
      difficulty,
      questions: parsedQuestions
    });
  } catch (error: any) {
    console.error("Failed to generate dynamic reading challenge:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
