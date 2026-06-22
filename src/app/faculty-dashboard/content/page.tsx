"use client"

import { useState, useEffect, useRef } from "react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Button } from "@/components/ui/button"
import { 
  FolderOpen, Search, UploadCloud, BookOpen, Film, Layers, CheckCircle2,
  Trash2, X, Plus, Eye, Download, Info, PlayCircle, FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentItem {
  id: string
  title: string
  classroomId: string
  classroomName: string
  type: "document" | "video" | "presentation" | "quiz"
  description: string
  fileName: string
  fileSize: string
  views: number
  downloads: number
  createdAt: string
}

export default function ContentLibraryPage() {
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [contents, setContents] = useState<ContentItem[]>([])
  const [filteredContents, setFilteredContents] = useState<ContentItem[]>([])
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")

  // Upload Panel states
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [upTitle, setUpTitle] = useState("")
  const [upClassId, setUpClassId] = useState("")
  const [upType, setUpType] = useState<"document" | "video" | "presentation" | "quiz">("document")
  const [upDesc, setUpDesc] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Upload Progress simulation
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  // Load classrooms & contents
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/faculty/classrooms")
        if (res.ok) {
          const data = await res.json()
          setClassrooms(data.classrooms || [])
        }

        const saved = localStorage.getItem("faculty_contents")
        if (saved) {
          setContents(JSON.parse(saved))
        } else {
          // Initialize mock content items
          const mockContents: ContentItem[] = [
            {
              id: "cnt-1",
              title: "Syllabus Handout & Code Guidelines",
              classroomId: "mock-class-1",
              classroomName: "Advanced Software Engineering",
              type: "document",
              description: "Essential rules and weekly agenda.",
              fileName: "Syllabus_2026.pdf",
              fileSize: "1.2 MB",
              views: 48,
              downloads: 32,
              createdAt: new Date(Date.now() - 604800000).toISOString().split("T")[0],
            },
            {
              id: "cnt-2",
              title: "Introductory Web Refraction Concepts",
              classroomId: "mock-class-1",
              classroomName: "Advanced Software Engineering",
              type: "video",
              description: "Virtual session covering CSS backdrop filters.",
              fileName: "refraction_demo.mp4",
              fileSize: "28.5 MB",
              views: 82,
              downloads: 14,
              createdAt: new Date(Date.now() - 259200000).toISOString().split("T")[0],
            },
            {
              id: "cnt-3",
              title: "Stage 2 Coding Project Pitch",
              classroomId: "mock-class-1",
              classroomName: "Advanced Software Engineering",
              type: "presentation",
              description: "Lecture slide deck detailing expectations.",
              fileName: "Project_Pitch_Slides.pptx",
              fileSize: "8.4 MB",
              views: 30,
              downloads: 25,
              createdAt: new Date().toISOString().split("T")[0],
            }
          ]
          setContents(mockContents)
          localStorage.setItem("faculty_contents", JSON.stringify(mockContents))
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [])

  // Filters logic
  useEffect(() => {
    let result = [...contents]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.fileName.toLowerCase().includes(term)
      )
    }

    if (typeFilter !== "all") {
      result = result.filter((c) => c.type === typeFilter)
    }

    if (classFilter !== "all") {
      result = result.filter((c) => c.classroomId === classFilter)
    }

    setFilteredContents(result)
  }, [contents, searchTerm, typeFilter, classFilter])

  // Drag handlers
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
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Simulate file upload progress
  const handleUploadSubmit = () => {
    if (!upTitle.trim() || !selectedFile) return
    
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          
          // Add to listing
          const targetClass = classrooms.find((c) => c.id === upClassId)
          const newMaterial: ContentItem = {
            id: Date.now().toString(),
            title: upTitle,
            classroomId: upClassId || "all-classrooms",
            classroomName: targetClass ? targetClass.name : "All Classrooms",
            type: upType,
            description: upDesc,
            fileName: selectedFile.name,
            fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
            views: 0,
            downloads: 0,
            createdAt: new Date().toISOString().split("T")[0],
          }

          const updated = [newMaterial, ...contents]
          setContents(updated)
          localStorage.setItem("faculty_contents", JSON.stringify(updated))

          setTimeout(() => {
            setIsUploading(false)
            setUploadProgress(0)
            setIsUploadOpen(false)
            setUpTitle("")
            setUpDesc("")
            setSelectedFile(null)
            alert(`File "${newMaterial.title}" uploaded successfully!`)
          }, 300)

          return 100
        }
        return prev + 20
      })
    }, 150)
  }

  // Delete content item
  const handleDeleteContent = (id: string) => {
    if (!confirm("Are you sure you want to delete this resource material?")) return
    const updated = contents.filter((c) => c.id !== id)
    setContents(updated)
    localStorage.setItem("faculty_contents", JSON.stringify(updated))
  }

  // Analytics helper: Most viewed
  const mostViewed = [...contents].sort((a,b) => b.views - a.views).slice(0, 3)

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 flex flex-col gap-8">
      
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[var(--glass-border-subtle)] pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            Content Library
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Upload lecture notes, presentations, videos, and quizzes across classrooms.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-xs shadow-lg cursor-pointer border border-primary/20 hover:scale-[1.02] transition-transform"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Content</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-950/15 p-5 backdrop-blur-md">
        <div className="glass-noise" />
        <div className="glass-specular" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <h3 className="font-bold text-xs md:text-sm text-foreground flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-400 animate-bounce" /> Library Highlights (Most Viewed)
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-3">
            {mostViewed.length === 0 ? (
              <span className="text-xs text-muted-foreground">No metrics logs available.</span>
            ) : (
              mostViewed.map((c) => (
                <div key={c.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                  <div className="truncate text-xs">
                    <span className="font-bold text-foreground block truncate">{c.title}</span>
                    <span className="text-[10px] text-muted-foreground">{c.classroomName}</span>
                  </div>
                  <div className="flex gap-2 text-[10px] font-bold text-emerald-400 shrink-0">
                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {c.views}</span>
                    <span className="flex items-center gap-0.5"><Download className="w-3 h-3 text-indigo-400" /> {c.downloads}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Upload Sidebar vs Files List */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        
        {/* Sidebar filters (1 col wide) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Class Filters */}
          <div className="glass-panel border border-[var(--glass-border)] rounded-3xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col gap-4">
            <div className="glass-noise" />
            <h3 className="font-bold text-sm text-foreground">Filter by Classroom</h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setClassFilter("all")}
                className={cn(
                  "w-full text-left px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer",
                  classFilter === "all"
                    ? "bg-primary/10 border-primary/20 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                    : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5"
                )}
              >
                All Classrooms
              </button>
              {classrooms.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setClassFilter(c.id)}
                  className={cn(
                    "w-full text-left px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer truncate",
                    classFilter === c.id
                      ? "bg-primary/10 border-primary/20 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Files Listing (2 cols wide) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="glass-panel border border-[var(--glass-border)] rounded-2xl p-4 backdrop-blur-md relative overflow-hidden flex flex-wrap items-center gap-4 z-10">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search file name or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex gap-1.5 flex-wrap text-xs font-semibold">
              {[
                { id: "all", label: "All" },
                { id: "document", label: "Documents" },
                { id: "video", label: "Videos" },
                { id: "presentation", label: "Slides" },
                { id: "quiz", label: "Quizzes" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border transition-all cursor-pointer",
                    typeFilter === f.id
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Files grid */}
          {filteredContents.length === 0 ? (
            <div className="glass-panel border border-[var(--glass-border)] rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="glass-noise" />
              <div className="p-3 bg-white/5 rounded-full border border-white/10 text-muted-foreground">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h4 className="text-xs font-bold text-foreground">No resources uploaded</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Click Upload Content to publish reference materials, syllabus, or lecture worksheets.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredContents.map((c) => {
                let badgeColor = "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                if (c.type === "video") badgeColor = "bg-blue-500/15 text-blue-400 border-blue-500/30"
                else if (c.type === "presentation") badgeColor = "bg-rose-500/15 text-rose-400 border-rose-500/30"
                else if (c.type === "quiz") badgeColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"

                return (
                  <div
                    key={c.id}
                    className="glass-panel border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all flex justify-between items-center relative overflow-hidden gap-4"
                  >
                    <div className="glass-noise animate-pulse opacity-5" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-emerald-400 shrink-0">
                        {c.type === "video" ? <PlayCircle className="w-5 h-5 text-blue-400" /> : <FileText className="w-5 h-5 text-indigo-400" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs md:text-sm text-foreground line-clamp-1 leading-snug">{c.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                          {c.fileName} ({c.fileSize}) • <span className="text-emerald-400">{c.classroomName}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-sm mt-0.5">
                          {c.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10 shrink-0 select-none">
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0", badgeColor)}>
                        {c.type}
                      </span>
                      <button
                        onClick={() => handleDeleteContent(c.id)}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-all cursor-pointer"
                        title="Delete Material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* ────────────────────────────────────────────────────────
          UPLOAD DIALOG MODAL
          ──────────────────────────────────────────────────────── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-900/95 max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="glass-noise" />
            <div className="glass-specular" />

            <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-400" /> Upload Classroom Material
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isUploading ? (
              <div className="relative z-10 py-12 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                <div>
                  <span className="font-bold text-xs text-foreground block">Uploading files...</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{uploadProgress}% complete</span>
                </div>
                <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 mt-2">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : (
              <>
                <div className="relative z-10 flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Content Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Unit 3 Trees & Graphs Notes"
                      value={upTitle}
                      onChange={(e) => setUpTitle(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                    />
                  </div>

                  <div className="grid gap-3 grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-semibold">Select Classroom *</label>
                      <select
                        value={upClassId}
                        onChange={(e) => setUpClassId(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="" className="bg-slate-900 text-foreground">All Classrooms</option>
                        {classrooms.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-900 text-foreground">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted-foreground font-semibold">Content Type</label>
                      <select
                        value={upType}
                        onChange={(e) => setUpType(e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="document" className="bg-slate-900 text-foreground">Document (PDF/Doc)</option>
                        <option value="video" className="bg-slate-900 text-foreground">Video Session</option>
                        <option value="presentation" className="bg-slate-900 text-foreground">Slides (PPTX)</option>
                        <option value="quiz" className="bg-slate-900 text-foreground">Practice Quiz</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Enter a brief summary..."
                      value={upDesc}
                      onChange={(e) => setUpDesc(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full leading-relaxed"
                    />
                  </div>

                  {/* Drag drop area */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted-foreground font-semibold">Upload File *</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold",
                        selectedFile
                          ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
                          : dragActive
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-white/10 hover:border-emerald-500/20 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <UploadCloud className="w-7 h-7 text-indigo-400" />
                      {selectedFile ? (
                        <div className="truncate max-w-[250px]">
                          <span className="block truncate font-bold text-foreground">{selectedFile.name}</span>
                          <span className="text-[10px] text-muted-foreground">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                      ) : (
                        <span>Drag file or click to browse</span>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex justify-end gap-2.5 mt-2 shrink-0">
                  <button
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 bg-transparent text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={!upTitle.trim() || !selectedFile}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg"
                  >
                    Upload Material
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
