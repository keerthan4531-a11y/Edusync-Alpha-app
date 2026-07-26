import { Calendar as CalendarIcon, Clock, MapPin, Users, Calendar } from "lucide-react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

export const dynamic = "force-static"

const MOCK_SCHEDULE = [
  {
    day: "Monday",
    classes: [
      { time: "09:00 AM - 10:30 AM", subject: "CS101: Introduction to Programming", room: "Room 301", type: "Lecture", students: 45 },
      { time: "11:00 AM - 12:30 PM", subject: "CS201: Data Structures", room: "Lab 2", type: "Lab", students: 30 },
    ]
  },
  {
    day: "Tuesday",
    classes: [
      { time: "10:00 AM - 11:30 AM", subject: "CS305: Web Development", room: "Room 304", type: "Lecture", students: 60 },
    ]
  },
  {
    day: "Wednesday",
    classes: [
      { time: "09:00 AM - 10:30 AM", subject: "CS101: Introduction to Programming", room: "Room 301", type: "Lecture", students: 45 },
      { time: "02:00 PM - 04:00 PM", subject: "Faculty Meeting", room: "Conference Room B", type: "Meeting", students: 0 },
    ]
  },
  {
    day: "Thursday",
    classes: [
      { time: "11:00 AM - 12:30 PM", subject: "CS201: Data Structures", room: "Room 302", type: "Lecture", students: 50 },
    ]
  },
  {
    day: "Friday",
    classes: [
      { time: "10:00 AM - 01:00 PM", subject: "CS305: Web Development", room: "Lab 1", type: "Lab", students: 60 },
    ]
  }
]

export default function FacultySchedulePage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8 text-foreground">
      {/* Top Banner Header */}
      <LiquidGlassCard className="p-6 md:p-8 shadow-xl" accentColor="#a855f7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl neu-raised-sm flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Calendar className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Weekly Timetable & Schedule</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 font-medium">Review lecture sessions, lab hours, and departmental faculty meetings.</p>
            </div>
          </div>
          <button className="px-5 py-2.5 neu-button bg-primary text-primary-foreground font-extrabold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Sync Calendar</span>
          </button>
        </div>
      </LiquidGlassCard>

      <div className="grid gap-6">
        {MOCK_SCHEDULE.map((daySchedule, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 md:gap-8 neu-flat p-6 rounded-[2rem] shadow-xl dark:bg-white/5 dark:border-white/10">
            <div className="w-36 shrink-0">
              <h2 className="text-xl font-extrabold text-primary dark:text-indigo-400">{daySchedule.day}</h2>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{daySchedule.classes.length} {daySchedule.classes.length === 1 ? 'session' : 'sessions'}</p>
            </div>
            
            <div className="flex-1 grid gap-4">
              {daySchedule.classes.length > 0 ? (
                daySchedule.classes.map((cls, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl neu-raised-xs">
                    <div>
                      <h3 className="font-extrabold text-foreground text-base">{cls.subject}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> 
                          <span>{cls.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 
                          <span>{cls.room}</span>
                        </div>
                        {cls.students > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> 
                            <span>{cls.students} enrolled students</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold neu-raised-xs ${
                        cls.type === 'Lecture' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 
                        cls.type === 'Lab' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' : 
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {cls.type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl neu-inset-sm text-center text-xs font-semibold text-muted-foreground">
                  No lecture sessions scheduled for {daySchedule.day}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
