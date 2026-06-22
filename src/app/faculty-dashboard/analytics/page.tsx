"use client"

import { useState } from "react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { 
  BarChart3, LineChart, Users, Clock, Award, Activity, Calendar, ArrowUpRight, AwardIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AnalyticsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "attendance" | "engagement" | "classrooms">("overview")
  const [timeRange, setTimeRange] = useState("30")

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 flex flex-col gap-8">
      
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[var(--glass-border-subtle)] pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Evaluate class grades, student check-ins, platform activity, and engagement trends.
          </p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="semester">This Semester</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-none">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "performance", label: "Grade Performance", icon: Award },
          { id: "attendance", label: "Attendance Logs", icon: Clock },
          { id: "engagement", label: "Student Engagement", icon: Users },
          { id: "classrooms", label: "Classroom Metrics", icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all border whitespace-nowrap cursor-pointer",
              activeTab === tab.id
                ? "bg-primary/10 border-primary/20 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ────────────────────────────────────────────────────────
          TAB CONTENT PANELS
          ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-950/15 p-6 backdrop-blur-md min-h-[400px]">
        <div className="glass-noise" />
        <div className="glass-specular" />

        <div className="relative z-10 flex flex-col gap-6">

          {/* ─ OVERVIEW TAB ─ */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Active Engagement", value: "92%", desc: "Average student checking frequency", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Submission Rate", value: "88%", desc: "Assignments turned-in on schedule", icon: Award, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                  { label: "Quiz Success Ratio", value: "76%", desc: "Average practice grade percentage", icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</span>
                      <span className="text-2xl font-extrabold text-foreground block mt-1">{item.value}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 block">{item.desc}</span>
                    </div>
                    <div className={cn("p-3 rounded-xl shrink-0 border border-white/10", item.bg, item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* General activity log summary */}
              <div className="flex flex-col gap-3 border-t border-white/5 pt-5">
                <h4 className="font-bold text-sm text-foreground">Weekly Performance Breakdown</h4>
                
                <div className="h-44 bg-white/5 border border-white/5 rounded-2xl flex items-end justify-around p-4">
                  {[45, 62, 55, 78, 85, 92, 88].map((score, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 w-12 group relative">
                      <span className="absolute -top-7 bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {score}%
                      </span>
                      <div className="w-4 bg-white/5 border border-white/10 rounded-t-full h-32 flex items-end overflow-hidden">
                        <div className="w-full bg-gradient-to-t from-indigo-600 to-emerald-400 rounded-t-full" style={{ height: `${score}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground font-semibold">W{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─ GRADE PERFORMANCE TAB ─ */}
          {activeTab === "performance" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-base text-foreground">Grade Distribution</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Average score grades across academic projects.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Grades list table */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase border-b border-white/5 pb-2 mb-3">Topic Performance Rank</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { topic: "HTML & Custom Styling", avg: "94%", count: "142 student grades", status: "HIGH", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                      { topic: "JavaScript Loops & Arrays", avg: "86%", count: "138 student grades", status: "MID", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
                      { topic: "Advanced Databases", avg: "72%", count: "125 student grades", status: "LOW", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
                    ].map((row, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/10 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                        <div>
                          <span className="font-semibold text-xs text-foreground block">{row.topic}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">{row.count}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-foreground">{row.avg}</span>
                          <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0", row.color)}>{row.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grade cylinder bars */}
                <div className="p-5 border border-white/5 bg-slate-900/30 rounded-2xl flex flex-col justify-between h-64">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Grade Distribution Segments</span>
                  <div className="flex-1 flex items-end justify-around pt-6">
                    {[
                      { grade: "A (90-100)", count: 48, rate: 70, color: "from-indigo-600 to-indigo-400" },
                      { grade: "B (80-89)", count: 52, rate: 85, color: "from-emerald-600 to-emerald-400" },
                      { grade: "C (70-79)", count: 30, rate: 45, color: "from-amber-600 to-amber-400" },
                      { grade: "D/F (<70)", count: 12, rate: 20, color: "from-rose-600 to-rose-400" },
                    ].map((g, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 w-16 group relative">
                        <span className="absolute -top-7 bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-[9px] text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {g.count} pupils
                        </span>
                        <div className="w-5 bg-white/5 border border-white/10 rounded-t-full h-32 flex items-end overflow-hidden">
                          <div className={cn("w-full rounded-t-full transition-all duration-500", g.color)} style={{ height: `${g.rate}%` }} />
                        </div>
                        <span className="text-[9px] text-muted-foreground font-semibold text-center leading-none mt-1">{g.grade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─ ATTENDANCE TAB ─ */}
          {activeTab === "attendance" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-base text-foreground">Attendance Logs Summary</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Average weekly and daily check-ins stats.</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: "Peak Attendance Day", val: "Monday", desc: "96% check-in rate" },
                  { title: "Lowest Attendance Day", val: "Friday", desc: "84% check-in rate" },
                  { title: "Excused Absents Ratio", val: "12%", desc: "Approved medical leaves" },
                ].map((s, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs">
                    <span className="text-muted-foreground font-bold uppercase block text-[9px]">{s.title}</span>
                    <span className="text-xl font-extrabold text-foreground block mt-1.5">{s.val}</span>
                    <span className="text-muted-foreground mt-0.5 block">{s.desc}</span>
                  </div>
                ))}
              </div>

              {/* Attendance lines grids */}
              <div className="h-40 bg-slate-950/20 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Daily Check-in Rate (Weekly Timeline)</span>
                <div className="flex-1 flex items-end justify-between px-6 pt-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, idx) => {
                    const height = [96, 92, 88, 94, 84][idx]
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5 w-10 relative group">
                        <span className="absolute -top-7 bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {height}%
                        </span>
                        <div className="w-3 bg-white/5 border border-white/10 rounded-t-full h-20 flex items-end overflow-hidden">
                          <div className="w-full bg-gradient-to-t from-indigo-600 to-emerald-400 rounded-t-full" style={{ height: `${height}%` }} />
                        </div>
                        <span className="text-[9px] text-muted-foreground font-semibold">{day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─ STUDENT ENGAGEMENT TAB ─ */}
          {activeTab === "engagement" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-base text-foreground">Interactive Student Engagement</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Frequency of student clicks, coding compilers usages, and community forum replies.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase border-b border-white/5 pb-2">Engagement Metrics Factors</h4>
                  <div className="flex flex-col gap-2">
                    {[
                      { factor: "Coding Sandbox compiler runs", val: "2,482 hits this month" },
                      { factor: "Communities chat messages sent", val: "1,148 chat replies" },
                      { factor: "Stage progress accomplishments", val: "348 stage unlocks" },
                      { factor: "AI Assistant queries asked", val: "682 bot queries" },
                    ].map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-muted-foreground">{f.factor}</span>
                        <span className="font-bold text-emerald-400">{f.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between h-48 text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Engagement Activity by Classroom</span>
                  <div className="flex items-end justify-around gap-2 pt-4">
                    {[
                      { name: "Advanced Java", val: 88, color: "bg-indigo-500" },
                      { name: "Web Coding", val: 94, color: "bg-emerald-500" },
                      { name: "Databases", val: 62, color: "bg-amber-500" },
                    ].map((c, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 w-14">
                        <div className="w-3 bg-white/5 border border-white/10 rounded-t-full h-20 flex items-end overflow-hidden">
                          <div className={cn("w-full rounded-t-full", c.color)} style={{ height: `${c.val}%` }} />
                        </div>
                        <span className="text-[8px] text-muted-foreground truncate w-full text-center">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─ CLASSROOM METRICS TAB ─ */}
          {activeTab === "classrooms" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-base text-foreground">Classroom Progress Metrics</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Syllabus progression levels completed by classroom.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { name: "CS101 - Introduction to Programming", status: "Syllabus 80% Completed", xp: "Total XP Earned: 14.5k", color: "from-emerald-500 to-teal-500" },
                  { name: "CS201 - Data Structures & Algorithms", status: "Syllabus 65% Completed", xp: "Total XP Earned: 12.2k", color: "from-indigo-500 to-violet-500" },
                  { name: "CS301 - Database Management Systems", status: "Syllabus 40% Completed", xp: "Total XP Earned: 8.4k", color: "from-amber-500 to-orange-500" },
                  { name: "CS401 - System Architecture Lectures", status: "Syllabus 20% Completed", xp: "Total XP Earned: 4.8k", color: "from-rose-500 to-rose-600" },
                ].map((c, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-3 justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs md:text-sm text-foreground">{c.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{c.xp}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground">
                        <span>Syllabus Progress</span>
                        <span>{c.status}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full border border-white/5 overflow-hidden">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", c.color)} style={{ width: c.status.includes("80") ? "80%" : c.status.includes("65") ? "65%" : c.status.includes("40") ? "40%" : "20%" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}
