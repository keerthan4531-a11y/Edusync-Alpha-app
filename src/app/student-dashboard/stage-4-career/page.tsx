"use client";

import { useState } from "react";
import { ResumeBuilder } from "./components/ResumeBuilder";
import { AptitudeTests } from "./components/AptitudeTests";
import { MockInterviews } from "./components/MockInterviews";
import { ResumeScorer } from "./components/ResumeScorer";
import { PortfolioGenerator } from "./components/PortfolioGenerator";
import { ComingSoonWidgets } from "./components/ComingSoonWidgets";

export default function Stage4CareerPage() {
  const [activeTab, setActiveTab] = useState("resume-builder");

  const tabs = [
    { id: "resume-builder", label: "Resume Builder" },
    { id: "aptitude", label: "Aptitude Tests" },
    { id: "mock-interview", label: "AI Interviews" },
    { id: "resume-scorer", label: "Resume Scorer" },
    { id: "portfolio", label: "Portfolio" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Stage Header */}
      <div className="bg-gradient-to-br from-stage4/20 to-amber-900/10 border border-stage4/30 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-stage4/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stage4/20 text-stage4 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-stage4 animate-pulse" />
            Stage 4: Career Prep
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Launch Your Career
          </h1>
          <p className="text-zinc-300 max-w-2xl">
            Prepare for placements with AI mock interviews, automated resume building, and rigorous aptitude testing.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-stage4/10 text-stage4 border-b-2 border-stage4"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "resume-builder" && <ResumeBuilder />}
        {activeTab === "aptitude" && <AptitudeTests />}
        {activeTab === "mock-interview" && <MockInterviews />}
        {activeTab === "resume-scorer" && <ResumeScorer />}
        {activeTab === "portfolio" && <PortfolioGenerator />}
      </div>

      {/* Coming Soon Section */}
      <div className="pt-8 mt-12 border-t border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">More Career Tools</h3>
        <ComingSoonWidgets />
      </div>

    </div>
  );
}
