// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: User;
  thumbnail?: string;
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  rating: number;
  studentsEnrolled: number;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

// Lesson types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  isCompleted?: boolean;
  resources?: Resource[];
}

// Resource types
export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
}

// Enrollment types
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // percentage
  enrolledAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}