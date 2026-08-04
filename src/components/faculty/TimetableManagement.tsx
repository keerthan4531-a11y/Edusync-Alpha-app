"use client"

import { useState, useEffect } from "react"
import {
  Calendar, Clock, MapPin, BookOpen, Plus, Edit2, Trash2,
  Loader2, CheckCircle2, X, RefreshCw, GraduationCap, Coffee,
  Download, Grid3X3
} from "lucide-react"

// ─── Period Configuration (Campus Nexus-inspired) ───────────
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"]

interface PeriodInfo {
  periodNo: number
  label: string
  startTime: string
  endTime: string
  type: "teaching" | "break"
}

const PERIODS: PeriodInfo[] = [
  { periodNo: 1, label: "Period 1", startTime: "09:00", endTime: "09:50", type: "teaching" },
  { periodNo: 2, label: "Period 2", startTime: "09:50", endTime: "10:40", type: "teaching" },
  { periodNo: 3, label: "Break",    startTime: "10:40", endTime: "11:00", type: "break" },
  { periodNo: 4, label: "Period 3", startTime: "11:00", endTime: "11:50", type: "teaching" },
  { periodNo: 5, label: "Period 4", startTime: "11:50", endTime: "12:40", type: "teaching" },
  { periodNo: 6, label: "Lunch",    startTime: "12:40", endTime: "13:30", type: "break" },
  { periodNo: 7, label: "Period 5", startTime: "13:30", endTime: "14:20", type: "teaching" },
  { periodNo: 8, label: "Period 6", startTime: "14:20", endTime: "15:10", type: "teaching" },
  { periodNo: 9, label: "Break",    startTime: "15:10", endTime: "15:20", type: "break" },
  { periodNo: 10, label: "Period 7", startTime: "15:20", endTime: "16:10", type: "teaching" },
]

// Session type color system (from Campus Nexus)
const SESSION_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  theory:   { bg: "bg-blue-500/10",   border: "border-l-4 border-blue-500",   text: "text-blue-600 dark:text-blue-400",   label: "Lecture" },
  lab:      { bg: "bg-emerald-500/10", border: "border-l-4 border-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Lab" },
  tutorial: { bg: "bg-cyan-500/10",    border: "border-l-4 border-cyan-500",    text: "text-cyan-600 dark:text-cyan-400",    label: "Tutorial" },
  project:  { bg: "bg-purple-500/10",  border: "border-l-4 border-purple-500",  text: "text-purple-600 dark:text-purple-400",  label: "Project" },
  activity: { bg: "bg-amber-500/10",   border: "border-l-4 border-amber-500",   text: "text-amber-600 dark:text-amber-400",   label: "Activity" },
}

interface TimetableSlot {
  id: string
  dayOfWeek: number
  periodNo: number
  subject: string
  classGroup: string
  room: string
  startTime: string
  endTime: string
  sessionType?: string
}

interface SlotFormData {
  dayOfWeek: number
  periodNo: number
  subject: string
  classGroup: string
  room: string
  startTime: string
  endTime: string
  sessionType: string
}

const EMPTY_FORM: SlotFormData = {
  dayOfWeek: 1,
  periodNo: 1,
  subject: "",
  classGroup: "",
  room: "",
  startTime: "09:00",
  endTime: "09:50",
  sessionType: "theory",
}

export function TimetableManagement() {
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null)
  const [form, setForm] = useState<SlotFormData>(EMPTY_FORM)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch timetable slots
  const fetchSlots = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/faculty/timetable")
      const data = await res.json()
      setSlots(Array.isArray(data) ? data : [])
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSlots() }, [])

  // Get slot for a specific day + period
  const getSlot = (dayOfWeek: number, periodNo: number): TimetableSlot | undefined => {
    return slots.find(s => s.dayOfWeek === dayOfWeek && s.periodNo === periodNo)
  }

  // Open Add modal
  const openAddModal = (dayOfWeek?: number, periodNo?: number) => {
    const period = periodNo ? PERIODS.find(p => p.periodNo === periodNo) : PERIODS[0]
    setEditingSlot(null)
    setForm({
      ...EMPTY_FORM,
      dayOfWeek: dayOfWeek || 1,
      periodNo: periodNo || 1,
      startTime: period?.startTime || "09:00",
      endTime: period?.endTime || "09:50",
    })
    setShowModal(true)
  }

  // Open Edit modal
  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot)
    setForm({
      dayOfWeek: slot.dayOfWeek,
      periodNo: slot.periodNo,
      subject: slot.subject,
      classGroup: slot.classGroup,
      room: slot.room,
      startTime: slot.startTime,
      endTime: slot.endTime,
      sessionType: slot.sessionType || "theory",
    })
    setShowModal(true)
  }

  // Save slot (create or update)
  const handleSave = async () => {
    if (!form.subject || !form.classGroup) return
    setSaving(true)
    try {
      if (editingSlot) {
        // Update
        await fetch("/api/faculty/timetable", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSlot.id, ...form }),
        })
      } else {
        // Create
        await fetch("/api/faculty/timetable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      }
      await fetchSlots()
      setShowModal(false)
    } catch (e) {
      console.error("Save slot error:", e)
    } finally {
      setSaving(false)
    }
  }

  // Delete slot (soft delete)
  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/faculty/timetable?id=${id}`, { method: "DELETE" })
      await fetchSlots()
    } catch (e) {
      console.error("Delete slot error:", e)
    } finally {
      setDeletingId(null)
    }
  }

  // Export timetable as text
  const handleExport = () => {
    let text = "FACULTY TIMETABLE\n" + "=".repeat(60) + "\n\n"
    DAYS.forEach((day, di) => {
      const dayIdx = di + 1
      const daySlots = slots.filter(s => s.dayOfWeek === dayIdx).sort((a, b) => a.periodNo - b.periodNo)
      text += `${day}:\n`
      if (daySlots.length === 0) {
        text += "  No classes scheduled\n"
      } else {
        daySlots.forEach(s => {
          text += `  P${s.periodNo} (${s.startTime}-${s.endTime}) | ${s.subject} | ${s.classGroup} | Room: ${s.room || "TBD"}\n`
        })
      }
      text += "\n"
    })
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "faculty_timetable.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Unique subjects and class groups for summary
  const uniqueSubjects = [...new Set(slots.map(s => s.subject))]
  const uniqueClassGroups = [...new Set(slots.map(s => s.classGroup))]
  const totalTeachingSlots = slots.length

  return (
    <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2rem] border border-indigo-500/20 shadow-xl flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Timetable Management</h2>
            <p className="text-xs text-muted-foreground font-medium">View and manage your weekly teaching schedule</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchSlots} disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold neu-flat dark:bg-white/5 text-muted-foreground hover:text-foreground transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={handleExport} disabled={slots.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold neu-flat dark:bg-white/5 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-extrabold hover:scale-105 transition-all shadow-md shadow-indigo-500/20">
            <Plus className="w-3.5 h-3.5" /> Add Slot
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {slots.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-indigo-500/5 dark:bg-white/5 p-3 rounded-xl text-center border border-indigo-500/10">
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{totalTeachingSlots}</p>
            <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mt-0.5">Total Slots</p>
          </div>
          <div className="bg-blue-500/5 dark:bg-white/5 p-3 rounded-xl text-center border border-blue-500/10">
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{uniqueSubjects.length}</p>
            <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mt-0.5">Subjects</p>
          </div>
          <div className="bg-emerald-500/5 dark:bg-white/5 p-3 rounded-xl text-center border border-emerald-500/10">
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{uniqueClassGroups.length}</p>
            <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mt-0.5">Class Groups</p>
          </div>
        </div>
      )}

      {/* Session Type Legend */}
      <div className="flex flex-wrap gap-2 items-center text-[10px] font-bold">
        <span className="text-muted-foreground uppercase tracking-wider">Legend:</span>
        {Object.entries(SESSION_COLORS).map(([key, val]) => (
          <span key={key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${val.bg} ${val.text} border border-current/10`}>
            <span className={`w-2 h-2 rounded-full bg-current`} />
            {val.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10">
          <Coffee className="w-3 h-3" /> Break
        </span>
      </div>

      {/* ============= TIMETABLE GRID ============= */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-indigo-500/10 shadow-inner">
          <table className="w-full text-xs min-w-[700px]">
            {/* Header: Days */}
            <thead>
              <tr className="bg-indigo-500/5 dark:bg-white/5">
                <th className="px-3 py-3 text-left text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider sticky left-0 bg-indigo-500/5 dark:bg-[#0d121f] z-10 w-32 border-r border-indigo-500/10">
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Period / Time</div>
                </th>
                {DAYS.map((day, i) => (
                  <th key={day} className="px-3 py-3 text-center text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider min-w-[120px]">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{DAY_SHORT[i]}</span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body: Period Rows */}
            <tbody>
              {PERIODS.map((period) => {
                const isBreak = period.type === "break"
                return (
                  <tr key={period.periodNo} className={`transition-colors ${isBreak ? "bg-amber-500/5 dark:bg-amber-900/10" : "hover:bg-indigo-500/5 dark:hover:bg-white/5"}`}>
                    {/* Period Label Cell */}
                    <td className={`px-3 py-2 sticky left-0 z-10 border-r border-indigo-500/10 ${isBreak ? "bg-amber-500/5 dark:bg-amber-900/10" : "bg-white dark:bg-[#0d121f]"}`}>
                      <div className="flex flex-col">
                        <span className={`font-extrabold ${isBreak ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                          {isBreak && <Coffee className="w-3 h-3 inline mr-1" />}
                          {period.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">{period.startTime} – {period.endTime}</span>
                      </div>
                    </td>

                    {/* Day Cells */}
                    {DAYS.map((_, dayIdx) => {
                      const dayOfWeek = dayIdx + 1
                      if (isBreak) {
                        return (
                          <td key={dayOfWeek} className="px-2 py-2 text-center">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-500/60">
                              <Coffee className="w-3 h-3" />
                              <span>{period.label}</span>
                            </div>
                          </td>
                        )
                      }

                      const slot = getSlot(dayOfWeek, period.periodNo)
                      if (slot) {
                        const sessionType = slot.sessionType || "theory"
                        const colors = SESSION_COLORS[sessionType] || SESSION_COLORS.theory
                        return (
                          <td key={dayOfWeek} className="px-1.5 py-1.5">
                            <div className={`group relative p-2.5 rounded-xl ${colors.bg} ${colors.border} transition-all hover:scale-[1.02] cursor-pointer min-h-[70px] flex flex-col justify-between`}>
                              {/* Slot Content */}
                              <div>
                                <p className={`font-extrabold text-[11px] ${colors.text} leading-tight`}>{slot.subject}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3 shrink-0" /> {slot.classGroup}
                                </p>
                              </div>
                              {slot.room && (
                                <p className="text-[9px] text-muted-foreground font-medium mt-1 flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" /> {slot.room}
                                </p>
                              )}

                              {/* Hover Action Buttons */}
                              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); openEditModal(slot) }}
                                  className="w-5 h-5 rounded-md bg-white/80 dark:bg-black/60 flex items-center justify-center text-indigo-500 hover:text-indigo-700 transition-colors shadow-sm">
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(slot.id) }}
                                  disabled={deletingId === slot.id}
                                  className="w-5 h-5 rounded-md bg-white/80 dark:bg-black/60 flex items-center justify-center text-rose-500 hover:text-rose-700 transition-colors shadow-sm disabled:opacity-50">
                                  {deletingId === slot.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          </td>
                        )
                      }

                      // Empty Cell — Click to Add
                      return (
                        <td key={dayOfWeek} className="px-1.5 py-1.5">
                          <button
                            onClick={() => openAddModal(dayOfWeek, period.periodNo)}
                            className="w-full min-h-[70px] rounded-xl border-2 border-dashed border-indigo-500/10 dark:border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all flex items-center justify-center group"
                          >
                            <Plus className="w-4 h-4 text-indigo-500/30 group-hover:text-indigo-500/60 transition-colors" />
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Subject Summary Badges */}
      {slots.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center pt-2">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Subjects Taught:</span>
          {uniqueSubjects.map(sub => (
            <span key={sub} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold border border-indigo-500/20">
              {sub}
            </span>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && slots.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto text-indigo-500/30 mb-3" />
          <p className="text-sm font-bold text-foreground mb-1">No timetable slots configured yet</p>
          <p className="text-xs text-muted-foreground mb-4 font-medium">Click "Add Slot" or click any empty cell in the grid above to add your first teaching period.</p>
          <button onClick={() => openAddModal()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 hover:scale-105 transition-all">
            <Plus className="w-4 h-4 inline mr-1.5" /> Add Your First Slot
          </button>
        </div>
      )}

      {/* ============= ADD / EDIT SLOT MODAL ============= */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-lg neu-flat dark:bg-[#0d121f] rounded-3xl border border-indigo-500/20 shadow-2xl p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-500/10">
              <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                {editingSlot ? <Edit2 className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-indigo-500" />}
                {editingSlot ? "Edit Timetable Slot" : "Add New Timetable Slot"}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Day</label>
                <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/20 outline-none focus:ring-2 focus:ring-indigo-500 text-foreground">
                  {DAYS.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Period</label>
                <select value={form.periodNo} onChange={e => {
                  const pNo = Number(e.target.value)
                  const p = PERIODS.find(p => p.periodNo === pNo)
                  setForm(f => ({ ...f, periodNo: pNo, startTime: p?.startTime || f.startTime, endTime: p?.endTime || f.endTime }))
                }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/20 outline-none focus:ring-2 focus:ring-indigo-500 text-foreground">
                  {PERIODS.filter(p => p.type === "teaching").map(p => (
                    <option key={p.periodNo} value={p.periodNo}>{p.label} ({p.startTime}–{p.endTime})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Subject Name</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Data Structures, Web Development"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/20 outline-none focus:ring-2 focus:ring-indigo-500 text-foreground" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Class Group</label>
                <input value={form.classGroup} onChange={e => setForm(f => ({ ...f, classGroup: e.target.value }))}
                  placeholder="e.g. CSE-A, IT-B"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/20 outline-none focus:ring-2 focus:ring-indigo-500 text-foreground" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Room / Venue</label>
                <input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                  placeholder="e.g. Room 301, Lab 2"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/20 outline-none focus:ring-2 focus:ring-indigo-500 text-foreground" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Session Type</label>
                <select value={form.sessionType} onChange={e => setForm(f => ({ ...f, sessionType: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/20 outline-none focus:ring-2 focus:ring-indigo-500 text-foreground">
                  <option value="theory">Lecture / Theory</option>
                  <option value="lab">Lab / Practical</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="project">Project</option>
                  <option value="activity">Activity</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Time Override</label>
                <div className="flex items-center gap-2">
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="flex-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/20 outline-none focus:ring-2 focus:ring-indigo-500 text-foreground" />
                  <span className="text-muted-foreground text-xs font-bold">to</span>
                  <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="flex-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/20 outline-none focus:ring-2 focus:ring-indigo-500 text-foreground" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-indigo-500/10">
              <button onClick={handleSave} disabled={saving || !form.subject || !form.classGroup}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-extrabold hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {editingSlot ? "Update Slot" : "Add Slot to Timetable"}
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-5 py-3 rounded-xl neu-flat dark:bg-white/5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
