"use client"

import { useState, useEffect, useRef } from "react"
import { BookOpen, Upload, FileText, PlusCircle, Save, CheckCircle2, Loader2, ClipboardList, GraduationCap } from "lucide-react"

const EXAM_TYPES = ["CIA1", "CIA2", "MODEL", "PRACTICAL"]

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<"plans" | "marks" | "periodlog">("plans")

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 md:p-8 text-foreground">
      {/* Header Banner — Clean layout without hero card wrapper */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Academics & Lesson Plans</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">Manage subject course plans, student assessment marks, and daily session topic logs.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-black/10 dark:border-white/10 pb-3">
        {([
          { key: "plans", label: "Course Plans", icon: FileText },
          { key: "marks", label: "Internal Marks", icon: ClipboardList },
          { key: "periodlog", label: "Period Log", icon: BookOpen },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === key
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                : "neu-flat dark:bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "plans" && <CoursePlansTab />}
      {activeTab === "marks" && <InternalMarksTab />}
      {activeTab === "periodlog" && <PeriodLogTab />}
    </div>
  )
}

function CoursePlansTab() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: "", classGroup: "", semester: "1", academicYear: "2025-2026" })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/faculty/course-plans")
      .then(r => r.json()).then(data => { setPlans(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    const res = await fetch("/api/faculty/course-plans", { method: "POST", body: fd })
    const data = await res.json()
    if (res.ok) { setPlans(p => [data, ...p]); setShowForm(false); if (fileRef.current) fileRef.current.value = "" }
    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Uploaded Subject Course Plans
        </h2>
        <button 
          onClick={() => setShowForm(v => !v)} 
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
        >
          <Upload className="w-4 h-4" /> Upload Course Plan PDF
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleUpload} className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-2xl flex flex-col gap-4 border border-blue-500/20 shadow-xl">
          <h3 className="text-sm font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">New Course Plan Submission</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Subject" value={form.subject} onChange={v => setForm(f => ({ ...f, subject: v }))} placeholder="e.g. Data Structures & Algorithms" />
            <Field label="Class / Group" value={form.classGroup} onChange={v => setForm(f => ({ ...f, classGroup: v }))} placeholder="e.g. CSE-A" />
            <Field label="Semester" value={form.semester} onChange={v => setForm(f => ({ ...f, semester: v }))} placeholder="1" type="number" />
            <Field label="Academic Year" value={form.academicYear} onChange={v => setForm(f => ({ ...f, academicYear: v }))} placeholder="2025-2026" />
          </div>
          <div>
            <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 block">PDF Document</label>
            <input ref={fileRef} type="file" accept=".pdf" className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-600 hover:file:bg-blue-500/20 cursor-pointer border border-blue-500/20 rounded-xl p-1 bg-blue-500/5" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={uploading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold disabled:opacity-50 hover:scale-105 transition-all shadow-md shadow-blue-500/20">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl neu-flat dark:bg-white/5 text-xs font-bold">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : plans.length === 0 ? (
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-12 rounded-2xl text-center border border-blue-500/10">
          <FileText className="w-12 h-12 mx-auto text-blue-500/40 mb-3" />
          <p className="text-sm font-bold text-foreground">No course plans uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">Upload PDF course plans for your assigned subjects above.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan: any) => (
            <a key={plan.id} href={plan.fileUrl} target="_blank" rel="noopener noreferrer"
              className="neu-flat dark:bg-white/5 dark:border-white/10 p-5 rounded-2xl flex items-start gap-4 hover:scale-[1.02] transition-all group border border-blue-500/10 hover:border-blue-500/40 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{plan.fileName}</p>
                <span className="inline-block text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md mt-1">
                  {plan.subject} ({plan.classGroup})
                </span>
                <p className="text-[11px] text-muted-foreground font-medium mt-1">Sem {plan.semester} · {plan.academicYear}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(plan.uploadedAt).toLocaleDateString()}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function InternalMarksTab() {
  const [students, setStudents] = useState<any[]>([])
  const [marks, setMarks] = useState<Record<string, Record<string, number>>>({})
  const [filter, setFilter] = useState({ subject: "", classGroup: "", examType: "CIA1" })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!filter.subject || !filter.classGroup) return
    setLoading(true)
    Promise.all([
      fetch(`/api/faculty/marks?subject=${filter.subject}&classGroup=${filter.classGroup}`).then(r => r.json()),
      fetch("/api/faculty/all-students").then(r => r.json()).catch(() => []),
    ]).then(([marksData, studentsData]) => {
      if (Array.isArray(marksData)) {
        const m: Record<string, Record<string, number>> = {}
        marksData.forEach((mk: any) => {
          if (!m[mk.studentId]) m[mk.studentId] = {}
          m[mk.studentId][mk.examType] = mk.scoredMark
        })
        setMarks(m)
        const studsFromMarks = marksData
          .map((mk: any) => mk.student)
          .filter((s: any, i: number, arr: any[]) => arr && s && arr.findIndex(x => x?.id === s?.id) === i)
        if (studsFromMarks.length > 0) {
          setStudents(studsFromMarks)
        } else if (Array.isArray(studentsData) && studentsData.length > 0) {
          setStudents(studentsData)
        }
      } else if (Array.isArray(studentsData)) {
        setStudents(studentsData)
      }
      setLoading(false)
    })
  }, [filter.subject, filter.classGroup])

  const fetchStudents = async () => {
    if (!filter.classGroup) return
    setLoading(true)
    const res = await fetch("/api/faculty/all-students").catch(() => null)
    if (res?.ok) {
      const data = await res.json()
      setStudents(Array.isArray(data) ? data.slice(0, 40) : [])
    }
    setLoading(false)
  }

  const saveMark = async (studentId: string) => {
    const score = marks[studentId]?.[filter.examType]
    if (score === undefined || !filter.subject || !filter.classGroup) return
    await fetch("/api/faculty/marks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, subject: filter.subject, classGroup: filter.classGroup, examType: filter.examType, maxMark: 100, scoredMark: score }),
    })
  }

  const handleSaveAll = async () => {
    setSaving(true)
    await Promise.all(students.map(s => saveMark(s.id)))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-5 rounded-2xl flex flex-wrap gap-4 items-end border border-blue-500/10 shadow-lg">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Subject</label>
          <input value={filter.subject} onChange={e => setFilter(f => ({ ...f, subject: e.target.value }))}
            placeholder="e.g. Data Structures" className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
          <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Class Group</label>
          <input value={filter.classGroup} onChange={e => setFilter(f => ({ ...f, classGroup: e.target.value }))}
            placeholder="e.g. CSE-A" className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
          <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Exam Type</label>
          <select value={filter.examType} onChange={e => setFilter(f => ({ ...f, examType: e.target.value }))}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground">
            {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={fetchStudents} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:scale-105 transition-all shadow-md shadow-blue-500/20">
          Load Roster
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : students.length === 0 ? (
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-12 rounded-2xl text-center border border-blue-500/10">
          <ClipboardList className="w-12 h-12 mx-auto text-blue-500/40 mb-3" />
          <p className="text-sm font-bold text-foreground">Enter Subject & Class Group above to load students</p>
        </div>
      ) : (
        <>
          <div className="neu-flat dark:bg-white/5 dark:border-white/10 rounded-2xl overflow-hidden border border-blue-500/10 shadow-xl">
            <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 px-5 py-3 border-b border-blue-500/10 flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Mark Sheet — {filter.subject} ({filter.classGroup}) · {filter.examType}
              </span>
              <span className="text-xs font-bold text-muted-foreground">{students.length} Students</span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <th className="text-left px-5 py-3 font-extrabold text-muted-foreground uppercase tracking-widest text-[10px]">#</th>
                  <th className="text-left px-5 py-3 font-extrabold text-muted-foreground uppercase tracking-widest text-[10px]">Student Name</th>
                  <th className="text-center px-5 py-3 font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[10px]">{filter.examType} Score (/ 100)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s: any, i: number) => (
                  <tr key={s.id} className="border-b border-black/5 dark:border-white/5 hover:bg-blue-500/5 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground font-bold">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-foreground">{s.name}</p>
                      <p className="text-muted-foreground text-[10px]">{s.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <input
                        type="number" min={0} max={100}
                        value={marks[s.id]?.[filter.examType] ?? ""}
                        onChange={e => setMarks(m => ({ ...m, [s.id]: { ...m[s.id], [filter.examType]: Number(e.target.value) } }))}
                        className="w-24 text-center px-3 py-2 rounded-xl text-xs font-extrabold bg-blue-500/10 dark:bg-white/5 border border-blue-500/30 outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSaveAll} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved Marks!" : "Save All Marks"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function PeriodLogTab() {
  const [slots, setSlots] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [form, setForm] = useState({ slotId: "", date: new Date().toISOString().slice(0, 10), topicCovered: "", notes: "" })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/faculty/timetable").then(r => r.json()),
      fetch("/api/faculty/period-log").then(r => r.json()),
    ]).then(([slotsData, logsData]) => {
      setSlots(Array.isArray(slotsData) ? slotsData : [])
      setLogs(Array.isArray(logsData) ? logsData : [])
      if (Array.isArray(slotsData) && slotsData.length > 0) setForm(f => ({ ...f, slotId: slotsData[0].id }))
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.slotId || !form.topicCovered) return
    setSaving(true)
    const res = await fetch("/api/faculty/period-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      const slot = slots.find(s => s.id === data.slotId)
      setLogs(l => [{ ...data, slot }, ...l])
      setForm(f => ({ ...f, topicCovered: "", notes: "" }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri"]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-2xl flex flex-col gap-4 border border-blue-500/10 shadow-xl">
        <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          Log Session Topic
        </h2>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div> :
          slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground font-semibold">No timetable slots found. Please add a timetable slot in the Attendance module first.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 block">Select Period Slot</label>
                <select value={form.slotId} onChange={e => setForm(f => ({ ...f, slotId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground">
                  {slots.map(s => (
                    <option key={s.id} value={s.id}>{DAYS[s.dayOfWeek]} P{s.periodNo} — {s.subject} ({s.classGroup}) {s.startTime}–{s.endTime}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 block">Session Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 block">Topic Covered *</label>
                <input value={form.topicCovered} onChange={e => setForm(f => ({ ...f, topicCovered: e.target.value }))} required
                  placeholder="e.g. Binary Search Trees - Insertion & Balancing"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 block">Notes & Homework (optional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                  placeholder="Class activity summary or assigned homework..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground resize-none" />
              </div>
              <button type="submit" disabled={saving || !form.topicCovered}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                {saved ? "Logged Session!" : "Submit Topic Log"}
              </button>
            </form>
          )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Recent Syllabus Logs
        </h2>
        {logs.length === 0 ? (
          <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-10 rounded-2xl text-center border border-blue-500/10">
            <BookOpen className="w-10 h-10 mx-auto text-blue-500/40 mb-2" />
            <p className="text-xs text-muted-foreground font-semibold">No topic logs recorded yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[540px] overflow-y-auto pr-1 no-scrollbar">
            {logs.map((log: any) => (
              <div key={log.id} className="neu-flat dark:bg-white/5 dark:border-white/10 p-4 rounded-2xl border border-blue-500/10 hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-extrabold text-foreground">{log.topicCovered}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                        {log.slot ? `${DAYS[log.slot.dayOfWeek]} P${log.slot.periodNo} · ${log.slot.subject} (${log.slot.classGroup})` : "—"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">{log.date}</span>
                    </div>
                    {log.notes && <p className="text-[11px] text-muted-foreground mt-2 bg-black/5 dark:bg-white/5 p-2 rounded-xl">{log.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/5 dark:bg-white/5 border border-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
    </div>
  )
}
