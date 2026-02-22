import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, map, Observable, throwError, timeout, tap } from 'rxjs';
import { State, Task } from '../models/task.model';

export interface PagedResult<T> {
  data: T[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

getTasks(page: number, limit: number): Observable<PagedResult<Task>> {
  return this.http.get<Task[]>(`${this.base}/tasks`).pipe(
    map((all) => {
      const total = all.length;
      const start = (page - 1) * limit;
      const data = all.slice(start, start + limit);
      return { data, total };
    })
  );
}

  getTask(id: string) {
  const url = `${this.base}/tasks/${id}`;
  console.log('[API] GET', url);
  return this.http.get<Task>(url).pipe(
    tap({
      next: (t) => console.log('[API] OK', t),
      error: (e) => console.log('[API] FAIL', e),
    })
  );
}

createTask(payload: Omit<Task, 'id'>): Observable<Task> {
  return this.http.post<Task>(`${this.base}/tasks`, payload);
}
updateTask(id: string, payload: Task) {
  return this.http.put<Task>(`${this.base}/tasks/${id}`, payload);
}

patchTask(id: string, payload: Partial<Task>) {
  return this.http.patch<Task>(`${this.base}/tasks/${id}`, payload);
}

deleteTask(id: string) {
  return this.http.delete<void>(`${this.base}/tasks/${id}`);
}

  getStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.base}/states`);
  }
}