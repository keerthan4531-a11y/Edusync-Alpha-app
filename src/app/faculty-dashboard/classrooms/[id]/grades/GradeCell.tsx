"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Check, Edit2, X } from "lucide-react"

export function GradeCell({ 
  classroomId, 
  assignment, 
  submission 
}: { 
  classroomId: string, 
  assignment: any, 
  submission: any 
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [grade, setGrade] = useState(submission?.grade?.toString() || "")
  const [feedback, setFeedback] = useState(submission?.feedback || "")
  const [loading, setLoading] = useState(false)

  // Status mapping
  const hasSubmitted = !!submission
  const isGraded = submission?.status === "GRADED"
  const isMissing = !hasSubmitted && new Date(assignment.dueDate) < new Date()

  let statusBadge = <span className="text-zinc-500">—</span>
  
  if (isGraded) {
    statusBadge = <span className="font-bold text-white">{submission.grade} <span className="text-zinc-500 text-xs font-normal">/ {assignment.maxPoints}</span></span>
  } else if (hasSubmitted) {
    statusBadge = <span className="text-stage3 font-medium bg-stage3/10 px-2 py-1 rounded">Turned in</span>
  } else if (isMissing) {
    statusBadge = <span className="text-red-400 font-medium">Missing</span>
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submission) return
    if (grade === "") return

    setLoading(true)
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: parseInt(grade), feedback }),
      })
      
      if (!res.ok) throw new Error("Failed to grade")
      
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div 
        className="w-full h-full flex items-center justify-center cursor-pointer min-h-[40px] hover:bg-white/5 rounded transition-colors"
        onClick={() => hasSubmitted && setIsOpen(true)}
        title={hasSubmitted ? "Click to grade" : "No submission yet"}
      >
        {statusBadge}
      </div>

      {isOpen && hasSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Grade Submission</h3>
                <p className="text-sm text-zinc-400 mt-1">{assignment.title}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/5 text-sm font-mono text-zinc-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {submission.code || "No text content submitted."}
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Grade (out of {assignment.maxPoints})</label>
                <input 
                  type="number" 
                  max={assignment.maxPoints}
                  min={0}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors w-full text-lg font-bold"
                  placeholder="0"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Private Feedback (optional)</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors w-full resize-none h-24 placeholder:text-zinc-500"
                  placeholder="Great job on..."
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-zinc-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || grade === ""}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
