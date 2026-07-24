"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Clock, Filter, Search, AlertTriangle, CheckSquare } from "lucide-react"

type Priority = "urgent" | "high" | "medium" | "low"
type Status = "pending" | "approved" | "rejected" | "deferred"

interface Approval {
  id: number
  title: string
  type: string
  requester: string
  priority: Priority
  status: Status
  submitted: string
  due: string
  description: string
}

const INITIAL_APPROVALS: Approval[] = [
  { id: 1, title: "Request to Create ML Community", type: "Faculty Community", requester: "Dr. Meera Nair", priority: "urgent", status: "pending", submitted: "Jul 18, 2025", due: "Jul 20, 2025", description: "Requesting permission to create a Machine Learning research community for inter-departmental collaboration." },
  { id: 2, title: "Leave Application — 3 Days", type: "Faculty Leave", requester: "Dr. Arun Kumar", priority: "high", status: "pending", submitted: "Jul 17, 2025", due: "Jul 21, 2025", description: "Medical leave required from July 22-24, 2025. Classes will be covered by Dr. Priya Sharma." },
  { id: 3, title: "20 Additional Laptops for Lab 102", type: "Resource Request", requester: "Dr. Rajan Pillai", priority: "high", status: "pending", submitted: "Jul 16, 2025", due: "Jul 25, 2025", description: "Current lab equipment is outdated. Requesting 20 laptops with i7 processor for new semester needs." },
  { id: 4, title: "Q3 Budget Allocation — Research", type: "Budget Allocation", requester: "Dr. Priya Sharma", priority: "medium", status: "pending", submitted: "Jul 15, 2025", due: "Jul 28, 2025", description: "Requesting ₹5 lakhs for research activities, conference participation, and publication fees in Q3." },
  { id: 5, title: "Syllabus Update — CS401", type: "Curriculum Change", requester: "Dr. Meera Nair", priority: "medium", status: "approved", submitted: "Jul 10, 2025", due: "Jul 15, 2025", description: "Proposing to add 2 new modules on Large Language Models to the CS401 Machine Learning curriculum." },
  { id: 6, title: "AI Workshop — August 10", type: "Event Permission", requester: "Dr. Sunita Rao", priority: "low", status: "approved", submitted: "Jul 8, 2025", due: "Jul 20, 2025", description: "Requesting permission to host a 1-day AI workshop for 3rd and 4th year students on Aug 10, 2025." },
  { id: 7, title: "Grade Appeal — Student ID 2024CS112", type: "Student Request", requester: "Student Affairs", priority: "medium", status: "rejected", submitted: "Jul 5, 2025", due: "Jul 12, 2025", description: "Student appeals internal marks for CS302. Requires HOD review and faculty verification." },
]

const PRIORITY_BORDER: Record<Priority, string> = {
  urgent: "border-l-4 border-l-red-500",
  high: "border-l-4 border-l-amber-500",
  medium: "border-l-4 border-l-indigo-500",
  low: "border-l-4 border-l-emerald-500",
}

const PRIORITY_BADGE: Record<Priority, string> = {
  urgent: "bg-red-500/10 text-red-400",
  high: "bg-amber-500/10 text-amber-400",
  medium: "bg-indigo-500/10 text-indigo-400",
  low: "bg-emerald-500/10 text-emerald-400",
}

const STATUS_BADGE: Record<Status, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
  deferred: "bg-zinc-500/10 text-zinc-400",
}

const TYPE_BADGE: Record<string, string> = {
  "Faculty Community": "bg-violet-500/10 text-violet-400",
  "Faculty Leave": "bg-indigo-500/10 text-indigo-400",
  "Resource Request": "bg-emerald-500/10 text-emerald-400",
  "Budget Allocation": "bg-amber-500/10 text-amber-400",
  "Curriculum Change": "bg-pink-500/10 text-pink-400",
  "Event Permission": "bg-violet-500/10 text-violet-400",
  "Student Request": "bg-blue-500/10 text-blue-400",
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS)
  const [filterStatus, setFilterStatus] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = approvals.filter(a => {
    const matchStatus = filterStatus === "all" || a.status === filterStatus
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.requester.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const pending = approvals.filter(a => a.status === "pending").length
  const urgent = approvals.filter(a => a.priority === "urgent" && a.status === "pending").length

  const handleAction = (id: number, action: Status) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action } : a))
  }

  const FILTER_TABS: { label: string; value: string; count?: number }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending", count: pending },
    { label: "Urgent", value: "urgent" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ]

  const urgentFiltered = approvals.filter(a => a.priority === "urgent" && a.status === "pending")
  const displayList = filterStatus === "urgent" ? urgentFiltered : filtered

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent backdrop-blur-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Approvals Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">Review and approve requests from faculty, staff, and students</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium border border-violet-500/30 transition-colors">
            <CheckSquare className="w-4 h-4" /> Quick Approve All
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Requests", value: approvals.length, color: "text-violet-400" },
          { label: "Pending", value: pending, color: "text-amber-400" },
          { label: "Urgent", value: urgent, color: "text-red-400" },
          { label: "Approved This Month", value: approvals.filter(a => a.status === "approved").length, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5">
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50" placeholder="Search by title or requester..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                filterStatus === tab.value
                  ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab.count > 0 ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-muted-foreground"}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals Grid */}
      {displayList.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-12 text-center text-muted-foreground">
          No approvals found for this filter.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {displayList.map((a) => (
            <div key={a.id} className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 flex flex-col gap-3 ${PRIORITY_BORDER[a.priority]} hover:border-white/20 transition-colors relative`}>
              {/* Status badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[a.type] || "bg-white/10 text-muted-foreground"}`}>{a.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[a.priority]}`}>{a.priority.charAt(0).toUpperCase() + a.priority.slice(1)}</span>
                  </div>
                  <p className="font-semibold text-foreground">{a.title}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[a.status]}`}>
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
              </div>

              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>By: <span className="text-foreground">{a.requester}</span></span>
                <span>Due: <span className="text-foreground">{a.due}</span></span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>

              {a.status === "pending" && (
                <div className="flex gap-2 pt-1 border-t border-white/10">
                  <button onClick={() => handleAction(a.id, "approved")} className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => handleAction(a.id, "rejected")} className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button onClick={() => handleAction(a.id, "deferred")} className="flex items-center gap-1.5 justify-center px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground text-xs font-medium border border-white/10 transition-colors">
                    <Clock className="w-3.5 h-3.5" /> Defer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All Approvals Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">All Approvals</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Title", "Type", "Requester", "Priority", "Status", "Submitted", "Due Date"].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvals.map((a) => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-3 font-medium text-foreground">{a.title}</td>
                  <td className="py-3 px-3"><span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_BADGE[a.type] || ""}`}>{a.type}</span></td>
                  <td className="py-3 px-3 text-muted-foreground">{a.requester}</td>
                  <td className="py-3 px-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[a.priority]}`}>{a.priority}</span></td>
                  <td className="py-3 px-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[a.status]}`}>{a.status}</span></td>
                  <td className="py-3 px-3 text-muted-foreground">{a.submitted}</td>
                  <td className="py-3 px-3 text-muted-foreground">{a.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
