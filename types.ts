
export type SubjectType = 'Math' | 'Physics' | 'Chemistry' | 'Economics' | 'Biology' | 'English' | 'Spanish' | 'Computer Science';

export interface StudySettings {
  daysPerWeek: number;
  hoursPerDay: number;
  subjectsPerDay: number;
  completionDays: number;
  startDate: string;
  subjectImportance: Record<string, number>; // 1 to 5
}

export interface StudyTask {
  id: string;
  subject: SubjectType;
  topic: string;
  week: number;
  day: number; // 0-6
  isCompleted: boolean;
  duration?: number; // hours
  // Added to track completion time for stats/streaks
  completedAt?: string;
  // Added to handle priority levels used in Dashboard and TaskTracker
  priority: 'low' | 'medium' | 'high';
  // Added to handle actual date scheduling used in Dashboard and TaskTracker
  dueDate: string;
}

export type ViewType = 'setup' | 'upload' | 'timetable' | 'stats' | 'tasks';

export interface WeeklyPlan {
  weekNumber: number;
  days: {
    dayIndex: number; // 0-6
    tasks: StudyTask[];
  }[];
}
