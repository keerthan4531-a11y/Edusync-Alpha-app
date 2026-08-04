"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users, GraduationCap, Building2, Calendar, BookOpen,
  CheckCircle2, RefreshCw, Plus, Upload, ArrowUpRight,
  ShieldCheck, Loader2, Sparkles, UserCheck, AlertCircle
} from "lucide-react"

interface AdminStats {
  totalStudents: number
  totalFaculty: number
  totalAdmins: number
  totalDepartments: number
  totalClasses: number
  totalTimetableSlots: number
  totalAttendanceRecords: number
  recentUsers: Array<{
    id: string
    name: string
    email: string
    role: string
    createdAt: string
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
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

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 md:p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-[#0d1222] rounded-[0.9rem] flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Super Admin Control Center
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium mt-0.5">
              Comprehensive platform oversight, user management, and timetable control
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap relative z-10">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Add User
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: stats?.totalStudents ?? 0, sub: "Registered Students", icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Faculty Members", value: stats?.totalFaculty ?? 0, sub: "Active Teachers", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Departments", value: stats?.totalDepartments ?? 0, sub: "Academic Depts", icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { label: "Timetable Slots", value: stats?.totalTimetableSlots ?? 0, sub: "Scheduled Periods", icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        ].map((item, idx) => (
          <div key={idx} className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between gap-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{item.label}</span>
              <div className={`w-9 h-9 rounded-xl ${item.bg} border flex items-center justify-center ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-white">{loading ? "..." : item.value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Grid & Recent Registrations */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Management Actions (2 cols) */}
        <div className="lg:col-span-2 neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2rem] border border-indigo-500/15 shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Quick Action Hub
            </h2>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Management Shortcuts</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { href: "/admin/users", label: "Manage Users", sub: "Add / edit students & faculty", icon: Users, color: "from-blue-600 to-indigo-600" },
              { href: "/admin/timetables", label: "Master Timetable", sub: "Upload & configure slots", icon: Calendar, color: "from-purple-600 to-indigo-600" },
              { href: "/admin/departments", label: "Depts & Classes", sub: "Manage departments & rooms", icon: Building2, color: "from-indigo-600 to-emerald-600" },
              { href: "/admin/analytics", label: "Platform Analytics", sub: "View usage & reports", icon: ArrowUpRight, color: "from-emerald-600 to-teal-600" },
              { href: "/admin/users?action=bulk", label: "Bulk User Upload", sub: "Import users via CSV", icon: Upload, color: "from-amber-600 to-orange-600" },
              { href: "/admin/timetables?action=bulk", label: "Bulk Timetable", sub: "Import schedule CSV", icon: BookOpen, color: "from-rose-600 to-pink-600" },
            ].map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className="group p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between gap-3"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${action.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight">{action.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Registrations Card (1 col) */}
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2rem] border border-indigo-500/15 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              Recent Users
            </h2>
            <Link href="/admin/users" className="text-[10px] font-extrabold text-indigo-400 hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
          ) : stats?.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {stats.recentUsers.map(user => (
                <div key={user.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase shrink-0 ${
                    user.role === "ADMIN" ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" :
                    user.role === "FACULTY" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" :
                    "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8 font-medium">No recent registrations.</p>
          )}
        </div>
      </div>
    </div>
  )
}
