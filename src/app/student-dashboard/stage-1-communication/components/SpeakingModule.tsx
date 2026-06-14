"use client";

import { useState } from "react";
import { Stage1ContentDTO } from "@/types/communication";
import { GlassCard } from "@/components/ui/glass-card";
import { useSpeaking } from "../hooks/useSpeaking";
import { Mic, Square, Type } from "lucide-react";

interface SpeakingModuleProps {
  content: Stage1ContentDTO | null;
  onFinish: () => void;
}

export function SpeakingModule({ content, onFinish }: SpeakingModuleProps) {
  const [useFallback, setUseFallback] = useState(false);
  
  const {
    transcribedText,
    setTranscribedText,
    startRecording,
    stopRecording,
    isRecording,
    submitSpeaking,
    isSubmitting,
    result,
    error,
  } = useSpeaking(content);

  if (!content) {
    return (
      <GlassCard className="p-8 text-center text-gray-400">
        No speaking challenges available right now.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-stage1 mb-2">{content.title}</h2>
        <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
          <p className="text-gray-200 text-2xl font-medium leading-relaxed">
            "{content.content}"
          </p>
        </div>
      </GlassCard>

      {!result ? (
        <GlassCard className="p-6 border-stage1/20 flex flex-col items-center">
          
          <div className="w-full flex justify-end mb-4">
            <button 
              onClick={() => setUseFallback(!useFallback)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Type className="w-4 h-4" />
              {useFallback ? "Use Microphone" : "Keyboard Fallback"}
            </button>
          </div>

          {useFallback ? (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type what you would have said (Fallback Mode)
              </label>
              <textarea
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-stage1 transition-all resize-none"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 my-4 w-full">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSubmitting}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.5)]" 
                    : "bg-stage1/20 hover:bg-stage1/40 border-2 border-stage1/50"
                }`}
              >
                {isRecording ? (
                  <Square className="w-12 h-12 text-white" fill="currentColor" />
                ) : (
                  <Mic className="w-14 h-14 text-stage1" />
                )}
              </button>
              
              <p className="text-gray-400 font-medium">
                {isRecording ? "Recording... Click to stop." : "Click to start speaking"}
              </p>

              {transcribedText && (
                <div className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-gray-300">
                  <span className="text-sm text-stage1 font-medium block mb-1">Heard:</span>
                  {transcribedText}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="w-full mt-4 text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          <button
            onClick={submitSpeaking}
            disabled={isSubmitting || transcribedText.trim().length < 2}
            className="w-full mt-6 py-3 rounded-xl bg-stage1 text-white font-semibold text-lg hover:bg-stage1/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI is analyzing speech...
              </>
            ) : (
              "Submit Speech"
            )}
          </button>
        </GlassCard>
      ) : (
        <GlassCard className="p-6 border-stage1 bg-stage1/5">
          <h3 className="text-2xl font-bold text-white mb-4">Pronunciation Feedback</h3>
          
          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-stage1 font-semibold mb-2">Coach's Notes</h4>
              <p className="text-gray-200">{result.evaluation.feedback}</p>
              <p className="text-gray-400 text-sm mt-2">{result.evaluation.tamilFeedback}</p>
            </div>

            {result.evaluation.mispronouncedWords?.length > 0 ? (
              <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <h4 className="text-orange-400 font-semibold mb-2">Words to Practice</h4>
                <div className="flex flex-wrap gap-2">
                  {result.evaluation.mispronouncedWords.map((word: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-black/40 border border-orange-500/30 rounded-lg text-orange-200 text-sm">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <p className="text-green-400 font-medium">Perfect pronunciation! No missed words detected.</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <span className="px-4 py-2 rounded-full bg-stage1/20 text-stage1 font-semibold text-lg">
              Accuracy: {result.score}%
            </span>
            <span className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-500 font-semibold text-lg">
              +{result.xpAwarded} XP
            </span>
            <div className="flex-1" />
            <button
              onClick={onFinish}
              className="px-8 py-3 rounded-xl bg-stage1 text-white font-medium hover:bg-stage1/80 transition-colors"
            >
              Finish Stage 1
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
