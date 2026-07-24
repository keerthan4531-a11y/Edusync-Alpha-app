"use client"

import { useState } from "react"
import { Building, BookOpen, Settings, Cloud, Database, AlertTriangle, Save, RefreshCw, Upload, Shield } from "lucide-react"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string | null>("info")
  const [theme, setTheme] = useState("purple")
  
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent backdrop-blur-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Department Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage department information, academic parameters, and system configurations</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium border border-violet-500/30 transition-colors">
            <Save className="w-4 h-4" /> Save All Changes
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            <RefreshCw className="w-4 h-4" /> Reset Defaults
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            <Database className="w-4 h-4" /> Backup Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            <Upload className="w-4 h-4" /> Import Settings
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Section 1: Department Information */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
          <button 
            onClick={() => toggleSection("info")}
            className="w-full flex items-center justify-between p-5 text-left bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400"><Building className="w-5 h-5" /></div>
              <div>
                <h2 className="font-semibold text-foreground">Department Information</h2>
                <p className="text-xs text-muted-foreground">Basic details and location</p>
              </div>
            </div>
          </button>
          {activeSection === "info" && (
            <div className="p-6 border-t border-white/10 grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-foreground">Basic Information</h3>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">Department Name</label><input defaultValue="Computer Science & Engineering" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Department Code</label><input defaultValue="CSE" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Email Contact</label><input defaultValue="hod.cse@edusync.edu" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" /></div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-foreground">Location Details</h3>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">Building</label><input defaultValue="Tech Block A" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Room Number</label><input defaultValue="A-401" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Campus</label>
                    <select className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground">
                      <option>Main Campus</option><option>South Campus</option><option>North Campus</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Academic Settings */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
          <button 
            onClick={() => toggleSection("academic")}
            className="w-full flex items-center justify-between p-5 text-left bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400"><BookOpen className="w-5 h-5" /></div>
              <div>
                <h2 className="font-semibold text-foreground">Academic Settings</h2>
                <p className="text-xs text-muted-foreground">Calendar, curriculum rules, and grading</p>
              </div>
            </div>
          </button>
          {activeSection === "academic" && (
            <div className="p-6 border-t border-white/10 grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-foreground">Academic Calendar</h3>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">Current Academic Year</label><input defaultValue="2025-2026" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Semester Duration (Weeks)</label><input type="number" defaultValue={16} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" /></div>
                  <button className="text-xs text-indigo-400 font-medium hover:underline">Edit Detailed Calendar</button>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-foreground">Curriculum Settings</h3>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">Min Credits for Graduation</label><input type="number" defaultValue={160} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Pass Percentage</label><input type="number" defaultValue={40} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">GPA Scale</label>
                    <select className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground">
                      <option>10-point Scale</option><option>4-point Scale</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: System Settings */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
          <button 
            onClick={() => toggleSection("system")}
            className="w-full flex items-center justify-between p-5 text-left bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Settings className="w-5 h-5" /></div>
              <div>
                <h2 className="font-semibold text-foreground">System Settings</h2>
                <p className="text-xs text-muted-foreground">Notifications, security, and appearance</p>
              </div>
            </div>
          </button>
          {activeSection === "system" && (
            <div className="p-6 border-t border-white/10 grid gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-foreground">Notifications</h3>
                <div className="space-y-3">
                  {["Email Notifications", "Push Notifications", "Urgent Alerts", "Event Reminders"].map(n => (
                    <label key={n} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/5" /> {n}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-foreground">Security & Permissions</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/5" /> Two-Factor Auth
                  </label>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Session Timeout</label>
                    <select className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground">
                      <option>30 minutes</option><option>60 minutes</option>
                    </select>
                  </div>
                  <button className="text-xs text-emerald-400 font-medium hover:underline">Manage Password Policy</button>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-foreground">Theme & Appearance</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/5" /> Dark Mode
                  </label>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Primary Color</label>
                    <div className="flex gap-2">
                      {[
                        { id: "purple", color: "bg-purple-500" },
                        { id: "indigo", color: "bg-indigo-500" },
                        { id: "emerald", color: "bg-emerald-500" },
                        { id: "blue", color: "bg-blue-500" },
                        { id: "amber", color: "bg-amber-500" },
                      ].map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => setTheme(c.id)}
                          className={`w-6 h-6 rounded-full ${c.color} ${theme === c.id ? "ring-2 ring-white/50 ring-offset-2 ring-offset-zinc-950" : ""}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Section 6: Danger Zone */}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 backdrop-blur-2xl overflow-hidden mt-4">
          <button 
            onClick={() => toggleSection("danger")}
            className="w-full flex items-center justify-between p-5 text-left bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-500"><AlertTriangle className="w-5 h-5" /></div>
              <div>
                <h2 className="font-semibold text-red-400">Danger Zone</h2>
                <p className="text-xs text-red-500/70">Irreversible actions and data management</p>
              </div>
            </div>
          </button>
          {activeSection === "danger" && (
            <div className="p-6 border-t border-red-500/20 grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <h3 className="text-sm font-semibold text-red-400">Data Management</h3>
                <p className="text-xs text-red-400/80 mb-2">Clear cache to resolve issues, or delete old records (older than 5 years).</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium border border-red-500/30 transition-colors">Clear Cache</button>
                  <button className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium border border-red-500/30 transition-colors">Delete Old Data</button>
                </div>
              </div>
              <div className="flex flex-col gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <h3 className="text-sm font-semibold text-red-400">Account & Access</h3>
                <p className="text-xs text-red-400/80 mb-2">Transfer HOD ownership to another faculty member or archive this department.</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium border border-red-500/30 transition-colors">Transfer Ownership</button>
                  <button className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold transition-colors shadow-[0_0_15px_rgba(239,68,68,0.5)]">Archive Department</button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
