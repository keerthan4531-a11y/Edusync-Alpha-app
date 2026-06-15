"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { FileDown, Edit3, Briefcase, GraduationCap, Code, Award, Loader2 } from "lucide-react";
import { ResumeData } from "@/types/career";

export function ResumeBuilder() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation we would fetch this from an API endpoint 
    // that calls `generateResumeData` from `lib/career-service.ts`.
    // For now we'll simulate the data load to match the flow.
    const loadData = async () => {
      // Simulate network
      await new Promise(r => setTimeout(r, 1000));
      
      setData({
        user: { name: "Student User", email: "student@example.com", department: "Computer Science" },
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
      <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-stage4 animate-spin mb-4" />
        <p className="text-zinc-400">Aggregating your profile data...</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Resume Builder</h2>
          <p className="text-zinc-400">Auto-generated from your platform achievements</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-stage4 text-black font-semibold px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors"
          onClick={() => window.print()}
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* A4 Preview Container */}
      <GlassCard className="p-8 md:p-12 bg-white text-black print:p-0 print:border-none print:shadow-none print:bg-white print:m-0 print:max-w-none w-full max-w-4xl mx-auto overflow-hidden relative group">
        
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
          <button className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-600">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Header */}
        <div className="border-b-2 border-zinc-200 pb-6 mb-6 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-2">{data.user.name}</h1>
          <p className="text-zinc-600 flex items-center justify-center gap-4">
            <span>{data.user.email}</span>
            <span>•</span>
            <span>{data.user.department}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-zinc-400" /> Education
              </h3>
              {data.education.map((edu, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-zinc-800">{edu.institution}</h4>
                    <span className="text-zinc-500 text-sm whitespace-nowrap">{edu.year}</span>
                  </div>
                  <p className="text-zinc-700">{edu.degree}</p>
                  {edu.gpa && <p className="text-zinc-500 text-sm mt-1">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-zinc-400" /> Projects
              </h3>
              {data.projects.map((proj, idx) => (
                <div key={idx} className="mb-4">
                  <h4 className="font-bold text-zinc-800 mb-1">{proj.name}</h4>
                  <p className="text-zinc-600 text-sm leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-zinc-400" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, idx) => (
                  <span key={idx} className="bg-zinc-100 text-zinc-700 px-3 py-1 rounded-md text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-zinc-400" /> Achievements
              </h3>
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="mb-3">
                  <h4 className="font-medium text-zinc-800 text-sm">{cert.name}</h4>
                  <p className="text-zinc-500 text-xs">{cert.issuer} • {cert.date}</p>
                </div>
              ))}
            </section>
          </div>
        </div>

      </GlassCard>
    </div>
  );
}
