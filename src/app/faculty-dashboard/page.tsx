import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Users, Monitor, BookOpen, Star, Clock, AlertCircle, ArrowRight, CheckCircle2, MessageCircle, GraduationCap, ShieldCheck, Calendar, Heart, ClipboardCheck, Bell } from "lucide-react"
import Link from "next/link"
import { FacultyAiAssistant } from "@/components/faculty/FacultyAiAssistant"

export const dynamic = "force-dynamic"

export default async function FacultyDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const facultyId = session.user.id
  const facultyName = session.user.name || "Faculty"

  // Real DB stats
  const [totalStudents, totalClassrooms, pendingSubmissions, pendingLeaves, unreadNotifications, gradedSubmissions] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.classroom.count({ where: { facultyId } }),
    db.assignmentSubmission.count({ where: { status: "SUBMITTED" } }),
    (db as any).leaveRequest.count({ where: { facultyId, status: { in: ["PENDING", "SUB_PENDING"] } } }),
    (db as any).notification.count({ where: { userId: facultyId, isRead: false } }),
    db.assignmentSubmission.findMany({
      where: { status: "GRADED", assignment: { classroom: { facultyId } } },
      select: { grade: true },
      take: 100,
    }),
  ])

  const avgGrade = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length) + "%"
    : "N/A"

  // Recent activity
  const recentActivity = await db.assignmentSubmission.findMany({
    where: { assignment: { classroom: { facultyId } } },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      student: { select: { name: true } },
      assignment: { select: { title: true } },
    },
  })

  // Pending student leaves for class incharge
  const pendingStudentLeaves = await (db as any).studentLeaveRequest.count({
    where: { classInchargeId: facultyId, status: "PENDING" },
  })

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8 text-foreground">
      {/* Top Header — Clean layout without box */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">Faculty Portal</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Evaluator Verified
            </span>
            {unreadNotifications > 0 && (
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" /> {unreadNotifications} New
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {facultyName}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xl font-medium">
            Here is what's happening across your classrooms, student directory, academics, and leave requests today.
          </p>
        </div>
        <Link href="/faculty-dashboard/classrooms" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 hover:scale-105 transition-all flex items-center gap-2 shrink-0">
          <Monitor className="w-4 h-4" /><span>Manage Classrooms</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Students", value: totalStudents, sub: "Active Enrolled Roster", icon: Users, color: "text-blue-600 dark:text-blue-400" },
          { label: "Active Classrooms", value: totalClassrooms, sub: "Live Courses Managed", icon: Monitor, color: "text-indigo-600 dark:text-indigo-400" },
          { label: "Pending Submissions", value: pendingSubmissions, sub: "Awaiting Review", icon: BookOpen, color: "text-rose-600 dark:text-rose-400" },
          { label: "Average Grade", value: avgGrade, sub: "Overall Performance", icon: Star, color: "text-amber-600 dark:text-amber-400" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="neu-flat p-6 rounded-[2rem] shadow-xl flex flex-col justify-between dark:bg-white/5 dark:border-white/10 border border-blue-500/10">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-xs font-extrabold text-muted-foreground uppercase">{label}</h3>
              <div className={`w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground mt-2">{value}</div>
            <span className={`text-[11px] font-semibold mt-1 ${color}`}>{sub}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="neu-flat p-6 rounded-[2rem] flex flex-col gap-5 shadow-xl dark:bg-white/5 dark:border-white/10 border border-blue-500/10">
          <h2 className="text-xl font-extrabold text-foreground">Quick Management Hub</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: "/faculty-dashboard/classrooms",   icon: Monitor,         label: "Classrooms",   color: "text-blue-600 dark:text-blue-400" },
              { href: "/faculty-dashboard/students",     icon: Users,           label: "Students & Att", color: "text-indigo-600 dark:text-indigo-400" },
              { href: "/faculty-dashboard/academics",    icon: GraduationCap,   label: "Academics",    color: "text-violet-600 dark:text-violet-400" },
              { href: "/faculty-dashboard/leave",        icon: Calendar,        label: "Leave",        color: "text-amber-600 dark:text-amber-400", badge: pendingLeaves > 0 ? pendingLeaves : undefined },
              { href: "/faculty-dashboard/class-incharge", icon: ClipboardCheck, label: "Incharge",   color: "text-teal-600 dark:text-teal-400",   badge: pendingStudentLeaves > 0 ? pendingStudentLeaves : undefined },
              { href: "/faculty-dashboard/community",    icon: MessageCircle,   label: "Community",    color: "text-emerald-600 dark:text-emerald-400" },
            ].map(({ href, icon: Icon, label, color, badge }: any) => (
              <Link key={href} href={href} className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl neu-raised-sm hover:scale-105 transition-all border border-blue-500/10">
                <Icon className={`w-6 h-6 ${color}`} />
                <span className={`text-[10px] font-extrabold text-center ${color}`}>{label}</span>
                {badge !== undefined && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">{badge}</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="neu-flat p-6 rounded-[2rem] flex flex-col gap-5 shadow-xl dark:bg-white/5 dark:border-white/10 border border-blue-500/10">
          <h2 className="text-xl font-extrabold text-foreground">Recent Assignment Submissions</h2>
          <div className="flex flex-col gap-3">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground font-medium py-4 text-center">No student submissions yet.</p>
            ) : (
              recentActivity.map(sub => (
                <div key={sub.id} className="flex items-center gap-4 p-3.5 rounded-2xl neu-raised-xs border border-blue-500/10">
                  <div className={`p-2 rounded-xl border ${sub.status === "GRADED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"}`}>
                    {sub.status === "GRADED" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-extrabold text-foreground">{sub.assignment.title}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{sub.student.name} · {sub.status === "GRADED" ? `Grade: ${sub.grade}%` : "Awaiting review"}</p>
                  </div>
                </div>
              ))
            )}
            <Link href="/faculty-dashboard/submissions" className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1">
              <span>View all submissions</span><ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <FacultyAiAssistant />
    </div>
  )
}
