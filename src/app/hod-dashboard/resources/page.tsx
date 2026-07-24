"use client"

import { useState } from "react"
import { Package, Monitor, FileCode2, Archive, ClipboardList, PenTool, Plus, Search, Filter } from "lucide-react"

const TABS = [
  { id: "equipment", label: "Laboratory Equipment", icon: Monitor },
  { id: "software", label: "Software & Licenses", icon: FileCode2 },
  { id: "inventory", label: "Inventory", icon: Archive },
  { id: "requests", label: "Resource Requests", icon: ClipboardList },
  { id: "maintenance", label: "Maintenance", icon: PenTool },
]

const EQUIPMENT = [
  { name: "Dell OptiPlex 7090", model: "Core i7, 16GB RAM", serial: "DOP-2023-001", category: "Computers", location: "Lab 101", status: "Available", lastMaintenance: "Jul 01, 2025" },
  { name: "Dell OptiPlex 7090", model: "Core i7, 16GB RAM", serial: "DOP-2023-002", category: "Computers", location: "Lab 101", status: "In Use", lastMaintenance: "Jul 01, 2025" },
  { name: "Cisco Catalyst 9300", model: "48-port PoE+", serial: "CS-9300-112", category: "Networking", location: "Server Room", status: "Available", lastMaintenance: "Jun 15, 2025" },
  { name: "NVIDIA Jetson Nano", model: "Developer Kit V3", serial: "NV-JN-405", category: "Lab Equipment", location: "AI Lab", status: "Maintenance", lastMaintenance: "Jul 10, 2025" },
  { name: "Epson EB-X41", model: "XGA Projector", serial: "EP-PR-882", category: "Other", location: "Room 302", status: "Available", lastMaintenance: "May 20, 2025" },
]

const STATUS_COLORS: Record<string, string> = {
  "Available": "bg-emerald-500/10 text-emerald-400",
  "In Use": "bg-indigo-500/10 text-indigo-400",
  "Maintenance": "bg-amber-500/10 text-amber-400",
  "Damaged": "bg-red-500/10 text-red-400",
}

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("equipment")
  const [search, setSearch] = useState("")
  
  const filtered = EQUIPMENT.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.serial.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent backdrop-blur-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Department Resources</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage equipment, software licenses, inventory, and maintenance</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium border border-violet-500/30 transition-colors">
            <Plus className="w-4 h-4" /> Add New Resource
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            Import Resources
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Assets", value: 450, color: "text-violet-400" },
          { label: "Available", value: 312, color: "text-emerald-400" },
          { label: "In Use", value: 125, color: "text-indigo-400" },
          { label: "In Maintenance", value: 13, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5">
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
        <div className="flex border-b border-white/10 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "text-violet-400 border-violet-500 bg-violet-500/5"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "equipment" && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50" placeholder="Search equipment by name or serial..." />
                </div>
                <select className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground">
                  <option>All Status</option><option>Available</option><option>In Use</option><option>Maintenance</option>
                </select>
                <select className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground">
                  <option>All Categories</option><option>Computers</option><option>Networking</option><option>Lab Equipment</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Name", "Model", "Serial No.", "Category", "Location", "Status", "Last Maintenance", "Actions"].map(h => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-3 font-medium text-foreground">{e.name}</td>
                        <td className="py-3 px-3 text-muted-foreground">{e.model}</td>
                        <td className="py-3 px-3 font-mono text-violet-400">{e.serial}</td>
                        <td className="py-3 px-3 text-muted-foreground">{e.category}</td>
                        <td className="py-3 px-3 text-muted-foreground">{e.location}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[e.status]}`}>{e.status}</span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{e.lastMaintenance}</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1.5">
                            <button className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-foreground">View</button>
                            <button className="text-xs px-2 py-1 rounded bg-violet-500/10 text-violet-300">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab !== "equipment" && (
            <div className="py-12 text-center text-muted-foreground">
              Module under development. Check back later.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
