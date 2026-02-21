import { inject, Injectable } from '@angular/core';
import { catchError, finalize, map, of, tap } from 'rxjs';
import { TaskApiService } from './task-api.service';
import { TaskStoreService } from './task-store.service';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskFacade {
  private api = inject(TaskApiService);
  private store = inject(TaskStoreService);

  readonly state$ = this.store.state$;
  readonly tasks$ = this.state$.pipe(map(s => s.tasks));
  readonly loading$ = this.state$.pipe(map(s => s.loading));
  readonly error$ = this.state$.pipe(map(s => s.error));

  loadTasks(page?: number, limit?: number) {
    this.store.setLoading(true);
    this.store.setError(null);

    return this.api.getTasks(page, limit).pipe(
      tap(tasks => this.store.setTasks(tasks)),
      catchError(err => {
        this.store.setError('No fue posible cargar las tareas.');
        return of([] as Task[]);
      }),
      finalize(() => this.store.setLoading(false))
    );
  }

  markCompleted(task: Task) {
    return this.api.patchTask(task.id, { completed: true });
  }

  deleteTask(id: number) {
    return this.api.deleteTask(id);
  }

  createTask(payload: Omit<Task, 'id'>) {
    return this.api.createTask(payload);
  }
}
