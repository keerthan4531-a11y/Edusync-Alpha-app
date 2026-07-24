import { db } from "@/lib/db"
import { StreamPostForm } from "./StreamPostForm"
import { MessageSquare, Clock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ClassroomStreamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const announcements = await db.announcement.findMany({
    where: { classroomId: id },
    orderBy: { createdAt: 'desc' }
  })

  const upcomingAssignments = await db.assignment.findMany({
    where: { classroomId: id, dueDate: { gt: new Date() } },
    orderBy: { dueDate: 'asc' },
    take: 3
  })

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4">
      {/* Sidebar: Upcoming Work */}
      <div className="w-full md:w-64 flex flex-col gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-4">Upcoming</h3>
          {upcomingAssignments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcomingAssignments.map(a => (
                <div key={a.id} className="text-sm">
                  <p className="text-indigo-300 font-medium truncate" title={a.title}>{a.title}</p>
                  <p className="text-zinc-500 text-xs">Due {new Date(a.dueDate).toLocaleDateString()}</p>
                </div>
              ))}
              <div className="mt-2 text-right">
                <a href={`/faculty-dashboard/classrooms/${id}/classwork`} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">View all</a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Woohoo, no work due soon!</p>
          )}
        </div>
      </div>

      {/* Main Feed: Announcements */}
      <div className="flex-1 flex flex-col gap-6">
        <StreamPostForm classroomId={id} />

        <div className="flex flex-col gap-4">
          {announcements.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-zinc-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>This is where you can talk to your class.</p>
              <p className="text-sm mt-1">Use the stream to share announcements, syllabi, or reminders.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      F
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Faculty Member</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-wrap">{ann.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
