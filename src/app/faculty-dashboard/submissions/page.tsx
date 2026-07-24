import { db } from "@/lib/db"
import { Search, Filter, CheckCircle, Clock, XCircle, Eye } from "lucide-react"

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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Submissions</h1>
          <p className="text-muted-foreground mt-1">Review and grade student assignments.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 backdrop-blur-2xl p-4 rounded-2xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by student or assignment..." 
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="bg-black/20 border border-white/10 rounded-xl py-2 px-4 text-sm text-foreground focus:outline-none focus:border-indigo-500">
              <option value="all">All Classrooms</option>
            </select>
            <select className="bg-black/20 border border-white/10 rounded-xl py-2 px-4 text-sm text-foreground focus:outline-none focus:border-indigo-500">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="graded">Graded</option>
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
                <th className="px-6 py-4 font-medium">Assignment</th>
                <th className="px-6 py-4 font-medium">Classroom</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Grade</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No submissions found.</td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{sub.student.name}</div>
                      <div className="text-zinc-500 text-xs">{sub.student.email}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{sub.assignment.title}</td>
                    <td className="px-6 py-4 text-zinc-400">{sub.assignment.classroom.name}</td>
                    <td className="px-6 py-4">
                      {sub.status === "SUBMITTED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stage3/10 text-stage3 border border-stage3/20">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stage1/10 text-stage1 border border-stage1/20">
                          <CheckCircle className="w-3 h-3" /> Graded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub.grade ? (
                        <span className="font-semibold text-foreground">{sub.grade}/100</span>
                      ) : (
                        <span className="text-zinc-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition-colors">
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
