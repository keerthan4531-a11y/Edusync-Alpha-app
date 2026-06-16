"use client";

import { useState } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Link as LinkIcon, ExternalLink, Code, Check } from "lucide-react";

export function PortfolioGenerator() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("edusync.dev/p/student123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-2">
            <i className="fas fa-globe text-stage4 w-5 h-5"></i>
            Public Portfolio
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">Share your live achievements and projects with recruiters.</p>
        </div>
        
        <div className="bg-white/70 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-xl p-2.5 px-4 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start shadow-sm backdrop-blur-md">
          <span className="text-[13px] text-zinc-500 dark:text-gray-400 font-mono">edusync.dev/p/student123</span>
          <button 
            onClick={handleCopy}
            className="text-stage4 hover:text-amber-500 transition-colors p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mock Browser Frame */}
      <LiquidGlassCard className="p-0 overflow-hidden shadow-2xl" accentColor="#10b981">
        {/* Browser Header */}
        <div className="bg-black/10 dark:bg-black/35 px-4 py-3 flex items-center gap-2 border-b border-black/5 dark:border-white/5 backdrop-blur-md">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-sm" />
          </div>
          <div className="ml-4 bg-black/5 dark:bg-black/30 text-[12px] text-zinc-500 dark:text-gray-400 px-4 py-1.5 rounded-xl flex-1 text-center font-mono border border-black/5 dark:border-white/5 truncate max-w-lg mx-auto">
            https://edusync.dev/p/student123
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-400 dark:text-gray-500 cursor-pointer hover:text-foreground transition-colors shrink-0" />
        </div>

        {/* Portfolio Content Preview */}
        <div className="p-8 bg-[#f8fafc] dark:bg-[#020617] text-foreground min-h-[400px] transition-colors duration-500">
          <div className="max-w-3xl mx-auto space-y-10">
            <header className="text-center space-y-3">
              <div className="w-24 h-24 bg-gradient-to-tr from-stage4 to-stage3 rounded-full mx-auto p-1 shadow-lg">
                <div className="w-full h-full bg-[#f1f5f9] dark:bg-[#0f172a] rounded-full flex items-center justify-center font-bold text-3xl text-foreground">
                  JD
                </div>
              </div>
              <div>
                <h1 className="text-[28px] font-semibold text-foreground tracking-tight leading-tight">John Doe</h1>
                <p className="text-[15px] text-zinc-500 dark:text-gray-400 font-medium">Full-Stack Engineer Intern • EduSync Stage 4 Certified</p>
              </div>
            </header>

            <div className="space-y-8">
              <div>
                <h3 className="text-[17px] font-semibold text-foreground border-b border-black/10 dark:border-white/10 pb-2 mb-4 flex items-center gap-2">
                  <Code className="w-4 h-4 text-stage3" /> Featured Projects
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/80 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
                    <h4 className="font-semibold text-[15px] mb-1 flex justify-between items-center text-foreground">
                      E-Commerce API
                      <Code className="w-4 h-4 text-zinc-400 dark:text-gray-500" />
                    </h4>
                    <p className="text-[13px] text-zinc-500 dark:text-gray-400 mb-4 leading-normal">Fully optimized RESTful backend built during Stage 3 Project sprints.</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-semibold border border-blue-500/20">TypeScript</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">Node.js</span>
                    </div>
                  </div>
                  <div className="bg-white/80 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
                    <h4 className="font-semibold text-[15px] mb-1 flex justify-between items-center text-foreground">
                      Sorting Visualizer
                      <Code className="w-4 h-4 text-zinc-400 dark:text-gray-500" />
                    </h4>
                    <p className="text-[13px] text-zinc-500 dark:text-gray-400 mb-4 leading-normal">Interactive client visualizer displaying classic sorting algorithms.</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20">React</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-semibold border border-purple-500/20">Algorithms</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[17px] font-semibold text-foreground border-b border-black/10 dark:border-white/10 pb-2 mb-4">
                  Verified Achievements
                </h3>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-sm shadow-sm" title="Communication Badge">S1</div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shadow-sm" title="Coding Badge">S2</div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-sm" title="Project Badge">S3</div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-stage4 font-bold text-sm shadow-sm animate-pulse" title="Stage 4 Active">S4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  );
}
