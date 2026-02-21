import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { State, Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getTasks(page?: number, limit?: number): Observable<Task[]> {
    let params = new HttpParams();
    if (page && limit) {
      params = params.set('_page', page).set('_limit', limit);
    }
    return this.http.get<Task[]>(`${this.base}/tasks`, { params });
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
