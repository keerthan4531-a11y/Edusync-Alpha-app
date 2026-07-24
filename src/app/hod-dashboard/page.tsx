import { db } from "@/lib/db"
import { Users, Monitor, BookOpen, Star, TrendingUp, CheckCircle2, AlertCircle, Clock, BarChart3, GraduationCap, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function HodDashboardPage() {
  const hodUser = await db.user.findFirst({ where: { role: "HOD" } })
  const hodName = hodUser?.name || "Dr. K. Rajendran"

  const totalFaculty = await db.user.count({ where: { role: "FACULTY" } })
  const totalStudents = await db.user.count({ where: { role: "STUDENT" } })
  const totalClassrooms = await db.classroom.count()
  const pendingSubmissions = await db.assignmentSubmission.count({ where: { status: "SUBMITTED" } })
  const totalDepartments = await db.department.count()

  const faculty = await db.user.findMany({
    where: { role: "FACULTY" },
    include: { facultyClassrooms: true },
    take: 4,
  })

  const recentClassrooms = await db.classroom.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { faculty: true, students: true },
  })

  const stats = [
    { label: "Total Faculty", value: totalFaculty, icon: Users, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Total Students", value: totalStudents, icon: GraduationCap, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { label: "Active Classrooms", value: totalClassrooms, icon: Monitor, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Pending Submissions", value: pendingSubmissions, icon: BookOpen, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ]

  const quickActions = [
    { label: "Faculty", href: "/hod-dashboard/faculty", icon: Users, color: "text-violet-400", bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20" },
    { label: "Analytics", href: "/hod-dashboard/analytics", icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20" },
    { label: "Approvals", href: "/hod-dashboard/approvals", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20" },
    { label: "Reports", href: "/hod-dashboard/reports", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20" },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent backdrop-blur-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-violet-400 font-medium mb-1">Computer Science & Engineering Department</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Welcome, {hodName} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Academic Year 2024–25 · Department Overview</p>
          </div>
          <div className="flex gap-3">
            <Link href="/hod-dashboard/reports" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium border border-violet-500/30 transition-colors">
              <Star className="w-4 h-4" /> Generate Report
            </Link>
            <Link href="/hod-dashboard/faculty" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
              <Users className="w-4 h-4" /> Faculty Meeting
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.bg} backdrop-blur-2xl p-5 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> +2.4% this month
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link key={a.href} href={a.href} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border ${a.bg} ${a.color} transition-colors`}>
                <a.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Faculty Quick View */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Faculty Overview</h2>
            <Link href="/hod-dashboard/faculty" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {faculty.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No faculty registered yet.</p>
            ) : (
              faculty.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {f.name?.charAt(0) || "F"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{f.email}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-400 shrink-0">
                    <Monitor className="w-3 h-3" />
                    {f.facultyClassrooms.length}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Classrooms */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Classrooms</h2>
          <Link href="/hod-dashboard/analytics" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
            Analytics <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentClassrooms.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No classrooms created yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {recentClassrooms.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.faculty?.name || "Unassigned"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.students.length} students</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Performance Insights */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Department Performance Trends
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Student Satisfaction", value: 87, color: "bg-violet-500" },
            { label: "Course Completion Rate", value: 92, color: "bg-indigo-500" },
            { label: "Faculty Attendance", value: 96, color: "bg-emerald-500" },
          ].map((m) => (
            <div key={m.label} className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-semibold text-foreground">{m.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
