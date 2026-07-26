"use client";

import { useState } from "react";
import { Stage1ContentDTO, ActivityType } from "@/types/communication";
import { ReadingModule } from "./ReadingModule";
import { ListeningModule } from "./ListeningModule";
import { WritingModule } from "./WritingModule";
import { SpeakingModule } from "./SpeakingModule";
import { VocabularyModule } from "./VocabularyModule";
import { AIChatModule } from "./AIChatModule";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft
} from "lucide-react";

import Image from "next/image";

interface Stage1ClientProps {
  initialContent: Record<ActivityType, Stage1ContentDTO[]>;
}

const MAIN_FEATURES = [
  { id: "LISTENING" as const, label: "Listening", image: "/images/communication/listening.png" },
  { id: "READING" as const, label: "Reading", image: "/images/communication/reading.png" },
  { id: "WRITING" as const, label: "Writing", image: "/images/communication/writing.png" },
  { id: "SPEAKING" as const, label: "Speaking", image: "/images/communication/speaking.png" },
  { id: "VOCABULARY" as const, label: "Vocabulary", image: "/images/communication/vocabulary.png" },
  { id: "AICHAT" as const, label: "AI Convo", image: "/images/communication/aiconvo.png" },
];

export function Stage1Client({ initialContent }: Stage1ClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActivityType | null>(null);
  const [isSubFeatureOpen, setIsSubFeatureOpen] = useState(false);
  
  // Safe retrieval for reading/listening/writing/speaking list items
  const activeContentList = activeTab ? (initialContent[activeTab as keyof typeof initialContent] || []) : [];
  const currentChallenge = activeContentList.length > 0 ? activeContentList[0] : null;

  const handleFeatureClick = (featureId: ActivityType) => {
    setActiveTab(featureId);
  };

  if (!activeTab) {
    return (
      <div className="space-y-8">
        <div className="mb-4 shrink-0">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        </div>
        <div>
          <h1 className="text-[28px] md:text-[34px] leading-tight font-semibold text-foreground tracking-tight mb-2">Communication</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {MAIN_FEATURES.map((feature) => {
          return (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className="group relative flex flex-col items-center justify-center gap-4 p-8 neu-convex rounded-[2rem] hover:scale-[1.02] transition-all duration-300 dark:bg-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center neu-raised-sm dark:bg-indigo-950/30 dark:border-2 dark:border-indigo-400/20 transition-all duration-300 group-hover:scale-110 shadow-inner group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                  <Image 
                    src={feature.image} 
                    alt={feature.label}
                    fill
                    className="object-contain filter drop-shadow-[0_4px_12px_rgba(129,140,248,0.4)] dark:mix-blend-screen"
                    sizes="(max-width: 768px) 64px, 80px"
                    priority
                  />
                </div>
              </div>
              <span className="text-[15px] font-semibold text-foreground dark:text-gray-200 group-hover:text-primary transition-colors">
                {feature.label}
              </span>
            </button>
          );
        })}
        </div>
      </div>
    );
  }

  // AI Chat gets its own full-screen layout, no extra wrappers
  if (activeTab === "AICHAT") {
    return <AIChatModule onSubFeatureOpen={setIsSubFeatureOpen} onBack={() => setActiveTab(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      {!isSubFeatureOpen && (
        <div className="flex items-center justify-between p-2">
          <button 
            onClick={() => { setActiveTab(null); }}
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
            onSubFeatureOpen={setIsSubFeatureOpen}
            onComplete={async (score, timeSec) => {
              await fetch("/api/student/award-points", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: "MEDIUM", moduleType: "READING" }),
              });
              await fetch("/api/student/daily-challenges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: "MEDIUM", score, timeSec }),
              });
            }}
          />
        )}
        
        {activeTab === "LISTENING" && (
          <ListeningModule 
            content={currentChallenge} 
            challenges={activeContentList}
            onNext={() => setActiveTab("WRITING")} 
            onSubFeatureOpen={setIsSubFeatureOpen}
            onComplete={async (score, timeSec) => {
              await fetch("/api/student/award-points", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: "MEDIUM", moduleType: "LISTENING" }),
              });
              await fetch("/api/student/daily-challenges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: "MEDIUM", score, timeSec }),
              });
            }}
          />
        )}
        
        {activeTab === "WRITING" && (
          <WritingModule 
            content={currentChallenge} 
            challenges={activeContentList}
            onNext={() => setActiveTab("SPEAKING")} 
            onSubFeatureOpen={setIsSubFeatureOpen}
            onComplete={async (score, timeSec) => {
              await fetch("/api/student/award-points", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: "MEDIUM", moduleType: "WRITING" }),
              });
              await fetch("/api/student/daily-challenges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: "MEDIUM", score, timeSec }),
              });
            }}
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
            onComplete={async (score, timeSec) => {
              await fetch("/api/student/award-points", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: "MEDIUM", moduleType: "SPEAKING" }),
              });
              await fetch("/api/student/daily-challenges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: "MEDIUM", score, timeSec }),
              });
            }}
          />
        )}

        {activeTab === "VOCABULARY" && (
          <VocabularyModule 
            onSubFeatureOpen={setIsSubFeatureOpen}
            onComplete={async (score, timeSec) => {
              await fetch("/api/student/award-points", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: "MEDIUM", moduleType: "VOCABULARY" }),
              });
              await fetch("/api/student/daily-challenges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: "MEDIUM", score, timeSec }),
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
