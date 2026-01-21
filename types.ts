
export type Role = 'teacher' | 'student';

export interface User {
  userId: string;
  role: Role;
  fullName: string;
  class?: number; // Only for students
  username: string;
}

export type QuestionType = 'grammar' | 'vocabulary' | 'cloze';

export interface Question {
  id: string;
  grade: number;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface TestDetail {
  questionId: string;
  userChoice: string;
  isCorrect: boolean;
}

export interface TestResult {
  resultId: string;
  studentId: string;
  grade: number;
  score: number;
  date: string;
  details: TestDetail[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppSettings {
  questionsPerTest: number;
}
