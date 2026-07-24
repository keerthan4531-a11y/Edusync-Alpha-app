import { db } from "@/lib/db"
import { Users, Monitor, Mail, Search, Star, CheckCircle2, AlertCircle, Clock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HodFacultyPage() {
  const faculty = await db.user.findMany({
    where: { role: "FACULTY" },
    include: {
      facultyClassrooms: {
        include: { students: true, assignments: true }
      }
    },
    orderBy: { createdAt: "asc" }
  })

  const statuses = ["Active", "Active", "Active", "On Leave", "Active", "Active", "Probation"]

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent backdrop-blur-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Faculty Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage faculty members, workload, and performance metrics</p>
        <div className="flex gap-3 mt-4">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium border border-violet-500/30 transition-colors">
            <Users className="w-4 h-4" /> Add New Faculty
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            Import Faculty Data
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Faculty", value: faculty.length, color: "text-violet-400" },
          { label: "Active", value: faculty.filter((_, i) => statuses[i % statuses.length] === "Active").length, color: "text-emerald-400" },
          { label: "On Leave", value: faculty.filter((_, i) => statuses[i % statuses.length] === "On Leave").length, color: "text-amber-400" },
          { label: "Total Classrooms", value: faculty.reduce((sum, f) => sum + f.facultyClassrooms.length, 0), color: "text-indigo-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5">
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Faculty Cards Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-400" /> Faculty Members
        </h2>
        {faculty.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-12 text-center text-muted-foreground">
            No faculty members registered yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {faculty.map((f, idx) => {
              const status = statuses[idx % statuses.length]
              const totalStudents = f.facultyClassrooms.reduce((s, c) => s + c.students.length, 0)
              const totalAssignments = f.facultyClassrooms.reduce((s, c) => s + c.assignments.length, 0)
              const rating = (3.8 + (idx % 12) * 0.1).toFixed(1)
              const workload = Math.min(100, 60 + (f.facultyClassrooms.length * 8))

              return (
                <div key={f.id} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 flex flex-col gap-4 hover:border-violet-500/30 transition-colors">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                      {f.name?.charAt(0) || "F"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{f.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      status === "Active" ? "bg-emerald-500/10 text-emerald-400" :
                      status === "On Leave" ? "bg-amber-500/10 text-amber-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>{status}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Classes", value: f.facultyClassrooms.length },
                      { label: "Students", value: totalStudents },
                      { label: "Assignments", value: totalAssignments },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-white/5 p-2 text-center">
                        <p className="text-base font-bold text-violet-400">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Workload bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Workload</span>
                      <span className="text-foreground font-medium">{workload}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${workload}%` }} />
                    </div>
                  </div>

                  {/* Rating + Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-medium">{rating}</span>
                      <span className="text-muted-foreground text-xs">/ 5.0</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground border border-white/10 transition-colors">View</button>
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 transition-colors">Edit</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Faculty Details Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Monitor className="w-5 h-5 text-violet-400" /> Faculty Details Table
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Name", "Email", "Classrooms", "Students", "Rating", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {faculty.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No faculty found.</td></tr>
              ) : (
                faculty.map((f, idx) => {
                  const status = statuses[idx % statuses.length]
                  const totalStudents = f.facultyClassrooms.reduce((s, c) => s + c.students.length, 0)
                  const rating = (3.8 + (idx % 12) * 0.1).toFixed(1)
                  return (
                    <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {f.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{f.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{f.email}</td>
                      <td className="py-3 px-4 text-foreground">{f.facultyClassrooms.length}</td>
                      <td className="py-3 px-4 text-foreground">{totalStudents}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" /> {rating}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          status === "Active" ? "bg-emerald-500/10 text-emerald-400" :
                          status === "On Leave" ? "bg-amber-500/10 text-amber-400" :
                          "bg-red-500/10 text-red-400"
                        }`}>{status}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-foreground transition-colors">View</button>
                          <button className="text-xs px-2 py-1 rounded bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 transition-colors">Edit</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
