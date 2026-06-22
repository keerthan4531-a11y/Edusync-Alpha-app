"use client"

import { useState, useEffect } from "react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, Search, Filter, CheckCircle2, AlertCircle, FileCode2, 
  ChevronRight, ArrowLeft, Send, Check, X, Code, ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([])
  const [selectedSub, setSelectedSub] = useState<any | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [classrooms, setClassrooms] = useState<any[]>([])

  // Grading form states
  const [gradeInput, setGradeInput] = useState("")
  const [feedbackInput, setFeedbackInput] = useState("")

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch submissions from API
  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/faculty/submissions")
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
        
        // Extract unique classrooms for filters
        const uniqueClasses: any[] = []
        const classIds = new Set()
        data.submissions?.forEach((s: any) => {
          const cls = s.assignment?.classroom
          if (cls && !classIds.has(cls.id)) {
            classIds.add(cls.id)
            uniqueClasses.push(cls)
          }
        })
        setClassrooms(uniqueClasses)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = [...submissions]

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (s) =>
          s.student.name.toLowerCase().includes(term) ||
          s.assignment.title.toLowerCase().includes(term)
      )
    }

    // Classroom filter
    if (classFilter !== "all") {
      result = result.filter((s) => s.assignment.classroom.id === classFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter)
    }

    setFilteredSubmissions(result)
  }, [submissions, searchTerm, classFilter, statusFilter])

  // Click submission
  const handleSelectSubmission = (sub: any) => {
    setSelectedSub(sub)
    setGradeInput(sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : "")
    setFeedbackInput(sub.feedback || "")
  }

  // Grade submission
  const handleGradeSubmission = async () => {
    if (!selectedSub || gradeInput === "") return
    try {
      setSubmitting(true)
      const res = await fetch("/api/faculty/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          grade: Number(gradeInput),
          feedback: feedbackInput,
        }),
      })

      if (res.ok) {
        alert("Submission graded successfully! Rewards awarded to student.")
        setSelectedSub(null)
        loadSubmissions()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to grade submission.")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 flex flex-col gap-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          Student Submissions
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review, analyze, and grade student submissions.
        </p>
      </div>

      {/* Main Grid: Submissions List VS Grading Panel */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        
        {/* Submissions List Column (2 cols wide) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Filters Bar */}
          <div className="glass-panel border border-[var(--glass-border)] rounded-2xl p-4 backdrop-blur-md relative overflow-hidden flex flex-wrap items-center gap-4 z-10">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search student or assignment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* Classroom filter */}
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-slate-900/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="all">All Classrooms</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="SUBMITTED">Pending Review</option>
                <option value="GRADED">Graded</option>
              </select>
            </div>
          </div>

          {/* List content */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
              ))}
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="glass-panel border border-[var(--glass-border)] rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="glass-noise" />
              <div className="p-3 bg-white/5 rounded-full border border-white/10 text-muted-foreground">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-foreground">No submissions found</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Try expanding your search query or modifying your filters.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={cn(
                    "glass-panel border border-white/5 rounded-2xl p-4 cursor-pointer hover:-translate-y-0.5 hover:border-white/10 transition-all flex justify-between items-center relative overflow-hidden gap-4",
                    selectedSub?.id === sub.id && "border-primary/40 bg-primary/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  )}
                >
                  <div className="glass-noise animate-pulse opacity-5" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-indigo-400 shrink-0">
                      <FileCode2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs md:text-sm text-foreground">{sub.student.name}</h4>
                        <span className="text-[10px] text-muted-foreground hidden md:inline">({sub.student.email})</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                        {sub.assignment.title} • <span className="text-indigo-400">{sub.assignment.classroom.name}</span>
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Submitted: {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10 shrink-0">
                    {sub.status === "GRADED" ? (
                      <div className="flex flex-col items-end">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Graded
                        </span>
                        <span className="text-xs font-extrabold text-foreground mt-1">{sub.grade}%</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grading details panel (1 col wide) */}
        <div className="lg:col-span-1">
          {selectedSub ? (
            <div className="glass-panel border border-[var(--glass-border)] rounded-3xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col gap-5 z-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="glass-noise animate-pulse opacity-10" />
              <div className="glass-specular" />

              <div className="flex justify-between items-center relative z-10 border-b border-white/5 pb-3">
                <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wide">Review & Grade</h3>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student/Asg summary */}
              <div className="relative z-10 flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Student</span>
                <span className="font-bold text-foreground">{selectedSub.student.name}</span>
                <span className="text-muted-foreground">{selectedSub.student.email}</span>

                <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider mt-3">Assignment</span>
                <span className="font-bold text-indigo-400">{selectedSub.assignment.title}</span>
                <span className="text-muted-foreground">Classroom: {selectedSub.assignment.classroom.name}</span>
              </div>

              {/* Submitted Content/Code */}
              <div className="relative z-10 flex flex-col gap-2 flex-1">
                <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Submitted Work</span>
                <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3.5 font-mono text-[10px] md:text-xs text-slate-300 max-h-48 overflow-y-auto w-full leading-relaxed no-scrollbar select-all whitespace-pre-wrap">
                  {selectedSub.code || "// Student has submitted empty content."}
                </div>
              </div>

              {/* Grading Input Fields */}
              <div className="relative z-10 flex flex-col gap-4 border-t border-white/5 pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-semibold">Award Score (0-100)%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 95"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-24"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-semibold">Feedback Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed comments or corrections..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleGradeSubmission}
                  disabled={gradeInput === "" || submitting}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.01] transition-all text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{selectedSub.status === "GRADED" ? "Update Grade" : "Submit Grade"}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-panel border border-[var(--glass-border)] border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 text-muted-foreground min-h-[300px]">
              <FileCode2 className="w-8 h-8 opacity-40 animate-pulse text-indigo-400" />
              <p className="text-xs leading-relaxed max-w-[200px] mx-auto">
                Select a student submission from the list to view code, write feedback, and submit grades.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
