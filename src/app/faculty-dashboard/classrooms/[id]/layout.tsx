import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { ClassroomNav } from "./ClassroomNav"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function ClassroomLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const classroom = await db.classroom.findUnique({
    where: { id },
  })

  if (!classroom) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-full max-w-6xl mx-auto p-4 md:p-8 w-full gap-6">
      {/* Back Button */}
      <div className="mb-4">
        <Link 
          href="/faculty-dashboard/classrooms"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-sm text-gray-400 hover:text-white"
          aria-label="Go back to classrooms"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Classroom Banner */}
      <div className="relative overflow-hidden rounded-2xl h-48 sm:h-64 flex flex-col justify-end p-6 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-indigo-600 border border-white/10 shadow-lg">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{classroom.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-indigo-100 text-sm sm:text-base font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-md inline-block">
              Code: <span className="font-mono">{classroom.code}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4-Tab Navigation */}
      <ClassroomNav classroomId={classroom.id} />

      {/* Main Content Area */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
