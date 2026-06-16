"use client";

import { useState } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export function ResumeScorer() {
  const [file, setFile] = useState<File | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleScore = async () => {
    if (!file) return;
    setIsScoring(true);

    try {
      const res = await fetch("/api/ai/resume-scorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-3">
          <FileText className="text-stage4 w-6 h-6" />
          AI Resume Scorer
        </h2>
        <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">Check your resume's ATS alignment and readability metrics.</p>
      </div>

      {!result ? (
        <LiquidGlassCard className="p-6 space-y-6 animate-in fade-in duration-500" accentColor="#f59e0b">
          <div className="border-2 border-dashed border-stage4/30 hover:border-stage4/65 rounded-2xl p-8 text-center transition-colors">
            <Upload className="w-12 h-12 text-stage4 mx-auto mb-4 animate-bounce" />
            <p className="text-foreground font-semibold text-[15px] mb-1">Upload your resume for AI evaluation</p>
            <p className="text-[13px] text-zinc-500 dark:text-gray-400 mb-6 font-medium">PDF or Word document (Max 5MB)</p>
            
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <label
              htmlFor="resume-upload"
              className="bg-stage4/20 text-stage4 border border-stage4/30 px-6 py-3 rounded-xl cursor-pointer hover:bg-stage4/35 font-semibold text-sm transition-all shadow-sm"
            >
              {file ? file.name : "Select File"}
            </label>
          </div>

          <button
            onClick={handleScore}
            disabled={!file || isScoring}
            className="w-full bg-stage4 hover:bg-amber-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isScoring ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              "Get ATS Score"
            )}
          </button>
        </LiquidGlassCard>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <LiquidGlassCard className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6" accentColor="#f59e0b">
            <div className="text-center sm:border-r border-black/10 dark:border-white/10 sm:pr-8 shrink-0">
              <div className="text-[50px] font-semibold tracking-tight text-stage4 leading-none mb-1">{result.score}</div>
              <div className="text-[12px] text-zinc-500 dark:text-gray-500 uppercase tracking-wider font-bold">ATS Score</div>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-[17px] text-foreground">Evaluation Complete</h3>
              <p className="text-zinc-600 dark:text-gray-300 text-[15px] leading-relaxed">
                Your resume scored higher than 75% of similar engineering applicants. You earned <span className="text-stage4 font-bold">+{result.xpAwarded} XP</span>!
              </p>
            </div>
          </LiquidGlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiquidGlassCard className="p-6" accentColor="#10b981">
              <h4 className="font-semibold text-[17px] text-emerald-500 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5" /> Strengths
              </h4>
              <ul className="text-[15px] text-zinc-600 dark:text-gray-300 space-y-2.5">
                {result.strengths.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </LiquidGlassCard>
            
            <LiquidGlassCard className="p-6" accentColor="#f59e0b">
              <h4 className="font-semibold text-[17px] text-amber-500 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5" /> Recommendations
              </h4>
              <ul className="text-[15px] text-zinc-600 dark:text-gray-300 space-y-2.5">
                {result.recommendations.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </LiquidGlassCard>
          </div>

          <button
            onClick={() => {
              setResult(null);
              setFile(null);
            }}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-semibold py-3.5 rounded-xl transition-all text-sm"
          >
            Upload New Resume
          </button>
        </div>
      )}
    </div>
  );
}
