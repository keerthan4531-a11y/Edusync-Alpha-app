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

    const systemPrompt = `You are an English teacher generating a reading comprehension exercise.
Respond ONLY with a valid JSON object. Do not include markdown formatting or backticks.
Format:
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

    const prompt = `Generate a short reading passage (about 4-5 sentences) about ${randomTopic}.
Provide a suitable title.
Then, generate exactly 3 multiple-choice comprehension questions based on the passage. Each question must have 4 options and state the 0-based index of the correct option.`;

    // Fallback data
    let title = "The Lost Key";
    let passage = "Sarah was walking down the street when she saw something shiny on the ground. It was an old, rusty key. She wondered what it might open, so she put it in her pocket and hurried home.";
    let parsedQuestions = [
      {
        id: 1,
        question: "What did Sarah find on the ground?",
        options: ["A coin", "A shiny key", "A ring", "A piece of glass"],
        correctIndex: 1
      },
      {
        id: 2,
        question: "How did the key look?",
        options: ["New and shiny", "Old and rusty", "Broken", "Golden"],
        correctIndex: 1
      },
      {
        id: 3,
        question: "Where did Sarah put the key?",
        options: ["In her pocket", "In her bag", "On the ground", "In a box"],
        correctIndex: 0
      }
    ];

    try {
      const aiResponse = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]);

      if (aiResponse) {
        let cleanJson = aiResponse.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.replace(/```json/g, "").replace(/```/g, "").trim();
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/```/g, "").trim();
        }
        
        const data = JSON.parse(cleanJson);
        if (data.passage && data.questions && data.questions.length === 3) {
          title = data.title || "Reading Practice";
          passage = data.passage;
          parsedQuestions = data.questions;
        }
      }
    } catch (err) {
      console.warn("[ES-ENGINE] generate-reading-mcq AI failed, using fallback:", err);
    }

    const challengeId = `reading-mcq-${crypto.randomUUID()}`;
    
    // Save to DB
    // @ts-ignore
    const dynamicChallenge = await db.stage1Content.create({
      data: {
        id: challengeId,
        type: "READING",
        title: title,
        content: passage,
        difficulty: "medium",
        questions: JSON.stringify(parsedQuestions)
      }
    });

    return NextResponse.json({
      success: true,
      id: dynamicChallenge.id,
      title: title,
      content: passage,
      questions: parsedQuestions
    });
  } catch (error: any) {
    console.error("Failed to generate dynamic reading mcq:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
