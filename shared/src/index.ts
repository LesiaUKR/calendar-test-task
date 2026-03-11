export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const ALLOWED_LABEL_COLORS = [
  '#34d399',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#ef4444',
] as const;

export type LabelColor = (typeof ALLOWED_LABEL_COLORS)[number];

export interface Task {
  id: string;
  title: string;
  date: string;
  order: number;
  labels: string[];
  priority?: Priority;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
}

export type CreateTaskDto = Pick<Task, 'title' | 'date' | 'order'> & {
  labels?: string[];
  priority?: Priority;
  description?: string;
};

export type UpdateTaskDto = Partial<Omit<CreateTaskDto, 'date' | 'order'>> & {
  date?: string;
  order?: number;
};

export type ReorderItem = Pick<Task, 'id' | 'order' | 'date'>;
