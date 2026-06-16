"use client";

import { useState } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { useRouter } from "next/navigation";
import { 
  Home, 
  Briefcase, 
  Mic, 
  Globe, 
  Bot, 
  Trophy, 
  FileText, 
  Users, 
  Brain, 
  FileCheck,
  ChevronLeft
} from "lucide-react";

const Linkedin = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Components
import { Overview } from "./components/Overview";
import { JobPortal } from "./components/JobPortal";
import { MockInterviews } from "./components/MockInterviews";
import { PortfolioGenerator } from "./components/PortfolioGenerator";
import { JobMatcher } from "./components/JobMatcher";
import { LinkedInChecklist } from "./components/LinkedInChecklist";
import { HiringLeaderboard } from "./components/HiringLeaderboard";
import { ResumeBuilder } from "./components/ResumeBuilder";
import { AlumniNetwork } from "./components/AlumniNetwork";
import { AptitudeTests } from "./components/AptitudeTests";
import { ResumeScorer } from "./components/ResumeScorer";

export default function Stage4CareerPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "job-portal", label: "Job Portal", icon: Briefcase },
    { id: "mock-interview", label: "AI Mock Interview", icon: Mic },
    { id: "portfolio", label: "Live Portfolio", icon: Globe },
    { id: "job-matcher", label: "Smart Job Matcher", icon: Bot },
    { id: "linkedin", label: "LinkedIn Optimization", icon: Linkedin },
    { id: "leaderboard", label: "Hiring Leaderboard", icon: Trophy },
    { id: "resume", label: "Resume Builder", icon: FileText },
    { id: "alumni", label: "Alumni Network", icon: Users },
    { id: "aptitude", label: "Aptitude Tests", icon: Brain },
    { id: "resume-scorer", label: "Resume Scorer", icon: FileCheck },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push('/student-dashboard')}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
          aria-label="Back to Dashboard"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-[13px] text-zinc-500 dark:text-gray-400 font-semibold">Stage 4 • Career & Placement</span>
      </div>

      {/* Stage Header Block */}
      <LiquidGlassCard className="p-8" accentColor="#f59e0b">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stage4/10 text-stage4 border border-stage4/20 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-stage4 animate-pulse" />
            Stage 4: Career & Placement Readiness
          </div>
          <h1 className="text-[28px] md:text-[34px] font-semibold text-foreground tracking-tight leading-tight">
            Get Job Ready
          </h1>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400 max-w-3xl leading-relaxed">
            Transition from learning to employment with our comprehensive career preparation suite.
            Get interview-ready, optimize your professional profiles, build your resume, and connect with opportunities.
          </p>

          {/* Progress bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-[13px] text-zinc-500 dark:text-gray-400 font-medium">
              <span>Career Readiness Progress</span>
              <span className="text-stage4 font-semibold">78%</span>
            </div>
            <div className="w-full h-2.5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5 shadow-inner">
              <div className="h-full bg-stage4 rounded-full transition-all duration-1000 ease-out" style={{ width: "78%" }} />
            </div>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Main Multi-Section Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sub-Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <LiquidGlassCard className="p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar shadow-md">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-all whitespace-nowrap lg:whitespace-normal w-auto lg:w-full shrink-0 ${
                    isActive
                      ? "bg-stage4/15 text-stage4 font-semibold shadow-sm"
                      : "text-zinc-500 dark:text-gray-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-stage4" : "text-zinc-500 dark:text-gray-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </LiquidGlassCard>
        </div>

        {/* Content Section Panel */}
        <div className="flex-1 w-full min-h-[500px]">
          {activeSection === "overview" && (
            <Overview onTabChange={setActiveSection} />
          )}
          {activeSection === "job-portal" && (
            <JobPortal />
          )}
          {activeSection === "mock-interview" && (
            <MockInterviews />
          )}
          {activeSection === "portfolio" && (
            <PortfolioGenerator />
          )}
          {activeSection === "job-matcher" && (
            <JobMatcher />
          )}
          {activeSection === "linkedin" && (
            <LinkedInChecklist />
          )}
          {activeSection === "leaderboard" && (
            <HiringLeaderboard />
          )}
          {activeSection === "resume" && (
            <ResumeBuilder />
          )}
          {activeSection === "alumni" && (
            <AlumniNetwork />
          )}
          {activeSection === "aptitude" && (
            <AptitudeTests />
          )}
          {activeSection === "resume-scorer" && (
            <ResumeScorer />
          )}
        </div>

      </div>

    </div>
  );
}
