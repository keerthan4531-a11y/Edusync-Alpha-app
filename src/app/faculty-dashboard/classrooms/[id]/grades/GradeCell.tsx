"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Check, Edit2, X, FileText, ExternalLink } from "lucide-react"

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
  const [viewingFile, setViewingFile] = useState<{name: string, data: string | null} | null>(null)

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

  const handleOpenFile = (filename: string, data: string | null = null) => {
    let fileUrl = data
    if (!fileUrl && filename) {
      fileUrl = `/uploads/${filename}`
    }
    setViewingFile({ name: filename, data: fileUrl })
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

            {submission.code?.startsWith("[FILE_UPLOAD_V3]") ? (
              <div 
                onClick={() => {
                  const parts = submission.code.replace("[FILE_UPLOAD_V3]", "").split("|");
                  handleOpenFile(parts[0], parts[1]);
                }}
                className="mb-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-sm font-medium text-indigo-300 flex items-center justify-between cursor-pointer hover:bg-indigo-500/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="truncate">{submission.code.replace("[FILE_UPLOAD_V3]", "").split("|")[0]}</span>
                </div>
                <div className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2 flex items-center gap-1 font-semibold">
                  View PDF ↗
                </div>
              </div>
            ) : submission.code?.startsWith("[FILE_UPLOAD_V2]") ? (
              <div 
                onClick={() => {
                  const parts = submission.code.replace("[FILE_UPLOAD_V2]", "").split("|");
                  handleOpenFile(parts[0], parts[1]);
                }}
                className="mb-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-sm font-medium text-indigo-300 flex items-center justify-between cursor-pointer hover:bg-indigo-500/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="truncate">{submission.code.replace("[FILE_UPLOAD_V2]", "").split("|")[0]}</span>
                </div>
                <div className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2 flex items-center gap-1 font-semibold">
                  View PDF ↗
                </div>
              </div>
            ) : submission.code?.startsWith("[FILE_UPLOAD]") ? (
              <div 
                onClick={() => handleOpenFile(submission.code.replace("[FILE_UPLOAD] ", ""))}
                className="mb-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-sm font-medium text-indigo-300 flex items-center justify-between cursor-pointer hover:bg-indigo-500/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="truncate">{submission.code.replace("[FILE_UPLOAD] ", "")}</span>
                </div>
                <div className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2 flex items-center gap-1 font-semibold">
                  View PDF ↗
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/5 text-sm font-mono text-zinc-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {submission.code || "No text content submitted."}
              </div>
            )}

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

      {/* File Viewer Overlay */}
      {viewingFile && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#1a1d27] animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="font-bold text-white block text-sm sm:text-base truncate max-w-[280px] sm:max-w-[400px]">{viewingFile.name}</span>
                <span className="text-[11px] text-indigo-300 font-mono">PDF Document Viewer</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {viewingFile.data && (
                <a 
                  href={viewingFile.data} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Open Full PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button 
                onClick={() => setViewingFile(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#12141c] overflow-hidden">
            {viewingFile.data ? (
              <iframe 
                src={viewingFile.data} 
                className="w-full h-full rounded-2xl bg-white border border-white/10 shadow-2xl"
                title={viewingFile.name}
              />
            ) : (
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center max-w-md w-full shadow-2xl flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-5 border border-indigo-500/20">
                  <FileText className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{viewingFile.name}</h2>
                <p className="text-zinc-400 text-sm mb-4">
                  No preview URL available for this file.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
