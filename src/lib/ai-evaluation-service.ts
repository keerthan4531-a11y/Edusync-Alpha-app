import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";
import { getGeminiModel } from "@/lib/gemini-client";

export async function evaluateWriting(userId: string, contentId: string, submissionText: string) {
  // @ts-ignore: Bypassing stale IDE cache
  const content = await db.stage1Content.findUnique({
    where: { id: contentId }
  });

  if (!content) {
    throw new Error("Content not found");
  }

  const model = getGeminiModel("gemini-1.5-flash");

  // Gemini Prompt for Writing Evaluation
  // Expected response: JSON object with score, feedback, tamilFeedback, grammar, vocabulary
  const prompt = `You are a strict but encouraging English teacher evaluating an ESL student's writing.
  
  Writing Prompt: "${content.content}"
  Student's Submission: "${submissionText}"
  
  Evaluate the submission based on:
  1. Relevance to the prompt
  2. Grammar and syntax
  3. Vocabulary usage
  
  Return your response as a valid JSON object ONLY. Do NOT wrap it in markdown blockquotes like \`\`\`json.
  {
      "score": integer (0-100),
      "feedback": "Two sentences of professional, constructive feedback in English",
      "tamilFeedback": "A clear professional explanation in Tamil with suggestions for improvement",
      "grammarIssues": ["list of specific grammar mistakes, if any"],
      "vocabularySuggestions": ["suggested better words to use"]
  }`;

  let parsedResponse;
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from Gemini response
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    parsedResponse = JSON.parse(cleanJson);
  } catch (e) {
    console.error("Gemini writing evaluation failed or returned malformed JSON:", e);
    // Sensible fallback so the UI doesn't break
    parsedResponse = {
      score: 50,
      feedback: "AI evaluation is temporarily unavailable. We've recorded your submission.",
      tamilFeedback: "செயற்கை நுண்ணறிவு மதிப்பீடு தற்காலிகமாக கிடைக்கவில்லை. உங்கள் பதிவு சேமிக்கப்பட்டது.",
      grammarIssues: [],
      vocabularySuggestions: []
    };
  }

  const score = Math.max(0, Math.min(100, parsedResponse.score || 0));
  
  let xpAwarded = 0;
  if (score >= 80) xpAwarded = 30;
  else if (score >= 50) xpAwarded = 15;
  else xpAwarded = 5; // Base effort XP

  // @ts-ignore: Bypassing stale IDE cache
  await db.stage1Activity.create({
    data: {
      userId,
      contentId,
      type: "WRITING",
      score,
      xpAwarded,
      feedback: JSON.stringify(parsedResponse)
    }
  });

  if (xpAwarded > 0) {
    await awardXp(userId, xpAwarded, `Completed Stage 1 WRITING with ${score}% score`);
  }

  return {
    success: true,
    score,
    xpAwarded,
    evaluation: parsedResponse
  };
}

export async function evaluateSpeaking(userId: string, contentId: string, transcribedText: string) {
  // @ts-ignore: Bypassing stale IDE cache
  const content = await db.stage1Content.findUnique({
    where: { id: contentId }
  });

  if (!content) {
    throw new Error("Content not found");
  }

  const model = getGeminiModel("gemini-1.5-flash");

  // Gemini Prompt for Speaking Evaluation
  // Expected response: JSON object with score, feedback, tamilFeedback, mispronouncedWords
  const prompt = `You are a friendly English speech coach evaluating an ESL student's pronunciation.
  
  Reference Text: "${content.content}"
  Transcribed Speech (what the student said): "${transcribedText}"
  
  Compare the transcribed speech with the reference text. Evaluate their accuracy (0-100), identifying small typos versus serious misunderstandings or skipped words.
  
  Return your response as a valid JSON object ONLY. Do NOT wrap it in markdown blockquotes like \`\`\`json.
  {
      "score": integer (0-100),
      "feedback": "Two sentences of encouraging feedback in English",
      "tamilFeedback": "A clear professional explanation in Tamil",
      "mispronouncedWords": ["words they missed or likely mispronounced based on the transcript differences"]
  }`;

  let parsedResponse;
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from Gemini response
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    parsedResponse = JSON.parse(cleanJson);
  } catch (e) {
    console.error("Gemini speaking evaluation failed or returned malformed JSON:", e);
    parsedResponse = {
      score: 50,
      feedback: "AI pronunciation evaluation is temporarily unavailable.",
      tamilFeedback: "செயற்கை நுண்ணறிவு மதிப்பீடு தற்காலிகமாக கிடைக்கவில்லை.",
      mispronouncedWords: []
    };
  }

  const score = Math.max(0, Math.min(100, parsedResponse.score || 0));
  
  let xpAwarded = 0;
  if (score >= 80) xpAwarded = 30;
  else if (score >= 50) xpAwarded = 15;
  else xpAwarded = 5;

  // @ts-ignore: Bypassing stale IDE cache
  await db.stage1Activity.create({
    data: {
      userId,
      contentId,
      type: "SPEAKING",
      score,
      xpAwarded,
      feedback: JSON.stringify(parsedResponse)
    }
  });

  if (xpAwarded > 0) {
    await awardXp(userId, xpAwarded, `Completed Stage 1 SPEAKING with ${score}% score`);
  }

  return {
    success: true,
    score,
    xpAwarded,
    evaluation: parsedResponse
  };
}
