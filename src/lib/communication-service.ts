import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";
import { EvaluateRequestInput } from "@/schemas/communication";
import { Question } from "@/types/communication";

export async function evaluateMCQ(userId: string, data: EvaluateRequestInput) {
  // 1. Fetch content and questions
  const content = await db.stage1Content.findUnique({
    where: { id: data.contentId }
  });

  if (!content) {
    throw new Error("Content not found");
  }

  if (!content.questions) {
    throw new Error("Content has no evaluatable questions");
  }

  const questions: Question[] = JSON.parse(content.questions);

  // 2. Evaluate answers
  let correctCount = 0;
  let totalCount = questions.length;

  for (const q of questions) {
    const userAnswer = data.answers.find(a => a.questionId === q.id);
    if (userAnswer && userAnswer.answerIndex === q.correctIndex) {
      correctCount++;
    }
  }

  const score = Math.round((correctCount / totalCount) * 100);

  // 3. Determine XP based on score
  let xpAwarded = 0;
  if (score === 100) {
    xpAwarded = 20; // Perfect score
  } else if (score >= 50) {
    xpAwarded = 10; // Partial score
  }

  // 4. Record Activity
  let feedback = `You scored ${score}% (${correctCount}/${totalCount} correct).`;
  let tamilFeedback = `நீங்கள் ${score}% மதிப்பெண் பெற்றுள்ளீர்கள் (${correctCount}/${totalCount} சரியானவை).`;
  
  if (score === 100) {
    feedback += " Excellent work!";
    tamilFeedback += " அருமையான முயற்சி!";
  } else {
    feedback += " Keep practicing!";
    tamilFeedback += " தொடர்ந்து பயிற்சி செய்யுங்கள்!";
  }

  await db.stage1Activity.create({
    data: {
      userId,
      contentId: content.id,
      type: content.type,
      score,
      xpAwarded,
      feedback: JSON.stringify({ english: feedback, tamil: tamilFeedback })
    }
  });

  // 5. Award XP
  if (xpAwarded > 0) {
    await awardXp(userId, xpAwarded, `Completed Stage 1 ${content.type} with ${score}% score`);
  }

  return {
    success: true,
    score,
    xpAwarded,
    feedback,
    tamilFeedback
  };
}
