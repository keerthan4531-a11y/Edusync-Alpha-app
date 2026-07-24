import { Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react"

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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Weekly Schedule</h1>
          <p className="text-muted-foreground mt-1">View your upcoming classes and meetings.</p>
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-foreground rounded-lg font-medium transition-colors w-fit flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" /> Sync Calendar
        </button>
      </div>

      <div className="grid gap-6">
        {MOCK_SCHEDULE.map((daySchedule, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 md:gap-8 bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-2xl shadow-sm">
            <div className="w-32 flex-shrink-0">
              <h2 className="text-xl font-bold text-indigo-400">{daySchedule.day}</h2>
              <p className="text-sm text-zinc-500">{daySchedule.classes.length} {daySchedule.classes.length === 1 ? 'session' : 'sessions'}</p>
            </div>
            
            <div className="flex-1 grid gap-4">
              {daySchedule.classes.length > 0 ? (
                daySchedule.classes.map((cls, i) => (
                  <div key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${cls.type === 'Meeting' ? 'bg-zinc-900/50 border-zinc-700/50' : 'bg-black/20 border-white/5'}`}>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{cls.subject}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-indigo-400" /> {cls.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-stage1" /> {cls.room}
                        </div>
                        {cls.students > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-stage2" /> {cls.students} students
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        cls.type === 'Lecture' ? 'bg-stage2/20 text-stage2 border border-stage2/20' : 
                        cls.type === 'Lab' ? 'bg-stage3/20 text-stage3 border border-stage3/20' : 
                        'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}>
                        {cls.type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-black/20 border border-dashed border-white/10 text-center text-zinc-500">
                  No sessions scheduled
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
