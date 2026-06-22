import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateResponseTurbo, type INIXAMessage } from "@/lib/inixa-ai";
import { ActivityType } from "@/types/communication";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleType, difficulty = "Intermediate" } = await req.json();

    if (!moduleType) {
      return NextResponse.json({ error: "Module type is required" }, { status: 400 });
    }

    let systemPrompt = "You are an expert English language tutor creating interactive exercises.";
    let promptText = "";

    switch (moduleType as ActivityType) {
      case "READING":
        promptText = `Generate a ${difficulty} level reading comprehension passage (approx 150-200 words) about a random engaging topic. 
        Then, create 3 multiple-choice questions based on the passage.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Passage Title",
          "content": "The full passage text here...",
          "questions": [
            {
              "id": 1,
              "question": "Question text?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 0,
              "explanation": "Why this is correct"
            }
          ]
        }`;
        break;
      case "LISTENING":
        promptText = `Generate a ${difficulty} level short monologue or dialogue script (approx 100-150 words) about an everyday situation.
        Then, create 3 multiple-choice questions testing listening comprehension.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Audio Transcript Title",
          "content": "The full transcript text here...",
          "questions": [
            {
              "id": 1,
              "question": "Question text?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 0,
              "explanation": "Why this is correct"
            }
          ]
        }`;
        break;
      case "LISTENING_FILL":
        promptText = `Generate a ${difficulty} level short monologue transcript (approx 100-150 words) about an everyday routine or event.
        Then, create 2 fill-in-the-blank questions based on the script details.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Transcription Fill Challenge",
          "content": "The full transcript text here...",
          "questions": [
            {
              "id": 1,
              "question": "The first fill-in-the-blank question, e.g., 'The speaker wakes up at ______.'",
              "answer": "7 AM"
            },
            {
              "id": 2,
              "question": "The second fill-in-the-blank question, e.g., 'He enjoys drinking ______.'",
              "answer": "coffee"
            }
          ]
        }`;
        break;
      case "LISTENING_DIRECTIONS":
        promptText = `Generate a ${difficulty} level map navigation listening exercise on a 5x5 grid (coordinates 0 to 4 for rows and cols).
        You need to define a starting junction, a destination junction, a list of 2 landmarks, a set of verbal navigation directions, and the exact step-by-step path coordinates to get there.
        Note: The path must only make grid steps (North, South, East, West). No diagonal steps.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Listening Map Navigation",
          "content": "Verbal directions description, e.g., 'Start at green node (1, 1). Walk east past the Cafe, then turn south...'",
          "gridSize": 5,
          "start": { "row": 0, "col": 0 },
          "end": { "row": 2, "col": 2 },
          "landmarks": [
            { "name": "Cafe", "row": 0, "col": 1 },
            { "name": "Library", "row": 1, "col": 2 }
          ],
          "correctPath": [
            { "row": 0, "col": 0 },
            { "row": 0, "col": 1 },
            { "row": 0, "col": 2 },
            { "row": 1, "col": 2 },
            { "row": 2, "col": 2 }
          ]
        }`;
        break;
      case "LISTENING_TONE":
        promptText = `Generate a ${difficulty} level short monologue (1-2 sentences) spoken with a very strong emotional tone (excited, anxious, sad, angry, apologetic, etc.).
        Create 1 multiple-choice question asking the student to analyze the emotional tone of the speaker.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Emotional Tone Analysis",
          "content": "The monologue text containing clear emotional clues here...",
          "questions": [
            {
              "id": 1,
              "question": "What is the emotional tone of the speaker?",
              "options": ["Excited", "Sad", "Angry", "Calm"],
              "correctIndex": 0
            }
          ]
        }`;
        break;
      case "WRITING":
        promptText = `Generate a ${difficulty} level creative writing prompt. It should ask the student to write a paragraph (at least 3-4 sentences) expressing their opinion or describing an experience.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Writing Challenge Title",
          "content": "The writing prompt text detailing what the student should write about."
        }`;
        break;
      case "WRITING_IMAGE":
        promptText = `Generate a ${difficulty} level picture description prompt. Provide a detailed descriptive text-to-image prompt that will be rendered for the student, and write the matching description outline they must replicate.
        IMPORTANT: Create a COMPLETELY RANDOM, unique scene every time! (e.g., sci-fi city, bustling alien market, underwater base, peaceful snowy forest, medieval castle). DO NOT just use the cozy cafe example!
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Creative Scene Describer",
          "content": "A detailed descriptive prompt describing the visual scene you imagined.",
          "imagePrompt": "The text-to-image prompt to use to generate the image."
        }`;
        break;
      case "WRITING_REWRITE":
        promptText = `Generate a ${difficulty} level sentence rewrite exercise. Provide a simple/boring sentence using basic English words.
        List 2 or 3 of these basic words as banned filter words, and suggest advanced alternative adjectives as hints.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Advanced Vocabulary Rewrite",
          "content": "The simple/boring sentence, e.g., 'The weather was very good and I felt happy.'",
          "banned": ["good", "happy", "very"],
          "hints": {
            "good": ["splendid", "pleasant", "delightful"],
            "happy": ["thrilled", "joyful", "ecstatic"],
            "very": ["incredibly", "exceptionally"]
          }
        }`;
        break;
      case "SPEAKING":
        promptText = `Generate a ${difficulty} level speaking prompt. It should give a scenario or topic for the student to speak about for 1 minute. Provide 3 bullet points they must include in their speech.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Speaking Topic",
          "content": "The speaking prompt scenario...",
          "bulletPoints": ["Point 1", "Point 2", "Point 3"]
        }`;
        break;
      case "SPEAKING_SHADOW":
        promptText = `Generate a ${difficulty} level inspiring or philosophical sentence (8-15 words) suitable for pronunciation repetition/shadowing practice.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Shadow repetition challenge",
          "content": "The inspiring sentence here, e.g., 'Clear communication is the bridge between confusion and clarity.'"
        }`;
        break;
      case "SPEAKING_ANALYZER":
        promptText = `Generate a ${difficulty} level speaking presentation topic. It should ask the student to speak for 1 minute on an engaging subject. Provide 3 bullet points they should address.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Presentation Pitch Topic",
          "content": "The speaking presentation prompt, e.g., 'Explain the advantages of renewable energy sources.'",
          "bulletPoints": ["Point 1", "Point 2", "Point 3"]
        }`;
        break;
      default:
        return NextResponse.json({ error: "Invalid module type" }, { status: 400 });
    }

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: promptText }
    ];

    const result = await generateResponseTurbo(
      messages,
      {
        stage: "stage-1",
        feature: "chat",
        role: session.user.role || "STUDENT",
        userId: session.user.id,
      },
      0.7
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to generate AI response");
    }

    // Try to parse the JSON output
    let parsedData;
    try {
      const text = result.response;
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI output as JSON:", result.response);
      return NextResponse.json({ error: "AI produced invalid format. Please try again." }, { status: 500 });
    }

    // Store in Prisma database so it is evaluatable by id
    let questionsField = null;
    if (parsedData.questions) {
      questionsField = JSON.stringify(parsedData.questions);
    } else if (parsedData.bulletPoints) {
      questionsField = JSON.stringify({ bulletPoints: parsedData.bulletPoints });
    } else if (moduleType === "LISTENING_DIRECTIONS") {
      questionsField = JSON.stringify({
        gridSize: parsedData.gridSize,
        start: parsedData.start,
        end: parsedData.end,
        landmarks: parsedData.landmarks,
        correctPath: parsedData.correctPath
      });
    } else if (moduleType === "WRITING_REWRITE") {
      questionsField = JSON.stringify({
        banned: parsedData.banned,
        hints: parsedData.hints
      });
    } else if (moduleType === "WRITING_IMAGE") {
      questionsField = JSON.stringify({
        imagePrompt: parsedData.imagePrompt
      });
    }

    // SQLite/Prisma create record
    // @ts-ignore
    const savedChallenge = await db.stage1Content.create({
      data: {
        type: moduleType,
        title: parsedData.title || `${moduleType} Challenge`,
        content: parsedData.content || "",
        questions: questionsField,
        difficulty: difficulty.toLowerCase(),
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      challenge: {
        id: savedChallenge.id,
        type: savedChallenge.type as ActivityType,
        title: savedChallenge.title,
        content: savedChallenge.content,
        difficulty: savedChallenge.difficulty,
        // DTO field mapping
        questions: parsedData.questions || null,
        bulletPoints: parsedData.bulletPoints || null,
        imagePrompt: parsedData.imagePrompt || null,
        banned: parsedData.banned || null,
        hints: parsedData.hints || null,
        gridSize: parsedData.gridSize || null,
        start: parsedData.start || null,
        end: parsedData.end || null,
        landmarks: parsedData.landmarks || null,
        correctPath: parsedData.correctPath || null
      },
      modelUsed: result.modelUsed,
      responseTime: result.responseTime
    });

  } catch (error: any) {
    console.error("Generate Challenge API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
