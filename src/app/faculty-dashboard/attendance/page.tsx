"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Check, X, ChevronDown, Save, Clock } from "lucide-react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

// Mock Data
const MOCK_CLASSROOMS = [
  { id: "c1", name: "CS101: Introduction to Programming" },
  { id: "c2", name: "CS201: Data Structures" },
]

const MOCK_STUDENTS = [
  { id: "s1", name: "Alice Johnson", roll: "101" },
  { id: "s2", name: "Bob Smith", roll: "102" },
  { id: "s3", name: "Charlie Brown", roll: "103" },
  { id: "s4", name: "Diana Prince", roll: "104" },
  { id: "s5", name: "Evan Wright", roll: "105" },
]

export default function FacultyAttendancePage() {
  const [selectedClass, setSelectedClass] = useState(MOCK_CLASSROOMS[0].id)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    MOCK_STUDENTS.reduce((acc, student) => ({ ...acc, [student.id]: true }), {})
  )

  const toggleAttendance = (studentId: string, status: boolean) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSave = () => {
    alert("Attendance record successfully saved!")
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-4 md:p-8 text-foreground">
      {/* Top Banner Header */}
      <LiquidGlassCard className="p-6 md:p-8 shadow-xl" accentColor="#f59e0b">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-raised-sm flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Attendance Register</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 font-medium">Mark daily lecture attendance, generate roll reports, and sync student logs.</p>
          </div>
        </div>
      </LiquidGlassCard>

      <div className="flex flex-col md:flex-row gap-4 items-end neu-flat p-6 rounded-[2rem] shadow-xl dark:bg-white/5 dark:border-white/10">
        <div className="flex-1 w-full">
          <label className="block text-xs font-extrabold uppercase text-muted-foreground mb-2">Select Course Classroom</label>
          <div className="relative">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full h-11 appearance-none neu-inset-sm bg-transparent rounded-xl py-2.5 pl-4 pr-10 text-xs font-extrabold text-foreground focus:outline-none dark:bg-white/5"
            >
              {MOCK_CLASSROOMS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs font-extrabold uppercase text-muted-foreground mb-2">Lecture Date</label>
          <div className="relative">
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 neu-inset-sm bg-transparent rounded-xl py-2.5 px-4 text-xs font-extrabold text-foreground focus:outline-none dark:bg-white/5"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full md:w-auto h-11 px-6 bg-primary text-primary-foreground neu-button rounded-xl font-extrabold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Record
        </button>
      </div>

      <div className="rounded-[2rem] neu-flat shadow-xl overflow-hidden dark:bg-white/5 dark:border-white/10">
        <div className="p-4 border-b border-black/5 dark:border-white/5 neu-raised-xs flex justify-between items-center">
          <h2 className="font-extrabold text-xs uppercase tracking-wider text-foreground">Enrolled Roster ({MOCK_STUDENTS.length})</h2>
          <div className="text-xs font-bold text-muted-foreground">
            Total Present: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm ml-1">{Object.values(attendance).filter(Boolean).length}</span> / {MOCK_STUDENTS.length}
          </div>
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/5">
          {MOCK_STUDENTS.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl neu-raised-xs flex items-center justify-center font-extrabold text-foreground">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-foreground">{student.name}</div>
                  <div className="text-muted-foreground text-xs font-medium">Roll No: {student.roll}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 neu-inset-sm p-1 rounded-2xl">
                <button 
                  onClick={() => toggleAttendance(student.id, true)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    attendance[student.id] 
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 neu-button scale-105' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" /> Present
                </button>
                <button 
                  onClick={() => toggleAttendance(student.id, false)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    !attendance[student.id] 
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 neu-button scale-105' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <X className="w-3.5 h-3.5" /> Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
