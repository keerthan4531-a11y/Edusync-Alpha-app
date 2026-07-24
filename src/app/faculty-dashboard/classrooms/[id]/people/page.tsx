import { db } from "@/lib/db"
import { InviteStudentModal } from "./InviteStudentModal"
import { Users, Mail, UserPlus, MoreVertical } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ClassroomPeoplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const classroom = await db.classroom.findUnique({
    where: { id: id },
    include: {
      faculty: true,
      students: true,
      invitations: {
        where: { status: "PENDING" },
        include: { student: true }
      }
    }
  })

  if (!classroom) return null

  return (
    <div className="flex flex-col gap-10 mt-4 max-w-4xl mx-auto">
      
      {/* Teachers Section */}
      <section>
        <div className="flex items-center justify-between pb-4 border-b-2 border-indigo-500/50 mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Teachers</h2>
        </div>
        <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
              {classroom.faculty.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-white">{classroom.faculty.name}</span>
          </div>
        </div>
      </section>

      {/* Students Section */}
      <section>
        <div className="flex items-center justify-between pb-4 border-b-2 border-indigo-500/50 mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Students <span className="text-sm font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{classroom.students.length}</span>
          </h2>
          <InviteStudentModal classroomId={classroom.id} classCode={classroom.code} />
        </div>

        <div className="flex flex-col">
          {classroom.students.map((student) => (
            <div key={student.id} className="group flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300 text-sm">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{student.name}</p>
                </div>
              </div>
              <button className="text-zinc-500 hover:text-white transition-colors p-2 opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          ))}

          {classroom.students.length === 0 && classroom.invitations.length === 0 && (
            <div className="text-center py-10 text-zinc-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No students enrolled yet.</p>
            </div>
          )}

          {/* Pending Invitations */}
          {classroom.invitations.map((invite) => (
            <div key={invite.id} className="group flex items-center justify-between p-3 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-4 opacity-50">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300 text-sm">
                  {invite.student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{invite.student.name}</p>
                  <p className="text-xs text-zinc-400">Invited</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
