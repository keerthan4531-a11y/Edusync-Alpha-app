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
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles
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

const STAGE4_FEATURES = [
  { id: "job-portal", label: "Job Portal", icon: Briefcase, color: "text-amber-600 dark:text-amber-400", borderColor: "border-amber-500/30", glowColor: "group-hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]", bgGradient: "from-amber-500/20 to-yellow-500/10", desc: "Browse active job openings, campus placement drives, and application tracking" },
  { id: "mock-interview", label: "AI Mock Interview", icon: Mic, color: "text-rose-600 dark:text-rose-400", borderColor: "border-rose-500/30", glowColor: "group-hover:shadow-[0_0_25px_rgba(244,63,94,0.3)]", bgGradient: "from-rose-500/20 to-pink-500/10", desc: "Practice technical & HR interview questions with live AI voice feedback" },
  { id: "portfolio", label: "Live Portfolio", icon: Globe, color: "text-blue-600 dark:text-blue-400", borderColor: "border-blue-500/30", glowColor: "group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]", bgGradient: "from-blue-500/20 to-indigo-500/10", desc: "Generate a personal developer portfolio site showcasing your projects & achievements" },
  { id: "job-matcher", label: "Smart Job Matcher", icon: Bot, color: "text-purple-600 dark:text-purple-400", borderColor: "border-purple-500/30", glowColor: "group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]", bgGradient: "from-purple-500/20 to-fuchsia-500/10", desc: "AI matches your skills with relevant job role requirements & compatibility scores" },
  { id: "linkedin", label: "LinkedIn Optimization", icon: Linkedin, color: "text-sky-600 dark:text-sky-400", borderColor: "border-sky-500/30", glowColor: "group-hover:shadow-[0_0_25px_rgba(14,165,233,0.3)]", bgGradient: "from-sky-500/20 to-blue-500/10", desc: "Profile checklist & AI suggestions to boost recruiter outreach on LinkedIn" },
  { id: "leaderboard", label: "Hiring Leaderboard", icon: Trophy, color: "text-yellow-600 dark:text-yellow-400", borderColor: "border-yellow-500/30", glowColor: "group-hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]", bgGradient: "from-yellow-500/20 to-amber-500/10", desc: "Compete on campus placement ranks, XP leaderboards & recruiter visibility" },
  { id: "resume", label: "Resume Builder", icon: FileText, color: "text-emerald-600 dark:text-emerald-400", borderColor: "border-emerald-500/30", glowColor: "group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]", bgGradient: "from-emerald-500/20 to-teal-500/10", desc: "Craft ATS-friendly professional resumes with customizable templates" },
  { id: "alumni", label: "Alumni Network", icon: Users, color: "text-indigo-600 dark:text-indigo-400", borderColor: "border-indigo-500/30", glowColor: "group-hover:shadow-[0_0_25px_rgba(99,102,241,0.3)]", bgGradient: "from-indigo-500/20 to-purple-500/10", desc: "Connect with verified college alumni working in top tech companies" },
  { id: "aptitude", label: "Aptitude Tests", icon: Brain, color: "text-cyan-600 dark:text-cyan-400", borderColor: "border-cyan-500/30", glowColor: "group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]", bgGradient: "from-cyan-500/20 to-teal-500/10", desc: "Practice quantitative, logical reasoning & verbal placement test modules" },
  { id: "resume-scorer", label: "Resume Scorer", icon: FileCheck, color: "text-teal-600 dark:text-teal-400", borderColor: "border-teal-500/30", glowColor: "group-hover:shadow-[0_0_25px_rgba(20,184,166,0.3)]", bgGradient: "from-teal-500/20 to-emerald-500/10", desc: "Instant AI score & ATS keyword feedback for your uploaded resume" }
];

export default function Stage4CareerPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // LANDING OVERVIEW VIEW (WHEN NO SECTION IS SELECTED)
  if (!activeSection) {
    return (
      <div className="space-y-8 p-2 text-foreground max-w-6xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/student-dashboard')}
            className="flex items-center justify-center w-10 h-10 rounded-full neu-button transition-colors shadow-sm"
            aria-label="Back to Dashboard"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider neu-raised-xs px-3 py-1 rounded-full">
            Stage 4 • Career & Placement
          </span>
        </div>

        {/* Stage Header Block */}
        <LiquidGlassCard className="p-6 md:p-8 shadow-xl" accentColor="#f59e0b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl neu-raised-sm flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-lg">
                <Briefcase className="w-9 h-9 md:w-10 md:h-10" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest neu-raised-xs px-2.5 py-0.5 rounded-full">Stage 4</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Placement Ready
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-amber-100 dark:to-orange-200 tracking-tight">
                  Get Job Ready & Placement Suite
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed font-medium">
                  Transition from learning to employment with our comprehensive career preparation suite. Get interview-ready, optimize your professional profiles, build your resume, and connect with opportunities.
                </p>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto text-center border-t md:border-t-0 border-black/10 dark:border-white/10 pt-4 md:pt-0">
              <div className="p-3 neu-raised-sm rounded-2xl hover:scale-105 transition-all">
                <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 block">78%</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Readiness</span>
              </div>
              <div className="p-3 neu-raised-sm rounded-2xl hover:scale-105 transition-all">
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block">12</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Applications</span>
              </div>
              <div className="p-3 neu-raised-sm rounded-2xl hover:scale-105 transition-all">
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 block">4</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Interviews</span>
              </div>
              <div className="p-3 neu-raised-sm rounded-2xl hover:scale-105 transition-all">
                <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 block">#3</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Hiring Rank</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 pt-4 border-t border-black/5 dark:border-white/5 mt-4">
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
              <span>Career Readiness Progress</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">78%</span>
            </div>
            <div className="w-full h-2.5 neu-progress-track rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000 ease-out" style={{ width: "78%" }} />
            </div>
          </div>
        </LiquidGlassCard>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <button
            onClick={() => setActiveSection("overview")}
            className="group text-left relative flex flex-col justify-between p-6 neu-flat rounded-[2rem] hover:scale-[1.01] transition-all duration-300 shadow-xl group-hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] h-60 dark:bg-white/5 dark:border-white/10"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 transition-transform duration-300 group-hover:scale-110 shadow-lg">
                <Home className="w-7 h-7 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
              <div className="w-8 h-8 rounded-full neu-button flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
            <div className="space-y-1.5 mt-4">
              <h3 className="text-lg font-extrabold text-foreground dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Career Dashboard Overview
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-normal">
                Career readiness milestones, placement drive calendar & application summary
              </p>
            </div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-3 border-t border-black/5 dark:border-white/5 mt-auto">
              <span>Open Module</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {STAGE4_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveSection(feature.id)}
                className={`group text-left relative flex flex-col justify-between p-6 neu-flat rounded-[2rem] hover:scale-[1.01] transition-all duration-300 shadow-xl ${feature.glowColor} h-60 dark:bg-white/5 dark:border-white/10`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.bgGradient} border ${feature.borderColor} transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                    <Icon className={`w-7 h-7 ${feature.color}`} strokeWidth={2} />
                  </div>
                  <div className="w-8 h-8 rounded-full neu-button flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-4">
                  <h3 className="text-lg font-extrabold text-foreground dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {feature.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-normal">
                    {feature.desc}
                  </p>
                </div>

                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-3 border-t border-black/5 dark:border-white/5 mt-auto">
                  <span>Open Module</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ACTIVE SECTION VIEW WITH TOP NEUMORPHIC FLOATING BAR
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12 p-2 text-foreground">
      {/* Top Floating Glass Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 neu-raised rounded-3xl shrink-0 shadow-xl dark:bg-white/5 dark:border-white/10">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center justify-center w-9 h-9 rounded-full neu-button transition-colors shadow-sm shrink-0"
            aria-label="Back to Career Options"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-sm font-extrabold text-foreground dark:text-white hidden md:inline">Stage 4: Career & Placement</span>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[{ id: "overview", label: "Overview", icon: Home }, ...STAGE4_FEATURES].map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-amber-600 text-white shadow-md scale-105 neu-button"
                    : "neu-button text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
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
  );
}
