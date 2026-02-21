import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
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
    const params = new HttpParams()
      .set('_page', page)
      .set('_limit', limit);

    return this.http
      .get<Task[]>(`${this.base}/tasks`, { params, observe: 'response' })
      .pipe(
        map((res: HttpResponse<Task[]>) => {
          const total = Number(res.headers.get('X-Total-Count') ?? 0);
          return { data: res.body ?? [], total };
        })
      );
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.base}/tasks/${id}`);
  }

  createTask(payload: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(`${this.base}/tasks`, payload);
  }

  updateTask(id: number, payload: Task): Observable<Task> {
    return this.http.put<Task>(`${this.base}/tasks/${id}`, payload);
  }

  patchTask(id: number, payload: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.base}/tasks/${id}`, payload);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/tasks/${id}`);
  }

  getStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.base}/states`);
  }
}