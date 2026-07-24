"use client"

import { useState } from "react"
import { Plus, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function JoinClassroomModal({ 
  onJoined 
}: { 
  onJoined: (message: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!code.trim() || code.length < 6) {
      setError("Please enter a valid 6-character classroom code.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/student/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() })
      })
      
      const data = await res.json()
      if (res.ok) {
        setIsOpen(false)
        setCode("")
        onJoined("Successfully joined classroom!")
      } else {
        setError(data.error || "Failed to join classroom.")
      }
    } catch (err) {
      setError("Network error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
      >
        <Plus className="w-4 h-4" />
        <span>Join</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-2">Join Classroom</h2>
            <p className="text-sm text-gray-400 mb-6">Ask your teacher for the 6-character class code, then enter it below.</p>
            
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter class code (e.g. ABCDEF)"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-center"
                  maxLength={10}
                />
              </div>
              
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              
              <div className="flex justify-end gap-3 mt-6 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Join
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
