"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Save, Loader2, Users, BarChart3, RefreshCw, PlusCircle, Sparkles, Clock } from "lucide-react"

type Slot = { id: string; dayOfWeek: number; periodNo: number; subject: string; classGroup: string; room: string; startTime: string; endTime: string }
type Student = { id: string; name: string; email: string }
type AttRecord = { studentId: string; isPresent: boolean; student: Student }
type Stat = { studentId: string; name: string; email: string; total: number; present: number; percentage: number }

const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export function AttendanceSection() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [stats, setStats] = useState<Stat[]>([])
  const [tab, setTab] = useState<"mark" | "stats" | "setup">("mark")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetching, setFetching] = useState(false)

  // New slot form
  const [newSlot, setNewSlot] = useState({ dayOfWeek: "1", periodNo: "1", subject: "", classGroup: "", room: "", startTime: "09:00", endTime: "09:50" })
  const [savingSlot, setSavingSlot] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/faculty/timetable").then(r => r.json()),
      fetch("/api/faculty/attendance/stats").then(r => r.json()),
    ]).then(([slotsData, statsData]) => {
      const s = Array.isArray(slotsData) ? slotsData : []
      setSlots(s)
      if (s.length > 0) setSelectedSlot(s[0].id)
      setStats(Array.isArray(statsData) ? statsData : [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedSlot || !date) return
    setFetching(true)
    fetch(`/api/faculty/attendance?slotId=${selectedSlot}&date=${date}`)
      .then(r => r.json())
      .then((records: AttRecord[]) => {
        if (Array.isArray(records) && records.length > 0) {
          const studs = records.map(r => r.student).filter(Boolean)
          if (studs.length > 0) setStudents(studs)
          const att: Record<string, boolean> = {}
          records.forEach(r => { att[r.studentId] = r.isPresent })
          setAttendance(att)
        }
        setFetching(false)
      })
  }, [selectedSlot, date])

  const loadStudents = async () => {
    if (!selectedSlot) return
    setFetching(true)
    const res = await fetch("/api/faculty/timetable-students?slotId=" + selectedSlot).catch(() => null)
    let studs: Student[] = []
    if (res?.ok) {
      const data = await res.json()
      studs = Array.isArray(data) ? data : []
    }
    if (studs.length === 0) {
      const res2 = await fetch("/api/faculty/all-students")
      const data2 = await res2.json().catch(() => [])
      studs = Array.isArray(data2) ? data2.slice(0, 40) : []
    }
    setStudents(studs)
    const att: Record<string, boolean> = {}
    studs.forEach(s => { att[s.id] = attendance[s.id] !== undefined ? attendance[s.id] : true })
    setAttendance(att)
    setFetching(false)
  }

  const toggleAll = (present: boolean) => {
    const att: Record<string, boolean> = {}
    students.forEach(s => { att[s.id] = present })
    setAttendance(att)
  }

  const handleSave = async () => {
    if (!selectedSlot || students.length === 0) return
    setSaving(true)
    const attendanceArr = students.map(s => ({ studentId: s.id, isPresent: attendance[s.id] !== false }))
    const res = await fetch("/api/faculty/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: selectedSlot, date, attendance: attendanceArr }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      const statsData = await fetch("/api/faculty/attendance/stats").then(r => r.json())
      setStats(Array.isArray(statsData) ? statsData : [])
    }
    setSaving(false)
  }

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSlot(true)
    const res = await fetch("/api/faculty/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newSlot, dayOfWeek: Number(newSlot.dayOfWeek), periodNo: Number(newSlot.periodNo) }),
    })
    const data = await res.json()
    if (res.ok) {
      setSlots(s => [...s, data])
      setSelectedSlot(data.id)
      setNewSlot({ dayOfWeek: "1", periodNo: "1", subject: "", classGroup: "", room: "", startTime: "09:00", endTime: "09:50" })
      setTab("mark")
    }
    setSavingSlot(false)
  }

  const presentCount = students.filter(s => attendance[s.id] !== false).length
  const absentCount = students.length - presentCount

  return (
    <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2rem] border border-blue-500/20 shadow-xl flex flex-col gap-6">
      {/* Header section inside component */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Attendance Tracking</h2>
            <p className="text-xs text-muted-foreground font-medium">Mark and record real-time student attendance by timetable slot</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "mark", label: "Mark Attendance", icon: CheckCircle2 },
            { key: "stats", label: "Statistics", icon: BarChart3 },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === key 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]" 
                  : "neu-flat dark:bg-white/5 text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* MARK TAB */}
      {tab === "mark" && (
        loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div> :
        slots.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 mx-auto text-blue-500/40 mb-2" />
            <p className="text-xs font-bold text-foreground mb-1">No timetable slots configured yet</p>
            <p className="text-[11px] text-muted-foreground font-medium">Use the Timetable Management section below to add your teaching slots.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Controls panel */}
            <div className="flex flex-wrap gap-3 items-end bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Timetable Slot</label>
                <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground">
                  {slots.map(s => (
                    <option key={s.id} value={s.id}>{DAYS[s.dayOfWeek]} P{s.periodNo} — {s.subject} ({s.classGroup}) {s.startTime}–{s.endTime}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 min-w-[140px]">
                <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Attendance Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
              </div>
              <button onClick={loadStudents} disabled={fetching}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:scale-105 transition-all disabled:opacity-50 shadow-md shadow-blue-500/20">
                {fetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Load Roster
              </button>
            </div>

            {/* Quick stats cards */}
            {students.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-500/5 dark:bg-white/5 p-3 rounded-xl text-center border border-blue-500/10">
                  <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{students.length}</p>
                  <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mt-0.5">Total</p>
                </div>
                <div className="bg-emerald-500/5 dark:bg-white/5 p-3 rounded-xl text-center border border-emerald-500/10">
                  <p className="text-2xl font-extrabold text-emerald-500">{presentCount}</p>
                  <p className="text-[9px] font-extrabold text-emerald-500/80 uppercase tracking-widest mt-0.5">Present</p>
                </div>
                <div className="bg-rose-500/5 dark:bg-white/5 p-3 rounded-xl text-center border border-rose-500/10">
                  <p className="text-2xl font-extrabold text-rose-500">{absentCount}</p>
                  <p className="text-[9px] font-extrabold text-rose-500/80 uppercase tracking-widest mt-0.5">Absent</p>
                </div>
              </div>
            )}

            {students.length === 0 ? (
              <div className="p-8 text-center bg-blue-500/5 rounded-xl border border-blue-500/10">
                <p className="text-xs font-bold text-foreground">Select a timetable slot and click "Load Roster" to display students</p>
              </div>
            ) : (
              <>
                {/* Bulk controls */}
                <div className="flex gap-2 items-center justify-between bg-blue-500/5 p-2.5 rounded-xl border border-blue-500/10">
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Bulk Actions:</span>
                  <div className="flex gap-2">
                    <button onClick={() => toggleAll(true)} className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/25 transition-all">All Present</button>
                    <button onClick={() => toggleAll(false)} className="px-3 py-1 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/25 transition-all">All Absent</button>
                  </div>
                </div>

                {/* Student list */}
                <div className="rounded-xl overflow-hidden border border-blue-500/10">
                  {students.map((student, i) => {
                    const isPresent = attendance[student.id] !== false
                    return (
                      <div key={student.id} className={`flex items-center justify-between px-4 py-3 transition-all ${i < students.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""} ${isPresent ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "bg-rose-500/5 hover:bg-rose-500/10"}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-extrabold text-blue-600 dark:text-blue-400 shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-foreground">{student.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{student.email}</p>
                          </div>
                        </div>
                        <button onClick={() => setAttendance(a => ({ ...a, [student.id]: !isPresent }))}
                          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 ${isPresent ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-rose-500 text-white shadow-md shadow-rose-500/20"}`}>
                          {isPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {isPresent ? "PRESENT" : "ABSENT"}
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-end pt-1">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "Saved Attendance!" : "Save Attendance Record"}
                  </button>
                </div>
              </>
            )}
          </div>
        )
      )}

      {/* STATS TAB */}
      {tab === "stats" && (
        <div className="flex flex-col gap-3">
          {stats.length === 0 ? (
            <div className="p-8 text-center bg-blue-500/5 rounded-xl border border-blue-500/10">
              <BarChart3 className="w-8 h-8 mx-auto text-blue-500/40 mb-2" />
              <p className="text-xs font-bold text-foreground">No attendance records stored yet</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-blue-500/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <th className="text-left px-4 py-2.5 font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">Student</th>
                    <th className="text-center px-4 py-2.5 font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">Attended</th>
                    <th className="text-center px-4 py-2.5 font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">Total</th>
                    <th className="text-center px-4 py-2.5 font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[9px]">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.sort((a, b) => b.percentage - a.percentage).map(stat => (
                    <tr key={stat.studentId} className="border-b border-black/5 dark:border-white/5 hover:bg-blue-500/5">
                      <td className="px-4 py-2.5 font-bold text-foreground">{stat.name}</td>
                      <td className="px-4 py-2.5 text-center font-extrabold text-emerald-500">{stat.present}</td>
                      <td className="px-4 py-2.5 text-center font-extrabold text-muted-foreground">{stat.total}</td>
                      <td className="px-4 py-2.5 text-center font-extrabold text-blue-600">{stat.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
