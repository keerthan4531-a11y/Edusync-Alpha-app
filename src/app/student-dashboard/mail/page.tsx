"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Inbox, Send, Star, Trash, Plus, Search, 
  RefreshCw, X, ArrowLeft, Reply, SendHorizontal, 
  CheckCircle2, AlertCircle, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MailUser {
  id: string
  name: string
  email: string
}

interface Mail {
  id: string
  senderId: string
  sender: MailUser
  recipientId: string
  recipient: MailUser
  subject: string
  body: string
  isRead: boolean
  isStarred: boolean
  isTrash: boolean
  createdAt: string
}

type Folder = "inbox" | "sent" | "starred" | "trash"

export default function MailPage() {
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox")
  const [mails, setMails] = useState<Record<Folder, Mail[]>>({
    inbox: [],
    sent: [],
    starred: [],
    trash: []
  })
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [composeTo, setComposeTo] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [userSuggestions, setUserSuggestions] = useState<MailUser[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [composeStatus, setComposeStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" })

  const fetchMails = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const response = await fetch("/api/student/mail")
      if (response.ok) {
        const data = await response.json()
        setMails({
          inbox: data.inbox || [],
          sent: data.sent || [],
          starred: data.starred || [],
          trash: data.trash || []
        })

        // Refresh selected mail details if open
        if (selectedMail) {
          const allMails: Mail[] = [...(data.inbox || []), ...(data.sent || []), ...(data.starred || []), ...(data.trash || [])]
          const updatedSelected = allMails.find(m => m.id === selectedMail.id)
          if (updatedSelected) {
            setSelectedMail(updatedSelected)
          }
        }
      }
    } catch (e) {
      console.error("Failed to load mails", e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMails()
  }, [])

  // Auto-complete suggestions logic
  useEffect(() => {
    if (composeTo.length < 2) {
      setUserSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/student/mail/recipients?query=${encodeURIComponent(composeTo)}`)
        if (res.ok) {
          const data = await res.json()
          setUserSuggestions(data)
          setShowSuggestions(data.length > 0)
        }
      } catch (err) {
        console.error("Error fetching recipients", err)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [composeTo])

  const handleSelectMail = async (mail: Mail) => {
    setSelectedMail(mail)
    // Mark as read if received and currently unread
    if (!mail.isRead && mail.recipient.id !== mail.senderId) {
      try {
        const response = await fetch(`/api/student/mail/${mail.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true })
        })
        if (response.ok) {
          // Update local status silently
          fetchMails(true)
        }
      } catch (err) {
        console.error("Failed to mark read", err)
      }
    }
  }

  const handleToggleStar = async (mail: Mail, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextStarred = !mail.isStarred
    try {
      const response = await fetch(`/api/student/mail/${mail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: nextStarred })
      })
      if (response.ok) {
        fetchMails(true)
      }
    } catch (err) {
      console.error("Failed to star/unstar mail", err)
    }
  }

  const handleMoveToTrash = async (mail: Mail, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const nextTrash = !mail.isTrash
    try {
      const response = await fetch(`/api/student/mail/${mail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrash: nextTrash })
      })
      if (response.ok) {
        if (selectedMail?.id === mail.id) {
          setSelectedMail(null)
        }
        fetchMails(true)
      }
    } catch (err) {
      console.error("Failed to delete mail", err)
    }
  }

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault()
    setComposeStatus({ type: null, message: "" })

    if (!composeTo || !composeSubject || !composeBody) {
      setComposeStatus({ type: "error", message: "Please fill out all fields" })
      return
    }

    try {
      const response = await fetch("/api/student/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: composeTo,
          subject: composeSubject,
          body: composeBody
        })
      })

      const data = await response.json()
      if (response.ok) {
        setComposeStatus({ type: "success", message: "Message sent successfully" })
        setComposeTo("")
        setComposeSubject("")
        setComposeBody("")
        fetchMails(true)
        setTimeout(() => {
          setIsComposeOpen(false)
          setComposeStatus({ type: null, message: "" })
        }, 1500)
      } else {
        setComposeStatus({ type: "error", message: data.error || "Failed to send email" })
      }
    } catch (err) {
      console.error("Send mail error", err)
      setComposeStatus({ type: "error", message: "An error occurred while sending" })
    }
  }

  const handleReply = (mail: Mail) => {
    setComposeTo(mail.sender.email)
    setComposeSubject(`Re: ${mail.subject}`)
    setComposeBody(`\n\n--- On ${new Date(mail.createdAt).toLocaleString()} ${mail.sender.name} wrote: ---\n> ${mail.body.split('\n').join('\n> ')}`)
    setIsComposeOpen(true)
  }

  const activeMails = mails[activeFolder].filter(mail => {
    const term = searchQuery.toLowerCase()
    return (
      mail.subject.toLowerCase().includes(term) ||
      mail.body.toLowerCase().includes(term) ||
      mail.sender.name.toLowerCase().includes(term) ||
      mail.sender.email.toLowerCase().includes(term)
    )
  })

  return (
    <div className="flex h-[calc(100vh-140px)] w-full gap-6 text-white pb-6 max-w-6xl mx-auto">
      {/* Folder sidebar (Hidden on mobile when detail is open) */}
      <div className={cn(
        "w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col gap-2 shrink-0 md:flex shadow-2xl",
        selectedMail ? "hidden md:flex" : "flex w-full md:w-64"
      )}>
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Message</span>
        </button>

        <div className="mt-4 flex flex-col gap-1">
          <button 
            onClick={() => { setActiveFolder("inbox"); setSelectedMail(null); }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border border-transparent font-medium",
              activeFolder === "inbox" ? "bg-white/10 border-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className="flex items-center gap-3">
              <Inbox className="w-5 h-5" />
              <span>Inbox</span>
            </span>
            {mails.inbox.filter(m => !m.isRead).length > 0 && (
              <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded-full font-bold shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                {mails.inbox.filter(m => !m.isRead).length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveFolder("sent"); setSelectedMail(null); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent font-medium",
              activeFolder === "sent" ? "bg-white/10 border-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Send className="w-5 h-5" />
            <span>Sent</span>
          </button>

          <button 
            onClick={() => { setActiveFolder("starred"); setSelectedMail(null); }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border border-transparent font-medium",
              activeFolder === "starred" ? "bg-white/10 border-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className="flex items-center gap-3">
              <Star className="w-5 h-5" />
              <span>Starred</span>
            </span>
            {mails.starred.length > 0 && (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded-full font-bold">
                {mails.starred.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveFolder("trash"); setSelectedMail(null); }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border border-transparent font-medium",
              activeFolder === "trash" ? "bg-white/10 border-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className="flex items-center gap-3">
              <Trash className="w-5 h-5" />
              <span>Trash</span>
            </span>
            {mails.trash.length > 0 && (
              <span className="text-gray-400 bg-white/5 text-xs px-2 py-0.5 rounded-full font-bold border border-white/5">
                {mails.trash.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Message List Pane (Hidden on mobile when mail is selected) */}
      <div className={cn(
        "flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all",
        selectedMail ? "hidden md:flex" : "flex"
      )}>
        {/* Search header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4 bg-white/5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input 
              type="text" 
              placeholder="Search messages..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-black/30 transition-all"
            />
          </div>
          <button 
            onClick={() => fetchMails(true)}
            disabled={refreshing}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 active:scale-95 transition-all text-gray-300 hover:text-white"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
        </div>

        {/* Message Items container */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <span>Loading mailbox...</span>
            </div>
          ) : activeMails.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Inbox className="w-12 h-12 text-gray-600 mb-3" />
              <span>No messages found</span>
            </div>
          ) : (
            activeMails.map(mail => (
              <div 
                key={mail.id} 
                onClick={() => handleSelectMail(mail)}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all border border-transparent flex flex-col gap-1.5 hover:bg-white/5 relative",
                  !mail.isRead && mail.recipientId === mail.recipient.id ? "bg-indigo-500/5 hover:bg-indigo-500/10" : ""
                )}
              >
                {!mail.isRead && mail.recipientId === mail.recipient.id && (
                  <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full absolute left-2 top-5 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
                <div className="flex justify-between items-start pl-3">
                  <span className="font-semibold text-gray-200">
                    {activeFolder === "sent" ? mail.recipient.name : mail.sender.name}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(mail.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="pl-3 font-medium text-white truncate text-sm">
                  {mail.subject}
                </div>
                <div className="pl-3 text-xs text-gray-400 truncate leading-relaxed">
                  {mail.body}
                </div>
                <button 
                  onClick={(e) => handleToggleStar(mail, e)}
                  className="absolute right-4 bottom-4 text-gray-500 hover:text-amber-400 hover:scale-110 active:scale-95 transition-all"
                >
                  <Star className={cn("w-4 h-4", mail.isStarred ? "fill-amber-400 text-amber-400" : "")} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Reader Pane */}
      {selectedMail && (
        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <button 
              onClick={() => setSelectedMail(null)}
              className="flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 md:hidden py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <button 
                onClick={() => handleReply(selectedMail)}
                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-gray-300 hover:text-white"
              >
                <Reply className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => handleToggleStar(selectedMail, e)}
                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-gray-300 hover:text-white"
              >
                <Star className={cn("w-4 h-4", selectedMail.isStarred ? "fill-amber-400 text-amber-400 border-amber-400" : "")} />
              </button>
              <button 
                onClick={() => handleMoveToTrash(selectedMail)}
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 active:scale-95 transition-all text-red-400"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight leading-normal">
                {selectedMail.subject}
              </h2>
              <div className="flex justify-between items-start border-t border-white/5 pt-4">
                <div>
                  <div className="font-semibold text-gray-200 text-sm">{selectedMail.sender.name}</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">{selectedMail.sender.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    {new Date(selectedMail.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mt-1">
                    {new Date(selectedMail.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-sans px-2">
              {selectedMail.body}
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>New Message</span>
              </h3>
              <button 
                onClick={() => { setIsComposeOpen(false); setComposeStatus({ type: null, message: "" }); }}
                className="text-gray-400 hover:text-white active:scale-90 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMail} className="p-6 flex flex-col gap-4">
              {composeStatus.type && (
                <div className={cn(
                  "p-3 rounded-xl border text-sm flex items-center gap-3",
                  composeStatus.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  {composeStatus.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{composeStatus.message}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 relative">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">To</label>
                <input 
                  type="email" 
                  value={composeTo}
                  onChange={e => setComposeTo(e.target.value)}
                  placeholder="username@campus.com"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:bg-black/30 transition-all text-sm"
                  required
                />
                {/* Suggestions drop */}
                {showSuggestions && (
                  <div className="absolute top-16 left-0 right-0 z-50 bg-[#1e293b] border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-40 overflow-y-auto divide-y divide-white/5">
                    {userSuggestions.map(u => (
                      <div 
                        key={u.id}
                        onClick={() => {
                          setComposeTo(u.email)
                          setShowSuggestions(false)
                        }}
                        className="p-3 hover:bg-white/5 cursor-pointer text-sm flex justify-between"
                      >
                        <span className="font-semibold text-gray-200">{u.name}</span>
                        <span className="text-gray-400 font-mono text-xs">{u.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Subject</label>
                <input 
                  type="text" 
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  placeholder="Enter subject"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:bg-black/30 transition-all text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Message</label>
                <textarea 
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  placeholder="Write your message here..."
                  rows={8}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:bg-black/30 transition-all text-sm resize-none"
                  required
                />
              </div>

              <button 
                type="submit"
                className="mt-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-98 transition-all"
              >
                <SendHorizontal className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
