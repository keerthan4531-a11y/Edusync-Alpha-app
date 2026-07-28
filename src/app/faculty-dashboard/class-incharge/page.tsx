"use client"

import { useState, useEffect } from "react"
import { ClipboardCheck, CheckCircle2, XCircle, ArrowUpRight, Loader2, Clock, AlertCircle } from "lucide-react"

type Leave = {
  id: string
  fromDate: string
  toDate: string
  reason: string
  leaveType: string
  status: string
  inchargeRemark: string | null
  appliedAt: string
  student: {
    id: string; name: string; email: string
    studentProfile?: { rollNumber?: string; batch?: string; semester?: number } | null
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:           { label: "Pending Review",   color: "text-amber-500 bg-amber-500/10 border-amber-500/20",   icon: Clock },
  APPROVED:          { label: "Approved",         color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  REJECTED:          { label: "Rejected",         color: "text-rose-500 bg-rose-500/10 border-rose-500/20",     icon: XCircle },
  FORWARDED_TO_HOD:  { label: "Forwarded to HOD",color: "text-blue-500 bg-blue-500/10 border-blue-500/20",     icon: ArrowUpRight },
}

const LEAVE_TYPE_COLORS: Record<string, string> = {
  MEDICAL: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  PERSONAL: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  EVENT: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  EXAM: "text-amber-500 bg-amber-500/10 border-amber-500/20",
}

export default function ClassInchargePage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [remarkMap, setRemarkMap] = useState<Record<string, string>>({})
  const [filterStatus, setFilterStatus] = useState("ALL")

  useEffect(() => {
    fetch("/api/faculty/student-leaves")
      .then(r => r.json())
      .then(data => { setLeaves(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED" | "FORWARDED_TO_HOD") => {
    setActionId(id)
    const res = await fetch(`/api/faculty/student-leaves/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, inchargeRemark: remarkMap[id] || null }),
    })
    if (res.ok) {
      setLeaves(l => l.map(lv => lv.id === id ? { ...lv, status: action, inchargeRemark: remarkMap[id] || null } : lv))
    }
    setActionId(null)
  }

  const filtered = filterStatus === "ALL" ? leaves : leaves.filter(l => l.status === filterStatus)
  const pendingCount = leaves.filter(l => l.status === "PENDING").length

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 md:p-8 text-foreground">
      {/* Header Banner — Clean layout without box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Leave Approvals</h1>
            {pendingCount > 0 && (
              <span className="text-[11px] font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
            Review, approve, reject or forward leave applications for students in your incharge section.
          </p>
        </div>
      </div>

      {/* Filter Navigation */}
      <div className="flex gap-2 flex-wrap border-b border-black/10 dark:border-white/10 pb-3">
        {["ALL", "PENDING", "APPROVED", "REJECTED", "FORWARDED_TO_HOD"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === s 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20" 
                : "neu-flat dark:bg-white/5 text-muted-foreground hover:text-foreground"
            }`}>
            {s === "ALL" ? "All Requests" : s === "FORWARDED_TO_HOD" ? "Forwarded to HOD" : s.charAt(0) + s.slice(1).toLowerCase()}
            <span className="ml-1.5 text-[10px] opacity-80">({leaves.filter(l => s === "ALL" || l.status === s).length})</span>
          </button>
        ))}
      </div>

      {/* Requests */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-12 rounded-2xl text-center border border-blue-500/10 shadow-xl">
          <ClipboardCheck className="w-12 h-12 mx-auto text-blue-500/40 mb-3" />
          <p className="text-sm font-bold text-foreground">No {filterStatus !== "ALL" ? filterStatus.toLowerCase() : ""} leave applications found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((leave) => {
            const cfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG["PENDING"]
            const StatusIcon = cfg.icon
            const isPending = leave.status === "PENDING"
            return (
              <div key={leave.id} className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-2xl flex flex-col gap-4 border border-blue-500/10 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-md shadow-blue-500/20">
                      {leave.student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-foreground">{leave.student.name}</p>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{leave.student.email}</p>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                        {leave.student.studentProfile?.rollNumber || "No Roll #"} · Batch {leave.student.studentProfile?.batch || "—"} · Sem {leave.student.studentProfile?.semester || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl border ${LEAVE_TYPE_COLORS[leave.leaveType] || "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>{leave.leaveType}</span>
                    <span className={`flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-xl border ${cfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-blue-500/5 dark:bg-white/5 p-3 rounded-xl border border-blue-500/10">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest">Start Date</p>
                    <p className="font-extrabold text-foreground mt-0.5">{new Date(leave.fromDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-blue-500/5 dark:bg-white/5 p-3 rounded-xl border border-blue-500/10">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest">End Date</p>
                    <p className="font-extrabold text-foreground mt-0.5">{new Date(leave.toDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-blue-500/5 dark:bg-white/5 p-3 rounded-xl border border-blue-500/10">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest">Applied On</p>
                    <p className="font-extrabold text-foreground mt-0.5">{new Date(leave.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-blue-500/5 dark:bg-white/5 p-4 rounded-xl border border-blue-500/10">
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest mb-1">Reason Statement</p>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">{leave.reason}</p>
                </div>

                {leave.inchargeRemark && (
                  <div className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">Incharge Remark: "{leave.inchargeRemark}"</p>
                  </div>
                )}

                {isPending && (
                  <div className="flex flex-col gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                    <input
                      value={remarkMap[leave.id] || ""}
                      onChange={e => setRemarkMap(m => ({ ...m, [leave.id]: e.target.value }))}
                      placeholder="Add an optional remark for the student..."
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleAction(leave.id, "APPROVED")} disabled={actionId === leave.id}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20">
                        {actionId === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve Leave
                      </button>
                      <button onClick={() => handleAction(leave.id, "REJECTED")} disabled={actionId === leave.id}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-md shadow-rose-500/20">
                        {actionId === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject Leave
                      </button>
                      <button onClick={() => handleAction(leave.id, "FORWARDED_TO_HOD")} disabled={actionId === leave.id}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-md shadow-blue-500/20">
                        {actionId === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />} Forward to HOD
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
