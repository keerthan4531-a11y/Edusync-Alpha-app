import { db } from "@/lib/db"
import { Search, Filter, Mail, Award, TrendingUp, Users } from "lucide-react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

export const dynamic = "force-dynamic"

export default async function FacultyStudentsPage() {
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    take: 30,
    orderBy: { xp: 'desc' },
    include: {
      enrolledClassrooms: { select: { name: true } }
    }
  })

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8 text-foreground">
      {/* Top Banner Header */}
      <LiquidGlassCard className="p-6 md:p-8 shadow-xl" accentColor="#3b82f6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-raised-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Users className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Student Directory</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 font-medium">Inspect student level progress, XP leaderboards, enrolled classrooms, and learning streaks.</p>
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
              placeholder="Search student by name or email..." 
              className="w-full h-11 pl-10 pr-4 text-xs font-semibold rounded-xl neu-inset-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all dark:bg-white/5 dark:border dark:border-white/10"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="h-11 neu-inset-sm bg-transparent rounded-xl px-4 text-xs font-extrabold text-foreground focus:outline-none dark:bg-white/5">
              <option value="all">All Classrooms</option>
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
                <th className="px-6 py-4">Level / XP</th>
                <th className="px-6 py-4">Classrooms</th>
                <th className="px-6 py-4">Streak</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-semibold">No students found.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl neu-raised-xs flex items-center justify-center text-primary font-extrabold text-xs">
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
                          <span key={i} className="px-2.5 py-0.5 rounded-full neu-raised-xs text-[10px] font-extrabold text-foreground">
                            {cls.name}
                          </span>
                        ))}
                        {student.enrolledClassrooms.length > 2 && (
                          <span className="px-2 py-0.5 rounded-full neu-raised-xs text-[10px] font-bold text-muted-foreground">
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
                      <button className="p-2.5 neu-button rounded-xl text-primary hover:scale-105 transition-all" title="Message Student">
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
