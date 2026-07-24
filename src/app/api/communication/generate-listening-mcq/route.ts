import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { esChat } from "@/lib/es-engine";
import crypto from "crypto";

const FALLBACK_POOL = [
  {
    content: "I usually wake up at 7 AM. I brush my teeth, take a shower, and then have breakfast. For breakfast, I like to eat cereal and drink a cup of coffee. After that, I take the bus to work.",
    questions: [
      { id: 1, question: "What time does the speaker wake up?", options: ["6 AM", "7 AM", "8 AM", "9 AM"], correctIndex: 1 },
      { id: 2, question: "What does the speaker have for breakfast?", options: ["Eggs and toast", "Pancakes", "Cereal and coffee", "Oatmeal and juice"], correctIndex: 2 },
      { id: 3, question: "How does the speaker travel to work?", options: ["Walk", "By car", "By bus", "Train"], correctIndex: 2 }
    ]
  },
  {
    content: "Last weekend, Sarah went to the beach with her family. They built sandcastles, swam in the ocean, and ate delicious ice cream. In the evening, they watched the sunset before driving home.",
    questions: [
      { id: 1, question: "Where did Sarah go last weekend?", options: ["Mountain", "Beach", "Park", "Museum"], correctIndex: 1 },
      { id: 2, question: "What treat did they eat at the beach?", options: ["Pizza", "Burgers", "Ice cream", "Fruit salad"], correctIndex: 2 },
      { id: 3, question: "What did they do in the evening?", options: ["Watched sunset", "Went shopping", "Ate dinner at a restaurant", "Camped overnight"], correctIndex: 0 }
    ]
  },
  {
    content: "Alex bought a new laptop yesterday for his college studies. It is lightweight, fast, and has a great battery life. He spent the night setting up his favorite applications and organizing his study files.",
    questions: [
      { id: 1, question: "Why did Alex buy a new laptop?", options: ["For gaming", "For college studies", "For work", "As a gift"], correctIndex: 1 },
      { id: 2, question: "What is one feature of the new laptop?", options: ["Heavy", "Slow", "Great battery life", "Small screen"], correctIndex: 2 },
      { id: 3, question: "What did Alex do at night?", options: ["Slept early", "Set up applications", "Watched a movie", "Studied for an exam"], correctIndex: 1 }
    ]
  },
  {
    content: "Chef Marco opened a new Italian restaurant in the city center. The menu features homemade pasta, fresh wood-fired pizza, and classic tiramisu. Customers love the cozy atmosphere and friendly service.",
    questions: [
      { id: 1, question: "What type of restaurant did Chef Marco open?", options: ["French", "Italian", "Mexican", "Japanese"], correctIndex: 1 },
      { id: 2, question: "Where is the restaurant located?", options: ["Suburbs", "City center", "Near the beach", "Airport"], correctIndex: 1 },
      { id: 3, question: "What is listed on the menu?", options: ["Sushi", "Burgers", "Homemade pasta", "Tacos"], correctIndex: 2 }
    ]
  },
  {
    content: "Every rainy afternoon, Maya enjoys sitting near the window with a warm mug of hot chocolate. She listens to soft acoustic music while reading her favorite mystery novel.",
    questions: [
      { id: 1, question: "When does Maya sit near the window?", options: ["Sunny morning", "Rainy afternoon", "Late evening", "Cold night"], correctIndex: 1 },
      { id: 2, question: "What drink does she enjoy?", options: ["Hot tea", "Coffee", "Hot chocolate", "Lemonade"], correctIndex: 2 },
      { id: 3, question: "What book genre is she reading?", options: ["Sci-Fi", "Romance", "Mystery", "History"], correctIndex: 2 }
    ]
  }
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const systemPrompt = "You are an English language teacher creating unique listening comprehension passages and quizzes for students.";
    const topics = [
      "traveling to a new city", "school projects", "hobbies and free time",
      "technology and gadgets", "favorite foods and cooking", "sports and exercise",
      "nature and the environment", "music and concerts", "movies and entertainment",
      "daily morning routines", "hanging out with friends", "shopping for clothes",
      "pets and animals", "the weather and seasons", "holidays and vacations"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const seed = Date.now() + Math.floor(Math.random() * 10000);

    const prompt = `Session Seed: ${seed}
Topic: ${randomTopic}

Generate a short, engaging, brand-new English listening comprehension passage (2-3 sentences) about ${randomTopic}.
Then create exactly 3 multiple choice questions based on the passage. Each question must have 4 distinct options and a correctIndex (0-3).

CRITICAL: Return ONLY a raw valid JSON object with no markdown code blocks, using this structure:
{
  "content": "Full passage text...",
  "questions": [
    {
      "id": 1,
      "question": "Question 1 text?",
      "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
      "correctIndex": 0
    },
    {
      "id": 2,
      "question": "Question 2 text?",
      "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
      "correctIndex": 1
    },
    {
      "id": 3,
      "question": "Question 3 text?",
      "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
      "correctIndex": 2
    }
  ]
}`;

    // Select a random fallback from pool as base default
    const randomFallback = FALLBACK_POOL[Math.floor(Math.random() * FALLBACK_POOL.length)];
    let content = randomFallback.content;
    let questions = randomFallback.questions;

    try {
      const aiResponse = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]);

      if (aiResponse) {
        // Strip markdown backticks if present
        const cleaned = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.content && Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
            content = parsed.content;
            questions = parsed.questions.slice(0, 3).map((q: any, idx: number) => ({
              id: idx + 1,
              question: q.question || `Question ${idx + 1}`,
              options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ["Option A", "Option B", "Option C", "Option D"],
              correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : (typeof q.correct_index === "number" ? q.correct_index : 0)
            }));
          }
        }
      }
    } catch (err) {
      console.warn("[ES-ENGINE] generate-listening-mcq AI failed, using fallback pool:", err);
    }

    // Save the dynamic challenge to the database so it can be evaluated by evaluate-mcq
    const challengeId = `mcq-dynamic-${crypto.randomUUID()}`;
    
    // @ts-ignore
    const dynamicChallenge = await db.stage1Content.create({
      data: {
        id: challengeId,
        type: "LISTENING",
        title: "Listen & Answer",
        content,
        difficulty: "medium",
        questions: JSON.stringify(questions)
      }
    });

    return NextResponse.json({
      id: dynamicChallenge.id,
      type: "LISTENING",
      title: "Listen & Answer",
      content,
      difficulty: "medium",
      questions
    });
  } catch (error: any) {
    console.error("Failed to generate dynamic listening MCQ:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

