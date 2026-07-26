import { db } from "@/lib/db"
import { Users, Monitor, BookOpen, Star, Clock, AlertCircle, ArrowRight, CheckCircle2, MessageCircle, Sparkles, GraduationCap, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { FacultyAiAssistant } from "@/components/faculty/FacultyAiAssistant"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

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

  const avgGrade = "85%"

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8 text-foreground">
      {/* Faculty Hero Banner */}
      <LiquidGlassCard className="p-6 md:p-8 shadow-xl" accentColor="#6366f1">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl neu-raised-sm flex items-center justify-center text-primary dark:text-indigo-400 shrink-0 shadow-lg">
              <GraduationCap className="w-9 h-9 md:w-10 md:h-10" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold text-primary dark:text-indigo-400 uppercase tracking-widest neu-raised-xs px-2.5 py-0.5 rounded-full">Faculty Portal</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Evaluator Verified
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-indigo-100 dark:to-purple-200 tracking-tight">
                Welcome back, {facultyName}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed font-medium">
                Here is what's happening across your assigned classrooms, active submissions, and student performance metrics today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/faculty-dashboard/classrooms"
              className="px-5 py-2.5 rounded-xl neu-button bg-primary text-primary-foreground font-extrabold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              <span>Manage Classrooms</span>
            </Link>
          </div>
        </div>
      </LiquidGlassCard>
      
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="neu-flat p-6 rounded-[2rem] shadow-xl flex flex-col justify-between dark:bg-white/5 dark:border-white/10">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-xs font-extrabold text-muted-foreground uppercase">Total Students</h3>
            <div className="w-9 h-9 rounded-xl neu-raised-xs flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">{totalStudents}</div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Active Enrolled Roster</span>
        </div>

        <div className="neu-flat p-6 rounded-[2rem] shadow-xl flex flex-col justify-between dark:bg-white/5 dark:border-white/10">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-xs font-extrabold text-muted-foreground uppercase">Active Classrooms</h3>
            <div className="w-9 h-9 rounded-xl neu-raised-xs flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Monitor className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">{totalClassrooms}</div>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1">Live Courses Managed</span>
        </div>

        <div className="neu-flat p-6 rounded-[2rem] shadow-xl flex flex-col justify-between dark:bg-white/5 dark:border-white/10">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-xs font-extrabold text-muted-foreground uppercase">Pending Submissions</h3>
            <div className="w-9 h-9 rounded-xl neu-raised-xs flex items-center justify-center text-rose-600 dark:text-rose-400">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">{pendingSubmissions}</div>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1">Awaiting Review</span>
        </div>

        <div className="neu-flat p-6 rounded-[2rem] shadow-xl flex flex-col justify-between dark:bg-white/5 dark:border-white/10">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-xs font-extrabold text-muted-foreground uppercase">Average Grade</h3>
            <div className="w-9 h-9 rounded-xl neu-raised-xs flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">{avgGrade}</div>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1">Overall Performance</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="neu-flat p-6 rounded-[2rem] flex flex-col gap-5 shadow-xl dark:bg-white/5 dark:border-white/10">
          <h2 className="text-xl font-extrabold text-foreground">Quick Management Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/faculty-dashboard/classrooms" className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl neu-raised-sm hover:scale-105 text-indigo-600 dark:text-indigo-400 transition-all">
              <Monitor className="w-7 h-7" />
              <span className="text-xs font-extrabold">Classrooms</span>
            </Link>
            <Link href="/faculty-dashboard/submissions" className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl neu-raised-sm hover:scale-105 text-rose-600 dark:text-rose-400 transition-all">
              <BookOpen className="w-7 h-7" />
              <span className="text-xs font-extrabold">Submissions</span>
            </Link>
            <Link href="/faculty-dashboard/attendance" className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl neu-raised-sm hover:scale-105 text-amber-600 dark:text-amber-400 transition-all">
              <Clock className="w-7 h-7" />
              <span className="text-xs font-extrabold">Attendance</span>
            </Link>
            <Link href="/faculty-dashboard/community" className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl neu-raised-sm hover:scale-105 text-emerald-600 dark:text-emerald-400 transition-all">
              <MessageCircle className="w-7 h-7" />
              <span className="text-xs font-extrabold">Community</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="neu-flat p-6 rounded-[2rem] flex flex-col gap-5 shadow-xl dark:bg-white/5 dark:border-white/10">
          <h2 className="text-xl font-extrabold text-foreground">Recent Evaluator Activity</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 p-3.5 rounded-2xl neu-raised-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-4 h-4" /></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">Graded "Data Structures" Assignment</p>
                <p className="text-[10px] text-muted-foreground font-medium">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3.5 rounded-2xl neu-raised-xs">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"><AlertCircle className="w-4 h-4" /></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">5 new submissions in Web Dev</p>
                <p className="text-[10px] text-muted-foreground font-medium">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3.5 rounded-2xl neu-raised-xs">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"><Clock className="w-4 h-4" /></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">Attendance marked for CS101</p>
                <p className="text-[10px] text-muted-foreground font-medium">Yesterday</p>
              </div>
            </div>
            <Link href="/faculty-dashboard/submissions" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1 mt-2">
              <span>View all activity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <FacultyAiAssistant />
    </div>
  )
}
