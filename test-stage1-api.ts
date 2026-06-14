import { PrismaClient } from "@prisma/client";
import { evaluateMCQ } from "./src/lib/communication-service";

const prisma = new PrismaClient();

async function main() {
  console.log("Running End-to-End Test for Stage 1 Communication...");

  // 1. Get the seeded student
  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" }
  });

  if (!student) {
    throw new Error("No student found in DB. Did you run the main seed?");
  }
  
  console.log(`Testing with student: ${student.name} (XP: ${student.xp}, Coins: ${student.coins})`);
  const initialXp = student.xp;

  // 2. Get a Reading challenge
  // @ts-ignore: Bypassing stale IDE cache
  const readingChallenge = await prisma.stage1Content.findFirst({
    where: { type: "READING" }
  });

  if (!readingChallenge) throw new Error("No reading challenge found");

  // 3. Get a Listening challenge
  // @ts-ignore: Bypassing stale IDE cache
  const listeningChallenge = await prisma.stage1Content.findFirst({
    where: { type: "LISTENING" }
  });

  if (!listeningChallenge) throw new Error("No listening challenge found");

  // Parse questions to get correct answers
  const readQs = JSON.parse(readingChallenge.questions!);
  const listenQs = JSON.parse(listeningChallenge.questions!);

  // 4. Simulate a perfect Reading submission
  console.log("\nSubmitting Reading Challenge...");
  const readResult = await evaluateMCQ(student.id, {
    contentId: readingChallenge.id,
    answers: readQs.map((q: any) => ({
      questionId: q.id,
      answerIndex: q.correctIndex
    }))
  });
  console.log("Reading Result:", readResult);

  // 5. Simulate a perfect Listening submission
  console.log("\nSubmitting Listening Challenge...");
  const listenResult = await evaluateMCQ(student.id, {
    contentId: listeningChallenge.id,
    answers: listenQs.map((q: any) => ({
      questionId: q.id,
      answerIndex: q.correctIndex
    }))
  });
  console.log("Listening Result:", listenResult);

  // 6. Verify XP and Activities
  const updatedStudent = await prisma.user.findUnique({
    where: { id: student.id }
  });

  console.log(`\nUpdated student XP: ${updatedStudent?.xp} (Expected: ${initialXp + readResult.xpAwarded + listenResult.xpAwarded})`);
  
  if (updatedStudent?.xp === initialXp + readResult.xpAwarded + listenResult.xpAwarded) {
    console.log("✅ XP updated successfully!");
  } else {
    console.log("❌ XP update failed!");
  }

  // @ts-ignore: Bypassing stale IDE cache
  const activities = await prisma.stage1Activity.findMany({
    where: { userId: student.id },
    orderBy: { createdAt: "desc" },
    take: 2
  });

  if (activities.length >= 2) {
    console.log("✅ Stage1Activities saved successfully!");
    console.log("Recent Activities:", activities.map((a: any) => ({ type: a.type, score: a.score, xp: a.xpAwarded })));
  } else {
    console.log("❌ Activities not saved correctly!");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
