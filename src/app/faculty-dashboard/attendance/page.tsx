"use client"

import { useState, useEffect } from "react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Button } from "@/components/ui/button"
import { 
  CalendarCheck, Users, UserCheck, UserX, Clock, BarChart3, Plus, Download, X, Check
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AttendanceRecord {
  id: string
  classroomId: string
  classroomName: string
  date: string
  presentCount: number
  absentCount: number
  lateCount: number
  records: { studentId: string; studentName: string; email: string; status: "PRESENT" | "ABSENT" | "LATE" }[]
}

export default function AttendancePage() {
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("all")

  // Mark Attendance Modal states
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false)
  const [selectedClassroomId, setSelectedClassroomId] = useState("")
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
  const [studentStatuses, setStudentStatuses] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({})
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0])

  // Load classrooms from database
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const res = await fetch("/api/faculty/classrooms")
        if (res.ok) {
          const data = await res.json()
          setClassrooms(data.classrooms || [])
        }

        // Load attendance logs from localStorage
        const savedLogs = localStorage.getItem("faculty_attendance_logs")
        if (savedLogs) {
          setAttendanceLogs(JSON.parse(savedLogs))
        } else {
          // Add some mock logs if empty
          const mockLogs: AttendanceRecord[] = [
            {
              id: "mock-1",
              classroomId: "mock-class-1",
              classroomName: "Advanced Software Engineering",
              date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
              presentCount: 18,
              absentCount: 2,
              lateCount: 1,
              records: []
            },
            {
              id: "mock-2",
              classroomId: "mock-class-1",
              classroomName: "Advanced Software Engineering",
              date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
              presentCount: 20,
              absentCount: 0,
              lateCount: 1,
              records: []
            }
          ]
          setAttendanceLogs(mockLogs)
          localStorage.setItem("faculty_attendance_logs", JSON.stringify(mockLogs))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Load students when a classroom is selected inside Mark Attendance modal
  useEffect(() => {
    if (!selectedClassroomId) {
      setEnrolledStudents([])
      return
    }
    const targetClass = classrooms.find((c) => c.id === selectedClassroomId)
    if (targetClass && targetClass.students) {
      setEnrolledStudents(targetClass.students)
      // Initialize all student statuses to PRESENT by default
      const initial: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {}
      targetClass.students.forEach((s: any) => {
        initial[s.id] = "PRESENT"
      })
      setStudentStatuses(initial)
    }
  }, [selectedClassroomId, classrooms])

  // Mark attendance status
  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE") => {
    setStudentStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  // Save Attendance to localStorage
  const handleSaveAttendance = () => {
    if (!selectedClassroomId || enrolledStudents.length === 0) return
    
    const targetClass = classrooms.find((c) => c.id === selectedClassroomId)
    const records = enrolledStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      email: s.email,
      status: studentStatuses[s.id] || "PRESENT",
    }))

    const present = records.filter((r) => r.status === "PRESENT").length
    const absent = records.filter((r) => r.status === "ABSENT").length
    const late = records.filter((r) => r.status === "LATE").length

    const newLog: AttendanceRecord = {
      id: Date.now().toString(),
      classroomId: selectedClassroomId,
      classroomName: targetClass ? targetClass.name : "Unknown Classroom",
      date: attendanceDate,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      records,
    }

    const updated = [newLog, ...attendanceLogs]
    setAttendanceLogs(updated)
    localStorage.setItem("faculty_attendance_logs", JSON.stringify(updated))
    
    // Reset & close
    setIsMarkModalOpen(false)
    setSelectedClassroomId("")
    setAttendanceDate(new Date().toISOString().split("T")[0])
    alert("Attendance logged successfully!")
  }

  // Delete log entry
  const handleDeleteLog = (id: string) => {
    if (!confirm("Delete this attendance record?")) return
    const updated = attendanceLogs.filter((log) => log.id !== id)
    setAttendanceLogs(updated)
    localStorage.setItem("faculty_attendance_logs", JSON.stringify(updated))
  }

  // Calculate stats summaries
  const todayStr = new Date().toISOString().split("T")[0]
  const todayLogs = attendanceLogs.filter((log) => log.date === todayStr)
  
  const todayPresent = todayLogs.reduce((acc, curr) => acc + curr.presentCount, 0)
  const todayAbsent = todayLogs.reduce((acc, curr) => acc + curr.absentCount, 0)
  const todayLate = todayLogs.reduce((acc, curr) => acc + curr.lateCount, 0)
  
  const totalToday = todayPresent + todayAbsent + todayLate
  const todayPresentPercent = totalToday > 0 ? Math.round((todayPresent / totalToday) * 100) : 0
  const todayAbsentPercent = totalToday > 0 ? Math.round((todayAbsent / totalToday) * 100) : 0

  const weeklyAverage = attendanceLogs.length > 0 
    ? Math.round(
        (attendanceLogs.reduce((acc, curr) => acc + curr.presentCount, 0) / 
        attendanceLogs.reduce((acc, curr) => acc + (curr.presentCount + curr.absentCount + curr.lateCount), 0)) * 100
      )
    : 85 // Fallback default average

  // Export logs to CSV
  const handleExportCSV = () => {
    if (attendanceLogs.length === 0) return
    
    let csvContent = "data:text/csv;charset=utf-8,Classroom,Date,Present Count,Absent Count,Late Count\n"
    attendanceLogs.forEach((log) => {
      csvContent += `"${log.classroomName}",${log.date},${log.presentCount},${log.absentCount},${log.lateCount}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `attendance_export_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 flex flex-col gap-8">
      
      {/* Header section */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[var(--glass-border-subtle)] pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            Attendance Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track student present levels, log attendance, and analyze weekly engagement logs.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={attendanceLogs.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-foreground bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setIsMarkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-xs shadow-lg cursor-pointer border border-primary/20 hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-4 h-4" /> Mark Attendance
          </button>
        </div>
      </div>

      {/* Metrics Widgets */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Today's Present", value: todayPresent, percentage: `${todayPresentPercent}%`, desc: "In classes today", icon: UserCheck, color: "text-stage3", accent: "#10b981" },
          { label: "Today's Absent", value: todayAbsent, percentage: `${todayAbsentPercent}%`, desc: "Unexcused absents", icon: UserX, color: "text-destructive", accent: "#ef4444" },
          { label: "Late Arrivals", value: todayLate, percentage: "Today", desc: "Arrived after time", icon: Clock, color: "text-stage4", accent: "#f59e0b" },
          { label: "Weekly Average", value: `${weeklyAverage}%`, percentage: "Avg Rate", desc: "Overall attendance", icon: BarChart3, color: "text-stage2", accent: "#3b82f6" },
        ].map((stat) => (
          <LiquidGlassCard key={stat.label} className="p-5 flex flex-col justify-between" accentColor={stat.accent}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground tracking-tight">{stat.value}</span>
              <span className={cn("text-[10px] font-bold", stat.color)}>{stat.percentage}</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1.5 block leading-none">{stat.desc}</span>
          </LiquidGlassCard>
        ))}
      </div>

      {/* Analytics Graph & Attendance Logs */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Weekly trends cylindrical graph */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <h3 className="font-bold text-base text-foreground">Attendance Trends</h3>
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-950/15 p-6 backdrop-blur-md flex flex-col justify-between h-[340px]">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="relative z-10 flex-1 flex items-end justify-around gap-2 pt-6">
              {attendanceLogs.slice(0, 5).reverse().map((log, idx) => {
                const total = log.presentCount + log.absentCount + log.lateCount
                const rate = total > 0 ? Math.round((log.presentCount / total) * 100) : 80
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 w-10 relative group">
                    <div className="absolute -top-7 bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-[9px] text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {rate}%
                    </div>
                    {/* cylindrical cylinder */}
                    <div className="w-5 bg-white/5 rounded-t-full border border-white/10 h-44 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-emerald-400 rounded-t-full transition-all duration-500 relative"
                        style={{ height: `${rate}%` }}
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-30 glass-shimmer" />
                      </div>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold truncate w-full text-center">
                      {log.date.substring(5)}
                    </span>
                  </div>
                )
              })}
            </div>
            <span className="text-[10px] text-muted-foreground border-t border-white/5 pt-3 mt-4 text-center block relative z-10">
              🟢 Average Presentee Rate (%) by Date
            </span>
          </div>
        </div>

        {/* Attendance logs table */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h3 className="font-bold text-base text-foreground">Session Log Registry</h3>
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-950/15 p-6 backdrop-blur-md flex-1 min-h-[340px]">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="relative z-10 overflow-x-auto no-scrollbar w-full h-full">
              {attendanceLogs.length === 0 ? (
                <div className="py-16 text-center text-xs text-muted-foreground">
                  No attendance session logs found. Click mark attendance to save one.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                      <th className="py-2.5 px-3">Classroom</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-center">Present</th>
                      <th className="py-2.5 px-3 text-center">Absent</th>
                      <th className="py-2.5 px-3 text-center">Late</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLogs.map((log) => (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 text-xs text-foreground">
                        <td className="py-3 px-3 font-semibold text-foreground truncate max-w-[150px]">
                          {log.classroomName}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{log.date}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-400">{log.presentCount}</td>
                        <td className="py-3 px-3 text-center font-bold text-rose-400">{log.absentCount}</td>
                        <td className="py-3 px-3 text-center font-bold text-amber-500">{log.lateCount}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          MARK ATTENDANCE DIALOG
          ──────────────────────────────────────────────────────── */}
      {isMarkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-900/95 max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-400" /> Mark Class Attendance
              </h3>
              <button
                onClick={() => setIsMarkModalOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 grid gap-4 grid-cols-2 my-1 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Select Classroom *</label>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="" className="bg-slate-900 text-foreground">-- Select classroom --</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-foreground">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Select Date *</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Students statuses toggler */}
            <div className="relative z-10 flex-1 max-h-60 overflow-y-auto no-scrollbar border border-white/5 bg-slate-950/20 rounded-2xl p-4 my-2">
              {!selectedClassroomId ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Select a classroom above to list students.
                </div>
              ) : enrolledStudents.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No students are enrolled in this classroom.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {enrolledStudents.map((stud) => {
                    const status = studentStatuses[stud.id] || "PRESENT"
                    return (
                      <div key={stud.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0 gap-4">
                        <div className="truncate max-w-[200px]">
                          <span className="font-semibold text-xs text-foreground block truncate">{stud.name}</span>
                          <span className="text-[10px] text-muted-foreground block truncate">{stud.email}</span>
                        </div>

                        <div className="flex gap-1.5 shrink-0 select-none">
                          {[
                            { id: "PRESENT", label: "P", color: "bg-emerald-500 text-white border-emerald-500", inactive: "border-white/10 hover:border-emerald-500/30 text-muted-foreground hover:text-emerald-400" },
                            { id: "LATE", label: "L", color: "bg-amber-500 text-white border-amber-500", inactive: "border-white/10 hover:border-amber-500/30 text-muted-foreground hover:text-amber-400" },
                            { id: "ABSENT", label: "A", color: "bg-rose-500 text-white border-rose-500", inactive: "border-white/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-400" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => handleStatusChange(stud.id, t.id as any)}
                              className={cn(
                                "w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center transition-all cursor-pointer",
                                status === t.id ? t.color : t.inactive
                              )}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="relative z-10 flex justify-end gap-2.5 mt-2 shrink-0">
              <button
                onClick={() => setIsMarkModalOpen(false)}
                className="px-4 py-2 bg-transparent text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAttendance}
                disabled={!selectedClassroomId || enrolledStudents.length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Log Attendance
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// Simple fallback component for trash icon in table (which we didn't import)
function Trash2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}
