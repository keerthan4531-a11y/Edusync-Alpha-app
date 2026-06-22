export type ActivityType = "READING" | "LISTENING" | "LISTENING_FILL" | "LISTENING_DIRECTIONS" | "LISTENING_TONE" | "WRITING" | "WRITING_IMAGE" | "WRITING_REWRITE" | "SPEAKING" | "SPEAKING_SHADOW" | "SPEAKING_ANALYZER" | "VOCABULARY" | "AICHAT" | "CREATION";

export interface Question {
  id: number;
  question: string;
  options?: string[];
  correctIndex?: number;
}

export interface Stage1ContentDTO {
  id: string;
  type: ActivityType;
  title: string;
  content: string;
  questions: any;
  difficulty: string;
  imagePrompt?: string | null;
  banned?: string[] | null;
  hints?: any | null;
  bulletPoints?: string[] | null;
  gridSize?: number | null;
  start?: any | null;
  end?: any | null;
  landmarks?: any | null;
  correctPath?: any | null;
}

export interface EvaluateRequest {
  contentId: string;
  answers: {
    questionId: number;
    answerIndex?: number;
    answerText?: string;
  }[];
}

export interface EvaluateResponse {
  success: boolean;
  score: number;
  xpAwarded: number;
  feedback: string;
  tamilFeedback?: string;
  error?: string;
  code?: string;
}
