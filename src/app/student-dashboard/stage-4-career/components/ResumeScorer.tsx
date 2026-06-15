"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
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
      // TODO: AI INTEGRATION POINT
      // In real app, we'd use formData to upload the PDF.
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
    <GlassCard className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <FileText className="text-stage4" />
        AI Resume Scorer
      </h2>

      {!result ? (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-stage4/30 rounded-xl p-8 text-center hover:border-stage4/60 transition-colors">
            <Upload className="w-12 h-12 text-stage4 mx-auto mb-4" />
            <p className="text-zinc-300 mb-2">Upload your resume for AI evaluation</p>
            <p className="text-sm text-zinc-500 mb-6">PDF or Word document (Max 5MB)</p>
            
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <label
              htmlFor="resume-upload"
              className="bg-stage4/20 text-stage4 px-6 py-2 rounded-lg cursor-pointer hover:bg-stage4/30 font-medium transition-colors"
            >
              {file ? file.name : "Select File"}
            </label>
          </div>

          <button
            onClick={handleScore}
            disabled={!file || isScoring}
            className="w-full bg-stage4 text-black font-semibold py-3 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-6 p-6 bg-stage4/10 rounded-xl border border-stage4/20">
            <div className="text-center">
              <div className="text-5xl font-bold text-stage4 mb-1">{result.score}</div>
              <div className="text-sm text-zinc-400">ATS Score</div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-white mb-2">Evaluation Complete</h3>
              <p className="text-zinc-300 text-sm">
                Your resume scored higher than 75% of applicants. You earned <span className="text-stage4 font-bold">+{result.xpAwarded} XP</span>!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Strengths
              </h4>
              <ul className="space-y-2">
                {result.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Recommendations
              </h4>
              <ul className="space-y-2">
                {result.recommendations.map((r: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => {
              setResult(null);
              setFile(null);
            }}
            className="w-full bg-white/10 text-white font-semibold py-3 rounded-lg hover:bg-white/20 transition-colors"
          >
            Upload New Resume
          </button>
        </div>
      )}
    </GlassCard>
  );
}
