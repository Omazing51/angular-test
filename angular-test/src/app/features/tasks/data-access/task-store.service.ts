import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../models/task.model';

export interface TaskStoreState {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initial: TaskStoreState = {
  tasks: [],
  total: 0,
  page: 1,
  pageSize: 5,
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

  patch(partial: Partial<TaskStoreState>) {
    this.stateSubject.next({ ...this.snapshot, ...partial });
  }

  setLoading(loading: boolean) {
    this.patch({ loading });
  }

  setError(error: string | null) {
    this.patch({ error });
  }

  setPage(page: number) {
    this.patch({ page });
  }

  setTasks(tasks: Task[], total: number) {
    this.patch({ tasks, total });
  }
}