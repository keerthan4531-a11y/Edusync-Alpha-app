"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function StreamPostForm({ classroomId }: { classroomId: string }) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error("Failed to post")
      setContent("")
      setIsFocused(false)
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      "bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-200",
      isFocused ? "shadow-md border-white/20 bg-white/10" : "shadow-sm hover:border-white/20"
    )}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="Announce something to your class"
        className="w-full bg-transparent p-5 text-white placeholder:text-zinc-500 focus:outline-none resize-none min-h-[60px]"
        rows={isFocused ? 3 : 1}
      />
      
      {isFocused && (
        <div className="px-5 pb-4 flex justify-end gap-3 border-t border-white/5 pt-3">
          <button 
            onClick={() => { setIsFocused(false); setContent("") }}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post
          </button>
        </div>
      )}
    </div>
  )
}
