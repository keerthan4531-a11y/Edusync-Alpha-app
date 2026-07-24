"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Check, X, ChevronDown, Save } from "lucide-react"

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
    alert("Attendance saved successfully! (Mock)")
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance</h1>
        <p className="text-muted-foreground mt-1">Mark daily attendance for your classrooms.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-2xl">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Select Classroom</label>
          <div className="relative">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full appearance-none bg-black/20 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {MOCK_CLASSROOMS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Date</label>
          <div className="relative">
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full md:w-auto px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Record
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
          <h2 className="font-semibold text-foreground">Student List</h2>
          <div className="text-sm text-zinc-400">
            Total Present: <span className="text-stage3 font-bold">{Object.values(attendance).filter(Boolean).length}</span> / {MOCK_STUDENTS.length}
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {MOCK_STUDENTS.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center font-medium text-zinc-300">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-foreground">{student.name}</div>
                  <div className="text-zinc-500 text-sm">Roll No: {student.roll}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => toggleAttendance(student.id, true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    attendance[student.id] 
                      ? 'bg-stage3/20 text-stage3 border border-stage3/30' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <Check className="w-4 h-4" /> Present
                </button>
                <button 
                  onClick={() => toggleAttendance(student.id, false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !attendance[student.id] 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <X className="w-4 h-4" /> Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
