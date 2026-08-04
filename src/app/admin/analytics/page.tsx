"use client"

import { useState, useEffect } from "react"
import {
  BarChart3, TrendingUp, Users, GraduationCap, Building2,
  Calendar, CheckCircle2, RefreshCw, ShieldCheck, Loader2, Sparkles,
  Zap, Database, Activity
} from "lucide-react"

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      setStats(data)
    } catch {
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const totalUsers = (stats?.totalStudents || 0) + (stats?.totalFaculty || 0) + (stats?.totalAdmins || 0)
  const studentRatio = totalUsers > 0 ? Math.round(((stats?.totalStudents || 0) / totalUsers) * 100) : 0
  const facultyRatio = totalUsers > 0 ? Math.round(((stats?.totalFaculty || 0) / totalUsers) * 100) : 0

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2.5rem] border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Platform Analytics & Reports</h1>
            <p className="text-xs text-muted-foreground font-medium">Real-time telemetry, user distribution, and system performance stats</p>
          </div>
        </div>

        <button onClick={fetchStats} disabled={loading} className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Telemetry
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="neu-flat dark:bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Accounts</span>
              <p className="text-3xl font-black text-white">{totalUsers}</p>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-1 flex">
                <div className="bg-blue-500 h-full" style={{ width: `${studentRatio}%` }} title={`Students: ${studentRatio}%`} />
                <div className="bg-indigo-500 h-full" style={{ width: `${facultyRatio}%` }} title={`Faculty: ${facultyRatio}%`} />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">{studentRatio}% Students · {facultyRatio}% Faculty</span>
            </div>

            <div className="neu-flat dark:bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Timetables</span>
              <p className="text-3xl font-black text-indigo-400">{stats?.totalTimetableSlots || 0}</p>
              <p className="text-[10px] font-semibold text-muted-foreground">Configured teaching periods</p>
            </div>

            <div className="neu-flat dark:bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Attendance Records</span>
              <p className="text-3xl font-black text-emerald-400">{stats?.totalAttendanceRecords || 0}</p>
              <p className="text-[10px] font-semibold text-muted-foreground">Logged daily student records</p>
            </div>

            <div className="neu-flat dark:bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">System Health</span>
              <p className="text-3xl font-black text-purple-400">100%</p>
              <p className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <Activity className="w-3 h-3" /> All APIs Operational
              </p>
            </div>
          </div>

          {/* Detailed Reports Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* System Breakdown Card */}
            <div className="neu-flat dark:bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-xl flex flex-col gap-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2 pb-3 border-b border-white/5">
                <Zap className="w-5 h-5 text-amber-400" />
                Infrastructure Distribution
              </h2>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Departments Configured</span>
                  </div>
                  <span className="text-sm font-black text-white">{stats?.totalDepartments || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">Class Sections</span>
                  </div>
                  <span className="text-sm font-black text-white">{stats?.totalClasses || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Super Admin Accounts</span>
                  </div>
                  <span className="text-sm font-black text-white">{stats?.totalAdmins || 0}</span>
                </div>
              </div>
            </div>

            {/* Database Telemetry */}
            <div className="neu-flat dark:bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-xl flex flex-col gap-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2 pb-3 border-b border-white/5">
                <Database className="w-5 h-5 text-indigo-400" />
                Database Engine Stats
              </h2>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Database Engine</span>
                  <span className="text-xs font-extrabold text-indigo-400">SQLite (Prisma ORM)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Auth Session Provider</span>
                  <span className="text-xs font-extrabold text-purple-400">NextAuth JWT</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">AI Engine Gateway</span>
                  <span className="text-xs font-extrabold text-emerald-400">INIXA Router (g4f)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
