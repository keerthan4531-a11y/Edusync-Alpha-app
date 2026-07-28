"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2, Plus } from "lucide-react"

export function CreateClassroomButton({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [section, setSection] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name.trim()) {
      setError("Classroom name is required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, section }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create classroom")
      
      setIsOpen(false)
      setName("")
      setSection("")
      if (onCreated) onCreated()
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-105"
      >
        <Plus className="w-4 h-4" /> Create Classroom
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1d27] border border-blue-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-white">Create New Course Classroom</h2>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold">{error}</div>}
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-300">Course Name (required)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/30 border border-blue-500/30 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Data Structures & Algorithms"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-300">Section / Group</label>
                <input 
                  type="text" 
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="bg-black/30 border border-blue-500/30 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. CSE-A"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-zinc-300 hover:text-white transition-colors text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-blue-500/20"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
