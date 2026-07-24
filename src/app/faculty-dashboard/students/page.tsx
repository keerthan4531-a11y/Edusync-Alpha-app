import { db } from "@/lib/db"
import { Search, Filter, Mail, Award, TrendingUp } from "lucide-react"

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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">Monitor student progress and performance across classrooms.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 backdrop-blur-2xl p-4 rounded-2xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="bg-black/20 border border-white/10 rounded-xl py-2 px-4 text-sm text-foreground focus:outline-none focus:border-indigo-500">
              <option value="all">All Classrooms</option>
            </select>
            <button className="p-2 bg-black/20 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-zinc-400">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-black/20">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Level / XP</th>
                <th className="px-6 py-4 font-medium">Classrooms</th>
                <th className="px-6 py-4 font-medium">Streak</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No students found.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{student.name}</div>
                          <div className="text-zinc-500 text-xs">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-stage3" />
                        <span className="font-medium text-zinc-200">Lvl {student.level}</span>
                        <span className="text-xs text-zinc-500">({student.xp} XP)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.enrolledClassrooms.slice(0, 2).map((cls, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-xs text-zinc-300">
                            {cls.name}
                          </span>
                        ))}
                        {student.enrolledClassrooms.length > 2 && (
                          <span className="px-2 py-0.5 rounded bg-white/5 text-xs text-zinc-500">
                            +{student.enrolledClassrooms.length - 2}
                          </span>
                        )}
                        {student.enrolledClassrooms.length === 0 && (
                          <span className="text-zinc-500 text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-stage1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">{student.currentStreak} days</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Message Student">
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
