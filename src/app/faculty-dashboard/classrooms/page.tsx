import { db } from "@/lib/db"
import { Users, BookOpen, ChevronRight, MoreVertical } from "lucide-react"
import Link from "next/link"
import { CreateClassroomButton } from "./CreateClassroomButton"

export const dynamic = "force-dynamic"

export default async function FacultyClassroomsPage() {
  const facultyUser = await db.user.findFirst({
    where: { role: "FACULTY" }
  })
  
  const facultyId = facultyUser?.id

  let classrooms: any[] = []
  if (facultyId) {
    classrooms = await db.classroom.findMany({
      where: { facultyId },
      include: {
        _count: {
          select: { students: true, assignments: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Classrooms</h1>
          <p className="text-muted-foreground mt-1">Manage your active classes and view student progress.</p>
        </div>
        <CreateClassroomButton />
      </div>

      {classrooms.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-2xl">
          <p className="text-zinc-400">No classrooms found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((cls) => (
            <Link key={cls.id} href={`/faculty-dashboard/classrooms/${cls.id}`} className="group block">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 transition-all hover:bg-white/10 hover:border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground group-hover:text-indigo-400 transition-colors">{cls.name}</h2>
                    <p className="text-sm text-zinc-500 mt-1">Code: <span className="font-mono text-zinc-300">{cls.code}</span></p>
                  </div>
                  <button className="text-zinc-500 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-black/20">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Users className="w-4 h-4" />
                      <span>Students</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{cls._count.students}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-black/20">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <BookOpen className="w-4 h-4" />
                      <span>Assignments</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{cls._count.assignments}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm text-indigo-400 font-medium">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
