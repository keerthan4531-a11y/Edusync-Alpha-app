"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Link as LinkIcon, ExternalLink, Code, MonitorPlay } from "lucide-react";

export function PortfolioGenerator() {
  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MonitorPlay className="text-stage4 w-6 h-6" />
            Public Portfolio
          </h2>
          <p className="text-zinc-400 mt-1">Share your live achievements and projects</p>
        </div>
        
        <div className="bg-stage4/10 border border-stage4/20 rounded-lg p-2 px-4 flex items-center gap-3">
          <span className="text-sm text-zinc-400">edusync.dev/p/student123</span>
          <button className="text-stage4 hover:text-white transition-colors">
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mock Portfolio Preview */}
      <div className="bg-black/50 border border-white/10 rounded-xl overflow-hidden">
        {/* Browser Header */}
        <div className="bg-[#1e1e1e] px-4 py-3 flex items-center gap-2 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="ml-4 bg-black/40 text-xs text-zinc-500 px-3 py-1 rounded flex-1 text-center font-mono">
            https://edusync.dev/p/student123
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-white" />
        </div>

        {/* Portfolio Content Preview */}
        <div className="p-8 bg-[#0a0a0a] text-white">
          <div className="max-w-3xl mx-auto">
            <header className="mb-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-stage4 to-stage3 rounded-full mx-auto mb-4 p-1">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-bold text-2xl">
                  S
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Student Name</h1>
              <p className="text-zinc-400">Full-Stack Developer • EduSync Level 42</p>
            </header>

            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-bold border-b border-white/10 pb-2 mb-4">Featured Projects</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h4 className="font-semibold mb-1 flex justify-between">
                      E-Commerce API
                      <Code className="w-4 h-4 text-zinc-400" />
                    </h4>
                    <p className="text-xs text-zinc-400 mb-3">Built during Stage 3 Sprint.</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">TypeScript</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Node.js</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h4 className="font-semibold mb-1 flex justify-between">
                      Sorting Visualizer
                      <Code className="w-4 h-4 text-zinc-400" />
                    </h4>
                    <p className="text-xs text-zinc-400 mb-3">Stage 2 Final Project.</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">React</span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold border-b border-white/10 pb-2 mb-4">Verified Badges</h3>
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-stage2/20 border border-stage2/40 flex items-center justify-center text-stage2 text-xs font-bold" title="Clean Coder">CC</div>
                  <div className="w-12 h-12 rounded-full bg-stage3/20 border border-stage3/40 flex items-center justify-center text-stage3 text-xs font-bold" title="Team Player">TP</div>
                  <div className="w-12 h-12 rounded-full bg-stage4/20 border border-stage4/40 flex items-center justify-center text-stage4 text-xs font-bold" title="Stage 4 Active">S4</div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
