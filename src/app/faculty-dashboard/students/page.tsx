"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/db"
import { 
  Users, Search, Award, TrendingUp, Mail, CheckCircle2, XCircle, 
  Clock, AlertCircle, PlusCircle, ChevronRight, Calendar, ClipboardCheck, 
  ArrowUpRight, Loader2, UserCheck, FileText, User
} from "lucide-react"
import { AttendanceSection } from "@/components/faculty/AttendanceSection"
import { TimetableManagement } from "@/components/faculty/TimetableManagement"

// ----------------------------------------------------
// TYPES & STATUS CONFIGS FOR LEAVES
// ----------------------------------------------------
type FacultyLeaveType = "CL" | "ML" | "OD" | "COMP_OFF"
type Slot = { id: string; dayOfWeek: number; periodNo: number; subject: string; classGroup: string; startTime: string; endTime: string }
type FacultyColleague = { id: string; name: string; email: string }
type Sub = { slotId: string; date: string; substituteId: string }
type FacultyLeave = { id: string; leaveType: string; fromDate: string; toDate: string; reason: string; status: string; hodRemark: string | null; appliedAt: string; substitutions: any[] }

type StudentLeave = {
  id: string
  fromDate: string
  toDate: string
  reason: string
  leaveType: string
  status: string
  inchargeRemark: string | null
  appliedAt: string
  student: {
    id: string; name: string; email: string
    studentProfile?: { rollNumber?: string; batch?: string; semester?: number } | null
  }
}

const FACULTY_LEAVE_STATUS: Record<string, { color: string; icon: any; label: string }> = {
  PENDING:     { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock, label: "Pending HOD Review" },
  SUB_PENDING: { color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: AlertCircle, label: "Awaiting Substitute Response" },
  APPROVED:    { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, label: "Approved by HOD" },
  REJECTED:    { color: "text-rose-500 bg-rose-500/10 border-rose-500/20", icon: XCircle, label: "Rejected" },
}

const STUDENT_LEAVE_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:           { label: "Pending Review",   color: "text-amber-500 bg-amber-500/10 border-amber-500/20",   icon: Clock },
  APPROVED:          { label: "Approved",         color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  REJECTED:          { label: "Rejected",         color: "text-rose-500 bg-rose-500/10 border-rose-500/20",     icon: XCircle },
  FORWARDED_TO_HOD:  { label: "Forwarded to HOD",color: "text-blue-500 bg-blue-500/10 border-blue-500/20",     icon: ArrowUpRight },
}

function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = []
  const start = new Date(from)
  const end = new Date(to)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day >= 1 && day <= 5) dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export default function FacultyStudentsPage() {
  const [activeTab, setActiveTab] = useState<"attendance" | "student-leaves" | "my-leaves">("attendance")

  // ----------------------------------------------------
  // STUDENT ROSTER STATE
  // ----------------------------------------------------
  const [students, setStudents] = useState<any[]>([])
  const [studentSearch, setStudentSearch] = useState("")
  const [loadingStudents, setLoadingStudents] = useState(true)

  // ----------------------------------------------------
  // STUDENT LEAVE APPROVALS STATE
  // ----------------------------------------------------
  const [studentLeaves, setStudentLeaves] = useState<StudentLeave[]>([])
  const [loadingStudentLeaves, setLoadingStudentLeaves] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [remarkMap, setRemarkMap] = useState<Record<string, string>>({})
  const [filterStudentLeaveStatus, setFilterStudentLeaveStatus] = useState("ALL")

  // ----------------------------------------------------
  // FACULTY LEAVE APPLICATION STATE
  // ----------------------------------------------------
  const [facultyLeaves, setFacultyLeaves] = useState<FacultyLeave[]>([])
  const [timetableSlots, setTimetableSlots] = useState<Slot[]>([])
  const [colleagues, setColleagues] = useState<FacultyColleague[]>([])
  const [loadingFacultyLeaves, setLoadingFacultyLeaves] = useState(true)
  const [leaveStep, setLeaveStep] = useState<1 | 2 | 3>(1)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [submittingLeave, setSubmittingLeave] = useState(false)

  const [leaveForm, setLeaveForm] = useState({ leaveType: "CL" as FacultyLeaveType, fromDate: "", toDate: "", reason: "" })
  const [substitutions, setSubstitutions] = useState<Sub[]>([])

  // Load All Initial Data
  useEffect(() => {
    // 1. Fetch Students
    fetch("/api/faculty/all-students")
      .then(r => r.json())
      .then(data => {
        setStudents(Array.isArray(data) ? data : [])
        setLoadingStudents(false)
      })
      .catch(() => setLoadingStudents(false))

    // 2. Fetch Student Leaves
    fetch("/api/faculty/student-leaves")
      .then(r => r.json())
      .then(data => {
        setStudentLeaves(Array.isArray(data) ? data : [])
        setLoadingStudentLeaves(false)
      })
      .catch(() => setLoadingStudentLeaves(false))

    // 3. Fetch Faculty Leaves & Timetable & Colleagues
    Promise.all([
      fetch("/api/faculty/leave").then(r => r.json()).catch(() => []),
      fetch("/api/faculty/timetable").then(r => r.json()).catch(() => []),
      fetch("/api/faculty/colleagues").then(r => r.json()).catch(() => []),
    ]).then(([leavesData, slotsData, facultiesData]) => {
      setFacultyLeaves(Array.isArray(leavesData) ? leavesData : [])
      setTimetableSlots(Array.isArray(slotsData) ? slotsData : [])
      setColleagues(Array.isArray(facultiesData) ? facultiesData : [])
      setLoadingFacultyLeaves(false)
    })
  }, [])

  // Auto-calculate affected timetable slots when dates change for faculty leave
  useEffect(() => {
    if (!leaveForm.fromDate || !leaveForm.toDate || timetableSlots.length === 0) return
    const dates = getDatesInRange(leaveForm.fromDate, leaveForm.toDate)
    const affected: Sub[] = []
    dates.forEach(date => {
      const dayOfWeek = new Date(date).getDay()
      const daySlots = timetableSlots.filter(s => s.dayOfWeek === dayOfWeek)
      daySlots.forEach(s => affected.push({ slotId: s.id, date, substituteId: "" }))
    })
    setSubstitutions(affected)
  }, [leaveForm.fromDate, leaveForm.toDate, timetableSlots])

  // Handle Student Leave Action (Approve / Reject / Forward)
  const handleStudentLeaveAction = async (id: string, action: "APPROVED" | "REJECTED" | "FORWARDED_TO_HOD") => {
    setActionId(id)
    const res = await fetch(`/api/faculty/student-leaves/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, inchargeRemark: remarkMap[id] || null }),
    })
    if (res.ok) {
      setStudentLeaves(l => l.map(lv => lv.id === id ? { ...lv, status: action, inchargeRemark: remarkMap[id] || null } : lv))
    }
    setActionId(null)
  }

  // Handle Faculty Leave Submit
  const handleFacultyLeaveSubmit = async () => {
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) return
    if (substitutions.some(s => !s.substituteId)) {
      alert("Please assign a substitute faculty for every affected period.")
      return
    }
    setSubmittingLeave(true)
    const res = await fetch("/api/faculty/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...leaveForm, substitutions }),
    })
    const data = await res.json()
    if (res.ok) {
      setFacultyLeaves(l => [data, ...l])
      setShowLeaveForm(false)
      setLeaveStep(1)
      setLeaveForm({ leaveType: "CL", fromDate: "", toDate: "", reason: "" })
      setSubstitutions([])
    }
    setSubmittingLeave(false)
  }

  // Filtered lists
  const filteredStudents = studentSearch.trim()
    ? students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase()))
    : students

  const filteredStudentLeaves = filterStudentLeaveStatus === "ALL" 
    ? studentLeaves 
    : studentLeaves.filter(l => l.status === filterStudentLeaveStatus)

  const pendingStudentLeavesCount = studentLeaves.filter(l => l.status === "PENDING").length

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 md:p-8 text-foreground pb-20">
      {/* Top Banner Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" />
          Students & Attendance Hub
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Comprehensive faculty management: mark class attendance, review student leave requests, and apply for faculty leave.
        </p>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex gap-2 border-b border-black/10 dark:border-white/10 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs md:text-sm font-extrabold transition-all shrink-0 ${
            activeTab === "attendance"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
              : "neu-flat dark:bg-white/5 text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Attendance & Roster</span>
        </button>

        <button
          onClick={() => setActiveTab("student-leaves")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs md:text-sm font-extrabold transition-all shrink-0 relative ${
            activeTab === "student-leaves"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
              : "neu-flat dark:bg-white/5 text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Student Leave Approvals</span>
          {pendingStudentLeavesCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ml-1">
              {pendingStudentLeavesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("my-leaves")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs md:text-sm font-extrabold transition-all shrink-0 ${
            activeTab === "my-leaves"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
              : "neu-flat dark:bg-white/5 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Faculty Leave</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: ATTENDANCE & STUDENT ROSTER DIRECTORY                       */}
      {/* =================================================================== */}
      {activeTab === "attendance" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Top Section: Realtime Class Attendance Tracking */}
          <AttendanceSection />

          {/* Timetable Management Section */}
          <TimetableManagement />

          {/* Bottom Section: Student Roster Directory Table */}
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Student Roster & Leaderboard Directory
              </h2>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                {students.length} Enrolled Students
              </span>
            </div>

            {/* Toolbar Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center neu-flat p-4 rounded-2xl shadow-lg dark:bg-white/5 dark:border-white/10 border border-blue-500/10">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                <input 
                  type="text" 
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  placeholder="Search student by name or email..." 
                  className="w-full h-10 pl-10 pr-4 text-xs font-semibold rounded-xl bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground transition-all"
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl neu-flat shadow-xl dark:bg-white/5 dark:border-white/10 border border-blue-500/10">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-extrabold border-b border-black/5 dark:border-white/5 bg-blue-500/5">
                  <tr>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Level / XP</th>
                    <th className="px-6 py-3.5">Enrolled Classrooms</th>
                    <th className="px-6 py-3.5">Streak</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                  {loadingStudents ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-semibold">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-semibold">No students found matching your search.</td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-blue-500/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                              {student.name ? student.name.charAt(0) : "S"}
                            </div>
                            <div>
                              <div className="font-extrabold text-foreground">{student.name}</div>
                              <div className="text-muted-foreground text-[10px]">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="font-extrabold text-foreground">Lvl {student.level || 1}</span>
                            <span className="text-[10px] text-muted-foreground font-bold">({student.xp || 0} XP)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {student.enrolledClassrooms?.slice(0, 2).map((cls: any, i: number) => (
                              <span key={i} className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-extrabold">
                                {cls.name}
                              </span>
                            ))}
                            {student.enrolledClassrooms?.length > 2 && (
                              <span className="px-2 py-0.5 rounded-lg bg-blue-500/5 text-[10px] font-bold text-muted-foreground">
                                +{student.enrolledClassrooms.length - 2}
                              </span>
                            )}
                            {(!student.enrolledClassrooms || student.enrolledClassrooms.length === 0) && (
                              <span className="text-muted-foreground text-xs font-bold">Enrolled Student</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                            <TrendingUp className="w-4 h-4" />
                            <span>{student.currentStreak || 0} days</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all" title="Message Student">
                            <Mail className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: STUDENT LEAVE APPROVALS (INCHARGE / FACULTY VIEW)           */}
      {/* =================================================================== */}
      {activeTab === "student-leaves" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-flat p-6 rounded-3xl dark:bg-white/5 dark:border-white/10 border border-blue-500/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Student Leave Approvals</h2>
                {pendingStudentLeavesCount > 0 && (
                  <span className="text-[11px] font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {pendingStudentLeavesCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Review, approve, reject or forward leave applications for students in your class incharge section.
              </p>
            </div>
          </div>

          {/* Filter Navigation */}
          <div className="flex gap-2 flex-wrap border-b border-black/10 dark:border-white/10 pb-3">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "FORWARDED_TO_HOD"].map(s => (
              <button key={s} onClick={() => setFilterStudentLeaveStatus(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStudentLeaveStatus === s 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20" 
                    : "neu-flat dark:bg-white/5 text-muted-foreground hover:text-foreground"
                }`}>
                {s === "ALL" ? "All Requests" : s === "FORWARDED_TO_HOD" ? "Forwarded to HOD" : s.charAt(0) + s.slice(1).toLowerCase()}
                <span className="ml-1.5 text-[10px] opacity-80">({studentLeaves.filter(l => s === "ALL" || l.status === s).length})</span>
              </button>
            ))}
          </div>

          {/* Requests List */}
          {loadingStudentLeaves ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : filteredStudentLeaves.length === 0 ? (
            <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-12 rounded-2xl text-center border border-blue-500/10 shadow-xl">
              <ClipboardCheck className="w-12 h-12 mx-auto text-blue-500/40 mb-3" />
              <p className="text-sm font-bold text-foreground">No {filterStudentLeaveStatus !== "ALL" ? filterStudentLeaveStatus.toLowerCase() : ""} student leave applications found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredStudentLeaves.map((leave) => {
                const cfg = STUDENT_LEAVE_STATUS[leave.status] || STUDENT_LEAVE_STATUS["PENDING"]
                const StatusIcon = cfg.icon
                const isPending = leave.status === "PENDING"
                return (
                  <div key={leave.id} className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-2xl flex flex-col gap-4 border border-blue-500/10 shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-md shadow-blue-500/20">
                          {leave.student?.name ? leave.student.name.charAt(0) : "S"}
                        </div>
                        <div>
                          <p className="text-base font-extrabold text-foreground">{leave.student?.name}</p>
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{leave.student?.email}</p>
                          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                            {leave.student?.studentProfile?.rollNumber || "No Roll #"} · Batch {leave.student?.studentProfile?.batch || "—"} · Sem {leave.student?.studentProfile?.semester || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">{leave.leaveType}</span>
                        <span className={`flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-xl border ${cfg.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-blue-500/5 dark:bg-white/5 p-3 rounded-xl border border-blue-500/10">
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest">Start Date</p>
                        <p className="font-extrabold text-foreground mt-0.5">{new Date(leave.fromDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-blue-500/5 dark:bg-white/5 p-3 rounded-xl border border-blue-500/10">
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest">End Date</p>
                        <p className="font-extrabold text-foreground mt-0.5">{new Date(leave.toDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-blue-500/5 dark:bg-white/5 p-3 rounded-xl border border-blue-500/10">
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest">Applied On</p>
                        <p className="font-extrabold text-foreground mt-0.5">{new Date(leave.appliedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-blue-500/5 dark:bg-white/5 p-4 rounded-xl border border-blue-500/10">
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest mb-1">Reason Statement</p>
                      <p className="text-xs font-semibold text-foreground leading-relaxed">{leave.reason}</p>
                    </div>

                    {leave.inchargeRemark && (
                      <div className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">Incharge Remark: "{leave.inchargeRemark}"</p>
                      </div>
                    )}

                    {isPending && (
                      <div className="flex flex-col gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                        <input
                          value={remarkMap[leave.id] || ""}
                          onChange={e => setRemarkMap(m => ({ ...m, [leave.id]: e.target.value }))}
                          placeholder="Add an optional remark for the student..."
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                        />
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => handleStudentLeaveAction(leave.id, "APPROVED")} disabled={actionId === leave.id}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20">
                            {actionId === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve Leave
                          </button>
                          <button onClick={() => handleStudentLeaveAction(leave.id, "REJECTED")} disabled={actionId === leave.id}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-md shadow-rose-500/20">
                            {actionId === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject Leave
                          </button>
                          <button onClick={() => handleStudentLeaveAction(leave.id, "FORWARDED_TO_HOD")} disabled={actionId === leave.id}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-md shadow-blue-500/20">
                            {actionId === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />} Forward to HOD
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: MY FACULTY LEAVE APPLICATION                                */}
      {/* =================================================================== */}
      {activeTab === "my-leaves" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-flat p-6 rounded-3xl dark:bg-white/5 dark:border-white/10 border border-blue-500/10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Faculty Leave & Timetable Alteration</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">Apply for leave, assign peer substitute faculty for affected periods, and track HOD approvals.</p>
            </div>
            <button onClick={() => { setShowLeaveForm(v => !v); setLeaveStep(1) }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 hover:scale-105 transition-all flex items-center gap-2 self-start sm:self-auto">
              <PlusCircle className="w-4 h-4" /> Apply New Leave
            </button>
          </div>

          {/* Multi-step Leave Application Form */}
          {showLeaveForm && (
            <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-2xl border border-blue-500/20 shadow-xl">
              {/* Steps indicator */}
              <div className="flex items-center gap-3 mb-6 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all ${leaveStep >= s ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20" : "bg-black/10 dark:bg-white/10 text-muted-foreground"}`}>{s}</div>
                    <span className={`text-xs font-extrabold hidden sm:block ${leaveStep === s ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>
                      {s === 1 ? "1. Leave Details" : s === 2 ? "2. Assign Substitutes" : "3. Final Review"}
                    </span>
                    {s < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto hidden sm:block" />}
                  </div>
                ))}
              </div>

              {/* STEP 1 */}
              {leaveStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Leave Type</label>
                      <select value={leaveForm.leaveType} onChange={e => setLeaveForm(f => ({ ...f, leaveType: e.target.value as FacultyLeaveType }))}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground">
                        {["CL", "ML", "OD", "COMP_OFF"].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">From Date</label>
                      <input type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm(f => ({ ...f, fromDate: e.target.value }))}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">To Date</label>
                      <input type="date" value={leaveForm.toDate} min={leaveForm.fromDate} onChange={e => setLeaveForm(f => ({ ...f, toDate: e.target.value }))}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                      <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Reason for Leave</label>
                      <textarea value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} rows={3}
                        placeholder="Enter explicit reason..." className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground resize-none" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setLeaveStep(2)} disabled={!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-md shadow-blue-500/20">
                      Continue to Substitute Assignment →
                    </button>
                    <button onClick={() => setShowLeaveForm(false)} className="px-5 py-2.5 rounded-xl neu-flat dark:bg-white/5 text-xs font-bold">Cancel</button>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {leaveStep === 2 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Assign Substitutes for Affected Timetable Periods
                  </h3>
                  {substitutions.length === 0 ? (
                    <p className="text-xs text-muted-foreground bg-blue-500/5 p-4 rounded-xl">No active timetable slots affected during selected dates.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {substitutions.map((sub, i) => {
                        const slot = timetableSlots.find(s => s.id === sub.slotId)
                        return (
                          <div key={i} className="neu-flat dark:bg-white/5 dark:border-white/10 p-4 rounded-xl flex flex-wrap items-center gap-4 border border-blue-500/10">
                            <div className="flex-1 min-w-[200px]">
                              <p className="text-xs font-extrabold text-foreground">{sub.date} · Period {slot?.periodNo}</p>
                              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{slot?.subject} ({slot?.classGroup}) {slot?.startTime}–{slot?.endTime}</p>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                              <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 block">Substitute Faculty</label>
                              <select value={sub.substituteId}
                                onChange={e => setSubstitutions(ss => ss.map((s, j) => j === i ? { ...s, substituteId: e.target.value } : s))}
                                className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground">
                                <option value="">Select substitute faculty...</option>
                                {colleagues.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                              </select>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setLeaveStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all shadow-md shadow-blue-500/20">Review Application →</button>
                    <button onClick={() => setLeaveStep(1)} className="px-5 py-2.5 rounded-xl neu-flat dark:bg-white/5 text-xs font-bold">← Back</button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {leaveStep === 3 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-foreground">Application Summary</h3>
                  <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-5 rounded-2xl space-y-2.5 text-xs border border-blue-500/10">
                    <div className="flex gap-2"><span className="font-extrabold text-blue-600 dark:text-blue-400 w-32">Leave Type:</span><span className="font-bold text-foreground">{leaveForm.leaveType}</span></div>
                    <div className="flex gap-2"><span className="font-extrabold text-blue-600 dark:text-blue-400 w-32">Duration:</span><span className="font-bold text-foreground">{leaveForm.fromDate} to {leaveForm.toDate}</span></div>
                    <div className="flex gap-2"><span className="font-extrabold text-blue-600 dark:text-blue-400 w-32">Reason:</span><span className="font-bold text-foreground">{leaveForm.reason}</span></div>
                    <div className="flex gap-2"><span className="font-extrabold text-blue-600 dark:text-blue-400 w-32">Substitutions:</span><span className="font-bold text-emerald-500">{substitutions.filter(s => s.substituteId).length} of {substitutions.length} assigned</span></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleFacultyLeaveSubmit} disabled={submittingLeave}
                      className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
                      {submittingLeave ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Submit Leave Application
                    </button>
                    <button onClick={() => setLeaveStep(2)} className="px-5 py-2.5 rounded-xl neu-flat dark:bg-white/5 text-xs font-bold">← Back</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Faculty Leave History List */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              My Submitted Leave Applications
            </h3>
            {loadingFacultyLeaves ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : facultyLeaves.length === 0 ? (
              <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-12 rounded-2xl text-center border border-blue-500/10">
                <Calendar className="w-12 h-12 mx-auto text-blue-500/40 mb-3" />
                <p className="text-sm font-bold text-foreground">No leave applications submitted yet</p>
              </div>
            ) : (
              facultyLeaves.map((leave) => {
                const cfg = FACULTY_LEAVE_STATUS[leave.status] || FACULTY_LEAVE_STATUS["PENDING"]
                const Icon = cfg.icon
                return (
                  <div key={leave.id} className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-2xl flex flex-col gap-4 border border-blue-500/10 shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">{leave.leaveType}</span>
                          <span className={`flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-xl border ${cfg.color}`}>
                            <Icon className="w-3.5 h-3.5" /> {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-foreground">{new Date(leave.fromDate).toLocaleDateString()} → {new Date(leave.toDate).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{leave.reason}</p>
                        {leave.hodRemark && <p className="text-xs text-amber-500 mt-2 font-semibold bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">HOD Remark: "{leave.hodRemark}"</p>}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground shrink-0">{new Date(leave.appliedAt).toLocaleDateString()}</p>
                    </div>

                    {leave.substitutions?.length > 0 && (
                      <div className="flex flex-col gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                        <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Substitution Responses</p>
                        <div className="flex flex-wrap gap-2">
                          {leave.substitutions.map((sub: any) => {
                            const subCfg = sub.status === "ACCEPTED" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : sub.status === "REJECTED" ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                            return (
                              <div key={sub.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold border ${subCfg}`}>
                                {sub.status === "ACCEPTED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : sub.status === "REJECTED" ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                {sub.date} · {sub.substitute?.name || "Substitute"} ({sub.status})
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
