import { db } from "@/lib/db"
import { CreateAssignmentModal } from "./CreateAssignmentModal"
import { ClipboardList, MoreVertical } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ClassroomClassworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const assignments = await db.assignment.findMany({
    where: { classroomId: id },
    orderBy: { createdAt: 'desc' }
  })

  // Group by topic
  const topics = assignments.reduce((acc, curr) => {
    const t = curr.topic || "No Topic"
    if (!acc[t]) acc[t] = []
    acc[t].push(curr)
    return acc
  }, {} as Record<string, typeof assignments>)

  return (
    <div className="flex flex-col gap-8 mt-4">
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Classwork</h2>
        <CreateAssignmentModal classroomId={id} />
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-zinc-400">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-white mb-2">This is where you'll assign work</h3>
          <p className="text-sm max-w-md mx-auto">You can add assignments, materials, or questions, and organize them into topics the way you want students to see them.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(topics).map(([topic, items]) => (
            <div key={topic}>
              <h3 className="text-2xl font-medium text-indigo-400 mb-4 pb-2 border-b border-indigo-500/20">{topic}</h3>
              <div className="flex flex-col gap-3">
                {items.map(assignment => (
                  <div key={assignment.id} className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-white group-hover:text-indigo-300 transition-colors">{assignment.title}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">Due {new Date(assignment.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="text-zinc-500 hover:text-white transition-colors p-2">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
