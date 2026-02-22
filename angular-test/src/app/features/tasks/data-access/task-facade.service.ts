import { inject, Injectable } from '@angular/core';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';
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
  readonly page$ = this.state$.pipe(map(s => s.page));
  readonly pageSize$ = this.state$.pipe(map(s => s.pageSize));
  readonly total$ = this.state$.pipe(map(s => s.total));
  readonly totalPages$ = this.state$.pipe(
    map(s => Math.max(1, Math.ceil(s.total / s.pageSize)))
  );

  loadPage(page: number) {
    const { pageSize } = this.store.snapshot;

    this.store.setLoading(true);
    this.store.setError(null);
    this.store.setPage(page);

    return this.api.getTasks(page, pageSize).pipe(
      tap(res => this.store.setTasks(res.data, res.total)),
      catchError(() => {
        this.store.setError('No fue posible cargar las tareas.');
        this.store.setTasks([], 0);
        return of({ data: [] as Task[], total: 0 });
      }),
      finalize(() => this.store.setLoading(false))
    );
  }

  refreshCurrentPage() {
    return this.loadPage(this.store.snapshot.page);
  }

  markCompleted(task: Task) {
    this.store.setLoading(true);
    return this.api.patchTask(task.id, { completed: true }).pipe(
      switchMap(() => this.refreshCurrentPage()),
      catchError(() => {
        this.store.setError('No fue posible completar la tarea.');
        return of(null);
      }),
      finalize(() => this.store.setLoading(false))
    );
  }

  deleteTask(id: string) {
    this.store.setLoading(true);
    return this.api.deleteTask(id).pipe(
      switchMap(() => {
        // Si borraste el último item de la página, retrocede una página si aplica
        const { page, pageSize, total } = this.store.snapshot;
        const remainingAfterDelete = Math.max(0, total - 1);
        const totalPagesAfter = Math.max(1, Math.ceil(remainingAfterDelete / pageSize));
        const nextPage = Math.min(page, totalPagesAfter);
        return this.loadPage(nextPage);
      }),
      catchError(() => {
        this.store.setError('No fue posible eliminar la tarea.');
        return of(null);
      }),
      finalize(() => this.store.setLoading(false))
    );
  }

  createTask(payload: Omit<Task, 'id'>) {
    this.store.setLoading(true);
    this.store.setError(null);

    return this.api.createTask(payload).pipe(
      switchMap(() => this.loadPage(1)),
      catchError(() => {
        this.store.setError('No fue posible crear la tarea.');
        return of(null);
      }),
      finalize(() => this.store.setLoading(false))
    );
  }

getTaskById(id: string) {
  return this.api.getTask(id).pipe(
    catchError(() => of(null))
  );
}

  updateTask(id: string, payload: Task) {
    this.store.setLoading(true);
    this.store.setError(null);

    return this.api.updateTask(id, payload).pipe(
      switchMap(updated => this.refreshCurrentPage().pipe(map(() => updated))),
      catchError(() => {
        this.store.setError('No fue posible actualizar la tarea.');
        return of(null);
      }),
      finalize(() => this.store.setLoading(false))
    );
  }
}