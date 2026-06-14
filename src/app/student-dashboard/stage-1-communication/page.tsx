import { db } from "@/lib/db";
import { Stage1Client } from "./components/Stage1Client";
import { Stage1ContentDTO, ActivityType, Question } from "@/types/communication";

export const metadata = {
  title: "Stage 1: Communication | EduSync",
  description: "Improve your English communication skills with AI-powered challenges.",
};

export default async function Stage1CommunicationPage() {
  // Fetch all active content for Stage 1
  const rawContent = await db.stage1Content.findMany({
    where: { isActive: true }
  });

  // Map to DTO, parsing JSON safely
  const contentMap: Record<ActivityType, Stage1ContentDTO[]> = {
    READING: [],
    LISTENING: [],
    WRITING: [],
    SPEAKING: []
  };

  rawContent.forEach(item => {
    try {
      const type = item.type as ActivityType;
      if (!contentMap[type]) return;
      
      let parsedQuestions: Question[] | null = null;
      if (item.questions) {
        parsedQuestions = JSON.parse(item.questions);
      }

      contentMap[type].push({
        id: item.id,
        type,
        title: item.title,
        content: item.content,
        questions: parsedQuestions,
        difficulty: item.difficulty
      });
    } catch (e) {
      console.error(`Failed to parse questions for content ID ${item.id}`, e);
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Stage 1: Communication</h1>
        <p className="text-gray-400 text-lg">
          Master English through interactive reading, listening, writing, and speaking exercises powered by Inixa AI.
        </p>
      </div>

      <Stage1Client initialContent={contentMap} />
    </div>
  );
}
