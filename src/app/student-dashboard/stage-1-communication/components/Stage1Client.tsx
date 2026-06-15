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

const MAIN_FEATURES = [
  { id: "LISTENING" as const, label: "Listening", icon: Headphones, color: "text-blue-400", bgColor: "bg-blue-400/10", borderColor: "border-blue-400/20" },
  { id: "READING" as const, label: "Reading", icon: BookOpen, color: "text-indigo-400", bgColor: "bg-indigo-400/10", borderColor: "border-indigo-400/20" },
  { id: "WRITING" as const, label: "Writing", icon: PenTool, color: "text-emerald-400", bgColor: "bg-emerald-400/10", borderColor: "border-emerald-400/20" },
  { id: "SPEAKING" as const, label: "Speaking", icon: Mic, color: "text-orange-400", bgColor: "bg-orange-400/10", borderColor: "border-orange-400/20" },
  { id: "VOCABULARY" as const, label: "Vocabulary", icon: BookOpenCheck, color: "text-rose-400", bgColor: "bg-rose-400/10", borderColor: "border-rose-400/20" },
  { id: "AICHAT" as const, label: "AI Convo", icon: MessageSquareCode, color: "text-purple-400", bgColor: "bg-purple-400/10", borderColor: "border-purple-400/20" },
];

export function Stage1Client({ initialContent }: Stage1ClientProps) {
  const [activeTab, setActiveTab] = useState<ActivityType | null>(null);
  
  // Safe retrieval for reading/listening/writing/speaking list items
  const activeContentList = activeTab ? (initialContent[activeTab as keyof typeof initialContent] || []) : [];
  const currentChallenge = activeContentList.length > 0 ? activeContentList[0] : null;

  if (!activeTab) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8">
        {MAIN_FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${feature.bgColor} ${feature.borderColor} border transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-10 h-10 ${feature.color}`} strokeWidth={1.5} />
              </div>
              <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">
                {feature.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
        <button 
          onClick={() => setActiveTab(null)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Modules
        </button>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pr-2">
          {MAIN_FEATURES.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <IconComponent className={`w-4 h-4 transition-colors ${isActive ? "text-white" : "text-gray-400"}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
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
