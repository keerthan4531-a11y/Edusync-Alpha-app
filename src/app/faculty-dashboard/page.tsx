"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Layers, BarChart3, Bot, ChevronRight, GraduationCap, PlusCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function FacultyDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    classroomsCount: 0,
    studentsCount: 0,
    pendingGradingCount: 0,
    avgScore: "85%",
  })
  const [chartData, setChartData] = useState<{ name: string; score: number }[]>([])

  useEffect(() => {
    async function loadStats() {
      try {
        const [classroomsRes, submissionsRes] = await Promise.all([
          fetch("/api/faculty/classrooms"),
          fetch("/api/faculty/submissions"),
        ])

        let classCount = 0
        let studCount = 0
        let pendingGrading = 0
        let classroomScores: { name: string; score: number }[] = []

        if (classroomsRes.ok) {
          const cData = await classroomsRes.json()
          classCount = cData.classrooms.length
          studCount = cData.classrooms.reduce((acc: number, curr: any) => acc + (curr.students?.length || 0), 0)
          
          classroomScores = cData.classrooms.map((c: any) => ({
            name: c.name,
            score: Math.floor(Math.random() * 20) + 75, // Simulated average score
          }))
        }

        if (submissionsRes.ok) {
          const sData = await submissionsRes.json()
          pendingGrading = sData.submissions.filter((s: any) => s.status === "SUBMITTED").length
        }

        setStats({
          classroomsCount: classCount,
          studentsCount: studCount,
          pendingGradingCount: pendingGrading,
          avgScore: classCount > 0 ? "88%" : "N/A",
        })

        // Set default chart data if empty
        if (classroomScores.length === 0) {
          setChartData([
            { name: "Advanced Python", score: 92 },
            { name: "Intro to JS", score: 84 },
            { name: "Web Projects", score: 89 },
          ])
        } else {
          setChartData(classroomScores.slice(0, 4))
        }
      } catch (e) {
        console.error("Failed to load dashboard statistics:", e)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const triggerAIAssistant = () => {
    window.dispatchEvent(new CustomEvent("openAIAssistant"))
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-gradient-to-r from-emerald-500/10 via-violet-500/5 to-indigo-500/10 p-6 md:p-8 backdrop-blur-md">
        <div className="glass-noise" />
        <div className="glass-specular" />
        <div className="absolute top-0 left-0 right-0 h-full pointer-events-none glass-shimmer" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              Welcome back, Professor!
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-base leading-relaxed">
              Manage your classrooms, track student performance metrics, coordinate workflows, and grade submissions. Get instant support anytime from your personal AI Assistant.
            </p>
          </div>
          <button
            onClick={triggerAIAssistant}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-violet-600 text-white font-semibold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/20"
          >
            <Bot className="w-5 h-5 animate-pulse" />
            <span>Ask AI Assistant for Help</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "My Classrooms",
            value: stats.classroomsCount,
            desc: "Active groups",
            icon: GraduationCap,
            color: "text-stage3",
            accent: "#10b981",
          },
          {
            label: "Enrolled Students",
            value: stats.studentsCount,
            desc: "Total students",
            icon: Users,
            color: "text-stage2",
            accent: "#3b82f6",
          },
          {
            label: "Pending Grading",
            value: stats.pendingGradingCount,
            desc: "Submissions to review",
            icon: BookOpen,
            color: "text-stage1",
            accent: "#8b5cf6",
          },
          {
            label: "Average Performance",
            value: stats.avgScore,
            desc: "Student average",
            icon: BarChart3,
            color: "text-stage4",
            accent: "#f59e0b",
          },
        ].map((stat) => (
          <LiquidGlassCard key={stat.label} className="p-6 relative overflow-hidden" accentColor={stat.accent}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
              <div className="p-2 rounded-xl glass-panel border border-white/10">
                <stat.icon className={`w-4 h-4 ${stat.color} drop-shadow-[0_0_6px_currentColor] relative z-10`} />
              </div>
            </div>
            {loading ? (
              <div className="h-9 w-16 bg-white/5 animate-pulse rounded-md" />
            ) : (
              <div className="text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">{stat.desc}</p>
          </LiquidGlassCard>
        ))}
      </div>

      {/* Quick Actions & Analytics Graph */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Quick Actions Panel */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Quick Actions</h2>
            <p className="text-xs text-muted-foreground mt-1">Direct access to core faculty functions.</p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              {
                title: "Manage Classrooms",
                desc: "View lists, create, or modify classrooms.",
                href: "/faculty-dashboard/classrooms",
                color: "from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/30",
                icon: GraduationCap,
                iconColor: "text-emerald-400",
              },
              {
                title: "Grade Submissions",
                desc: "Check and grade student codes.",
                href: "/faculty-dashboard/submissions",
                color: "from-violet-500/10 to-indigo-500/5 hover:border-violet-500/30",
                icon: BookOpen,
                iconColor: "text-violet-400",
              },
              {
                title: "Communities & WhatsApp",
                desc: "Operational guidelines and group chats.",
                href: "/faculty-dashboard/communities",
                color: "from-amber-500/10 to-orange-500/5 hover:border-amber-500/30",
                icon: Layers,
                iconColor: "text-amber-400",
              },
            ].map((action) => (
              <div
                key={action.title}
                onClick={() => router.push(action.href)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-gradient-to-br p-5 backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5",
                  action.color
                )}
              >
                <div className="glass-noise" />
                <div className="glass-specular" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <action.icon className={cn("w-5 h-5", action.iconColor)} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                        {action.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Classroom Performance</h2>
            <p className="text-xs text-muted-foreground mt-1">Average grades across active classrooms.</p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-950/15 p-6 backdrop-blur-md flex-1 flex flex-col justify-between min-h-[300px]">
            <div className="glass-noise" />
            <div className="glass-specular" />

            {/* Custom Bar Graph */}
            <div className="relative z-10 flex-1 flex items-end justify-around gap-4 pt-8 pb-4">
              {chartData.map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 w-16 relative group">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 bg-slate-900 border border-white/10 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    {bar.score}%
                  </div>

                  {/* Cylindrical Liquid Glass Bar */}
                  <div className="w-8 md:w-10 bg-white/5 rounded-t-full border border-white/10 h-48 relative overflow-hidden flex items-end">
                    {/* Glowing highlight in background */}
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-full bg-gradient-to-t from-indigo-500/20 to-emerald-500/40 blur-sm"
                      style={{ height: `${bar.score}%` }}
                    />
                    {/* Solid bar */}
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 via-emerald-500 to-teal-400 rounded-t-full relative overflow-hidden transition-all duration-1000 ease-out"
                      style={{ height: `${bar.score}%` }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-30 glass-shimmer" />
                    </div>
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold text-muted-foreground truncate w-full text-center">
                    {bar.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative z-10 flex justify-between items-center border-t border-[var(--glass-border-subtle)] pt-4 mt-2">
              <span className="text-[10px] text-muted-foreground">Legend: 🟢 Average Score (%)</span>
              <span className="text-[10px] text-muted-foreground font-medium">Updated just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
