
export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  dueDate: string; // ISO string
  isCompleted: boolean;
  completedAt?: string; // ISO string
  priority: 'low' | 'medium' | 'high';
}

export interface StudyPlan {
  id: string;
  name: string;
  tasks: StudyTask[];
  createdAt: string;
}

export type ViewType = 'dashboard' | 'tasks' | 'stats' | 'upload';

export interface ProgressSnap {
  date: string;
  completed: number;
  total: number;
}
