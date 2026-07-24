import { db } from "@/lib/db"
import { GradeCell } from "./GradeCell"
import { Users } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ClassroomGradesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Fetch classroom with students, assignments, and all submissions for this class
  const classroom = await db.classroom.findUnique({
    where: { id: id },
    include: {
      students: true,
      assignments: {
        include: {
          submissions: true
        },
        orderBy: { dueDate: "asc" }
      }
    }
  })

  if (!classroom) return null

  const students = classroom.students
  const assignments = classroom.assignments

  return (
    <div className="flex flex-col gap-6 mt-4 overflow-x-auto pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Grades</h2>
      </div>

      {students.length === 0 || assignments.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-zinc-400 max-w-2xl mx-auto w-full mt-10">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-white mb-2">Gradebook empty</h3>
          <p className="text-sm">Add students and create assignments to populate the gradebook.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden min-w-[800px]">
          <table className="w-full text-sm text-left text-zinc-300">
            <thead className="text-xs uppercase bg-black/40 text-zinc-400 border-b border-white/10">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold min-w-[200px] border-r border-white/10 sticky left-0 bg-[#0d1017]">
                  Student
                </th>
                {assignments.map(assignment => (
                  <th key={assignment.id} scope="col" className="px-4 py-4 font-semibold min-w-[150px] border-r border-white/5 text-center">
                    <div className="truncate mb-1 text-indigo-300" title={assignment.title}>{assignment.title}</div>
                    <div className="text-[10px] text-zinc-500 font-normal">Out of {assignment.maxPoints}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white border-r border-white/10 sticky left-0 bg-[#0d1017] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    {student.name}
                  </td>
                  
                  {assignments.map(assignment => {
                    // Find if student submitted this assignment
                    const submission = assignment.submissions.find(s => s.studentId === student.id)
                    
                    return (
                      <td key={assignment.id} className="px-4 py-3 border-r border-white/5 text-center relative group">
                        <GradeCell 
                          classroomId={id}
                          assignment={assignment}
                          submission={submission}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
