import { db } from "@/lib/db"
import { Users, BookOpen, ChevronRight, MoreVertical, Monitor, Plus } from "lucide-react"
import Link from "next/link"
import { CreateClassroomButton } from "./CreateClassroomButton"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8 text-foreground">
      {/* Top Banner Header */}
      <LiquidGlassCard className="p-6 md:p-8 shadow-xl" accentColor="#6366f1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl neu-raised-sm flex items-center justify-center text-primary dark:text-indigo-400 shrink-0">
              <Monitor className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Faculty Classrooms</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 font-medium">Manage active courses, post assignments, and track student roster progress.</p>
            </div>
          </div>
          <CreateClassroomButton />
        </div>
      </LiquidGlassCard>

      {classrooms.length === 0 ? (
        <div className="text-center py-20 neu-flat rounded-[2rem] p-8 shadow-xl dark:bg-white/5 dark:border-white/10">
          <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-base font-extrabold text-foreground">No classrooms created yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Create your first course classroom to begin enrolling students.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((cls) => (
            <Link key={cls.id} href={`/faculty-dashboard/classrooms/${cls.id}`} className="group block">
              <div className="neu-flat p-6 rounded-[2rem] transition-all hover:scale-[1.01] duration-300 shadow-xl flex flex-col justify-between h-full dark:bg-white/5 dark:border-white/10">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-extrabold text-foreground group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">{cls.name}</h2>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Course Code: <span className="font-mono font-bold text-foreground neu-raised-xs px-2 py-0.5 rounded-md">{cls.code}</span></p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="flex flex-col gap-1 p-3 rounded-2xl neu-raised-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-extrabold uppercase">
                        <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Students</span>
                      </div>
                      <span className="text-xl font-extrabold text-foreground mt-1">{cls._count.students}</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-2xl neu-raised-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-extrabold uppercase">
                        <BookOpen className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Assignments</span>
                      </div>
                      <span className="text-xl font-extrabold text-foreground mt-1">{cls._count.assignments}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-extrabold text-primary dark:text-indigo-400">
                  <span>Manage Classroom Roster</span>
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
