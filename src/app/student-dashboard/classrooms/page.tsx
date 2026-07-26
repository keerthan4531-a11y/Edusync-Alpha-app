"use client"

import { useState, useEffect, useRef } from "react"
import { 
  School, User, Calendar, Clock, ArrowLeft, BookOpen, 
  Send, CheckCircle2, AlertCircle, Sparkles, Code, Users, 
  Play, Check, RefreshCw, X, ChevronRight, MessageSquare, ChevronLeft,
  FileText, Plus
} from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlobalSpinner } from "@/components/ui/GlobalSpinner"
import Editor from "@monaco-editor/react"
import { JoinClassroomModal } from "./JoinClassroomModal"

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
  max_points?: number
  createdAt?: string
  submission: AssignmentSubmission | null
}

export default function StudentClassroomsPage() {
  // Navigation & view states
  const { data: session } = useSession()
  const currentUserEmail = session?.user?.email
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  // Toggle global back button
  useEffect(() => {
    const globalBackBtn = document.getElementById('global-back-btn')
    if (globalBackBtn) {
      globalBackBtn.style.display = selectedClassroom ? 'none' : 'block'
    }
    return () => {
      if (globalBackBtn) globalBackBtn.style.display = 'block'
    }
  }, [selectedClassroom])

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
    setCode(assignment.submission?.code || "")
    setSelectedFile(null)
    setRunOutput("")
    setRunError("")
    setAiHint("")
  }

  // Submit Assignment
  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || (!code.trim() && !selectedFile)) return
    setSubmittingAssignment(true)

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("code", code);
        
        res = await fetch(`/api/student/assignments/${selectedAssignment.id}/submit`, {
          method: "POST",
          body: formData
        });
      } else {
        res = await fetch(`/api/student/assignments/${selectedAssignment.id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code })
        });
      }

      const data = await res.json()
      if (res.ok) {
        setStatusMessage({ type: "success", message: "Assignment submitted successfully!" })
        setSelectedFile(null)
        
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
    <div className="flex flex-col h-[calc(100vh-140px)] w-full gap-6 text-foreground pb-6 max-w-6xl mx-auto">
      {/* Top Banner Status */}
      {statusMessage.type && (
        <div className={cn(
          "p-4 rounded-2xl border text-sm flex items-center gap-3 shrink-0 mx-4 md:mx-0 shadow-lg",
          statusMessage.type === "success" 
            ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400" 
            : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
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
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">My Classrooms</h1>
            </div>
            <JoinClassroomModal 
              onJoined={(msg) => {
                setStatusMessage({ type: "success", message: msg })
                fetchClassroomsData(true)
                setTimeout(() => setStatusMessage({ type: null, message: "" }), 3000)
              }} 
            />
          </div>

          {/* Pending Invitations Section */}
          {pendingInvites.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-primary dark:text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary dark:text-indigo-400" />
                <span>Pending Invitations ({pendingInvites.length})</span>
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {pendingInvites.map(invite => (
                  <LiquidGlassCard key={invite.request_id} className="p-5 flex flex-col gap-4" accentColor="#818cf8">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-foreground dark:text-white text-lg tracking-tight">{invite.classroom_name}</h3>
                        <span className="neu-raised-xs text-primary dark:bg-indigo-500/20 dark:text-indigo-300 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider font-mono">
                          {invite.classroom_code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <User className="w-4 h-4 text-primary dark:text-indigo-400" />
                        <span>Invited by {invite.faculty_name} ({invite.faculty_email})</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button 
                        onClick={() => handleRespondInvitation(invite.request_id, "accept")}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-2 flex items-center justify-center gap-1.5 shadow-md neu-button"
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
            <h2 className="text-lg font-bold text-foreground dark:text-gray-300 flex items-center gap-2">
              <School className="w-5 h-5 text-primary dark:text-indigo-400" />
              <span>Enrolled Classrooms</span>
            </h2>

            {loading ? (
              <div className="flex h-[400px] items-center justify-center">
              <GlobalSpinner />
            </div>
            ) : classrooms.length === 0 ? (
              <GlassCard className="p-8 text-center flex flex-col items-center justify-center gap-3 neu-flat rounded-3xl dark:bg-white/5">
                <School className="w-12 h-12 text-muted-foreground" />
                <span className="text-foreground dark:text-gray-400 font-medium">You are not enrolled in any classrooms yet.</span>
                <span className="text-xs text-muted-foreground max-w-sm">Contact your instructors to request an invitation or join code to get started.</span>
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
                    <LiquidGlassCard className="p-6 flex flex-col gap-4 h-full group-hover:scale-[1.02] shadow-xl">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-foreground group-hover:text-primary dark:text-white dark:group-hover:text-indigo-300 transition-colors text-lg leading-snug">
                          {classroom.name}
                        </h3>
                        <span className="neu-raised-xs text-muted-foreground text-xs px-2.5 py-0.5 rounded-full font-mono font-medium dark:bg-white/10 dark:text-gray-300">
                          {classroom.code}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary dark:text-indigo-400" />
                          <span className="truncate">{classroom.faculty_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary dark:text-indigo-400" />
                          <span>{classroom.student_count} Students enrolled</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-primary dark:text-indigo-400 font-medium text-xs">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-black/10 dark:border-white/10 pb-4 mb-4 gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setSelectedClassroom(null)
                  setSelectedAssignment(null)
                }}
                className="p-3 neu-button rounded-2xl transition-all text-primary dark:text-indigo-400 dark:bg-white/5 dark:border-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">{selectedClassroom.name}</h1>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="font-mono neu-raised-xs px-2 py-0.5 rounded text-foreground dark:text-gray-300">CODE: {selectedClassroom.code}</span>
                  <span>•</span>
                  <span>Instructor: {selectedClassroom.faculty_name}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex neu-inset-sm rounded-xl p-1 shrink-0 self-start md:self-auto dark:bg-black/30">
              <button 
                onClick={() => setActiveTab("stream")}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2",
                  activeTab === "stream" ? "neu-raised-sm text-foreground shadow dark:bg-white/10 dark:text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Stream</span>
              </button>
              <button 
                onClick={() => setActiveTab("classwork")}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2",
                  activeTab === "classwork" ? "neu-raised-sm text-foreground shadow dark:bg-white/10 dark:text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BookOpen className="w-4 h-4" />
                <span>Classwork</span>
              </button>
              <button 
                onClick={() => setActiveTab("people")}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2",
                  activeTab === "people" ? "neu-raised-sm text-foreground shadow dark:bg-white/10 dark:text-white" : "text-muted-foreground hover:text-foreground"
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
              <div className="flex h-[200px] items-center justify-center neu-raised-lg backdrop-blur-3xl rounded-[32px] dark:bg-white/5 dark:border-white/10 shadow-2xl">
              <GlobalSpinner />
            </div>
            ) : activeTab === "stream" ? (
              // STREAM / ANNOUNCEMENTS TAB
              <div className="space-y-4 max-w-3xl">
                {announcements.length === 0 ? (
                  <GlassCard className="p-8 text-center flex flex-col items-center justify-center gap-3 neu-flat rounded-3xl dark:bg-white/5">
                    <MessageSquare className="w-12 h-12 text-muted-foreground" />
                    <span className="text-foreground dark:text-gray-400 font-medium">No announcements yet.</span>
                    <span className="text-xs text-muted-foreground">Your teacher hasn't posted anything in the classroom stream yet.</span>
                  </GlassCard>
                ) : (
                  announcements.map(ann => (
                    <LiquidGlassCard key={ann.id} className="p-6 shadow-lg">
                      <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5 mb-4 text-xs text-muted-foreground font-semibold">
                        <span className="text-primary dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {selectedClassroom.faculty_name}
                        </span>
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-foreground dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                    </LiquidGlassCard>
                  ))
                )}
              </div>
            ) : activeTab === "classwork" ? (
              <div className="flex flex-col min-h-full overflow-y-auto pb-16">
                {/* Assignments List */}
                {!selectedAssignment && (
                  <div className="space-y-4 overflow-y-auto h-full pr-2">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Assignments</h3>
                    
                    {assignments.length === 0 ? (
                      <GlassCard className="p-8 text-center flex flex-col items-center justify-center gap-3 neu-flat rounded-3xl dark:bg-white/5">
                        <Code className="w-12 h-12 text-muted-foreground" />
                        <span className="text-foreground dark:text-gray-400 font-medium">No assignments posted.</span>
                      </GlassCard>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignments.map(assign => {
                          const isSubmitted = assign.submission !== null
                          const isGraded = assign.submission?.status === "GRADED"
                          return (
                            <div 
                              key={assign.id}
                              onClick={() => handleOpenAssignment(assign)}
                              className="cursor-pointer p-5 rounded-2xl transition-all duration-200 flex flex-col gap-2.5 neu-flat shadow-lg group hover:scale-[1.01] dark:bg-white/5 dark:border-white/5"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                  <BookOpen className="w-5 h-5 text-primary dark:text-indigo-400" />
                                </div>
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                  isGraded 
                                    ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                                    : isSubmitted
                                    ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                                    : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                )}>
                                  {isGraded ? "Graded" : isSubmitted ? "Submitted" : "Pending"}
                                </span>
                              </div>
                              <h4 className="font-bold text-foreground dark:text-white text-[17px] leading-snug mt-1 group-hover:text-primary dark:group-hover:text-indigo-300 transition-colors">{assign.title}</h4>

                              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 font-medium border-t border-black/5 dark:border-white/5 pt-3">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-primary dark:text-indigo-400" />
                                  <span>Due: {new Date(assign.due_date).toLocaleDateString()}</span>
                                </span>
                                <span className="text-primary dark:text-indigo-300 font-bold">+{assign.xp_reward} XP</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Assignment Editor / Solution Panel */}
                {selectedAssignment && (
                  <div className="w-full flex flex-col gap-6">
                    <div className="flex flex-col neu-raised-lg rounded-3xl shadow-2xl dark:bg-[#0b0f19] dark:border-white/10">
                      {/* Editor Header */}
                      <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setSelectedAssignment(null)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg neu-button text-muted-foreground hover:text-foreground transition-colors dark:bg-white/5 dark:border-white/10 dark:text-gray-300"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-semibold">Back to Assignments</span>
                          </button>
                        </div>
                      </div>

                      {/* Workspace - Google Classroom Style */}
                      <div className="flex flex-col lg:flex-row gap-6 p-6 md:p-8">
                        {/* Assignment Details (Left) */}
                        <div className="flex-1 space-y-6">
                          <div>
                            <h1 className="text-foreground dark:text-white text-3xl font-bold tracking-tight mb-1">{selectedAssignment.title}</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedClassroom.faculty_name} • {selectedAssignment.createdAt ? new Date(selectedAssignment.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'short' }) : "Recently"}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-foreground dark:text-gray-300 font-semibold mt-4">
                              <span>{selectedAssignment.max_points || 100} points</span>
                              <span className="text-muted-foreground">|</span>
                              <span>Due {selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toLocaleString("en-US", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "N/A"}</span>
                            </div>
                          </div>

                          {/* Class comments placeholder */}
                          <div className="border-t border-black/10 dark:border-white/10 my-4" />
                          <button className="flex items-center gap-2 text-primary dark:text-indigo-400 hover:text-primary/80 transition-colors text-sm font-semibold">
                            <MessageSquare className="w-4 h-4" />
                            <span>1 class comment</span>
                          </button>
                          <div className="border-t border-black/10 dark:border-white/10 my-4" />
                          
                          <div className="text-foreground dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                            {selectedAssignment.description}
                          </div>

                          <div className="flex gap-4 pt-4 font-semibold text-sm">
                            <div className="text-primary dark:text-indigo-400 flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                              <span>⚡ {selectedAssignment.xp_reward} XP</span>
                            </div>
                          </div>
                        </div>

                        {/* Your Work & Private Comments Panel (Right) */}
                        <div className="w-full lg:w-96 flex flex-col gap-6">
                          {/* Your Work Card */}
                          <div className="neu-raised rounded-2xl p-5 flex flex-col gap-4 shadow-xl dark:bg-white/5 dark:border-white/10">
                            <div className="flex items-center justify-between">
                              <h4 className="text-foreground dark:text-white font-semibold text-lg tracking-tight">Your work</h4>
                              <span className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                selectedAssignment.submission?.status === "GRADED" ? "text-primary dark:text-indigo-400" :
                                selectedAssignment.submission ? "text-primary dark:text-indigo-400" : "text-amber-600 dark:text-amber-400"
                              )}>
                                {selectedAssignment.submission?.status === "GRADED" ? "Marked" : selectedAssignment.submission ? "Handed in" : "Assigned"}
                              </span>
                            </div>

                            {/* Submission Area */}
                            <div className="flex flex-col gap-3">
                              {selectedAssignment.submission ? (
                                /* Submitted File Card */
                                <div className="neu-inset rounded-xl p-3 flex items-center justify-between group dark:bg-black/30 dark:border-white/10">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-primary dark:text-indigo-400 shrink-0">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                      <div className="text-foreground dark:text-white text-xs font-medium truncate">
                                        {selectedAssignment.submission.code.startsWith("[FILE_UPLOAD_V3]")
                                          ? selectedAssignment.submission.code.replace("[FILE_UPLOAD_V3]", "").split("|")[0]
                                          : selectedAssignment.submission.code.startsWith("[FILE_UPLOAD_V2]")
                                          ? selectedAssignment.submission.code.replace("[FILE_UPLOAD_V2]", "").split("|")[0]
                                          : selectedAssignment.submission.code.startsWith("[FILE_UPLOAD]")
                                          ? selectedAssignment.submission.code.replace("[FILE_UPLOAD] ", "")
                                          : `${selectedAssignment.title}_submission.txt`}
                                      </div>
                                      <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mt-0.5">
                                        {selectedAssignment.submission.code.startsWith("[FILE_UPLOAD]") || selectedAssignment.submission.code.startsWith("[FILE_UPLOAD_V2]") || selectedAssignment.submission.code.startsWith("[FILE_UPLOAD_V3]") ? "Document" : "Text Response"}
                                      </div>
                                    </div>
                                  </div>
                                  {selectedAssignment.submission.status !== "GRADED" && (
                                    <button 
                                      onClick={handleUnsubmitAssignment}
                                      disabled={submittingAssignment}
                                      className="w-8 h-8 rounded-full flex items-center justify-center neu-button text-muted-foreground hover:text-foreground transition-colors"
                                      title="Remove submission"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ) : selectedFile ? (
                                /* Selected File Preview */
                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between group">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="w-5 h-5 text-primary dark:text-indigo-400 shrink-0" />
                                    <div className="text-foreground dark:text-white text-xs font-medium truncate">{selectedFile.name}</div>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      setSelectedFile(null);
                                      setCode("");
                                      if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                /* Text Editor when Not Submitted */
                                <textarea
                                  value={code}
                                  onChange={(e) => setCode(e.target.value)}
                                  placeholder="Type your answer or paste a link to your work here..."
                                  disabled={submittingAssignment}
                                  className="w-full h-32 neu-input rounded-xl p-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none resize-none disabled:opacity-70 disabled:cursor-not-allowed dark:bg-black/30 dark:text-white"
                                />
                              )}
                            </div>

                            {/* Action Buttons */}
                            {selectedAssignment.submission ? (
                              selectedAssignment.submission.status !== "GRADED" ? (
                                <button 
                                  onClick={handleUnsubmitAssignment}
                                  disabled={submittingAssignment}
                                  className="w-full py-2.5 neu-button text-foreground font-semibold rounded-xl transition-all disabled:opacity-50 text-sm shadow-sm cursor-pointer dark:text-white"
                                >
                                  Unsubmit
                                </button>
                              ) : (
                                <div className="flex flex-col gap-3">
                                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-center">
                                    <span className="text-primary dark:text-indigo-400 font-bold text-lg">{selectedAssignment.submission.grade}/100</span>
                                    {selectedAssignment.submission.feedback && (
                                      <p className="text-foreground dark:text-gray-300 text-xs mt-2 italic">
                                        "{selectedAssignment.submission.feedback}"
                                      </p>
                                    )}
                                  </div>
                                  {/* Resubmit button if graded */}
                                  <button 
                                    onClick={handleUnsubmitAssignment}
                                    disabled={submittingAssignment}
                                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all text-sm neu-button cursor-pointer"
                                  >
                                    Resubmit
                                  </button>
                                </div>
                              )
                            ) : (
                              <div className="flex flex-col gap-2">
                                <button 
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="w-full py-2.5 neu-button text-primary font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                                >
                                  <Plus className="w-4 h-4 text-primary" />
                                  <span>Add or create</span>
                                </button>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  ref={fileInputRef} 
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      setSelectedFile(file);
                                      setCode(`[FILE_UPLOAD] ${file.name}`);
                                    }
                                  }} 
                                  accept=".pdf,.doc,.docx,.txt"
                                />
                                
                                <button 
                                  onClick={handleSubmitAssignment}
                                  disabled={submittingAssignment || (!code.trim() && !selectedFile)}
                                  className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm neu-button cursor-pointer"
                                >
                                  {submittingAssignment && <RefreshCw className="w-4 h-4 animate-spin" />}
                                  Turn in
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Private Comments Card */}
                          <div className="neu-raised rounded-2xl p-5 flex flex-col gap-3 shadow-xl dark:bg-white/5 dark:border-white/10">
                            <div className="flex items-center gap-2 text-foreground dark:text-white font-semibold text-sm">
                              <User className="w-4 h-4 text-primary dark:text-indigo-400" />
                              <span>Private comments</span>
                            </div>
                            <div className="relative mt-2">
                              <input 
                                type="text"
                                placeholder={`Add comment to ${selectedClassroom.faculty_name || "instructor"}...`}
                                className="w-full neu-input rounded-xl py-2 pl-3 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none dark:bg-black/30 dark:text-white"
                              />
                              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // PEOPLE / INSTRUCTORS TAB
              <div className="space-y-4 max-w-xl">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Classroom Faculty</h3>
                
                <LiquidGlassCard className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-primary dark:text-indigo-300 font-extrabold text-sm shrink-0">
                    {selectedClassroom.faculty_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground dark:text-white text-base leading-snug">
                      {selectedClassroom.faculty_name} {currentUserEmail === selectedClassroom.faculty_email && "(You)"}
                    </h4>
                    <span className="text-xs text-muted-foreground font-mono mt-0.5 block">{selectedClassroom.faculty_email}</span>
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
