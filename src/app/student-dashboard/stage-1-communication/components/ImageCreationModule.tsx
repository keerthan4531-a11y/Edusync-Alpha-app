"use client";

import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Loader2, Image as ImageIcon, Send, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

const SCENE_PROMPTS = [
  "A futuristic city with flying cars at sunset, highly detailed",
  "A golden retriever playing in a sunny park with a red frisbee",
  "An astronaut drinking coffee on the moon looking at earth",
  "A cozy cabin in the snowy mountains with smoke coming from the chimney",
  "A cyberpunk street market in Tokyo during rain",
  "A giant sea turtle swimming over a colorful coral reef",
  "A magical library with floating books and glowing crystals",
  "A medieval knight fighting a dragon near a volcano"
];

export function ImageCreationModule() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const loadNewImage = () => {
    const randomPrompt = SCENE_PROMPTS[Math.floor(Math.random() * SCENE_PROMPTS.length)];
    setCurrentPrompt(randomPrompt);
    setImageUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(randomPrompt)}?width=800&height=500&nologo=true&seed=${Math.floor(Math.random() * 1000)}`);
    setDescription("");
    setResult(null);
    setError("");
  };

  useEffect(() => {
    loadNewImage();
  }, []);

  const handleEvaluate = async () => {
    if (!description || description.trim().length < 5) {
      setError("Please write a longer description (at least 5 characters).");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/communication/evaluate-picture-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userDescription: description, actualPrompt: currentPrompt }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to evaluate description.");
      }
    } catch (e) {
      setError("Network error occurred.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-2">
            <ImageIcon className="text-stage1 w-6 h-6" />
            Picture Description
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">
            Look at the AI-generated picture and describe what you see in English. AI will evaluate your grammar and accuracy!
          </p>
        </div>
        <button 
          onClick={loadNewImage}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Next Picture
        </button>
      </div>

      <LiquidGlassCard className="p-6 space-y-6" accentColor="#8b5cf6">
        
        {/* Image Display */}
        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 relative">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="AI Generated Scene"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-stage1 animate-spin" />
            </div>
          )}
        </div>

        {/* User Input */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Describe what is happening in this picture:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || result !== null}
            placeholder="E.g., In this picture, I can see a futuristic city..."
            className="w-full h-32 p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-stage1 text-[15px] text-foreground resize-none disabled:opacity-50"
          />
          {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4"/>{error}</p>}
        </div>

        {!result ? (
          <button
            onClick={handleEvaluate}
            disabled={loading || description.length < 5}
            className="w-full flex items-center justify-center gap-2 bg-stage1 hover:bg-purple-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Evaluating your English...</>
            ) : (
              <><Send className="w-5 h-5" /> Submit Description</>
            )}
          </button>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold text-foreground">AI Feedback</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-zinc-600 dark:text-gray-300">Your Score</span>
                  <span className="text-emerald-500 font-bold text-xl">{result.score}%</span>
                </div>
                <p className="text-[14px] text-foreground font-medium mb-3">
                  {result.feedback}
                </p>
                <div className="pt-3 border-t border-emerald-500/20">
                  <span className="text-xs font-semibold text-zinc-500 block mb-1">Tamil Explanation:</span>
                  <p className="text-[13px] text-zinc-700 dark:text-gray-300 font-medium">
                    {result.tamilFeedback}
                  </p>
                </div>
              </div>

              <div className="bg-stage1/10 border border-stage1/20 p-5 rounded-2xl flex flex-col justify-center">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">How a Native Speaker Would Say It:</span>
                <p className="text-[15px] text-foreground font-medium italic">
                  "{result.improvedVersion}"
                </p>
              </div>
            </div>

            <button
              onClick={loadNewImage}
              className="w-full flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-semibold px-6 py-3.5 rounded-xl transition-all border border-black/10 dark:border-white/10"
            >
              Try Another Picture
            </button>
          </div>
        )}
      </LiquidGlassCard>
    </div>
  );
}
