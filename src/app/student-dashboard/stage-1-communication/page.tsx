import { Stage1Client } from "./components/Stage1Client";
import { Stage1ContentDTO, ActivityType } from "@/types/communication";

export const metadata = {
  title: "Stage 1: Communication | EduSync",
  description: "Improve your English communication skills with AI-powered challenges.",
};

export default function Stage1CommunicationPage() {
  // We no longer fetch mocked content from the database.
  // Instead, content is generated dynamically by AI inside the client modules.
  const emptyContentMap: Partial<Record<ActivityType, Stage1ContentDTO[]>> = {
    READING: [],
    LISTENING: [],
    WRITING: [],
    SPEAKING: [],
    VOCABULARY: [],
    AICHAT: [],
    CREATION: []
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Stage1Client initialContent={emptyContentMap} />
    </div>
  );
}
