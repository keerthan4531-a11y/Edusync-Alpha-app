"use client"

import { useState, useEffect } from "react"
import { Users, BookOpen, ChevronRight, Monitor, Loader2 } from "lucide-react"
import Link from "next/link"
import { CreateClassroomButton } from "./CreateClassroomButton"

export default function FacultyClassroomsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClassrooms = () => {
    setLoading(true)
    fetch("/api/classrooms")
      .then(r => r.json())
      .then(data => {
        setClassrooms(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchClassrooms()
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 md:p-8 text-foreground">
      {/* Header — Title on left, "+ Create Classroom" on right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Faculty Classrooms</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
            Manage active course classrooms and student rosters.
          </p>
        </div>
        <CreateClassroomButton onCreated={fetchClassrooms} />
      </div>

      {/* Classrooms Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : classrooms.length === 0 ? (
        <div className="text-center py-16 neu-flat rounded-[2rem] p-8 shadow-xl dark:bg-white/5 dark:border-white/10 border border-blue-500/10">
          <Monitor className="w-12 h-12 text-blue-500/40 mx-auto mb-3" />
          <p className="text-base font-extrabold text-foreground">No classrooms created yet.</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Create your first course classroom to begin enrolling students.</p>
          <CreateClassroomButton onCreated={fetchClassrooms} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((cls) => (
            <Link key={cls.id} href={`/faculty-dashboard/classrooms/${cls.id}`} className="group block">
              <div className="neu-flat p-6 rounded-[2rem] transition-all hover:scale-[1.01] duration-300 shadow-xl flex flex-col justify-between h-full dark:bg-white/5 dark:border-white/10 border border-blue-500/10 hover:border-blue-500/30">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-extrabold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{cls.name}</h2>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Course Code: <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{cls.code}</span></p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase">
                        <Users className="w-3.5 h-3.5" />
                        <span>Students</span>
                      </div>
                      <span className="text-xl font-extrabold text-foreground mt-1">{cls._count?.students || 0}</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Assignments</span>
                      </div>
                      <span className="text-xl font-extrabold text-foreground mt-1">{cls._count?.assignments || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  <span>Manage Course & Stream</span>
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
