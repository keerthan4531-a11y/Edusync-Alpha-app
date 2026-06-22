export type ActivityType = "READING" | "LISTENING" | "WRITING" | "SPEAKING" | "VOCABULARY" | "AICHAT" | "CREATION";

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
