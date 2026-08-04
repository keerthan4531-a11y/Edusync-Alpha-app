"use client"

import { useState, useEffect } from "react"
import {
  Building2, Plus, Edit2, Trash2, Loader2, CheckCircle2,
  X, RefreshCw, Users, GraduationCap, MapPin, Sparkles
} from "lucide-react"

interface DepartmentItem {
  id: string
  name: string
  hodId?: string
  hod?: { name: string; email: string }
  _count?: { users: number; classes: number }
}

interface ClassItem {
  id: string
  name: string
  room?: string
  departmentId?: string
  department?: { name: string }
  _count?: { students: number }
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [facultyList, setFacultyList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dept Modal
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null)
  const [deptName, setDeptName] = useState("")
  const [deptHodId, setDeptHodId] = useState("")
  const [savingDept, setSavingDept] = useState(false)

  // Class Modal
  const [showClassModal, setShowClassModal] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null)
  const [className, setClassName] = useState("")
  const [classRoom, setClassRoom] = useState("")
  const [classDeptId, setClassDeptId] = useState("")
  const [savingClass, setSavingClass] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [deptRes, classRes, facRes] = await Promise.all([
        fetch("/api/admin/departments"),
        fetch("/api/admin/classes"),
        fetch("/api/admin/users?role=FACULTY&limit=100"),
      ])
      const depts = await deptRes.json()
      const cls = await classRes.json()
      const facs = await facRes.json()

      setDepartments(Array.isArray(depts) ? depts : [])
      setClasses(Array.isArray(cls) ? cls : [])
      setFacultyList(facs.users || [])
    } catch {
      setDepartments([])
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Department Actions
  const openAddDeptModal = () => {
    setEditingDept(null)
    setDeptName("")
    setDeptHodId("")
    setShowDeptModal(true)
  }

  const openEditDeptModal = (dept: DepartmentItem) => {
    setEditingDept(dept)
    setDeptName(dept.name)
    setDeptHodId(dept.hodId || "")
    setShowDeptModal(true)
  }

  const handleSaveDept = async () => {
    if (!deptName) return
    setSavingDept(true)
    try {
      if (editingDept) {
        await fetch("/api/admin/departments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingDept.id, name: deptName, hodId: deptHodId || null }),
        })
      } else {
        await fetch("/api/admin/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: deptName, hodId: deptHodId || undefined }),
        })
      }
      await fetchData()
      setShowDeptModal(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSavingDept(false)
    }
  }

  const handleDeleteDept = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return
    try {
      await fetch(`/api/admin/departments?id=${id}`, { method: "DELETE" })
      await fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  // Class Actions
  const openAddClassModal = () => {
    setEditingClass(null)
    setClassName("")
    setClassRoom("")
    setClassDeptId(departments[0]?.id || "")
    setShowClassModal(true)
  }

  const openEditClassModal = (cls: ClassItem) => {
    setEditingClass(cls)
    setClassName(cls.name)
    setClassRoom(cls.room || "")
    setClassDeptId(cls.departmentId || "")
    setShowClassModal(true)
  }

  const handleSaveClass = async () => {
    if (!className) return
    setSavingClass(true)
    try {
      if (editingClass) {
        await fetch("/api/admin/classes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingClass.id, name: className, room: classRoom, departmentId: classDeptId || null }),
        })
      } else {
        await fetch("/api/admin/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: className, room: classRoom, departmentId: classDeptId || undefined }),
        })
      }
      await fetchData()
      setShowClassModal(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSavingClass(false)
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return
    try {
      await fetch(`/api/admin/classes?id=${id}`, { method: "DELETE" })
      await fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2.5rem] border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Department & Class Management</h1>
            <p className="text-xs text-muted-foreground font-medium">Configure academic departments, assigned HODs, and class sections</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchData} disabled={loading} className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground hover:text-white transition-all flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={openAddDeptModal} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Department
          </button>
          <button onClick={openAddClassModal} className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 text-xs font-black hover:bg-white/20 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>
      </div>

      {/* Grid Layout for Departments & Classes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Section 1: Academic Departments */}
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2rem] border border-white/10 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Academic Departments ({departments.length})
            </h2>
            <button onClick={openAddDeptModal} className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
          ) : departments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 font-medium">No departments configured yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {departments.map(dept => (
                <div key={dept.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{dept.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      HOD: {dept.hod?.name || "Unassigned"} · {dept._count?.users || 0} Members
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEditDeptModal(dept)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteDept(dept.id)} className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Classes & Sections */}
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2rem] border border-white/10 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              Classes & Sections ({classes.length})
            </h2>
            <button onClick={openAddClassModal} className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
          ) : classes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 font-medium">No class sections configured yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {classes.map(cls => (
                <div key={cls.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{cls.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      Room: {cls.room || "TBD"} · {cls.department?.name || "No Dept"} · {cls._count?.students || 0} Students
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEditClassModal(cls)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-400">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteClass(cls.id)} className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DEPARTMENT MODAL */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md neu-flat dark:bg-[#0d1222] rounded-[2.5rem] border border-indigo-500/20 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white">
                {editingDept ? "Edit Department" : "Add Department"}
              </h3>
              <button onClick={() => setShowDeptModal(false)} className="text-muted-foreground hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase">Department Name</label>
                <input value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="e.g. Computer Science Engineering"
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase">Assign HOD (Faculty)</label>
                <select value={deptHodId} onChange={e => setDeptHodId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500">
                  <option value="" className="bg-[#0d1222]">No HOD Assigned</option>
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id} className="bg-[#0d1222]">{f.name} ({f.email})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button onClick={handleSaveDept} disabled={savingDept || !deptName} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                {savingDept ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {editingDept ? "Update Department" : "Create Department"}
              </button>
              <button onClick={() => setShowDeptModal(false)} className="px-4 py-2.5 rounded-xl bg-white/5 text-xs font-bold text-muted-foreground hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLASS MODAL */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md neu-flat dark:bg-[#0d1222] rounded-[2.5rem] border border-purple-500/20 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white">
                {editingClass ? "Edit Class Section" : "Add Class Section"}
              </h3>
              <button onClick={() => setShowClassModal(false)} className="text-muted-foreground hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-purple-400 uppercase">Class Section Name</label>
                <input value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. CSE-A, IT-B"
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-purple-400 uppercase">Room Number / Venue</label>
                <input value={classRoom} onChange={e => setClassRoom(e.target.value)} placeholder="e.g. Room 301, Lab 2"
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-purple-400 uppercase">Department</label>
                <select value={classDeptId} onChange={e => setClassDeptId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500">
                  <option value="" className="bg-[#0d1222]">No Department Linked</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id} className="bg-[#0d1222]">{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button onClick={handleSaveClass} disabled={savingClass || !className} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2">
                {savingClass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {editingClass ? "Update Class" : "Create Class"}
              </button>
              <button onClick={() => setShowClassModal(false)} className="px-4 py-2.5 rounded-xl bg-white/5 text-xs font-bold text-muted-foreground hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
