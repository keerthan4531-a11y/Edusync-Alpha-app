import { db } from "@/lib/db"
import { Search, Filter, CheckCircle, Clock, XCircle, Eye, BookOpen } from "lucide-react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

export const dynamic = "force-dynamic"

export default async function FacultySubmissionsPage() {
  const submissions = await db.assignmentSubmission.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        select: { name: true, email: true }
      },
      assignment: {
        select: { title: true, classroom: { select: { name: true } } }
      }
    }
  })

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8 text-foreground">
      {/* Top Banner Header */}
      <LiquidGlassCard className="p-6 md:p-8 shadow-xl" accentColor="#818cf8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-raised-sm flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <BookOpen className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Assignment Submissions</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 font-medium">Audit submitted student code, evaluate assignments, and assign marks & feedback.</p>
          </div>
        </div>
      </LiquidGlassCard>

      <div className="flex flex-col gap-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center neu-flat p-4 rounded-[2rem] shadow-xl dark:bg-white/5 dark:border-white/10">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search student name or assignment..." 
              className="w-full h-11 pl-10 pr-4 text-xs font-semibold rounded-xl neu-inset-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all dark:bg-white/5 dark:border dark:border-white/10"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="h-11 neu-inset-sm bg-transparent rounded-xl px-4 text-xs font-extrabold text-foreground focus:outline-none dark:bg-white/5">
              <option value="all">All Classrooms</option>
            </select>
            <select className="h-11 neu-inset-sm bg-transparent rounded-xl px-4 text-xs font-extrabold text-foreground focus:outline-none dark:bg-white/5">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="graded">Graded</option>
            </select>
            <button className="h-11 w-11 flex items-center justify-center neu-button rounded-xl text-muted-foreground hover:text-foreground">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-[2rem] neu-flat shadow-xl dark:bg-white/5 dark:border-white/10">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-muted-foreground uppercase font-extrabold neu-raised-xs border-b border-black/5 dark:border-white/5">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Assignment</th>
                <th className="px-6 py-4">Classroom</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-semibold">No assignment submissions found.</td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-foreground">{sub.student.name}</div>
                      <div className="text-muted-foreground text-[10px]">{sub.student.email}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">{sub.assignment.title}</td>
                    <td className="px-6 py-4 text-muted-foreground font-semibold">{sub.assignment.classroom.name}</td>
                    <td className="px-6 py-4">
                      {sub.status === "SUBMITTED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 neu-raised-xs">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 neu-raised-xs">
                          <CheckCircle className="w-3 h-3" /> Graded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub.grade ? (
                        <span className="font-extrabold text-foreground neu-raised-xs px-2.5 py-1 rounded-lg">{sub.grade}/100</span>
                      ) : (
                        <span className="text-muted-foreground font-bold">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2.5 neu-button rounded-xl text-primary hover:scale-105 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
