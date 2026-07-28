"use client"

import { useState, useEffect } from "react"
import { Users, MessageCircle, PlusCircle, Loader2, CheckCircle2, TrendingUp, Calendar, BookOpen, Heart, Briefcase, User, Sparkles } from "lucide-react"

type Mentee = {
  id: string; name: string; email: string; xp: number; level: number; currentStreak: number
  attendancePercent: number | null
  studentProfile?: { rollNumber?: string; semester?: number; batch?: string } | null
  enrolledClassrooms: { id: string; name: string }[]
  assignmentSubmissions: { grade?: number; status: string }[]
  counselingSessions: { id: string; summary: string; sessionType: string; nextAction?: string; createdAt: string }[]
}

type SessionType = "GENERAL" | "ACADEMIC" | "PERSONAL" | "CAREER"

const SESSION_ICONS: Record<SessionType, any> = {
  GENERAL: MessageCircle, ACADEMIC: BookOpen, PERSONAL: Heart, CAREER: Briefcase
}
const SESSION_COLORS: Record<SessionType, string> = {
  GENERAL: "text-blue-500 bg-blue-500/10 border-blue-500/20", ACADEMIC: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  PERSONAL: "text-pink-500 bg-pink-500/10 border-pink-500/20", CAREER: "text-amber-500 bg-amber-500/10 border-amber-500/20",
}

export function MentorshipSection() {
  const [mentees, setMentees] = useState<Mentee[]>([])
  const [selected, setSelected] = useState<Mentee | null>(null)
  const [loading, setLoading] = useState(true)
  const [logForm, setLogForm] = useState({ summary: "", sessionType: "GENERAL" as SessionType, nextAction: "" })
  const [logging, setLogging] = useState(false)
  const [logSaved, setLogSaved] = useState(false)

  useEffect(() => {
    fetch("/api/faculty/mentees")
      .then(r => r.json())
      .then(data => { setMentees(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !logForm.summary) return
    setLogging(true)
    const res = await fetch("/api/faculty/counseling", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: selected.id, ...logForm }),
    })
    const newSession = await res.json()
    if (res.ok) {
      const updatedMentee = { ...selected, counselingSessions: [newSession, ...selected.counselingSessions] }
      setSelected(updatedMentee)
      setMentees(m => m.map(me => me.id === selected.id ? updatedMentee : me))
      setLogForm({ summary: "", sessionType: "GENERAL", nextAction: "" })
      setLogSaved(true)
      setTimeout(() => setLogSaved(false), 2000)
    }
    setLogging(false)
  }

  const avgGrade = (subs: { grade?: number; status: string }[]) => {
    const graded = subs.filter(s => s.grade !== null && s.grade !== undefined)
    if (graded.length === 0) return null
    return Math.round(graded.reduce((sum, s) => sum + (s.grade || 0), 0) / graded.length)
  }

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : mentees.length === 0 ? (
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-12 rounded-2xl text-center border border-blue-500/10 shadow-xl">
          <Users className="w-12 h-12 mx-auto text-blue-500/40 mb-3" />
          <p className="text-base font-bold text-foreground">No mentees assigned yet</p>
          <p className="text-xs text-muted-foreground mt-1">Contact HOD or Admin to assign students to your mentorship roster.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Mentee List */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest px-1">Mentees Roster ({mentees.length})</h2>
            {mentees.map(m => {
              const atPct = m.attendancePercent
              const isSelected = selected?.id === m.id
              return (
                <button key={m.id} onClick={() => setSelected(m)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                    isSelected 
                      ? "bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/10 scale-[1.02]" 
                      : "neu-flat dark:bg-white/5 dark:border-white/10 border-transparent hover:border-blue-500/20 hover:scale-[1.01]"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-md">
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-foreground truncate">{m.name}</p>
                      <p className="text-[10px] font-semibold text-muted-foreground">{m.studentProfile?.batch || "—"} · Sem {m.studentProfile?.semester || "—"}</p>
                    </div>
                    {atPct !== null && (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${atPct >= 75 ? "bg-emerald-500/15 text-emerald-500" : atPct >= 60 ? "bg-amber-500/15 text-amber-500" : "bg-rose-500/15 text-rose-500"}`}>
                        {atPct}%
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Detail Panel */}
          {selected ? (
            <div className="flex flex-col gap-5">
              {/* Mentee Header */}
              <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-5 rounded-2xl border border-blue-500/10 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/25">
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground">{selected.name}</h2>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{selected.email}</p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{selected.studentProfile?.rollNumber || ""} · Batch {selected.studentProfile?.batch || "—"} · Sem {selected.studentProfile?.semester || "—"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={TrendingUp} label="Level" value={`Lv.${selected.level}`} color="text-blue-500" />
                  <StatCard icon={Calendar} label="Attendance" value={selected.attendancePercent !== null ? `${selected.attendancePercent}%` : "N/A"} color={selected.attendancePercent !== null && selected.attendancePercent >= 75 ? "text-emerald-500" : "text-rose-500"} />
                  <StatCard icon={BookOpen} label="Avg Grade" value={avgGrade(selected.assignmentSubmissions) !== null ? `${avgGrade(selected.assignmentSubmissions)}%` : "N/A"} color="text-amber-500" />
                  <StatCard icon={MessageCircle} label="Sessions" value={String(selected.counselingSessions.length)} color="text-indigo-500" />
                </div>
              </div>

              {/* Enrolled classrooms */}
              {selected.enrolledClassrooms.length > 0 && (
                <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-4 rounded-2xl border border-blue-500/10">
                  <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Enrolled Course Classrooms</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.enrolledClassrooms.map(c => (
                      <span key={c.id} className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">{c.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Log Session Form */}
              <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-5 rounded-2xl border border-blue-500/20 shadow-xl">
                <h3 className="text-xs font-extrabold text-foreground mb-3 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-500" /> Log Counseling Session
                </h3>
                <form onSubmit={handleLogSession} className="flex flex-col gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {(["GENERAL", "ACADEMIC", "PERSONAL", "CAREER"] as SessionType[]).map(type => {
                      const Icon = SESSION_ICONS[type]
                      return (
                        <button key={type} type="button" onClick={() => setLogForm(f => ({ ...f, sessionType: type }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            logForm.sessionType === type 
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20" 
                              : "neu-flat dark:bg-white/5 text-muted-foreground hover:text-foreground"
                          }`}>
                          <Icon className="w-3.5 h-3.5" /> {type}
                        </button>
                      )
                    })}
                  </div>
                  <textarea value={logForm.summary} onChange={e => setLogForm(f => ({ ...f, summary: e.target.value }))} required rows={3}
                    placeholder="Enter session summary and guidance offered..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground resize-none" />
                  <input value={logForm.nextAction} onChange={e => setLogForm(f => ({ ...f, nextAction: e.target.value }))}
                    placeholder="Next action or follow-up recommendation (optional)..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
                  <button type="submit" disabled={logging || !logForm.summary}
                    className="flex items-center gap-2 px-5 py-2.5 self-start rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
                    {logging ? <Loader2 className="w-4 h-4 animate-spin" /> : logSaved ? <CheckCircle2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                    {logSaved ? "Saved Session!" : "Save Session"}
                  </button>
                </form>
              </div>

              {/* Session History */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-extrabold text-foreground">Past Session Logs</h3>
                {selected.counselingSessions.length === 0 ? (
                  <div className="p-6 text-center bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <MessageCircle className="w-6 h-6 mx-auto text-blue-500/40 mb-1" />
                    <p className="text-xs text-muted-foreground font-semibold">No counseling sessions recorded for this mentee yet.</p>
                  </div>
                ) : (
                  selected.counselingSessions.map((s: any) => {
                    const Icon = SESSION_ICONS[s.sessionType as SessionType] || MessageCircle
                    const color = SESSION_COLORS[s.sessionType as SessionType] || "text-blue-500 bg-blue-500/10 border-blue-500/20"
                    return (
                      <div key={s.id} className="neu-flat dark:bg-white/5 dark:border-white/10 p-4 rounded-2xl flex gap-3 border border-blue-500/10">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">{s.sessionType}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{new Date(s.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground">{s.summary}</p>
                          {s.nextAction && <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-bold">→ Follow-up Action: {s.nextAction}</p>}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-12 rounded-2xl flex items-center justify-center border border-blue-500/10">
              <div className="text-center">
                <User className="w-10 h-10 mx-auto text-blue-500/40 mb-2" />
                <p className="text-xs font-bold text-foreground">Select a mentee from the left roster to view portfolio & log sessions</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-3 rounded-xl text-center border border-blue-500/10">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
      <p className={`text-base font-extrabold ${color}`}>{value}</p>
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  )
}
