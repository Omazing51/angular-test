export interface TaskStateHistoryItem {
  state: string;
  date: string; 
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  stateHistory: TaskStateHistoryItem[];
  notes: string[];
}

export interface State {
  id: string; 
  name: string;
}
