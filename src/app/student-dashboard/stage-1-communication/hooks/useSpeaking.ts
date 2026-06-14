import { useState, useRef } from "react";
import { Stage1ContentDTO } from "@/types/communication";

export function useSpeaking(content: Stage1ContentDTO | null) {
  const [transcribedText, setTranscribedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    setError(null);
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Speech recognition is not supported in this browser. Please use the text fallback.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscribedText(prev => prev + ' ' + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        setError(`Microphone error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e: any) {
      setError("Failed to start microphone: " + e.message);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitSpeaking = async () => {
    if (!content) return;
    
    if (transcribedText.trim().length < 2) {
      setError("Transcription is empty. Please try speaking again or use the text fallback.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        contentId: content.id,
        transcribedText: transcribedText.trim()
      };

      const res = await fetch("/api/communication/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to evaluate speech");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setTranscribedText("");
    setResult(null);
    setError(null);
    stopRecording();
  };

  return {
    transcribedText,
    setTranscribedText,
    startRecording,
    stopRecording,
    isRecording,
    submitSpeaking,
    isSubmitting,
    result,
    error,
    reset,
  };
}
