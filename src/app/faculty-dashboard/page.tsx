import { db } from "@/lib/db"
import { Users, Monitor, BookOpen, Star, Clock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function FacultyDashboardPage() {
  // Try to find a faculty user or use a mock
  const facultyUser = await db.user.findFirst({
    where: { role: "FACULTY" }
  })
  
  const facultyId = facultyUser?.id || "mock-faculty-id"
  const facultyName = facultyUser?.name || "Dr. Sarah Mitchell"

  // Real stats
  const totalStudents = await db.user.count({
    where: { role: "STUDENT" }
  })
  
  const totalClassrooms = await db.classroom.count({
    where: { facultyId }
  })
  
  const pendingSubmissions = await db.assignmentSubmission.count({
    where: { status: "SUBMITTED" }
  })

  // We'll mock the avg grade since it might be complex to calculate across all
  const avgGrade = "85%"

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {facultyName}</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Here's what's happening in your classes today.</p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-zinc-400">Total Students</h3>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-zinc-400">Active Classrooms</h3>
            <Monitor className="h-4 w-4 text-stage2" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalClassrooms}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-zinc-400">Pending Submissions</h3>
            <BookOpen className="h-4 w-4 text-stage3" />
          </div>
          <div className="text-2xl font-bold text-foreground">{pendingSubmissions}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-zinc-400">Average Grade</h3>
            <Star className="h-4 w-4 text-stage1" />
          </div>
          <div className="text-2xl font-bold text-foreground">{avgGrade}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/faculty-dashboard/classrooms" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition-colors border border-indigo-500/20">
              <Monitor className="w-6 h-6" />
              <span className="text-sm font-medium">Classrooms</span>
            </Link>
            <Link href="/faculty-dashboard/submissions" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-stage3/10 hover:bg-stage3/20 text-stage3 transition-colors border border-stage3/20">
              <BookOpen className="w-6 h-6" />
              <span className="text-sm font-medium">Submissions</span>
            </Link>
            <Link href="/faculty-dashboard/attendance" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-stage1/10 hover:bg-stage1/20 text-stage1 transition-colors border border-stage1/20">
              <Clock className="w-6 h-6" />
              <span className="text-sm font-medium">Attendance</span>
            </Link>
            <Link href="/faculty-dashboard/students" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-stage2/10 hover:bg-stage2/20 text-stage2 transition-colors border border-stage2/20">
              <Users className="w-6 h-6" />
              <span className="text-sm font-medium">Students</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity (Mocked) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-black/10 dark:bg-white/5">
              <div className="p-2 rounded-full bg-stage3/20 text-stage3"><CheckCircle2 className="w-4 h-4" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Graded "Data Structures" Assignment</p>
                <p className="text-xs text-zinc-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-black/10 dark:bg-white/5">
              <div className="p-2 rounded-full bg-stage1/20 text-stage1"><AlertCircle className="w-4 h-4" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">5 new submissions in Web Dev</p>
                <p className="text-xs text-zinc-400">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-black/10 dark:bg-white/5">
              <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-500"><Clock className="w-4 h-4" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Attendance marked for CS101</p>
                <p className="text-xs text-zinc-400">Yesterday</p>
              </div>
            </div>
            <Link href="/faculty-dashboard/submissions" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2">
              View all activity <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
