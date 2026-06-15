"use client"

import { useState, useEffect } from "react"
import { 
  School, User, Calendar, Clock, ArrowLeft, BookOpen, 
  Send, CheckCircle2, AlertCircle, Sparkles, Code, Users, 
  Play, Check, RefreshCw, X, ChevronRight, MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Editor from "@monaco-editor/react"

interface Faculty {
  name: string
  email: string
}

interface Classroom {
  id: string
  name: string
  code: string
  faculty_name: string
  faculty_email: string
  student_count: number
}

interface PendingInvite {
  request_id: string
  classroom_id: string
  classroom_name: string
  classroom_code: string
  faculty_name: string
  faculty_email: string
  created_at: string
}

interface Announcement {
  id: string
  content: string
  createdAt: string
}

interface AssignmentSubmission {
  id: string
  code: string
  grade: number | null
  feedback: string | null
  status: string // "SUBMITTED", "GRADED"
  created_at: string
}

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  xp_reward: number
  coin_reward: number
  submission: AssignmentSubmission | null
}

export default function StudentClassroomsPage() {
  // Navigation & view states
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [activeTab, setActiveTab] = useState<"stream" | "classwork" | "people">("stream")
  
  // Detailed data states
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  
  // Coding / Practice states
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("python")
  const [runningCode, setRunningCode] = useState(false)
  const [submittingAssignment, setSubmittingAssignment] = useState(false)
  
  // Execution console output states
  const [runOutput, setRunOutput] = useState("")
  const [runError, setRunError] = useState("")
  const [aiHint, setAiHint] = useState("")
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  
  // Global action statuses
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" })

  const fetchClassroomsData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    
    try {
      // Fetch enrolled classrooms
      const resClassrooms = await fetch("/api/student/classrooms")
      const dataClassrooms = await resClassrooms.json()
      if (resClassrooms.ok) {
        setClassrooms(dataClassrooms.classrooms || [])
      }

      // Fetch pending invitations
      const resInvites = await fetch("/api/student/classrooms/pending")
      const dataInvites = await resInvites.json()
      if (resInvites.ok) {
        setPendingInvites(dataInvites.pending_requests || [])
      }
    } catch (e) {
      console.error("Failed to load classroom list", e)
      setStatusMessage({ type: "error", message: "Failed to load classroom data." })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchClassroomsData()
  }, [])

  // Load selected classroom details
  useEffect(() => {
    if (!selectedClassroom) return

    const fetchClassroomDetails = async () => {
      setDetailsLoading(true)
      try {
        // Fetch announcements
        const resAnnounce = await fetch(`/api/student/classroom/${selectedClassroom.id}/announcements`)
        const dataAnnounce = await resAnnounce.json()
        if (resAnnounce.ok) {
          setAnnouncements(dataAnnounce.announcements || [])
        }

        // Fetch assignments
        const resAssign = await fetch(`/api/student/classroom/${selectedClassroom.id}/assignments`)
        const dataAssign = await resAssign.json()
        if (resAssign.ok) {
          setAssignments(dataAssign.assignments || [])
        }
      } catch (err) {
        console.error("Failed to load classroom details", err)
      } finally {
        setDetailsLoading(false)
      }
    }

    fetchClassroomDetails()
  }, [selectedClassroom])

  const handleRespondInvitation = async (requestId: string, action: "accept" | "reject") => {
    try {
      const res = await fetch(`/api/student/classroom-requests/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      if (res.ok) {
        setStatusMessage({
          type: "success",
          message: action === "accept" 
            ? "Successfully joined classroom!" 
            : "Invitation rejected."
        })
        fetchClassroomsData(true)
        setTimeout(() => setStatusMessage({ type: null, message: "" }), 3000)
      } else {
        setStatusMessage({ type: "error", message: data.error || "Failed to respond to invitation." })
      }
    } catch (err) {
      console.error("Invitation response error", err)
      setStatusMessage({ type: "error", message: "Network error occurred." })
    }
  }

  const handleOpenAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setCode(assignment.submission?.code || getDefaultCodeTemplate(language))
    setRunOutput("")
    setRunError("")
    setAiHint("")
  }

  const getDefaultCodeTemplate = (lang: string) => {
    if (lang === "python") {
      return "# Write your solution here\n\ndef main():\n    print(\"Hello World\")\n\nif __name__ == \"__main__\":\n    main()"
    } else if (lang === "c") {
      return "#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    printf(\"Hello World\\n\");\n    return 0;\n}"
    } else if (lang === "cpp") {
      return "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    cout << \"Hello World\" << endl;\n    return 0;\n}"
    }
    return ""
  }

  // Handle changing language template
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    // Only set default code if no user code or unmodified template is found
    if (!code || code.trim() === "" || code.startsWith("# Write") || code.startsWith("#include")) {
      setCode(getDefaultCodeTemplate(newLang))
    }
  }

  const handleRunCode = async () => {
    if (!code.trim()) {
      setRunError("Please write some code first.")
      return
    }

    setRunningCode(true)
    setRunOutput("")
    setRunError("")
    setAiHint("")

    try {
      const res = await fetch("/api/student/language-courses/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          module_id: "classroom_assignment"
        })
      })

      const data = await res.json()
      if (res.ok) {
        if (data.success || !data.error) {
          setRunOutput(data.output || "Program executed successfully with no stdout output.")
        } else {
          setRunError(data.error)
          if (data.ai_hint) {
            setAiHint(data.ai_hint)
          }
        }
      } else {
        setRunError(data.error || "Failed to execute code.")
      }
    } catch (err) {
      console.error("Code run error", err)
      setRunError("Failed to communicate with execution server.")
    } finally {
      setRunningCode(false)
    }
  }

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return
    if (!code.trim()) {
      setStatusMessage({ type: "error", message: "Cannot submit empty solution." })
      return
    }

    setSubmittingAssignment(true)
    try {
      const res = await fetch(`/api/student/assignments/${selectedAssignment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      })

      const data = await res.json()
      if (res.ok) {
        setStatusMessage({ type: "success", message: "Assignment submitted successfully!" })
        
        // Refresh assignments list
        const resAssign = await fetch(`/api/student/classroom/${selectedClassroom?.id}/assignments`)
        const dataAssign = await resAssign.json()
        if (resAssign.ok) {
          const freshAssignments = dataAssign.assignments || []
          setAssignments(freshAssignments)
          
          // Update currently selected assignment detail
          const updated = freshAssignments.find((a: Assignment) => a.id === selectedAssignment.id)
          if (updated) setSelectedAssignment(updated)
        }
        
        setTimeout(() => setStatusMessage({ type: null, message: "" }), 3000)
      } else {
        setStatusMessage({ type: "error", message: data.error || "Submission failed." })
      }
    } catch (err) {
      console.error("Submit assignment error", err)
      setStatusMessage({ type: "error", message: "Network error occurred during submission." })
    } finally {
      setSubmittingAssignment(false)
    }
  }

  const handleUnsubmitAssignment = async () => {
    if (!selectedAssignment) return

    setSubmittingAssignment(true)
    try {
      const res = await fetch(`/api/student/assignments/${selectedAssignment.id}/unsubmit`, {
        method: "POST"
      })

      const data = await res.json()
      if (res.ok) {
        setStatusMessage({ type: "success", message: "Submission retracted." })
        
        // Refresh assignments list
        const resAssign = await fetch(`/api/student/classroom/${selectedClassroom?.id}/assignments`)
        const dataAssign = await resAssign.json()
        if (resAssign.ok) {
          const freshAssignments = dataAssign.assignments || []
          setAssignments(freshAssignments)
          
          const updated = freshAssignments.find((a: Assignment) => a.id === selectedAssignment.id)
          if (updated) setSelectedAssignment(updated)
        }
        
        setTimeout(() => setStatusMessage({ type: null, message: "" }), 3000)
      } else {
        setStatusMessage({ type: "error", message: data.error || "Failed to retract submission." })
      }
    } catch (err) {
      console.error("Retract submission error", err)
      setStatusMessage({ type: "error", message: "Network error occurred." })
    } finally {
      setSubmittingAssignment(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full gap-6 text-white pb-6 max-w-6xl mx-auto">
      {/* Top Banner Status */}
      {statusMessage.type && (
        <div className={cn(
          "p-4 rounded-2xl border text-sm flex items-center gap-3 shrink-0 mx-4 md:mx-0 shadow-lg",
          statusMessage.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
          {statusMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-medium">{statusMessage.message}</span>
        </div>
      )}

      {/* Main Container */}
      {!selectedClassroom ? (
        // LIST VIEW
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto px-4 md:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">My Classrooms</h1>
              <p className="text-gray-400 mt-1">Connect with your teachers and work on your classwork.</p>
            </div>
            <button 
              onClick={() => fetchClassroomsData(true)}
              disabled={refreshing}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all text-gray-300 hover:text-white"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </button>
          </div>

          {/* Pending Invitations Section */}
          {pendingInvites.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Pending Invitations ({pendingInvites.length})</span>
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {pendingInvites.map(invite => (
                  <LiquidGlassCard key={invite.request_id} className="p-5 flex flex-col gap-4" accentColor="#818cf8">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white text-lg tracking-tight">{invite.classroom_name}</h3>
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider font-mono">
                          {invite.classroom_code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>Invited by {invite.faculty_name} ({invite.faculty_email})</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button 
                        onClick={() => handleRespondInvitation(invite.request_id, "accept")}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl py-2 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept</span>
                      </Button>
                      <Button 
                        onClick={() => handleRespondInvitation(invite.request_id, "reject")}
                        variant="destructive"
                        className="flex-1 rounded-xl py-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </Button>
                    </div>
                  </LiquidGlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Enrolled Classrooms Grid */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-300 flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-400" />
              <span>Enrolled Classrooms</span>
            </h2>

            {loading ? (
              <div className="h-48 flex flex-col items-center justify-center gap-3 text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                <span>Loading classrooms...</span>
              </div>
            ) : classrooms.length === 0 ? (
              <GlassCard className="p-8 text-center flex flex-col items-center justify-center gap-3 border border-white/5 bg-white/5 rounded-3xl">
                <School className="w-12 h-12 text-gray-600" />
                <span className="text-gray-400 font-medium">You are not enrolled in any classrooms yet.</span>
                <span className="text-xs text-gray-500 max-w-sm">Contact your instructors to request an invitation or join code to get started.</span>
              </GlassCard>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {classrooms.map(classroom => (
                  <div 
                    key={classroom.id} 
                    onClick={() => {
                      setSelectedClassroom(classroom)
                      setActiveTab("stream")
                    }}
                    className="group cursor-pointer transition-all duration-300"
                  >
                    <LiquidGlassCard className="p-6 flex flex-col gap-4 h-full border border-white/10 group-hover:border-white/20 group-hover:scale-[1.02] shadow-xl">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors leading-snug">
                          {classroom.name}
                        </h3>
                        <span className="bg-white/10 border border-white/10 text-gray-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
                          {classroom.code}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-400" />
                          <span className="truncate">{classroom.faculty_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span>{classroom.student_count} Students enrolled</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-indigo-400 font-medium text-xs">
                        <span>Enter Classroom</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </LiquidGlassCard>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // DETAILED CLASSROOM VIEW
        <div className="flex-1 flex flex-col overflow-hidden px-4 md:px-0">
          {/* Details Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setSelectedClassroom(null)
                  setSelectedAssignment(null)
                }}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all text-indigo-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{selectedClassroom.name}</h1>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                  <span className="font-mono bg-white/5 border border-white/5 px-2 py-0.5 rounded text-gray-300">CODE: {selectedClassroom.code}</span>
                  <span>•</span>
                  <span>Instructor: {selectedClassroom.faculty_name}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-black/30 border border-white/10 rounded-xl p-1 shrink-0 self-start md:self-auto">
              <button 
                onClick={() => setActiveTab("stream")}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2",
                  activeTab === "stream" ? "bg-white/10 text-white shadow" : "text-gray-400 hover:text-white"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Stream</span>
              </button>
              <button 
                onClick={() => setActiveTab("classwork")}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2",
                  activeTab === "classwork" ? "bg-white/10 text-white shadow" : "text-gray-400 hover:text-white"
                )}
              >
                <BookOpen className="w-4 h-4" />
                <span>Classwork</span>
              </button>
              <button 
                onClick={() => setActiveTab("people")}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2",
                  activeTab === "people" ? "bg-white/10 text-white shadow" : "text-gray-400 hover:text-white"
                )}
              >
                <Users className="w-4 h-4" />
                <span>People</span>
              </button>
            </div>
          </div>

          {/* Tabs Body Container */}
          <div className="flex-1 overflow-y-auto">
            {detailsLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                <span>Loading stream...</span>
              </div>
            ) : activeTab === "stream" ? (
              // STREAM / ANNOUNCEMENTS TAB
              <div className="space-y-4 max-w-3xl">
                {announcements.length === 0 ? (
                  <GlassCard className="p-8 text-center flex flex-col items-center justify-center gap-3 bg-white/5 border-white/5 rounded-3xl">
                    <MessageSquare className="w-12 h-12 text-gray-600" />
                    <span className="text-gray-400 font-medium">No announcements yet.</span>
                    <span className="text-xs text-gray-500">Your teacher hasn't posted anything in the classroom stream yet.</span>
                  </GlassCard>
                ) : (
                  announcements.map(ann => (
                    <LiquidGlassCard key={ann.id} className="p-6 border border-white/10 shadow-lg">
                      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 text-xs text-gray-400 font-semibold">
                        <span className="text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {selectedClassroom.faculty_name}
                        </span>
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                    </LiquidGlassCard>
                  ))
                )}
              </div>
            ) : activeTab === "classwork" ? (
              // CLASSWORK / ASSIGNMENTS TAB
              <div className="grid md:grid-cols-5 gap-6 h-full items-start overflow-hidden">
                {/* Assignments List */}
                <div className={cn(
                  "space-y-4 md:col-span-2 overflow-y-auto h-full pr-2",
                  selectedAssignment ? "hidden md:block" : "block"
                )}>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Assignments</h3>
                  
                  {assignments.length === 0 ? (
                    <GlassCard className="p-8 text-center flex flex-col items-center justify-center gap-3 bg-white/5 border-white/5 rounded-3xl">
                      <Code className="w-12 h-12 text-gray-600" />
                      <span className="text-gray-400 font-medium">No assignments posted.</span>
                    </GlassCard>
                  ) : (
                    assignments.map(assign => {
                      const isSubmitted = assign.submission !== null
                      const isGraded = assign.submission?.status === "GRADED"
                      return (
                        <div 
                          key={assign.id}
                          onClick={() => handleOpenAssignment(assign)}
                          className={cn(
                            "cursor-pointer p-5 rounded-2xl border transition-all duration-200 flex flex-col gap-2.5",
                            selectedAssignment?.id === assign.id 
                              ? "bg-indigo-500/10 border-indigo-500/30" 
                              : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                          )}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-white text-[15px] leading-snug">{assign.title}</h4>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                              isGraded 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isSubmitted
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            )}>
                              {isGraded ? "Graded" : isSubmitted ? "Submitted" : "Pending"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-400 mt-2 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Due: {new Date(assign.due_date).toLocaleDateString()}</span>
                            </span>
                            <span className="text-indigo-300">+{assign.xp_reward} XP</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Assignment Editor / Solution Panel */}
                <div className="md:col-span-3 h-full overflow-hidden flex flex-col">
                  {selectedAssignment ? (
                    <div className="flex flex-col h-full bg-[#0b0f19] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                      {/* Editor Header */}
                      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
                        <button 
                          onClick={() => setSelectedAssignment(null)}
                          className="flex items-center gap-2 text-indigo-400 font-semibold text-xs md:hidden hover:text-indigo-300"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back to list</span>
                        </button>

                        <div className="hidden md:block">
                          <h4 className="font-bold text-white text-sm truncate max-w-xs">{selectedAssignment.title}</h4>
                        </div>

                        {/* Language selection dropdown */}
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lang:</label>
                          <select 
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            disabled={selectedAssignment.submission?.status === "GRADED"}
                            className="bg-black/30 border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                          >
                            <option value="python">Python</option>
                            <option value="c">C</option>
                            <option value="cpp">C++</option>
                          </select>
                        </div>
                      </div>

                      {/* Content Workspace Splitter */}
                      <div className="flex-1 flex flex-col md:grid md:grid-rows-2 overflow-hidden">
                        {/* Upper row: Details & Code Editor side by side */}
                        <div className="grid md:grid-cols-2 border-b border-white/5 overflow-hidden flex-1">
                          {/* Assignment specs & instructions */}
                          <div className="p-5 overflow-y-auto space-y-4 border-r border-white/5 bg-black/20">
                            <div>
                              <h3 className="font-bold text-white text-base tracking-tight">{selectedAssignment.title}</h3>
                              <p className="text-xs text-gray-400 mt-1">Due {new Date(selectedAssignment.due_date).toLocaleString()}</p>
                            </div>
                            
                            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed border-t border-white/5 pt-3">
                              {selectedAssignment.description}
                            </p>

                            <div className="flex gap-4 pt-3 border-t border-white/5 font-semibold text-xs">
                              <div className="text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                <span>🪙 {selectedAssignment.coin_reward} Coins</span>
                              </div>
                              <div className="text-indigo-400 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                                <span>⚡ {selectedAssignment.xp_reward} XP</span>
                              </div>
                            </div>

                            {/* Graded Details */}
                            {selectedAssignment.submission?.status === "GRADED" && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mt-4 space-y-2">
                                <div className="flex items-center justify-between text-emerald-400">
                                  <span className="font-bold text-xs uppercase tracking-wider">Graded Results</span>
                                  <span className="text-lg font-extrabold">{selectedAssignment.submission.grade}/100</span>
                                </div>
                                {selectedAssignment.submission.feedback && (
                                  <p className="text-gray-300 text-xs italic leading-relaxed">
                                    "{selectedAssignment.submission.feedback}"
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Monaco Code Editor */}
                          <div className="relative h-64 md:h-full min-h-[200px]">
                            <Editor
                              height="100%"
                              language={language}
                              theme="vs-dark"
                              value={code}
                              onChange={(val) => setCode(val || "")}
                              options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                lineHeight: 20,
                                padding: { top: 10 },
                                scrollBeyondLastLine: false,
                                readOnly: selectedAssignment.submission?.status === "GRADED"
                              }}
                            />
                          </div>
                        </div>

                        {/* Lower row: Console Execution Panel */}
                        <div className="flex flex-col bg-[#070b12] overflow-hidden min-h-[160px]">
                          <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex items-center justify-between shrink-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Console Output</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={handleRunCode}
                                disabled={runningCode}
                                className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                              >
                                {runningCode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-indigo-400" />}
                                <span>Run Code</span>
                              </button>
                              
                              {selectedAssignment.submission ? (
                                selectedAssignment.submission.status !== "GRADED" && (
                                  <button 
                                    onClick={handleUnsubmitAssignment}
                                    disabled={submittingAssignment}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-all"
                                  >
                                    <span>Unsubmit</span>
                                  </button>
                                )
                              ) : (
                                <button 
                                  onClick={handleSubmitAssignment}
                                  disabled={submittingAssignment}
                                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-500/10"
                                >
                                  {submittingAssignment && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                  <span>Submit</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed text-gray-300">
                            {runningCode && (
                              <div className="flex items-center gap-2 text-indigo-400">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Compiling and running code in Judge0 sandbox...</span>
                              </div>
                            )}

                            {!runningCode && !runOutput && !runError && (
                              <span className="text-gray-500">Run code or submit to see results.</span>
                            )}

                            {runOutput && (
                              <div className="text-emerald-400">
                                <div className="font-bold text-[10px] text-gray-500 uppercase tracking-wider mb-1">Standard Output:</div>
                                <pre className="whitespace-pre-wrap font-mono">{runOutput}</pre>
                              </div>
                            )}

                            {runError && (
                              <div className="text-rose-400">
                                <div className="font-bold text-[10px] text-gray-500 uppercase tracking-wider mb-1">Execution Error:</div>
                                <pre className="whitespace-pre-wrap font-mono">{runError}</pre>
                              </div>
                            )}

                            {aiHint && (
                              <div className="mt-4 p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1">
                                <div className="text-indigo-300 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                  <Sparkles className="w-4 h-4 text-indigo-400" />
                                  <span>AI Coding Tutor (Tanglish Suggestions)</span>
                                </div>
                                <p className="text-gray-300 text-xs italic leading-relaxed font-sans">{aiHint}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-white/10 rounded-3xl p-6 bg-black/10">
                      <Code className="w-12 h-12 text-gray-700 mb-2" />
                      <span className="font-medium text-sm">Select an assignment to start coding.</span>
                      <span className="text-xs text-gray-500 mt-1 max-w-xs text-center">Your work will be securely saved and graded by faculty.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // PEOPLE / INSTRUCTORS TAB
              <div className="space-y-4 max-w-xl">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Classroom Faculty</h3>
                
                <LiquidGlassCard className="p-5 border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-300 font-extrabold text-sm shrink-0">
                    {selectedClassroom.faculty_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base leading-snug">{selectedClassroom.faculty_name}</h4>
                    <span className="text-xs text-gray-400 font-mono mt-0.5 block">{selectedClassroom.faculty_email}</span>
                  </div>
                </LiquidGlassCard>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
