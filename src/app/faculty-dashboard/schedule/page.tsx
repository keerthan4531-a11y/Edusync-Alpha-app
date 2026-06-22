"use client"

import { useState, useEffect, useRef } from "react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Button } from "@/components/ui/button"
import { 
  Calendar, Clock, MapPin, Plus, FileText, FileSpreadsheet, X, Check, ChevronLeft, ChevronRight, Video, Landmark
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ScheduleItem {
  id: string
  classroomId: string
  classroomName: string
  subject: string
  date: string // YYYY-MM-DD
  dayOfWeek: string // e.g. Monday, Wednesday
  startTime: string // e.g. "10:00"
  endTime: string // e.g. "11:30"
  locationType: "ROOM" | "ZOOM"
  locationDetail: string // e.g. "Lab 402" or zoom url
  description: string
  repeat: "none" | "daily" | "weekly"
}

export default function SchedulePage() {
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [filterType, setFilterType] = useState<"week" | "today" | "upcoming">("week")
  
  // Date tracking for week navigation
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekRangeText, setWeekRangeText] = useState("")

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  
  // Add Schedule Forms
  const [selClassId, setSelClassId] = useState("")
  const [schSubject, setSchSubject] = useState("")
  const [schDate, setSchDate] = useState(new Date().toISOString().split("T")[0])
  const [schStartTime, setSchStartTime] = useState("09:00")
  const [schEndTime, setSchEndTime] = useState("10:30")
  const [schLocType, setSchLocType] = useState<"ROOM" | "ZOOM">("ROOM")
  const [schLocDetail, setSchLocDetail] = useState("Lab Room 402")
  const [schDesc, setSchDesc] = useState("")
  const [schRepeat, setSchRepeat] = useState<"none" | "daily" | "weekly">("none")

  // Timetable CSV file upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  // Load classrooms and saved schedules
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/faculty/classrooms")
        if (res.ok) {
          const data = await res.json()
          setClassrooms(data.classrooms || [])
        }

        const savedSch = localStorage.getItem("faculty_schedules")
        if (savedSch) {
          setSchedules(JSON.parse(savedSch))
        } else {
          // Initialize mock schedules
          const mockSch: ScheduleItem[] = [
            {
              id: "sch-1",
              classroomId: "mock-class-1",
              classroomName: "Advanced Software Engineering",
              subject: "Prisma & SQL Relations",
              date: new Date().toISOString().split("T")[0], // Today
              dayOfWeek: getDayName(new Date()),
              startTime: "10:00",
              endTime: "11:30",
              locationType: "ROOM",
              locationDetail: "Lab Room 402",
              description: "Practical lab covering database modeling.",
              repeat: "weekly"
            },
            {
              id: "sch-2",
              classroomId: "mock-class-1",
              classroomName: "Advanced Software Engineering",
              subject: "React Performance Tuning",
              date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
              dayOfWeek: getDayName(new Date(Date.now() + 86400000)),
              startTime: "14:00",
              endTime: "15:30",
              locationType: "ZOOM",
              locationDetail: "https://zoom.us/j/edusync-meeting-url",
              description: "Virtual session covering profiling components.",
              repeat: "weekly"
            }
          ]
          setSchedules(mockSch)
          localStorage.setItem("faculty_schedules", JSON.stringify(mockSch))
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [])

  // Calculate week range text
  useEffect(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    startOfWeek.setDate(diff)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
    const startText = startOfWeek.toLocaleDateString("en-US", options)
    const endText = endOfWeek.toLocaleDateString("en-US", options)
    const year = endOfWeek.getFullYear()
    
    setWeekRangeText(`${startText} - ${endText}, ${year}`)
  }, [currentDate])

  const getDayName = (date: Date): string => {
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  const handlePrevWeek = () => {
    const prev = new Date(currentDate)
    prev.setDate(currentDate.getDate() - 7)
    setCurrentDate(prev)
  }

  const handleNextWeek = () => {
    const next = new Date(currentDate)
    next.setDate(currentDate.getDate() + 7)
    setCurrentDate(next)
  }

  // Create Schedule
  const handleSaveSchedule = () => {
    if (!selClassId || !schSubject.trim()) return

    const targetClass = classrooms.find((c) => c.id === selClassId)
    const dateObj = new Date(schDate)
    const dayName = getDayName(dateObj)

    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      classroomId: selClassId,
      classroomName: targetClass ? targetClass.name : "Custom Subject",
      subject: schSubject,
      date: schDate,
      dayOfWeek: dayName,
      startTime: schStartTime,
      endTime: schEndTime,
      locationType: schLocType,
      locationDetail: schLocDetail,
      description: schDesc,
      repeat: schRepeat,
    }

    const updated = [...schedules, newItem]
    setSchedules(updated)
    localStorage.setItem("faculty_schedules", JSON.stringify(updated))
    
    setIsAddModalOpen(false)
    setSchSubject("")
    setSchDesc("")
    alert("Class schedule saved successfully!")
  }

  // Delete Schedule
  const handleDeleteSchedule = (id: string) => {
    if (!confirm("Are you sure you want to cancel this class schedule?")) return
    const updated = schedules.filter((s) => s.id !== id)
    setSchedules(updated)
    localStorage.setItem("faculty_schedules", JSON.stringify(updated))
  }

  // Drag & drop file handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseCSVTimetable(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseCSVTimetable(e.target.files[0])
    }
  }

  // Parse CSV File for Timetable import
  const parseCSVTimetable = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return

      try {
        const rows = text.split("\n").map((row) => row.split(","))
        // Expect headers: Classroom,Subject,Date,StartTime,EndTime,Type,Location
        const importedItems: ScheduleItem[] = []
        
        // Skip header row (index 0)
        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i]
          if (cols.length < 5 || !cols[1]?.trim()) continue
          
          const rawDate = cols[2]?.trim() || new Date().toISOString().split("T")[0]
          const dayName = getDayName(new Date(rawDate))

          importedItems.push({
            id: `csv-${Date.now()}-${i}`,
            classroomId: "csv-imported",
            classroomName: cols[0]?.trim() || "Advanced Lectures",
            subject: cols[1]?.trim(),
            date: rawDate,
            dayOfWeek: dayName,
            startTime: cols[3]?.trim() || "09:00",
            endTime: cols[4]?.trim() || "10:30",
            locationType: (cols[5]?.trim()?.toUpperCase() === "ZOOM" ? "ZOOM" : "ROOM"),
            locationDetail: cols[6]?.trim() || "Room 101",
            description: cols[7]?.trim() || "Imported via Timetable file.",
            repeat: "none",
          })
        }

        if (importedItems.length > 0) {
          const updated = [...schedules, ...importedItems]
          setSchedules(updated)
          localStorage.setItem("faculty_schedules", JSON.stringify(updated))
          setIsImportModalOpen(false)
          alert(`Successfully imported ${importedItems.length} class schedules from CSV!`)
        } else {
          alert("No valid rows found in the uploaded file.")
        }
      } catch (err) {
        console.error(err)
        alert("Failed to parse CSV file. Ensure it is formatted correctly.")
      }
    }
    reader.readAsText(file)
  }

  // Filter Schedule Items
  const startOfWeek = new Date(currentDate)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const filteredItems = schedules.filter((s) => {
    const itemDate = new Date(s.date)
    
    if (filterType === "today") {
      const todayStr = new Date().toISOString().split("T")[0]
      return s.date === todayStr
    }
    
    if (filterType === "upcoming") {
      const now = new Date()
      now.setHours(0,0,0,0)
      return itemDate >= now
    }

    // Default "week" filter
    return itemDate >= startOfWeek && itemDate <= endOfWeek
  }).sort((a,b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))

  // Group items by Day of the Week
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const groupedSchedules = daysOfWeek.map((day) => {
    return {
      day,
      classes: filteredItems.filter((s) => s.dayOfWeek === day),
    }
  })

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 flex flex-col gap-8">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[var(--glass-border-subtle)] pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            My Schedule & Planner
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Coordinate weekly schedules, plan virtual calls, and upload spreadsheet timetables.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-foreground bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Import Timetable
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-xs shadow-lg cursor-pointer border border-primary/20 hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-4 h-4" /> Add Schedule
          </button>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex justify-between items-center bg-slate-950/20 p-4 rounded-2xl border border-white/5 flex-wrap gap-4">
        {/* Navigation Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-foreground transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs md:text-sm font-bold text-foreground px-2">
            {weekRangeText}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-foreground transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter triggers */}
        <div className="flex gap-1.5 bg-slate-950/30 p-1 rounded-xl border border-white/5 text-xs">
          {[
            { id: "week", label: "Weekly View" },
            { id: "today", label: "Today" },
            { id: "upcoming", label: "Upcoming" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={cn(
                "px-3 py-1.5 font-semibold rounded-lg cursor-pointer transition-all",
                filterType === f.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Schedule Days list */}
      <div className="flex flex-col gap-6">
        {groupedSchedules.every((g) => g.classes.length === 0) ? (
          <div className="glass-panel border border-[var(--glass-border)] rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-4">
            <div className="glass-noise" />
            <div className="p-4 bg-white/5 rounded-full border border-white/10 text-muted-foreground">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No classes scheduled</h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              There are no classes scheduled for this period. Click Add Schedule or import a timetable sheet.
            </p>
          </div>
        ) : (
          groupedSchedules.map((dayGroup) => {
            if (dayGroup.classes.length === 0 && filterType === "week") return null
            if (dayGroup.classes.length === 0) return null

            return (
              <div key={dayGroup.day} className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-6 last:border-0">
                {/* Day Header */}
                <div className="md:w-32 shrink-0">
                  <span className="inline-block text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_8px_rgba(99,102,241,0.15)]">
                    {dayGroup.day}
                  </span>
                </div>

                {/* Day Classes list */}
                <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {dayGroup.classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="glass-panel border border-white/5 bg-slate-900/10 rounded-2xl p-4 flex flex-col justify-between min-h-[140px] hover:border-white/10 transition-all relative overflow-hidden group"
                    >
                      <div className="glass-noise animate-pulse opacity-5" />
                      <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-extrabold text-[10px] text-emerald-400 uppercase tracking-wide truncate max-w-[80%]">
                            {cls.classroomName}
                          </span>
                          <button
                            onClick={() => handleDeleteSchedule(cls.id)}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500 transition-all cursor-pointer"
                            title="Cancel Class"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="font-bold text-xs md:text-sm text-foreground leading-snug line-clamp-1">
                          {cls.subject}
                        </h4>
                        
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {cls.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-4 text-[10px] text-muted-foreground relative z-10">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {cls.startTime} - {cls.endTime}
                        </span>
                        
                        <span className="flex items-center gap-1 font-bold text-foreground">
                          {cls.locationType === "ZOOM" ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-blue-400" />
                              <a href={cls.locationDetail} target="_blank" rel="noreferrer" className="underline hover:text-blue-400">Zoom Call</a>
                            </>
                          ) : (
                            <>
                              <Landmark className="w-3.5 h-3.5 text-amber-500" />
                              {cls.locationDetail}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ────────────────────────────────────────────────────────
          ADD SCHEDULE DIALOG
          ──────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-900/95 max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> Schedule A New Class
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 grid gap-4 sm:grid-cols-2 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Select Classroom *</label>
                <select
                  value={selClassId}
                  onChange={(e) => setSelClassId(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="" className="bg-slate-900 text-foreground">-- Select Classroom --</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-foreground">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Lecture Subject / Topic *</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to HTML"
                  value={schSubject}
                  onChange={(e) => setSchSubject(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Schedule Date *</label>
                <input
                  type="date"
                  value={schDate}
                  onChange={(e) => setSchDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-semibold">Start Time</label>
                  <input
                    type="time"
                    value={schStartTime}
                    onChange={(e) => setSchStartTime(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-semibold">End Time</label>
                  <input
                    type="time"
                    value={schEndTime}
                    onChange={(e) => setSchEndTime(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Location Type</label>
                <select
                  value={schLocType}
                  onChange={(e) => setSchLocType(e.target.value as any)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="ROOM" className="bg-slate-900 text-foreground">Physical Lab / Hall</option>
                  <option value="ZOOM" className="bg-slate-900 text-foreground">Virtual Zoom Link</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Room No. / URL Link *</label>
                <input
                  type="text"
                  placeholder="e.g. Hall-A or Zoom URL"
                  value={schLocDetail}
                  onChange={(e) => setSchLocDetail(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-muted-foreground font-semibold">Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes, materials, or prep guidelines for students..."
                  value={schDesc}
                  onChange={(e) => setSchDesc(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full leading-relaxed"
                />
              </div>
            </div>

            <div className="relative z-10 flex justify-end gap-2.5 mt-2 shrink-0">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-transparent text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={!selClassId || !schSubject.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Schedule Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          IMPORT TIMETABLE MODAL
          ──────────────────────────────────────────────────────── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-900/95 max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Import Schedule Timetable
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drag & drop box */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative z-10 border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                dragActive 
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-white/10 hover:border-emerald-500/30 text-muted-foreground hover:text-foreground"
              )}
            >
              <FileSpreadsheet className="w-10 h-10 text-emerald-400 animate-pulse" />
              <div>
                <span className="font-bold text-xs block">Drag and drop CSV timetable here</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">or click to browse local files</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Formatting Help */}
            <div className="relative z-10 p-4 border border-white/5 bg-slate-950/20 rounded-2xl text-[10px] md:text-xs text-muted-foreground leading-relaxed flex flex-col gap-1.5">
              <span className="font-bold text-foreground">Timetable spreadsheet columns:</span>
              <code className="bg-white/5 p-1 rounded font-mono text-[9px] block text-emerald-400">
                Classroom, Subject, Date, StartTime, EndTime, Type, Location, Description
              </code>
              <span className="text-[9px] mt-1 block">
                * Standard date format YYYY-MM-DD. Type must be ZOOM or ROOM.
              </span>
            </div>

            <div className="relative z-10 flex justify-end gap-2.5 mt-1 shrink-0">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-transparent text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
