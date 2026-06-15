import { PrismaClient } from "@prisma/client";
import { evaluateWriting, evaluateSpeaking } from "./src/lib/ai-evaluation-service";
import "dotenv/config";

const prisma = new PrismaClient();

async function run() {
  console.log("Starting E2E test for Writing & Speaking...");

  const student = await prisma.user.findUnique({
    where: { email: "student@test.com" }
  });

  if (!student) throw new Error("Student not found");

  const initialXp = student.xp;

  // Since we might not have a WRITING content seeded, let's create a temporary one
  // Wait, let's check if there's any.
  let writingChallenge = await prisma.stage1Content.findFirst({
    where: { type: "WRITING" }
  });

  if (!writingChallenge) {
    writingChallenge = await prisma.stage1Content.create({
      data: {
        type: "WRITING",
        title: "Test Writing",
        content: "Write a short paragraph about your favorite hobby.",
        difficulty: "easy",
        // @ts-ignore
        xpReward: 30
      }
    });
  }

  let speakingChallenge = await prisma.stage1Content.findFirst({
    where: { type: "SPEAKING" }
  });

  if (!speakingChallenge) {
    speakingChallenge = await prisma.stage1Content.create({
      data: {
        type: "SPEAKING",
        title: "Test Speaking",
        content: "Hello, my name is Alex and I like to code.",
        difficulty: "easy",
        // @ts-ignore
        xpReward: 30
      }
    });
  }

  console.log("\nTesting Writing Evaluation...");
  const writingResult = await evaluateWriting(
    student.id, 
    writingChallenge.id, 
    "My favorite hobby is playing video games. I like to play action games with my friends online."
  );
  console.log("Writing Result:", JSON.stringify(writingResult, null, 2));

  console.log("\nTesting Speaking Evaluation...");
  const speakingResult = await evaluateSpeaking(
    student.id,
    speakingChallenge.id,
    "Hello my name is Alex and I like to code"
  );
  console.log("Speaking Result:", JSON.stringify(speakingResult, null, 2));

  const updatedStudent = await prisma.user.findUnique({
    where: { id: student.id }
  });

  console.log(`\nUpdated student XP: ${updatedStudent?.xp} (Expected: ${initialXp + writingResult.xpAwarded + speakingResult.xpAwarded})`);

  // @ts-ignore
  const activities = await prisma.stage1Activity.findMany({
    where: { userId: student.id, type: { in: ["WRITING", "SPEAKING"] } },
    orderBy: { createdAt: "desc" },
    take: 2
  });

  console.log("\nRecent Activities Stored JSON Feedback:");
  activities.forEach(a => {
    console.log(`Type: ${a.type}, Score: ${a.score}`);
    console.log(`Feedback JSON:`, a.feedback);
  });
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
