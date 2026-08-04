"use client"

import { useState, useEffect } from "react"
import {
  Users, Search, Plus, Edit2, Trash2, Upload, Download,
  Loader2, CheckCircle2, X, RefreshCw, GraduationCap, ShieldCheck,
  FileSpreadsheet, Filter, AlertCircle, Info, Calendar, Building2, User
} from "lucide-react"

interface UserItem {
  id: string
  name: string
  email: string
  role: "STUDENT" | "FACULTY" | "ADMIN" | "HOD"
  createdAt: string
  studentProfile?: {
    rollNumber?: string
    batch?: string
    semester?: number
    department?: string
    section?: string
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [infoUser, setInfoUser] = useState<UserItem | null>(null)

  // Create/Edit Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    department: "",
    rollNumber: "",
    batch: "",
    semester: 1,
    section: "A",
  })

  // Bulk Upload Modal State
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (search) query.set("search", search)
      if (roleFilter !== "ALL") query.set("role", roleFilter)
      const res = await fetch(`/api/admin/users?${query.toString()}`)
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }

  const openAddModal = () => {
    setEditingUser(null)
    setForm({
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
      department: "Computer Science",
      rollNumber: "",
      batch: "2023-2027",
      semester: 1,
      section: "A",
    })
    setShowModal(true)
  }

  const openEditModal = (user: UserItem) => {
    setEditingUser(user)
    setForm({
      name: user.name,
      email: user.email,
      password: "", // empty means unchanged
      role: user.role,
      department: user.studentProfile?.department || "",
      rollNumber: user.studentProfile?.rollNumber || "",
      batch: user.studentProfile?.batch || "",
      semester: user.studentProfile?.semester || 1,
      section: user.studentProfile?.section || "A",
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.email) return
    setSaving(true)
    try {
      if (editingUser) {
        // Edit
        await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingUser.id,
            name: form.name,
            email: form.email,
            role: form.role,
            ...(form.password ? { passwordHash: form.password } : {}),
          }),
        })
      } else {
        // Create
        await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password || "edusync123",
            role: form.role,
            studentProfile: form.role === "STUDENT" ? {
              rollNumber: form.rollNumber,
              batch: form.batch,
              semester: form.semester,
              department: form.department,
              section: form.section,
            } : undefined,
          }),
        })
      }
      await fetchUsers()
      setShowModal(false)
    } catch (e) {
      console.error("Save user error:", e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" })
      await fetchUsers()
    } catch (e) {
      console.error("Delete user error:", e)
    }
  }

  // Parse CSV text to users array
  const handleBulkImport = async () => {
    if (!csvText.trim()) return
    setImporting(true)
    setImportResult(null)

    try {
      const lines = csvText.trim().split("\n")
      const parsedUsers = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || i === 0 && line.toLowerCase().includes("email")) continue // Skip header if present
        const parts = line.split(",").map(p => p.trim())
        if (parts.length >= 3) {
          const [name, email, password, role = "STUDENT", department, rollNumber, batch] = parts
          parsedUsers.push({ name, email, password, role, department, rollNumber, batch })
        }
      }

      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: parsedUsers }),
      })
      const data = await res.json()
      setImportResult(data)
      await fetchUsers()
    } catch {
      setImportResult({ created: 0, errors: ["Failed to process CSV file"] })
    } finally {
      setImporting(false)
    }
  }

  const downloadCsvTemplate = () => {
    const template = "name,email,password,role,department,rollNumber,batch\nJohn Doe,john@example.com,pass123,STUDENT,Computer Science,CS202401,2023-2027\nDr. Smith,smith@example.com,pass123,FACULTY,Computer Science,,\n"
    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "user_import_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2.5rem] border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">User Directory & Management</h1>
            <p className="text-xs text-muted-foreground font-medium">Create, edit, and bulk-import students, faculty, and administrators</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchUsers} disabled={loading} className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground hover:text-white transition-all flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => { setShowBulkModal(true); setCsvText(""); setImportResult(null) }} className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Bulk CSV Import
          </button>
          <button onClick={openAddModal} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Role Tabs */}
        <div className="flex gap-1.5 p-1.5 bg-white/5 border border-white/5 rounded-2xl overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Users" },
            { key: "STUDENT", label: "Students" },
            { key: "FACULTY", label: "Faculty" },
            { key: "ADMIN", label: "Admins" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                roleFilter === tab.key
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500 transition-all"
          />
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : users.length === 0 ? (
        <div className="neu-flat dark:bg-white/5 p-12 rounded-[2rem] text-center border border-white/5">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-bold text-white mb-1">No users found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search query or role filter, or add a new user.</p>
        </div>
      ) : (
        <div className="neu-flat dark:bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-3 py-3.5 text-center">Role</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {user.name?.[0] || "U"}
                        </div>
                        <div className="truncate max-w-[140px] sm:max-w-none">
                          <p className="font-extrabold text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${
                        user.role === "ADMIN" ? "bg-purple-500/15 text-purple-400 border-purple-500/30" :
                        user.role === "FACULTY" ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" :
                        "bg-blue-500/15 text-blue-400 border-blue-500/30"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setInfoUser(user)}
                          title="View Account Info"
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit User"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        >
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

      {/* ACCOUNT INFO MODAL POPUP */}
      {infoUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm neu-flat dark:bg-[#0d1222] rounded-[2.5rem] border border-indigo-500/20 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" /> Account Details
              </h3>
              <button onClick={() => setInfoUser(null)} className="text-muted-foreground hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                  {infoUser.name?.[0] || "U"}
                </div>
                <div className="truncate">
                  <p className="font-extrabold text-white text-sm truncate">{infoUser.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{infoUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Role</p>
                  <p className="font-extrabold text-indigo-400 mt-0.5">{infoUser.role}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Joined Date</p>
                  <p className="font-bold text-white mt-0.5">{new Date(infoUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {infoUser.studentProfile ? (
                <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-1.5">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Student Profile</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Roll No:</span>{" "}
                      <span className="font-bold text-white">{infoUser.studentProfile.rollNumber || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Batch:</span>{" "}
                      <span className="font-bold text-white">{infoUser.studentProfile.batch || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dept:</span>{" "}
                      <span className="font-bold text-white">{infoUser.studentProfile.department || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sem / Sec:</span>{" "}
                      <span className="font-bold text-white">Sem {infoUser.studentProfile.semester || 1} ({infoUser.studentProfile.section || "A"})</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-muted-foreground text-[11px]">
                  <span>System Administrator / Administrative Account</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setInfoUser(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-extrabold hover:bg-white/20 transition-all mt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md neu-flat dark:bg-[#0d1222] rounded-[2.5rem] border border-indigo-500/20 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                {editingUser ? <Edit2 className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-indigo-400" />}
                {editingUser ? "Edit User Account" : "Add New User Account"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-indigo-400 uppercase">Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Alex Johnson"
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-indigo-400 uppercase">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. alex@edusync.app"
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-indigo-400 uppercase">{editingUser ? "New Password (Optional)" : "Password"}</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editingUser ? "Leave blank to keep unchanged" : "Password"}
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-indigo-400 uppercase">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}
                  className="px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500">
                  <option value="STUDENT" className="bg-[#0d1222]">Student</option>
                  <option value="FACULTY" className="bg-[#0d1222]">Faculty</option>
                  <option value="ADMIN" className="bg-[#0d1222]">Admin</option>
                </select>
              </div>

              {form.role === "STUDENT" && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Roll Number</label>
                    <input value={form.rollNumber} onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))} placeholder="CS202401"
                      className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Batch</label>
                    <input value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} placeholder="2023-2027"
                      className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Department</label>
                    <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="CSE"
                      className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Semester</label>
                    <input type="number" min={1} max={8} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: Number(e.target.value) }))}
                      className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white outline-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {editingUser ? "Update User" : "Create User"}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl bg-white/5 text-xs font-bold text-muted-foreground hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK CSV IMPORT MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl neu-flat dark:bg-[#0d1222] rounded-[2.5rem] border border-indigo-500/20 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                Bulk User CSV Import
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-muted-foreground hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Paste CSV rows or use template:</span>
                <button onClick={downloadCsvTemplate} className="text-indigo-400 font-extrabold hover:underline flex items-center gap-1 text-[11px]">
                  <Download className="w-3 h-3" /> Download Template
                </button>
              </div>

              <textarea
                rows={7}
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder={`name,email,password,role,department,rollNumber,batch\nAlex Smith,alex@example.com,pass123,STUDENT,CSE,CS101,2023-2027\nDr. Jane,jane@example.com,pass123,FACULTY,CSE,,`}
                className="w-full p-3 rounded-xl text-xs font-mono bg-white/5 border border-white/10 text-white outline-none focus:border-amber-400"
              />

              {importResult && (
                <div className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${importResult.created > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                  <p className="font-bold">Successfully imported {importResult.created} users!</p>
                  {importResult.errors.length > 0 && (
                    <ul className="text-[10px] list-disc list-inside">
                      {importResult.errors.map((err, idx) => <li key={idx}>{err}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button onClick={handleBulkImport} disabled={importing || !csvText.trim()} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Process and Import Users
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
