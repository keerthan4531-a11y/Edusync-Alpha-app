"use client"

import { useState, useEffect } from "react"
import {
  Calendar, Plus, Edit2, Trash2, Upload, Download,
  Loader2, CheckCircle2, X, RefreshCw, GraduationCap,
  Clock, MapPin, Grid3X3, FileSpreadsheet, User
} from "lucide-react"

interface SlotItem {
  id: string
  facultyId: string
  faculty?: { name: string; email: string }
  dayOfWeek: number
  periodNo: number
  subject: string
  classGroup: string
  room: string
  startTime: string
  endTime: string
}

interface FacultyOption {
  id: string
  name: string
  email: string
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export default function AdminTimetablesPage() {
  const [slots, setSlots] = useState<SlotItem[]>([])
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedFaculty, setSelectedFaculty] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<string>("")

  // Add/Edit Modal
  const [showModal, setShowModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState<SlotItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    facultyId: "",
    dayOfWeek: 1,
    periodNo: 1,
    subject: "",
    classGroup: "",
    room: "",
    startTime: "09:00",
    endTime: "09:50",
  })

  // Bulk Upload Modal
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null)

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (selectedFaculty) query.set("facultyId", selectedFaculty)
      if (selectedDay) query.set("day", selectedDay)
      const res = await fetch(`/api/admin/timetables?${query.toString()}`)
      const data = await res.json()
      setSlots(Array.isArray(data) ? data : [])
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFaculty = async () => {
    try {
      const res = await fetch("/api/admin/users?role=FACULTY&limit=100")
      const data = await res.json()
      setFacultyList(data.users || [])
    } catch {
      setFacultyList([])
    }
  }

  useEffect(() => {
    fetchFaculty()
    fetchSlots()
  }, [selectedFaculty, selectedDay])

  const openAddModal = () => {
    setEditingSlot(null)
    setForm({
      facultyId: facultyList[0]?.id || "",
      dayOfWeek: 1,
      periodNo: 1,
      subject: "",
      classGroup: "CSE-A",
      room: "Room 301",
      startTime: "09:00",
      endTime: "09:50",
    })
    setShowModal(true)
  }

  const openEditModal = (slot: SlotItem) => {
    setEditingSlot(slot)
    setForm({
      facultyId: slot.facultyId,
      dayOfWeek: slot.dayOfWeek,
      periodNo: slot.periodNo,
      subject: slot.subject,
      classGroup: slot.classGroup,
      room: slot.room,
      startTime: slot.startTime,
      endTime: slot.endTime,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.facultyId || !form.subject || !form.classGroup) return
    setSaving(true)
    try {
      if (editingSlot) {
        await fetch("/api/admin/timetables", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSlot.id, ...form }),
        })
      } else {
        await fetch("/api/admin/timetables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      }
      await fetchSlots()
      setShowModal(false)
    } catch (e) {
      console.error("Save timetable error:", e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this timetable slot?")) return
    try {
      await fetch(`/api/admin/timetables?id=${id}`, { method: "DELETE" })
      await fetchSlots()
    } catch (e) {
      console.error("Delete timetable error:", e)
    }
  }

  const handleBulkImport = async () => {
    if (!csvText.trim()) return
    setImporting(true)
    setImportResult(null)

    try {
      const lines = csvText.trim().split("\n")
      const parsedSlots = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || (i === 0 && line.toLowerCase().includes("facultyemail"))) continue
        const parts = line.split(",").map(p => p.trim())
        if (parts.length >= 5) {
          const [facultyEmail, dayOfWeek, periodNo, subject, classGroup, room = "", startTime = "09:00", endTime = "09:50"] = parts
          parsedSlots.push({
            facultyEmail,
            dayOfWeek: Number(dayOfWeek),
            periodNo: Number(periodNo),
            subject,
            classGroup,
            room,
            startTime,
            endTime,
          })
        }
      }

      const res = await fetch("/api/admin/timetables/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: parsedSlots }),
      })
      const data = await res.json()
      setImportResult(data)
      await fetchSlots()
    } catch {
      setImportResult({ created: 0, errors: ["Failed to process CSV file"] })
    } finally {
      setImporting(false)
    }
  }

  const downloadCsvTemplate = () => {
    const template = "facultyEmail,dayOfWeek,periodNo,subject,classGroup,room,startTime,endTime\nfaculty@example.com,1,1,Data Structures,CSE-A,Room 301,09:00,09:50\nfaculty@example.com,1,2,Web Dev,CSE-B,Lab 2,09:50,10:40\n"
    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "timetable_import_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2.5rem] border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Grid3X3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Master Timetable Management</h1>
            <p className="text-xs text-muted-foreground font-medium">Assign, edit, and bulk-upload faculty timetable schedules</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchSlots} disabled={loading} className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground hover:text-white transition-all flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => { setShowBulkModal(true); setCsvText(""); setImportResult(null) }} className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Bulk CSV Upload
          </button>
          <button onClick={openAddModal} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-col gap-1 flex-1 sm:w-64">
            <label className="text-[10px] font-black text-indigo-400 uppercase">Filter by Faculty</label>
            <select
              value={selectedFaculty}
              onChange={e => setSelectedFaculty(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
            >
              <option value="" className="bg-[#0d1222]">All Faculty Members</option>
              {facultyList.map(f => (
                <option key={f.id} value={f.id} className="bg-[#0d1222]">{f.name} ({f.email})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 sm:w-48">
            <label className="text-[10px] font-black text-indigo-400 uppercase">Filter by Day</label>
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
            >
              <option value="" className="bg-[#0d1222]">All Days</option>
              {DAYS.map((d, i) => (
                <option key={i} value={i + 1} className="bg-[#0d1222]">{d}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-muted-foreground">{slots.length} Total Slots Configured</span>
      </div>

      {/* Slots Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : slots.length === 0 ? (
        <div className="neu-flat dark:bg-white/5 p-12 rounded-[2rem] text-center border border-white/5">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-bold text-white mb-1">No timetable slots found</p>
          <p className="text-xs text-muted-foreground mb-4 font-medium">Use "Add Slot" or "Bulk CSV Upload" to configure faculty teaching schedules.</p>
          <button onClick={openAddModal} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black">
            Add First Slot
          </button>
        </div>
      ) : (
        <div className="neu-flat dark:bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                  <th className="px-5 py-4">Day & Period</th>
                  <th className="px-5 py-4">Faculty</th>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4">Class Group</th>
                  <th className="px-5 py-4">Room & Time</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {slots.map(slot => (
                  <tr key={slot.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-white">
                        {DAYS[slot.dayOfWeek - 1] || `Day ${slot.dayOfWeek}`}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-bold">Period {slot.periodNo}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-white">
                      {slot.faculty?.name || "Unknown Faculty"}
                      <p className="text-[10px] text-muted-foreground font-medium">{slot.faculty?.email}</p>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-indigo-300">
                      {slot.subject}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black">
                        {slot.classGroup}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-medium">
                      <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" /> {slot.room || "TBD"}</p>
                      <p className="flex items-center gap-1 text-[10px] mt-0.5"><Clock className="w-3 h-3 text-indigo-400" /> {slot.startTime} – {slot.endTime}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditModal(slot)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(slot.id)} className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md neu-flat dark:bg-[#0d1222] rounded-[2.5rem] border border-indigo-500/20 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                {editingSlot ? <Edit2 className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-indigo-400" />}
                {editingSlot ? "Edit Timetable Slot" : "Add Timetable Slot"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase">Assigned Faculty</label>
                <select value={form.facultyId} onChange={e => setForm(f => ({ ...f, facultyId: e.target.value }))}
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500">
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id} className="bg-[#0d1222]">{f.name} ({f.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase">Day</label>
                <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500">
                  {DAYS.map((d, i) => <option key={i} value={i + 1} className="bg-[#0d1222]">{d}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase">Period (1-8)</label>
                <input type="number" min={1} max={8} value={form.periodNo} onChange={e => setForm(f => ({ ...f, periodNo: Number(e.target.value) }))}
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase">Subject Name</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Data Structures"
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase">Class Group</label>
                <input value={form.classGroup} onChange={e => setForm(f => ({ ...f, classGroup: e.target.value }))} placeholder="CSE-A"
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase">Room / Venue</label>
                <input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} placeholder="Room 301"
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase">Start Time</label>
                <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase">End Time</label>
                <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {editingSlot ? "Update Slot" : "Add Timetable Slot"}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl bg-white/5 text-xs font-bold text-muted-foreground hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK CSV UPLOAD MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl neu-flat dark:bg-[#0d1222] rounded-[2.5rem] border border-indigo-500/20 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                Bulk Timetable CSV Upload
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-muted-foreground hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Paste CSV rows (or download sample format):</span>
                <button onClick={downloadCsvTemplate} className="text-purple-400 font-extrabold hover:underline flex items-center gap-1 text-[11px]">
                  <Download className="w-3 h-3" /> Download Template
                </button>
              </div>

              <textarea
                rows={7}
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder={`facultyEmail,dayOfWeek,periodNo,subject,classGroup,room,startTime,endTime\nfaculty@example.com,1,1,Data Structures,CSE-A,Room 301,09:00,09:50`}
                className="w-full p-3 rounded-xl text-xs font-mono bg-white/5 border border-white/10 text-white outline-none focus:border-purple-400"
              />

              {importResult && (
                <div className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${importResult.created > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                  <p className="font-bold">Successfully imported {importResult.created} slots!</p>
                  {importResult.errors.length > 0 && (
                    <ul className="text-[10px] list-disc list-inside">
                      {importResult.errors.map((err, idx) => <li key={idx}>{err}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button onClick={handleBulkImport} disabled={importing || !csvText.trim()} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload and Import Timetable
              </button>
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2.5 rounded-xl bg-white/5 text-xs font-bold text-muted-foreground hover:text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
