"use client";

import { useState } from "react";
import { Stage1ContentDTO, ActivityType } from "@/types/communication";
import { ReadingModule } from "./ReadingModule";
import { ListeningModule } from "./ListeningModule";
import { WritingModule } from "./WritingModule";
import { SpeakingModule } from "./SpeakingModule";
import { VocabularyModule } from "./VocabularyModule";
import { AIChatModule } from "./AIChatModule";
import { 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  BookOpenCheck, 
  MessageSquareCode 
} from "lucide-react";

interface Stage1ClientProps {
  initialContent: Record<ActivityType, Stage1ContentDTO[]>;
}

const TABS = [
  { id: "READING" as const, label: "Reading Comprehension", icon: BookOpen },
  { id: "LISTENING" as const, label: "Listening Practice", icon: Headphones },
  { id: "WRITING" as const, label: "AI Writing Tutor", icon: PenTool },
  { id: "SPEAKING" as const, label: "Speech & Roleplay", icon: Mic },
  { id: "VOCABULARY" as const, label: "Vocabulary Builder", icon: BookOpenCheck },
  { id: "AICHAT" as const, label: "AI Chat Assistant", icon: MessageSquareCode },
];

export function Stage1Client({ initialContent }: Stage1ClientProps) {
  const [activeTab, setActiveTab] = useState<ActivityType>("READING");
  
  // Safe retrieval for reading/listening/writing/speaking list items
  const activeContentList = initialContent[activeTab as keyof typeof initialContent] || [];
  const currentChallenge = activeContentList.length > 0 ? activeContentList[0] : null;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth">
        {TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <IconComponent className={`w-4 h-4 transition-colors ${isActive ? "text-white" : "text-gray-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Module Rendering */}
      <div className="mt-8">
        {activeTab === "READING" && (
          <ReadingModule 
            content={currentChallenge} 
            onNext={() => setActiveTab("LISTENING")} 
          />
        )}
        
        {activeTab === "LISTENING" && (
          <ListeningModule 
            content={currentChallenge} 
            challenges={activeContentList}
            onNext={() => setActiveTab("WRITING")} 
          />
        )}
        
        {activeTab === "WRITING" && (
          <WritingModule 
            content={currentChallenge} 
            challenges={activeContentList}
            onNext={() => setActiveTab("SPEAKING")} 
          />
        )}

        {activeTab === "SPEAKING" && (
          <SpeakingModule 
            content={currentChallenge} 
            challenges={activeContentList}
            onFinish={() => {
              setActiveTab("VOCABULARY");
            }} 
          />
        )}

        {activeTab === "VOCABULARY" && (
          <VocabularyModule />
        )}

        {activeTab === "AICHAT" && (
          <AIChatModule />
        )}
      </div>
    </div>
  );
}
