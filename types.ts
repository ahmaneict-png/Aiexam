
export enum AppView {
  HOME,
  TEACHER_AUTH,
  TEACHER_PANEL,
  STUDENT_PANEL,
  UPLOADING,
  TAKING_EXAM,
  VIEWING_REPORT,
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT_INPUT = 'TEXT_INPUT',
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface Question {
  id: number;
  questionText: string;
  contextText?: string;
  options?: string[];
  type: QuestionType;
  subject?: string;
  
  // Fields for visual context (Passages, Poems, Ads)
  pageIndex?: number;
  contextBox?: BoundingBox;
  diagramBox?: BoundingBox;
  optionsDiagramBoxes?: BoundingBox[];
  
  // Resulting crop URLs
  contextUrl?: string;
  diagramUrl?: string;
  optionsUrls?: string[];
}

export interface Exam {
  id: string;
  title: string;
  timestamp: number;
  questions: Question[];
}

export type StudentAnswers = Record<number, string>;

export interface GradedQuestion extends Question {
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  feedback: string;
}

export interface GradingReport {
  examId: string;
  examTitle: string;
  studentName: string;
  overallScore: number;
  summary: string;
  gradedQuestions: GradedQuestion[];
}
