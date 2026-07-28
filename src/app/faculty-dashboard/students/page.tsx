import { db } from "@/lib/db"
import { Search, Filter, Mail, Award, TrendingUp, Users } from "lucide-react"
import { AttendanceSection } from "@/components/faculty/AttendanceSection"

export const dynamic = "force-dynamic"

export default async function FacultyStudentsPage() {
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    take: 40,
    orderBy: { xp: 'desc' },
    include: {
      enrolledClassrooms: { select: { name: true } }
    }
  })

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 md:p-8 text-foreground">
      {/* Top Header — Clean layout without box */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Directory & Attendance</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">Track class attendance on top, and inspect student level progress, XP leaderboards, and enrolled rosters below.</p>
      </div>

      {/* 1. TOP SECTION: Attendance Tracking */}
      <AttendanceSection />

      {/* 2. BOTTOM SECTION: Student Directory List */}
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Student Roster & Leaderboard Directory
          </h2>
          <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            {students.length} Enrolled Students
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center neu-flat p-4 rounded-2xl shadow-lg dark:bg-white/5 dark:border-white/10 border border-blue-500/10">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search student by name or email..." 
              className="w-full h-10 pl-10 pr-4 text-xs font-semibold rounded-xl bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground transition-all"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl neu-flat shadow-xl dark:bg-white/5 dark:border-white/10 border border-blue-500/10">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-extrabold border-b border-black/5 dark:border-white/5 bg-blue-500/5">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Level / XP</th>
                <th className="px-6 py-3.5">Enrolled Classrooms</th>
                <th className="px-6 py-3.5">Streak</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-semibold">No students found.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-foreground">{student.name}</div>
                          <div className="text-muted-foreground text-[10px]">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="font-extrabold text-foreground">Lvl {student.level}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">({student.xp} XP)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {student.enrolledClassrooms.slice(0, 2).map((cls, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-extrabold">
                            {cls.name}
                          </span>
                        ))}
                        {student.enrolledClassrooms.length > 2 && (
                          <span className="px-2 py-0.5 rounded-lg bg-blue-500/5 text-[10px] font-bold text-muted-foreground">
                            +{student.enrolledClassrooms.length - 2}
                          </span>
                        )}
                        {student.enrolledClassrooms.length === 0 && (
                          <span className="text-muted-foreground text-xs font-bold">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                        <TrendingUp className="w-4 h-4" />
                        <span>{student.currentStreak} days</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all" title="Message Student">
                        <Mail className="w-4 h-4" />
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
