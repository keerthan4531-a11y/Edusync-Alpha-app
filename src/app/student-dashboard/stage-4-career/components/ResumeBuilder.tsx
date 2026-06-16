"use client";

import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { FileDown, Edit3, Briefcase, GraduationCap, Code, Award, Loader2, Check } from "lucide-react";
import { ResumeData } from "@/types/career";

const TEMPLATES = [
  { id: "minimal", name: "Minimalist Classic", desc: "Clean typography with structured columns." },
  { id: "modern", name: "Modern Professional", desc: "Sleek margins with bold titles." },
  { id: "creative", name: "Creative Designer", desc: "Centered profile alignment with modern borders." }
]

export function ResumeBuilder() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");

  useEffect(() => {
    const loadData = async () => {
      // Simulate network load
      await new Promise(r => setTimeout(r, 800));
      
      setData({
        user: { name: "John Doe", email: "student@example.com", department: "Computer Science" },
        education: [
          { institution: "EduSync Engineering College", degree: "B.Tech in Computer Science", year: "2024-2028", gpa: "8.5" }
        ],
        skills: ["JavaScript", "React", "Next.js", "TypeScript", "Tailwind CSS", "Python"],
        projects: [
          { name: "Edusync Platform", description: "A gamified learning management system built with Next.js and Tailwind." },
          { name: "Portfolio Website", description: "Personal portfolio showcasing frontend projects and achievements." }
        ],
        certifications: [
          { name: "Master of Loops", issuer: "EduSync Stage 2", date: "2026-05-15" },
          { name: "Clean Coder", issuer: "EduSync Stage 2", date: "2026-06-01" }
        ]
      });
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading || !data) {
    return (
      <LiquidGlassCard className="p-12 flex flex-col items-center justify-center min-h-[400px]" accentColor="#f59e0b">
        <Loader2 className="w-10 h-10 text-stage4 animate-spin mb-4" />
        <p className="text-[15px] text-zinc-400">Aggregating your profile achievements...</p>
      </LiquidGlassCard>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-foreground">Resume Builder</h2>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400">Auto-generated from your verified course progress & certifications.</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-stage4 hover:bg-amber-500 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm shrink-0 w-full sm:w-auto justify-center"
          onClick={() => window.print()}
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Template Chooser */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TEMPLATES.map(tmpl => {
          const isSelected = selectedTemplate === tmpl.id
          return (
            <LiquidGlassCard 
              key={tmpl.id} 
              onClick={() => setSelectedTemplate(tmpl.id)}
              className={`p-4 border cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 ${
                isSelected ? "border-amber-500/20 bg-amber-500/[0.03]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected 
                    ? "bg-amber-500 border-amber-500 text-white" 
                    : "border-zinc-400 dark:border-gray-600"
                } shrink-0`}>
                  {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-foreground">{tmpl.name}</h4>
                  <p className="text-[12px] text-zinc-500 dark:text-gray-400">{tmpl.desc}</p>
                </div>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>

      {/* A4 Preview Container */}
      <LiquidGlassCard 
        className="p-8 md:p-12 bg-white text-zinc-900 border border-white/50 shadow-xl shadow-black/5 w-full max-w-4xl mx-auto overflow-hidden relative group font-sans leading-relaxed"
        style={{ color: "#18181b" }}
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
          <button className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-600">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Header */}
        <div className={`border-b-2 border-zinc-200 pb-6 mb-6 ${selectedTemplate === "creative" ? "text-left" : "text-center"}`}>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">{data.user.name}</h1>
          <p className="text-zinc-500 text-[14px] flex items-center justify-center sm:justify-start gap-4 flex-wrap">
            <span className="font-semibold">{data.user.email}</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-semibold">{data.user.department} Major</span>
          </p>
        </div>

        <div className={`grid ${selectedTemplate === "minimal" ? "grid-cols-1 md:grid-cols-3 gap-8" : "grid-cols-1 gap-6"}`}>
          
          {/* Main Content */}
          <div className={`${selectedTemplate === "minimal" ? "md:col-span-2" : ""} space-y-6`}>
            <section>
              <h3 className="text-lg font-bold text-zinc-800 border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-zinc-400" /> Education
              </h3>
              {data.education.map((edu, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-zinc-800">{edu.institution}</h4>
                    <span className="text-zinc-500 text-sm whitespace-nowrap">{edu.year}</span>
                  </div>
                  <p className="text-zinc-600 text-sm">{edu.degree}</p>
                  {edu.gpa && <p className="text-zinc-400 text-xs mt-1">GPA: {edu.gpa} / 10</p>}
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-lg font-bold text-zinc-800 border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-zinc-400" /> Academic Projects
              </h3>
              {data.projects.map((proj, idx) => (
                <div key={idx} className="mb-4">
                  <h4 className="font-bold text-zinc-800 mb-1">{proj.name}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </section>
          </div>

          {/* Sidebar or Side Column */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-bold text-zinc-800 border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-zinc-400" /> Verified Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, idx) => (
                  <span key={idx} className="bg-zinc-100 text-zinc-700 px-3 py-1 rounded-lg text-xs font-semibold border border-zinc-200 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-zinc-800 border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-zinc-400" /> Verified Achievements
              </h3>
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="mb-3">
                  <h4 className="font-bold text-zinc-700 text-sm">{cert.name}</h4>
                  <p className="text-zinc-400 text-xs font-medium">{cert.issuer} • {cert.date}</p>
                </div>
              ))}
            </section>
          </div>
        </div>

      </LiquidGlassCard>
    </div>
  );
}
