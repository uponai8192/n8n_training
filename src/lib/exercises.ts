export type Step = {
  title: string;
  content: string;
  tip?: string;
  warning?: string;
  code?: string;
  codeLanguage?: string;
};

export type ExerciseTool = {
  name: string;
  description: string;
  docUrl?: string;
};

export type ExerciseContent = {
  overview: string;
  objectives: string[];
  prerequisites: string[];
  estimatedTime: string;
  tools: ExerciseTool[];
  steps: Step[];
  aiTips: string[];
  testingGuide: string;
  nextSteps: string;
};

export type ExerciseRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  order: number;
  tags: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export function parseExerciseContent(contentJson: string): ExerciseContent {
  return JSON.parse(contentJson) as ExerciseContent;
}

export const DIFFICULTY_CONFIG = {
  BEGINNER: { label: "Beginner", color: "bg-emerald-100 text-emerald-800", order: 1 },
  INTERMEDIATE: { label: "Intermediate", color: "bg-blue-100 text-blue-800", order: 2 },
  ADVANCED: { label: "Advanced", color: "bg-orange-100 text-orange-800", order: 3 },
  EXPERT: { label: "Expert", color: "bg-red-100 text-red-800", order: 4 },
} as const;
