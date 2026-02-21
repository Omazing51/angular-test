import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../models/task.model';

export interface TaskStoreState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initial: TaskStoreState = {
  tasks: [],
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  private readonly stateSubject = new BehaviorSubject<TaskStoreState>(initial);
  readonly state$ = this.stateSubject.asObservable();

  get snapshot(): TaskStoreState {
    return this.stateSubject.value;
  }

  setLoading(loading: boolean) {
    this.stateSubject.next({ ...this.snapshot, loading });
  }

  setError(error: string | null) {
    this.stateSubject.next({ ...this.snapshot, error });
  }

  setTasks(tasks: Task[]) {
    this.stateSubject.next({ ...this.snapshot, tasks });
  }
}
