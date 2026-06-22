"use client";

import { useState } from "react";
import { Stage1ContentDTO, ActivityType } from "@/types/communication";
import { ReadingModule } from "./ReadingModule";
import { ListeningModule } from "./ListeningModule";
import { WritingModule } from "./WritingModule";
import { SpeakingModule } from "./SpeakingModule";
import { VocabularyModule } from "./VocabularyModule";
import { AIChatModule } from "./AIChatModule";
import { ImageCreationModule } from "./ImageCreationModule";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  BookOpenCheck, 
  MessageSquareCode,
  Image as ImageIcon,
  ChevronLeft
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
  { id: "CREATION" as const, label: "Visual Expression", icon: ImageIcon, color: "text-stage1", bgColor: "bg-stage1/10", borderColor: "border-stage1/20" },
];

export function Stage1Client({ initialContent }: Stage1ClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActivityType | null>(null);
  const [isSubFeatureOpen, setIsSubFeatureOpen] = useState(false);
  
  // Safe retrieval for reading/listening/writing/speaking list items
  const activeContentList = activeTab ? (initialContent[activeTab as keyof typeof initialContent] || []) : [];
  const currentChallenge = activeContentList.length > 0 ? activeContentList[0] : null;

  if (!activeTab) {
    return (
      <div className="space-y-8">
        <div className="mb-4 shrink-0">
          <button 
            onClick={() => router.back()}
            className="glass-panel flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--glass-bg-hover)] transition-all duration-300"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-foreground relative z-10" />
          </button>
        </div>
        <div>
          <h1 className="text-[28px] md:text-[34px] leading-tight font-semibold text-foreground tracking-tight mb-2">Stage 1: Communication</h1>
          <p className="text-zinc-500 dark:text-gray-400 text-[15px] md:text-[17px]">
            Master English through interactive reading, listening, writing, and speaking exercises powered by Inixa AI.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {MAIN_FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              className="glass-panel group relative flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-400 overflow-hidden"
            >
              <div className="glass-noise" />
              <div className="glass-specular" />
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${feature.bgColor} ${feature.borderColor} border transition-transform duration-300 group-hover:scale-110 relative z-10 shadow-inner`}>
                <Icon className={`w-10 h-10 ${feature.color}`} strokeWidth={1.5} />
              </div>
              <span className="text-[15px] font-semibold text-zinc-600 dark:text-gray-300 group-hover:text-foreground transition-colors relative z-10">
                {feature.label}
              </span>
            </button>
          );
        })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      {!isSubFeatureOpen && (
        <div className="flex items-center justify-between p-2">
          <button 
            onClick={() => setActiveTab(null)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        </div>
      )}

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
            onSubFeatureOpen={setIsSubFeatureOpen}
          />
        )}
        
        {activeTab === "WRITING" && (
          <WritingModule 
            content={currentChallenge} 
            challenges={activeContentList}
            onNext={() => setActiveTab("SPEAKING")} 
            onSubFeatureOpen={setIsSubFeatureOpen}
          />
        )}

        {activeTab === "SPEAKING" && (
          <SpeakingModule 
            content={currentChallenge} 
            challenges={activeContentList}
            onFinish={() => {
              setActiveTab("VOCABULARY");
            }} 
            onSubFeatureOpen={setIsSubFeatureOpen}
          />
        )}

        {activeTab === "VOCABULARY" && (
          <VocabularyModule onSubFeatureOpen={setIsSubFeatureOpen} />
        )}

        {activeTab === "AICHAT" && (
          <AIChatModule onSubFeatureOpen={setIsSubFeatureOpen} />
        )}

        {activeTab === "CREATION" && (
          <ImageCreationModule />
        )}
      </div>
    </div>
  );
}
