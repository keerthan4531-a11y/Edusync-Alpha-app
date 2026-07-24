"use client"

import { useState } from "react"
import { BookOpen, Calendar, Users, BookMarked, Layers, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "syllabus", label: "Syllabus", icon: BookMarked },
  { id: "calendar", label: "Academic Calendar", icon: Calendar },
  { id: "assignments", label: "Faculty Assignments", icon: Users },
  { id: "structure", label: "Program Structure", icon: Layers },
]

const COURSES = [
  { code: "CS301", title: "Data Structures & Algorithms", credits: 4, year: 2, sem: 3, type: "Core", faculty: "Dr. Priya Sharma", status: "Active" },
  { code: "CS302", title: "Database Management Systems", credits: 3, year: 2, sem: 3, type: "Core", faculty: "Dr. Arun Kumar", status: "Active" },
  { code: "CS401", title: "Machine Learning", credits: 4, year: 3, sem: 5, type: "Elective", faculty: "Dr. Meera Nair", status: "Active" },
  { code: "CS402", title: "Computer Networks", credits: 3, year: 3, sem: 5, type: "Core", faculty: "Dr. Rajan Pillai", status: "Active" },
  { code: "CS501", title: "Artificial Intelligence", credits: 4, year: 4, sem: 7, type: "Elective", faculty: "Unassigned", status: "Pending" },
  { code: "CS101L", title: "Programming Lab", credits: 2, year: 1, sem: 1, type: "Lab", faculty: "Dr. Sunita Rao", status: "Active" },
]

const SYLLABUS = [
  { course: "CS301", week: 1, topic: "Introduction to Data Structures, Arrays, Linked Lists", status: "Completed" },
  { course: "CS301", week: 2, topic: "Stacks, Queues, and their Applications", status: "Completed" },
  { course: "CS301", week: 3, topic: "Trees: Binary Trees, BST, AVL Trees", status: "In Progress" },
  { course: "CS302", week: 1, topic: "Introduction to DBMS, ER Diagrams", status: "Completed" },
  { course: "CS302", week: 2, topic: "Relational Algebra, SQL Basics", status: "Completed" },
  { course: "CS302", week: 3, topic: "Normalization: 1NF, 2NF, 3NF, BCNF", status: "Upcoming" },
]

const CALENDAR_EVENTS = [
  { date: "Jul 15", title: "Mid-Semester Exams Begin", type: "examination" },
  { date: "Jul 22", title: "Project Submission Deadline", type: "academic" },
  { date: "Aug 5", title: "Summer Vacation", type: "holiday" },
  { date: "Aug 15", title: "Independence Day", type: "holiday" },
  { date: "Sep 1", title: "Semester End Exams", type: "examination" },
  { date: "Sep 10", title: "AI Workshop", type: "workshop" },
]

const ASSIGNMENTS = [
  { faculty: "Dr. Priya Sharma", course: "CS301", year: "2nd Year", sem: "3rd Sem", hours: 4 },
  { faculty: "Dr. Arun Kumar", course: "CS302", year: "2nd Year", sem: "3rd Sem", hours: 3 },
  { faculty: "Dr. Meera Nair", course: "CS401", year: "3rd Year", sem: "5th Sem", hours: 4 },
  { faculty: "Dr. Rajan Pillai", course: "CS402", year: "3rd Year", sem: "5th Sem", hours: 3 },
  { faculty: "Dr. Sunita Rao", course: "CS101L", year: "1st Year", sem: "1st Sem", hours: 2 },
]

const TYPE_COLORS: Record<string, string> = {
  Core: "bg-emerald-500/10 text-emerald-400",
  Elective: "bg-indigo-500/10 text-indigo-400",
  Lab: "bg-amber-500/10 text-amber-400",
  Project: "bg-violet-500/10 text-violet-400",
}

const EVENT_COLORS: Record<string, string> = {
  academic: "bg-emerald-500/10 text-emerald-400",
  examination: "bg-red-500/10 text-red-400",
  holiday: "bg-amber-500/10 text-amber-400",
  workshop: "bg-indigo-500/10 text-indigo-400",
}

export default function CurriculumPage() {
  const [activeTab, setActiveTab] = useState("courses")

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent backdrop-blur-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Curriculum Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">Computer Science & Engineering Department • Academic Year 2024–25</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium border border-violet-500/30 transition-colors">
            <Plus className="w-4 h-4" /> Add New Course
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            <Users className="w-4 h-4" /> Assign Faculty
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            <Calendar className="w-4 h-4" /> Academic Calendar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Courses", value: COURSES.length, color: "text-violet-400" },
          { label: "Core Courses", value: COURSES.filter(c => c.type === "Core").length, color: "text-indigo-400" },
          { label: "Elective Courses", value: COURSES.filter(c => c.type === "Elective").length, color: "text-emerald-400" },
          { label: "Lab Courses", value: COURSES.filter(c => c.type === "Lab").length, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5">
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
        <div className="flex border-b border-white/10 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                activeTab === tab.id
                  ? "text-violet-400 border-violet-500 bg-violet-500/5"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50" placeholder="Search courses..." />
                </div>
                <select className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground">
                  <option>All Types</option><option>Core</option><option>Elective</option><option>Lab</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Code", "Title", "Credits", "Year/Sem", "Type", "Faculty", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COURSES.map((c) => (
                      <tr key={c.code} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-3 font-mono text-violet-400">{c.code}</td>
                        <td className="py-3 px-3 text-foreground font-medium">{c.title}</td>
                        <td className="py-3 px-3 text-muted-foreground">{c.credits}</td>
                        <td className="py-3 px-3 text-muted-foreground">Y{c.year}/S{c.sem}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[c.type]}`}>{c.type}</span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{c.faculty}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{c.status}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1.5">
                            <button className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-foreground">View</button>
                            <button className="text-xs px-2 py-1 rounded bg-violet-500/10 text-violet-300">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Syllabus Tab */}
          {activeTab === "syllabus" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold text-foreground">Course Syllabus Management</h3>
              <div className="flex flex-col gap-3">
                {SYLLABUS.map((s, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-sm font-bold shrink-0">W{s.week}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">{s.course}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          s.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" :
                          s.status === "In Progress" ? "bg-indigo-500/10 text-indigo-400" :
                          "bg-zinc-500/10 text-zinc-400"
                        }`}>{s.status}</span>
                      </div>
                      <p className="text-sm text-foreground border-l-2 border-violet-500 pl-3">{s.topic}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === "calendar" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Academic Calendar</h3>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 text-violet-300 text-sm border border-violet-500/20 hover:bg-violet-500/20 transition-colors">
                  <Plus className="w-4 h-4" /> Add Event
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {CALENDAR_EVENTS.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0">{e.date.split(" ")[0]}<br />{e.date.split(" ")[1]}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{e.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${EVENT_COLORS[e.type]}`}>{e.type.charAt(0).toUpperCase() + e.type.slice(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Faculty Assignments Tab */}
          {activeTab === "assignments" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold text-foreground">Faculty Course Assignments</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Faculty", "Course", "Year", "Semester", "Hours/Week"].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ASSIGNMENTS.map((a, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">{a.faculty.split(" ").pop()?.charAt(0)}</div>
                            <span className="font-medium text-foreground">{a.faculty}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-violet-400">{a.course}</td>
                        <td className="py-3 px-4 text-muted-foreground">{a.year}</td>
                        <td className="py-3 px-4 text-muted-foreground">{a.sem}</td>
                        <td className="py-3 px-4 text-foreground font-medium">{a.hours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Program Structure Tab */}
          {activeTab === "structure" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold text-foreground">Program Structure — B.E. Computer Science</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map(year => (
                  <div key={year} className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <h4 className="font-semibold text-foreground mb-3">Year {year}</h4>
                    <div className="flex flex-col gap-2">
                      {COURSES.filter(c => c.year === year).map(c => (
                        <div key={c.code} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-violet-400">{c.code}</span>
                            <span className="text-muted-foreground">{c.title}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type]}`}>{c.credits}cr</span>
                        </div>
                      ))}
                      {COURSES.filter(c => c.year === year).length === 0 && (
                        <p className="text-xs text-muted-foreground">No courses for this year.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
