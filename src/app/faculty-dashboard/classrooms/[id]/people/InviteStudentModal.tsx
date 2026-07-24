"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, X, Loader2, Copy, Check, Search } from "lucide-react"

export function InviteStudentModal({ classroomId, classCode }: { classroomId: string, classCode: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const [searchResults, setSearchResults] = useState<{id: string, name: string, email: string}[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email.length >= 2 && showDropdown) {
        setSearching(true)
        try {
          const res = await fetch(`/api/users/search?q=${encodeURIComponent(email)}&role=STUDENT`)
          if (res.ok) {
            const data = await res.json()
            setSearchResults(data)
          }
        } catch (e) {
          console.error(e)
        } finally {
          setSearching(false)
        }
      } else if (email.length < 2) {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [email, showDropdown])

  const selectStudent = (selectedEmail: string) => {
    setEmail(selectedEmail)
    setShowDropdown(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(classCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to invite student")
      
      setIsOpen(false)
      setEmail("")
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
        className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-colors"
        title="Invite Students"
      >
        <UserPlus className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Invite students</h2>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Class Code Link */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Invite link or class code</label>
                <div className="flex items-center justify-between p-3 bg-black/20 border border-white/10 rounded-lg">
                  <span className="text-xl font-mono text-indigo-400 tracking-widest font-bold">{classCode}</span>
                  <button onClick={handleCopy} className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    {copied ? <Check className="w-5 h-5 text-stage3" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-medium text-zinc-500 uppercase">or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              {/* Email Invite Form */}
              <form onSubmit={handleInvite} className="flex flex-col gap-4">
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Invite by email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setShowDropdown(true)
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors w-full"
                      placeholder="Enter student email or name..."
                      autoComplete="off"
                    />
                    {searching && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-zinc-500" />}
                    
                    {showDropdown && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1d27] border border-white/10 rounded-lg shadow-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                        {searchResults.map(user => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => selectStudent(user.email)}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 flex flex-col transition-colors border-b border-white/5 last:border-0"
                          >
                            <span className="text-white font-medium text-sm">{user.name}</span>
                            <span className="text-zinc-500 text-xs">{user.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                    disabled={loading || !email.trim()}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
