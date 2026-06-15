export interface AptitudeQuestionDTO {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface AptitudeTestDTO {
  id: string;
  title: string;
  description: string;
  category: "QUANTITATIVE" | "LOGICAL" | "VERBAL" | string;
  questions: AptitudeQuestionDTO[];
  timeLimit: number; // in minutes
}

export interface ResumeData {
  user: {
    name: string;
    email: string;
    department?: string;
  };
  education: {
    institution: string;
    degree: string;
    year: string;
    gpa?: string;
  }[];
  skills: string[];
  projects: {
    name: string;
    description: string;
    url?: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
}

export interface ResumeScoreResult {
  score: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface InterviewEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
}
