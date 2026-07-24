import { db } from "@/lib/db"
import { BarChart3, TrendingUp, TrendingDown, Users, Monitor, GraduationCap, BookOpen, Star } from "lucide-react"

export const dynamic = "force-dynamic"

const FACULTY_ANALYTICS = [
  { name: "Dr. Priya Sharma", designation: "Professor", courses: 3, rating: 4.8, attendance: 96, research: 8.5, performance: 92 },
  { name: "Dr. Arun Kumar", designation: "Assoc. Prof.", courses: 2, rating: 4.5, attendance: 94, research: 7.2, performance: 87 },
  { name: "Dr. Meera Nair", designation: "Asst. Prof.", courses: 3, rating: 4.7, attendance: 98, research: 9.0, performance: 94 },
  { name: "Dr. Rajan Pillai", designation: "Professor", courses: 4, rating: 4.3, attendance: 91, research: 6.8, performance: 83 },
  { name: "Dr. Sunita Rao", designation: "Lecturer", courses: 2, rating: 4.6, attendance: 97, research: 5.5, performance: 88 },
]

const STUDENT_ANALYTICS = [
  { year: "1st Year", total: 120, avgGpa: 7.8, passRate: 94, attendance: 88, placement: "-" },
  { year: "2nd Year", total: 110, avgGpa: 7.5, passRate: 91, attendance: 85, placement: "-" },
  { year: "3rd Year", total: 105, avgGpa: 7.9, passRate: 95, attendance: 90, placement: "68%" },
  { year: "4th Year", total: 98, avgGpa: 8.1, passRate: 97, attendance: 92, placement: "87%" },
]

const COURSE_ANALYTICS = [
  { code: "CS301", name: "Data Structures", enrollment: 110, avgGrade: "B+", passRate: 92, studentRating: 4.7, facultyRating: 4.8 },
  { code: "CS302", name: "Database Systems", enrollment: 108, avgGrade: "B", passRate: 88, studentRating: 4.5, facultyRating: 4.6 },
  { code: "CS401", name: "Machine Learning", enrollment: 85, avgGrade: "A-", passRate: 94, studentRating: 4.9, facultyRating: 4.7 },
  { code: "CS402", name: "Computer Networks", enrollment: 105, avgGrade: "B+", passRate: 90, studentRating: 4.4, facultyRating: 4.5 },
]

const RESOURCE_ANALYTICS = [
  { type: "Computers", total: 80, inUse: 72, available: 6, maintenance: 2, utilization: 90, efficiency: "High" },
  { type: "Networking Equip.", total: 25, inUse: 20, available: 3, maintenance: 2, utilization: 80, efficiency: "Good" },
  { type: "Lab Equipment", total: 45, inUse: 38, available: 5, maintenance: 2, utilization: 84, efficiency: "Good" },
  { type: "Projectors", total: 12, inUse: 9, available: 2, maintenance: 1, utilization: 75, efficiency: "Good" },
]

const RESEARCH_ANALYTICS = [
  { faculty: "Dr. Priya Sharma", publications: 8, citations: 124, projects: 2, grants: "₹12L", patents: 1, score: 9.2 },
  { faculty: "Dr. Meera Nair", publications: 6, citations: 98, projects: 3, grants: "₹18L", patents: 0, score: 8.8 },
  { faculty: "Dr. Arun Kumar", publications: 5, citations: 72, projects: 1, grants: "₹8L", patents: 2, score: 7.9 },
  { faculty: "Dr. Rajan Pillai", publications: 4, citations: 55, projects: 2, grants: "₹6L", patents: 0, score: 6.8 },
  { faculty: "Dr. Sunita Rao", publications: 3, citations: 41, projects: 1, grants: "₹4L", patents: 0, score: 5.7 },
]

const ANALYTICS_TABS = ["Faculty Analytics", "Student Analytics", "Course Analytics", "Resource Analytics", "Research Analytics"]

export default async function HodAnalyticsPage() {
  const totalFaculty = await db.user.count({ where: { role: "FACULTY" } })
  const totalStudents = await db.user.count({ where: { role: "STUDENT" } })
  const totalClassrooms = await db.classroom.count()
  const pendingSubmissions = await db.assignmentSubmission.count({ where: { status: "SUBMITTED" } })

  const kpis = [
    { label: "Total Faculty", value: totalFaculty, change: "+2", up: true, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Total Students", value: totalStudents, change: "+12", up: true, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { label: "Active Classrooms", value: totalClassrooms, change: "+1", up: true, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Pending Submissions", value: pendingSubmissions, change: "-5", up: false, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Course Completion", value: "92%", change: "+3.2%", up: true, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
    { label: "Avg Pass Rate", value: "93%", change: "+1.4%", up: true, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  ]

  const gauges = [
    { label: "Course Completion", value: 92 },
    { label: "Resource Utilization", value: 84 },
    { label: "Faculty Satisfaction", value: 88 },
  ]

  const insights = [
    { icon: "🎯", priority: "high", text: "Machine Learning course has the highest student satisfaction (4.9/5). Consider expanding enrollment next semester." },
    { icon: "⚠️", priority: "medium", text: "2nd year attendance rate dropped to 85%. Recommend intervention sessions and student counseling." },
    { icon: "✅", priority: "low", text: "4th year placement rate reached 87% — highest in 3 years. Continue industry partnership programs." },
    { icon: "📊", priority: "medium", text: "Research output increased 15% this year. Dr. Meera Nair leads with 3 funded projects." },
  ]

  const PRIORITY_COLORS: Record<string, string> = {
    high: "bg-red-500/10 text-red-400",
    medium: "bg-amber-500/10 text-amber-400",
    low: "bg-emerald-500/10 text-emerald-400",
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent backdrop-blur-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Department Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Computer Science & Engineering • Real-time Performance Analytics</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium border border-violet-500/30 transition-colors">
            <BarChart3 className="w-4 h-4" /> Refresh Analytics
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-sm font-medium border border-white/10 transition-colors">
            Export Data
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-muted-foreground">Period:</label>
            <select className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground">
              <option>Current Month</option>
              <option>Last Month</option>
              <option>Current Quarter</option>
              <option>Current Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" /> Key Performance Indicators
        </h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {kpis.map((k) => (
            <div key={k.label} className={`rounded-2xl border ${k.bg} backdrop-blur-2xl p-4 flex flex-col gap-2`}>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className={`text-xs flex items-center gap-1 ${k.up ? "text-emerald-400" : "text-red-400"}`}>
                {k.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {k.change} this month
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Gauge-style Progress Cards */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" /> Performance Gauges
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {gauges.map((g) => (
            <div key={g.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 flex flex-col items-center gap-3">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3"
                    strokeDasharray={`${g.value} 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{g.value}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">{g.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analytics Tabs */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          <h2 className="text-base font-semibold text-foreground">Detailed Analytics</h2>
        </div>
        <div className="flex border-b border-white/10 overflow-x-auto px-4">
          {ANALYTICS_TABS.map((tab, i) => (
            <div key={tab} className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 cursor-pointer ${i === 0 ? "text-violet-400 border-violet-500" : "text-muted-foreground border-transparent"}`}>{tab}</div>
          ))}
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Faculty", "Designation", "Courses", "Avg. Rating", "Attendance %", "Research Score", "Performance"].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FACULTY_ANALYTICS.map((f) => (
                <tr key={f.name} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">{f.name.split(" ").pop()?.charAt(0)}</div>
                      <span className="font-medium text-foreground">{f.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{f.designation}</td>
                  <td className="py-3 px-3 text-foreground">{f.courses}</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" /> {f.rating}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${f.attendance}%` }} />
                      </div>
                      <span className="text-xs text-foreground">{f.attendance}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-violet-400 font-medium">{f.research}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${f.performance}%` }} />
                      </div>
                      <span className="text-xs text-foreground">{f.performance}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">AI-Powered Insights & Recommendations</h2>
          <button className="px-3 py-2 rounded-xl bg-violet-500/10 text-violet-300 text-xs border border-violet-500/20 hover:bg-violet-500/20 transition-colors">
            Generate New Insights
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((ins, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border-l-4 border-violet-500 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-base shrink-0">{ins.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ins.priority]}`}>
                    {ins.priority.charAt(0).toUpperCase() + ins.priority.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{ins.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Bars */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Performance Comparison — Current vs Previous Period</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            {[
              { label: "Student Performance", current: 93, previous: 89 },
              { label: "Faculty Performance", current: 88, previous: 85 },
              { label: "Resource Utilization", current: 84, previous: 78 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="text-foreground">{m.current}% vs {m.previous}%</span>
                </div>
                <div className="relative h-3 rounded-full bg-white/10">
                  <div className="absolute left-0 top-0 h-full rounded-full bg-violet-500/40" style={{ width: `${m.previous}%` }} />
                  <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${m.current}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-foreground">Trend Analysis</h3>
            <div className="flex items-end gap-2 h-32 pt-4">
              {[65, 72, 78, 83, 88, 92, 91, 94, 90, 93, 95, 93].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-gradient-to-t from-violet-500 to-indigo-400 opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${v}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
