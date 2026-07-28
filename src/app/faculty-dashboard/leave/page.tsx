"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Loader2, CheckCircle2, XCircle, AlertCircle, PlusCircle, ChevronRight, Users } from "lucide-react"

type LeaveType = "CL" | "ML" | "OD" | "COMP_OFF"
type Slot = { id: string; dayOfWeek: number; periodNo: number; subject: string; classGroup: string; startTime: string; endTime: string }
type Faculty = { id: string; name: string; email: string }
type Sub = { slotId: string; date: string; substituteId: string }
type Leave = { id: string; leaveType: string; fromDate: string; toDate: string; reason: string; status: string; hodRemark: string | null; appliedAt: string; substitutions: any[] }

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING:     { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock, label: "Pending HOD Review" },
  SUB_PENDING: { color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: AlertCircle, label: "Awaiting Substitute Response" },
  APPROVED:    { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, label: "Approved by HOD" },
  REJECTED:    { color: "text-rose-500 bg-rose-500/10 border-rose-500/20", icon: XCircle, label: "Rejected" },
}

function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = []
  const start = new Date(from)
  const end = new Date(to)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day >= 1 && day <= 5) dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({ leaveType: "CL" as LeaveType, fromDate: "", toDate: "", reason: "" })
  const [subs, setSubs] = useState<Sub[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/faculty/leave").then(r => r.json()),
      fetch("/api/faculty/timetable").then(r => r.json()),
      fetch("/api/faculty/colleagues").then(r => r.json()).catch(() => []),
    ]).then(([leavesData, slotsData, facultiesData]) => {
      setLeaves(Array.isArray(leavesData) ? leavesData : [])
      setSlots(Array.isArray(slotsData) ? slotsData : [])
      setFaculties(Array.isArray(facultiesData) ? facultiesData : [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!form.fromDate || !form.toDate || slots.length === 0) return
    const dates = getDatesInRange(form.fromDate, form.toDate)
    const affected: Sub[] = []
    dates.forEach(date => {
      const dayOfWeek = new Date(date).getDay()
      const daySlots = slots.filter(s => s.dayOfWeek === dayOfWeek)
      daySlots.forEach(s => affected.push({ slotId: s.id, date, substituteId: "" }))
    })
    setSubs(affected)
  }, [form.fromDate, form.toDate, slots])

  const handleSubmit = async () => {
    if (!form.fromDate || !form.toDate || !form.reason) return
    if (subs.some(s => !s.substituteId)) {
      alert("Please assign a substitute faculty for every affected period.")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/faculty/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, substitutions: subs }),
    })
    const data = await res.json()
    if (res.ok) {
      setLeaves(l => [data, ...l])
      setShowForm(false)
      setStep(1)
      setForm({ leaveType: "CL", fromDate: "", toDate: "", reason: "" })
      setSubs([])
    }
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 md:p-8 text-foreground">
      {/* Header Banner — Clean layout without box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leave & Timetable Alteration</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">Apply for leave, assign peer substitute faculty for affected periods, and track HOD approvals.</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setStep(1) }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 hover:scale-105 transition-all flex items-center gap-2 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" /> Apply New Leave
        </button>
      </div>

      {/* Multi-step form */}
      {showForm && (
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-2xl border border-blue-500/20 shadow-xl">
          {/* Steps indicator */}
          <div className="flex items-center gap-3 mb-6 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all ${step >= s ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20" : "bg-black/10 dark:bg-white/10 text-muted-foreground"}`}>{s}</div>
                <span className={`text-xs font-extrabold hidden sm:block ${step === s ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>
                  {s === 1 ? "1. Leave Details" : s === 2 ? "2. Assign Substitutes" : "3. Final Review"}
                </span>
                {s < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto hidden sm:block" />}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Leave Type</label>
                  <select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value as LeaveType }))}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground">
                    {["CL", "ML", "OD", "COMP_OFF"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">From Date</label>
                  <input type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">To Date</label>
                  <input type="date" value={form.toDate} min={form.fromDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
                </div>
                <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Reason for Leave</label>
                  <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3}
                    placeholder="Enter explicit reason..." className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} disabled={!form.fromDate || !form.toDate || !form.reason}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-md shadow-blue-500/20">Continue to Substitute Assignment →</button>
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl neu-flat dark:bg-white/5 text-xs font-bold">Cancel</button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Assign Substitutes for Affected Timetable Periods
              </h3>
              {subs.length === 0 ? (
                <p className="text-xs text-muted-foreground bg-blue-500/5 p-4 rounded-xl">No active timetable slots affected during selected dates.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {subs.map((sub, i) => {
                    const slot = slots.find(s => s.id === sub.slotId)
                    return (
                      <div key={i} className="neu-flat dark:bg-white/5 dark:border-white/10 p-4 rounded-xl flex flex-wrap items-center gap-4 border border-blue-500/10">
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-xs font-extrabold text-foreground">{sub.date} · Period {slot?.periodNo}</p>
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{slot?.subject} ({slot?.classGroup}) {slot?.startTime}–{slot?.endTime}</p>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 block">Substitute Faculty</label>
                          <select value={sub.substituteId}
                            onChange={e => setSubs(ss => ss.map((s, j) => j === i ? { ...s, substituteId: e.target.value } : s))}
                            className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground">
                            <option value="">Select substitute faculty...</option>
                            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all shadow-md shadow-blue-500/20">Review Application →</button>
                <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl neu-flat dark:bg-white/5 text-xs font-bold">← Back</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-foreground">Application Summary</h3>
              <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-5 rounded-2xl space-y-2.5 text-xs border border-blue-500/10">
                <div className="flex gap-2"><span className="font-extrabold text-blue-600 dark:text-blue-400 w-32">Leave Type:</span><span className="font-bold text-foreground">{form.leaveType}</span></div>
                <div className="flex gap-2"><span className="font-extrabold text-blue-600 dark:text-blue-400 w-32">Duration:</span><span className="font-bold text-foreground">{form.fromDate} to {form.toDate}</span></div>
                <div className="flex gap-2"><span className="font-extrabold text-blue-600 dark:text-blue-400 w-32">Reason:</span><span className="font-bold text-foreground">{form.reason}</span></div>
                <div className="flex gap-2"><span className="font-extrabold text-blue-600 dark:text-blue-400 w-32">Substitutions:</span><span className="font-bold text-emerald-500">{subs.filter(s => s.substituteId).length} of {subs.length} assigned</span></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Submit Leave Application
                </button>
                <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl neu-flat dark:bg-white/5 text-xs font-bold">← Back</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing requests */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          My Submitted Leave Applications
        </h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : leaves.length === 0 ? (
          <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-12 rounded-2xl text-center border border-blue-500/10">
            <Calendar className="w-12 h-12 mx-auto text-blue-500/40 mb-3" />
            <p className="text-sm font-bold text-foreground">No leave applications submitted yet</p>
          </div>
        ) : (
          leaves.map((leave) => {
            const cfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG["PENDING"]
            const Icon = cfg.icon
            return (
              <div key={leave.id} className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-2xl flex flex-col gap-4 border border-blue-500/10 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">{leave.leaveType}</span>
                      <span className={`flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-xl border ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-foreground">{new Date(leave.fromDate).toLocaleDateString()} → {new Date(leave.toDate).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{leave.reason}</p>
                    {leave.hodRemark && <p className="text-xs text-amber-500 mt-2 font-semibold bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">HOD Remark: "{leave.hodRemark}"</p>}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground shrink-0">{new Date(leave.appliedAt).toLocaleDateString()}</p>
                </div>

                {leave.substitutions?.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Substitution Responses</p>
                    <div className="flex flex-wrap gap-2">
                      {leave.substitutions.map((sub: any) => {
                        const subCfg = sub.status === "ACCEPTED" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : sub.status === "REJECTED" ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                        return (
                          <div key={sub.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold border ${subCfg}`}>
                            {sub.status === "ACCEPTED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : sub.status === "REJECTED" ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {sub.date} · {sub.substitute?.name || "Substitute"} ({sub.status})
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
