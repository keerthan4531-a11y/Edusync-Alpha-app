export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  earned: boolean;
  earnedAt?: string | null;
}

export interface StageProgress {
  stageNumber: number;
  stageName: string;
  status: string;
  completedAt?: string | null;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface SecuritySettings {
  email: boolean;
  push: boolean;
}

export interface ProfileData {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  xp?: number;
  coins?: number;
  level?: number;
  currentStreak?: number;
  longestStreak?: number;
  bio?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  department?: string;
  badges?: Badge[];
  stageProgress?: StageProgress[];
  activities?: Activity[];
  phone?: string;
  dob?: string;
  gender?: string;
  rollNumber?: string;
  yearOfStudy?: string;
  interests?: string[];
  careerGoals?: string[];
  weakAreas?: string[];
}
