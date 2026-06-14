"use client";

import { useState } from "react";
import { Stage1ContentDTO, ActivityType } from "@/types/communication";
import { ReadingModule } from "./ReadingModule";
import { ListeningModule } from "./ListeningModule";

import { WritingModule } from "./WritingModule";
import { SpeakingModule } from "./SpeakingModule";

interface Stage1ClientProps {
  initialContent: Record<ActivityType, Stage1ContentDTO[]>;
}

const TABS: { id: ActivityType; label: string; icon: string }[] = [
  { id: "READING", label: "Reading Comprehension", icon: "📚" },
  { id: "LISTENING", label: "Listening Practice", icon: "🎧" },
  { id: "WRITING", label: "AI Writing Tutor", icon: "✍️" },
  { id: "SPEAKING", label: "Speech & Roleplay", icon: "🎤" },
];

export function Stage1Client({ initialContent }: Stage1ClientProps) {
  const [activeTab, setActiveTab] = useState<ActivityType>("READING");
  
  // For simplicity, we just take a random or the first active content for the selected tab
  // In a full app, you'd have a list of challenges to choose from.
  const activeContentList = initialContent[activeTab];
  const currentChallenge = activeContentList.length > 0 ? activeContentList[0] : null;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? "bg-stage1 text-white shadow-lg shadow-stage1/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
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
            onNext={() => setActiveTab("WRITING")} 
          />
        )}
        
        {activeTab === "WRITING" && (
          <WritingModule 
            content={currentChallenge} 
            onNext={() => setActiveTab("SPEAKING")} 
          />
        )}

        {activeTab === "SPEAKING" && (
          <SpeakingModule 
            content={currentChallenge} 
            onFinish={() => {
              // Usually would redirect to dashboard or show confetti
              alert("Stage 1 completed! Great job.");
              window.location.href = "/student-dashboard";
            }} 
          />
        )}
      </div>
    </div>
  );
}
