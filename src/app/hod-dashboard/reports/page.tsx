"use client"

import { useState } from "react"
import { FileText, Clock, Download, Plus, Search, CheckCircle2, XCircle, Settings, PieChart } from "lucide-react"

const REPORTS = [
  { id: 1, title: "Monthly Attendance Report", type: "Attendance", author: "Dr. Priya Sharma", date: "Jul 18, 2025", format: "PDF", size: "2.4 MB", status: "Generated" },
  { id: 2, title: "Semester Results Analysis", type: "Academic", author: "Dr. Arun Kumar", date: "Jul 15, 2025", format: "Excel", size: "5.1 MB", status: "Generated" },
  { id: 3, title: "Faculty Performance Q2", type: "Faculty", author: "System Auto", date: "Jul 01, 2025", format: "PDF", size: "1.8 MB", status: "Generated" },
  { id: 4, title: "Lab Equipment Utilization", type: "Resource", author: "Dr. Rajan Pillai", date: "Jun 28, 2025", format: "CSV", size: "850 KB", status: "Generated" },
  { id: 5, title: "Annual Placement Stats", type: "Placement", author: "Placement Cell", date: "Jun 15, 2025", format: "PDF", size: "3.2 MB", status: "Generated" },
  { id: 6, title: "Q3 Budget Forecast", type: "Financial", author: "Dr. Priya Sharma", date: "Pending", format: "Excel", size: "-", status: "Scheduled" },
  { id: 7, title: "Weekly Student At-Risk", type: "Academic", author: "System Auto", date: "Pending", format: "JSON", size: "-", status: "Pending" },
]

const TABS = [
  { id: "all", label: "All Reports" },
  { id: "recent", label: "Recently Generated" },
  { id: "scheduled", label: "Scheduled" },
  { id: "templates", label: "Report Templates" },
  { id: "analytics", label: "Usage Analytics" },
]

const STATUS_COLORS: Record<string, string> = {
  "Generated": "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  "Scheduled": "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  "Pending": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "Failed": "bg-red-500/10 text-red-400 border border-red-500/20",
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = REPORTS.filter(r => r.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent backdrop-blur-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Department Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">Generate, schedule, and analyze comprehensive departmental reports</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium border border-violet-500/30 transition-colors">
            <Plus className="w-4 h-4" /> Generate Custom Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            <Clock className="w-4 h-4" /> Schedule Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            <PieChart className="w-4 h-4" /> Report Analytics
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Generated", value: 124, color: "text-violet-400" },
          { label: "Scheduled Reports", value: 12, color: "text-indigo-400" },
          { label: "Storage Used", value: "245 MB", color: "text-emerald-400" },
          { label: "Pending Generation", value: 3, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5">
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
        <div className="flex border-b border-white/10 overflow-x-auto px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "text-violet-400 border-violet-500"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "all" && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50" placeholder="Search reports..." />
                </div>
                <select className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground">
                  <option>All Types</option><option>Academic</option><option>Attendance</option><option>Faculty</option><option>Financial</option>
                </select>
                <select className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground">
                  <option>All Time</option><option>Today</option><option>This Week</option><option>This Month</option><option>This Year</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Report Title", "Type", "Generated By", "Date", "Format", "Size", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-3 font-medium text-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4 text-violet-400" />
                          {r.title}
                        </td>
                        <td className="py-3 px-3"><span className="text-xs text-muted-foreground px-2 py-1 bg-white/5 rounded-md">{r.type}</span></td>
                        <td className="py-3 px-3 text-muted-foreground">{r.author}</td>
                        <td className="py-3 px-3 text-muted-foreground">{r.date}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs font-bold ${r.format === 'PDF' ? 'text-red-400' : r.format === 'Excel' ? 'text-emerald-400' : 'text-blue-400'}`}>{r.format}</span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{r.size}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            {r.status === "Generated" && (
                              <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-foreground transition-colors" title="Download">
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-foreground transition-colors" title="Details">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab !== "all" && (
            <div className="py-12 text-center text-muted-foreground">
              Module under development. Check back later.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
