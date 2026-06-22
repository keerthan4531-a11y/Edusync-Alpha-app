"use client"

import { useState, useEffect } from "react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Button } from "@/components/ui/button"
import { 
  GraduationCap, Plus, Users, ClipboardList, Megaphone, Calendar, 
  FolderOpen, Settings, ChevronLeft, Trash2, Send, Check, X, FileText, Bookmark, CalendarIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null)
  const [classroomDetails, setClassroomDetails] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<"students" | "waiting" | "announcements" | "assignments" | "resources" | "settings">("students")
  
  // Modals & form states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [newAnnouncement, setNewAnnouncement] = useState("")
  const [newStudentEmail, setNewStudentEmail] = useState("")
  
  // Assignment form states
  const [asgTitle, setAsgTitle] = useState("")
  const [asgDesc, setAsgDesc] = useState("")
  const [asgDueDate, setAsgDueDate] = useState("")
  const [asgXp, setAsgXp] = useState(75)
  const [asgCoins, setAsgCoins] = useState(50)

  // Local storage based resources list
  const [resources, setResources] = useState<{ id: string; title: string; type: string; url: string }[]>([])
  const [resTitle, setResTitle] = useState("")
  const [resType, setResType] = useState("link")
  const [resUrl, setResUrl] = useState("")

  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Load classrooms list
  const loadClassrooms = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/faculty/classrooms")
      if (res.ok) {
        const data = await res.json()
        setClassrooms(data.classrooms || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClassrooms()
  }, [])

  // Load specific classroom detail
  const loadClassroomDetails = async (id: string) => {
    try {
      setDetailsLoading(true)
      const res = await fetch(`/api/faculty/classrooms/${id}`)
      if (res.ok) {
        const data = await res.json()
        setClassroomDetails(data.classroom)
        setSelectedClassroomId(id)
        
        // Load custom resources from localStorage
        const storedRes = localStorage.getItem(`resources_${id}`)
        if (storedRes) {
          setResources(JSON.parse(storedRes))
        } else {
          const defaultRes = [
            { id: "1", title: "Syllabus Overview", type: "pdf", url: "#" },
            { id: "2", title: "Introduction Slides", type: "slide", url: "#" },
          ]
          setResources(defaultRes)
          localStorage.setItem(`resources_${id}`, JSON.stringify(defaultRes))
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setDetailsLoading(false)
    }
  }

  // Create Classroom
  const handleCreateClassroom = async () => {
    if (!newClassName.trim()) return
    try {
      const res = await fetch("/api/faculty/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName }),
      })
      if (res.ok) {
        setNewClassName("")
        setIsCreateModalOpen(false)
        loadClassrooms()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Delete Classroom
  const handleDeleteClassroom = async () => {
    if (!selectedClassroomId) return
    if (!confirm("Are you sure you want to delete this classroom permanently? This will unenroll all students and delete all assignments.")) return
    try {
      const res = await fetch(`/api/faculty/classrooms/${selectedClassroomId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setSelectedClassroomId(null)
        setClassroomDetails(null)
        loadClassrooms()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Add Announcement
  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.trim() || !selectedClassroomId) return
    try {
      const res = await fetch(`/api/faculty/classrooms/${selectedClassroomId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newAnnouncement }),
      })
      if (res.ok) {
        setNewAnnouncement("")
        loadClassroomDetails(selectedClassroomId)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Direct Enroll Student
  const handleAddStudent = async () => {
    if (!newStudentEmail.trim() || !selectedClassroomId) return
    try {
      const res = await fetch(`/api/faculty/classrooms/${selectedClassroomId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newStudentEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewStudentEmail("")
        alert(`Successfully enrolled student: ${data.student.name}`)
        loadClassroomDetails(selectedClassroomId)
      } else {
        alert(data.error || "Failed to enroll student")
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Approve/Decline Join Invitation
  const handleInvitation = async (invId: string, action: "ACCEPT" | "REJECT") => {
    if (!selectedClassroomId) return
    try {
      const res = await fetch(`/api/faculty/classrooms/${selectedClassroomId}/invitations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: invId, action }),
      })
      if (res.ok) {
        loadClassroomDetails(selectedClassroomId)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Create Assignment
  const handleCreateAssignment = async () => {
    if (!asgTitle.trim() || !asgDueDate || !selectedClassroomId) return
    try {
      const res = await fetch(`/api/faculty/classrooms/${selectedClassroomId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: asgTitle,
          description: asgDesc,
          dueDate: asgDueDate,
          xpReward: asgXp,
          coinReward: asgCoins,
        }),
      })
      if (res.ok) {
        setAsgTitle("")
        setAsgDesc("")
        setAsgDueDate("")
        setAsgXp(75)
        setAsgCoins(50)
        loadClassroomDetails(selectedClassroomId)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Add Resource
  const handleAddResource = () => {
    if (!resTitle.trim() || !resUrl.trim() || !selectedClassroomId) return
    const newRes = {
      id: Date.now().toString(),
      title: resTitle,
      type: resType,
      url: resUrl,
    }
    const updated = [...resources, newRes]
    setResources(updated)
    localStorage.setItem(`resources_${selectedClassroomId}`, JSON.stringify(updated))
    setResTitle("")
    setResUrl("")
  }

  // Remove Resource
  const handleRemoveResource = (id: string) => {
    if (!selectedClassroomId) return
    const updated = resources.filter((r) => r.id !== id)
    setResources(updated)
    localStorage.setItem(`resources_${selectedClassroomId}`, JSON.stringify(updated))
  }

  // Delete Announcement
  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!selectedClassroomId) return
    if (!confirm("Are you sure you want to delete this announcement?")) return
    try {
      const res = await fetch(`/api/faculty/classrooms/${selectedClassroomId}/announcements/${announcementId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        loadClassroomDetails(selectedClassroomId)
      } else {
        alert("Failed to delete announcement")
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Delete Assignment
  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!selectedClassroomId) return
    if (!confirm("Are you sure you want to delete this assignment? All student submissions for it will also be deleted.")) return
    try {
      const res = await fetch(`/api/faculty/classrooms/${selectedClassroomId}/assignments/${assignmentId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        loadClassroomDetails(selectedClassroomId)
      } else {
        alert("Failed to delete assignment")
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* ────────────────────────────────────────────────────────
          CLASSROOM LIST VIEW
          ──────────────────────────────────────────────────────── */}
      {!selectedClassroomId ? (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                My Classrooms
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Create learning spaces and manage student enrollments.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Classroom</span>
            </button>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 bg-white/5 animate-pulse border border-white/5 rounded-2xl" />
              ))}
            </div>
          ) : classrooms.length === 0 ? (
            <div className="glass-panel border border-[var(--glass-border)] rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="glass-noise" />
              <div className="p-4 bg-white/5 rounded-full border border-white/10 text-muted-foreground">
                <GraduationCap className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No classrooms yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Get started by creating your first classroom. You will get a unique join code to share with your students.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-foreground text-sm font-semibold transition-all cursor-pointer"
              >
                Create Now
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classrooms.map((cls) => (
                <LiquidGlassCard
                  key={cls.id}
                  onClick={() => loadClassroomDetails(cls.id)}
                  className="p-6 cursor-pointer hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[180px]"
                  accentColor="#6366f1"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-extrabold text-lg text-foreground truncate max-w-[80%]">
                        {cls.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                        ACTIVE
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-1">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono select-all">
                        CODE: {cls.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-[var(--glass-border-subtle)] pt-4 mt-4 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      {cls.students?.length || 0} Students
                    </span>
                    <span className="text-primary hover:translate-x-1 transition-transform flex items-center gap-1">
                      Manage <ChevronLeft className="w-3 h-3 rotate-180" />
                    </span>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ────────────────────────────────────────────────────────
            CLASSROOM DETAILS VIEW
            ──────────────────────────────────────────────────────── */
        <div className="flex flex-col gap-6">
          {/* Top Panel Actions */}
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[var(--glass-border-subtle)] pb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedClassroomId(null)
                  setClassroomDetails(null)
                }}
                className="glass-panel flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/10 transition-all cursor-pointer border border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {classroomDetails?.name}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  Class Join Code: <span className="font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold select-all">{classroomDetails?.code}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleDeleteClassroom}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Class</span>
            </button>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-none">
            {[
              { id: "students", label: "Students", icon: Users },
              { id: "waiting", label: "Join Requests", icon: ClipboardList, badge: classroomDetails?.invitations?.length },
              { id: "announcements", label: "Announcements", icon: Megaphone },
              { id: "assignments", label: "Assignments", icon: FileText },
              { id: "resources", label: "Resource Library", icon: FolderOpen },
              { id: "settings", label: "Class Planner", icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all border whitespace-nowrap cursor-pointer",
                  activeTab === tab.id
                    ? "bg-primary/10 border-primary/20 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                    : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {!!tab.badge && (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] rounded-full bg-rose-500 text-white font-bold animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Panel */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-950/15 p-6 backdrop-blur-md">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="relative z-10">
              
              {/* ─ STUDENTS TAB ─ */}
              {activeTab === "students" && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="font-bold text-base text-foreground">Enrolled Students</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Students currently inside this classroom.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        placeholder="Student email..."
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground w-48"
                      />
                      <button
                        onClick={handleAddStudent}
                        className="flex items-center gap-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
                      >
                        <Plus className="w-3.5 h-3.5" /> Direct Enroll
                      </button>
                    </div>
                  </div>

                  {classroomDetails?.students?.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No students are currently enrolled. Share the classroom join code with them!
                    </div>
                  ) : (
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                            <th className="py-2.5 px-3">Student Name</th>
                            <th className="py-2.5 px-3">Email Address</th>
                            <th className="py-2.5 px-3 text-center">XP</th>
                            <th className="py-2.5 px-3 text-center">Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classroomDetails?.students?.map((s: any) => (
                            <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 text-xs">
                              <td className="py-3 px-3 font-semibold text-foreground">{s.name}</td>
                              <td className="py-3 px-3 text-muted-foreground">{s.email}</td>
                              <td className="py-3 px-3 text-center font-bold text-emerald-400">{s.xp}</td>
                              <td className="py-3 px-3 text-center font-bold">{s.level}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ─ WAITING LIST TAB ─ */}
              {activeTab === "waiting" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-base text-foreground">Join Requests Waiting Room</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Approve or deny join requests from students.</p>
                  </div>

                  {(!classroomDetails?.invitations || classroomDetails.invitations.length === 0) ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No pending requests at the moment.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {classroomDetails.invitations.map((inv: any) => (
                        <div key={inv.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all gap-4">
                          <div>
                            <h4 className="font-bold text-xs md:text-sm text-foreground">{inv.student.name}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{inv.student.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleInvitation(inv.id, "ACCEPT")}
                              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl transition-all cursor-pointer"
                              title="Accept Invitation"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleInvitation(inv.id, "REJECT")}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl transition-all cursor-pointer"
                              title="Decline Invitation"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─ ANNOUNCEMENTS TAB ─ */}
              {activeTab === "announcements" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <h3 className="font-bold text-base text-foreground">Post Announcement</h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Write a message to your classroom..."
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddAnnouncement()
                        }}
                        className="flex-1 bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={handleAddAnnouncement}
                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-white/5 pt-5 mt-2">
                    <h4 className="font-bold text-sm text-foreground">Classroom Updates Log</h4>
                    
                    {classroomDetails?.announcements?.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No announcements posted yet.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {classroomDetails?.announcements?.map((ann: any) => (
                          <div key={ann.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl relative group">
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium mb-1 pr-6">
                              <span>By You (Faculty)</span>
                              <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs md:text-sm text-foreground leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-rose-400 hover:bg-white/5 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete Announcement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─ ASSIGNMENTS TAB ─ */}
              {activeTab === "assignments" && (
                <div className="flex flex-col gap-6">
                  {/* Create Assignment Accordion/Form */}
                  <div className="p-5 border border-white/5 rounded-2xl bg-white/5 flex flex-col gap-4">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-400" /> Create Assignment
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted-foreground font-medium">Assignment Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Coding Arrays Quiz"
                          value={asgTitle}
                          onChange={(e) => setAsgTitle(e.target.value)}
                          className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted-foreground font-medium">Due Date *</label>
                        <input
                          type="date"
                          value={asgDueDate}
                          onChange={(e) => setAsgDueDate(e.target.value)}
                          className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground font-medium">Description</label>
                      <textarea
                        rows={2}
                        placeholder="Write assignment instructions, requirements, or code template..."
                        value={asgDesc}
                        onChange={(e) => setAsgDesc(e.target.value)}
                        className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="grid gap-4 grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted-foreground font-medium">XP Reward</label>
                        <input
                          type="number"
                          value={asgXp}
                          onChange={(e) => setAsgXp(Number(e.target.value))}
                          className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted-foreground font-medium">Coin Reward</label>
                        <input
                          type="number"
                          value={asgCoins}
                          onChange={(e) => setAsgCoins(Number(e.target.value))}
                          className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreateAssignment}
                      className="mt-2 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs rounded-xl hover:scale-[1.01] transition-all cursor-pointer shadow-lg"
                    >
                      Publish Assignment
                    </button>
                  </div>

                  {/* List Assignments */}
                  <div className="flex flex-col gap-4 border-t border-white/5 pt-5 mt-2">
                    <h4 className="font-bold text-sm text-foreground">Current Assignments</h4>

                    {classroomDetails?.assignments?.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No assignments published yet.
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {classroomDetails?.assignments?.map((asg: any) => (
                          <div key={asg.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all flex flex-col justify-between min-h-[140px] relative group">
                            <div>
                              <div className="flex justify-between items-start gap-2 pr-6">
                                <h5 className="font-bold text-xs md:text-sm text-foreground line-clamp-1">{asg.title}</h5>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shrink-0">
                                  {asg.submissions?.length || 0} Turned-in
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                {asg.description || "No description provided."}
                              </p>
                            </div>

                            <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                                Due: {new Date(asg.dueDate).toLocaleDateString()}
                              </span>
                              <span className="font-bold text-emerald-400">
                                {asg.xpReward} XP / {asg.coinReward} Coins
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteAssignment(asg.id)}
                              className="absolute top-3.5 right-3.5 p-1 text-muted-foreground hover:text-rose-400 hover:bg-white/5 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete Assignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─ RESOURCE LIBRARY TAB ─ */}
              {activeTab === "resources" && (
                <div className="flex flex-col gap-6">
                  {/* Upload Resource Form */}
                  <div className="p-5 border border-white/5 rounded-2xl bg-white/5 flex flex-col gap-4">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-400" /> Add Resource Material
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex flex-col gap-1.5 sm:col-span-1">
                        <label className="text-xs text-muted-foreground font-medium">Resource Type</label>
                        <select
                          value={resType}
                          onChange={(e) => setResType(e.target.value)}
                          className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full outline-none"
                        >
                          <option value="link" className="bg-slate-900 text-foreground">Hyperlink URL</option>
                          <option value="pdf" className="bg-slate-900 text-foreground">PDF Document</option>
                          <option value="slide" className="bg-slate-900 text-foreground">Lecture Slides</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs text-muted-foreground font-medium">Material Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Week 1 Lecture Handout"
                          value={resTitle}
                          onChange={(e) => setResTitle(e.target.value)}
                          className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground font-medium">Resource URL *</label>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/... or any reference url"
                        value={resUrl}
                        onChange={(e) => setResUrl(e.target.value)}
                        className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                      />
                    </div>

                    <button
                      onClick={handleAddResource}
                      className="mt-2 w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-xs rounded-xl hover:scale-[1.01] transition-all cursor-pointer shadow-lg"
                    >
                      Add Material to Library
                    </button>
                  </div>

                  {/* Material Listing */}
                  <div className="flex flex-col gap-4 border-t border-white/5 pt-5 mt-2">
                    <h4 className="font-bold text-sm text-foreground">Library Materials</h4>

                    {resources.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No materials shared yet.
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {resources.map((res) => (
                          <div key={res.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all gap-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                <Bookmark className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="font-bold text-xs text-foreground leading-snug">{res.title}</h5>
                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{res.type}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-foreground font-semibold text-[10px] rounded-lg transition-all"
                              >
                                View File
                              </a>
                              <button
                                onClick={() => handleRemoveResource(res.id)}
                                className="p-1 text-rose-500/75 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─ CLASS PLANNER TAB ─ */}
              {activeTab === "settings" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-base text-foreground">Classroom Schedule Planner</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage lecture times and project delivery milestones.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-5 border border-white/5 bg-slate-900/40 rounded-2xl flex flex-col gap-4">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-400" /> Weekly Class Schedule
                      </h4>
                      <div className="flex flex-col gap-2.5 text-xs">
                        {[
                          { day: "Monday", time: "10:00 AM - 11:30 AM", room: "Lab Room 402" },
                          { day: "Wednesday", time: "10:00 AM - 11:30 AM", room: "Lecture Hall A" },
                          { day: "Friday", time: "2:00 PM - 3:30 PM", room: "Virtual Zoom Room" },
                        ].map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                            <div>
                              <span className="font-bold text-foreground block">{s.day}</span>
                              <span className="text-[10px] text-muted-foreground">{s.room}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">{s.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 border border-white/5 bg-slate-900/40 rounded-2xl flex flex-col gap-4 justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <Settings className="w-4 h-4 text-indigo-400" /> Archive Classroom
                        </h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          Archiving a class freezes student participation and places all assignment submissions, codes, and details in read-only mode. The join code will be deactivated.
                        </p>
                      </div>
                      
                      <button
                        onClick={() => alert("Classroom archived! Students can now only view content in read-only mode.")}
                        className="py-2 px-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Archive Classroom
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          CREATE CLASSROOM MODAL
          ──────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-900/90 max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-extrabold text-base text-foreground">Create New Classroom</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 flex flex-col gap-1.5 my-2">
              <label className="text-xs text-muted-foreground font-medium">Classroom Name *</label>
              <input
                type="text"
                placeholder="e.g. Advanced Software Engineering"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="bg-white/5 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
              />
            </div>

            <div className="relative z-10 flex justify-end gap-2.5 mt-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-transparent text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClassroom}
                disabled={!newClassName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
