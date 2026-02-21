export interface TaskStateHistoryItem {
  state: string;
  date: string; 
}

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  stateHistory: TaskStateHistoryItem[];
  notes: string[];
}

export interface State {
  id: number; 
  name: string;
}
