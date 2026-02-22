import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, timeout, tap } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { TaskApiService } from '../../data-access/task-api.service';
import { TaskFacade } from '../../data-access/task-facade.service';
import { State, Task, TaskStateHistoryItem } from '../../models/task.model';
import {
  TaskFormComponent,
  TaskFormValue,
} from '../../components/task-form/task-form.component';
import { TaskStateManagerComponent } from '../../components/task-state-manager/task-state-manager.component';

@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, TaskStateManagerComponent],
  templateUrl: './task-detail-page.component.html',
  styleUrl: './task-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(TaskApiService); // solo para states
  private facade = inject(TaskFacade);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  task: Task | null = null;
  states: State[] = [];

  error$ = this.facade.error$;

loading = true;
statesLoading = true;
error = false;

constructor() {
  console.log('[DETAIL] constructor');
}

ngOnInit(): void {
  console.log('%c[DETAIL] ngOnInit START', 'background: #222; color: #bada55; padding: 2px 6px');

  const id = this.route.snapshot.paramMap.get('id');
  console.log('[DETAIL] id =', id);

  if (!id) {
    console.log('[DETAIL] NO ID -> navigate /tasks');
    this.router.navigateByUrl('/tasks');
    return;
  }
  this.statesLoading = true;
this.cdr.markForCheck();

this.api.getStates().pipe(
  timeout(8000),
  finalize(() => {
    this.statesLoading = false;
    this.cdr.markForCheck();
  }),
  takeUntilDestroyed(this.destroyRef),
).subscribe({
  next: (s) => {
    this.states = s ?? [];
    this.cdr.markForCheck();
  },
  error: (err) => {
    console.error('[DETAIL] getStates error:', err);
    this.states = [];
    // finalize apaga statesLoading
  },
});
this.loading = true;
this.cdr.markForCheck();

this.facade.getTaskById(id).pipe(
  timeout(8000),
  finalize(() => {
    this.loading = false;
    this.cdr.markForCheck();   // 👈 fuerza refresco
  }),
  takeUntilDestroyed(this.destroyRef),
).subscribe({
  next: (t) => {
    if (!t) {
      this.router.navigateByUrl('/tasks');
      return;
    }
    this.task = t;
    this.cdr.markForCheck();   
  },
  error: () => {
    this.router.navigateByUrl('/tasks');
  }
});
}

  onSubmit(payload: TaskFormValue) {
    console.log('[Detail] received payload', payload);
    if (!this.task) return;

    const nextHistory: TaskStateHistoryItem[] = [
      ...(this.task.stateHistory ?? []),
      ...(payload.stateHistory ?? []),
    ];

    const updated: Task = {
      ...this.task,
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate,
      completed: payload.completed,
      notes: payload.notes,
      stateHistory: nextHistory,
    };

    this.facade
      .updateTask(this.task.id, updated)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (t) => {
          if (t) this.task = t;
           this.router.navigateByUrl('/tasks');
        },
        error: (err) => {
          console.error('[DETAIL] updateTask error:', err);
          alert('No fue posible actualizar la tarea.');
        },
      });
  }

  onCancel() {
    this.router.navigateByUrl('/tasks');
  }

  onDelete() {
    if (!this.task) return;
    const ok = confirm('¿Seguro que deseas eliminar esta tarea?');
    if (!ok) return;

    this.facade
      .deleteTask(this.task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigateByUrl('/tasks'),
        error: (err) => {
          console.error('[DETAIL] deleteTask error:', err);
        },
      });
  }

  onAddState(ev: { state: string }) {
    if (!this.task) return;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const updated: Task = {
      ...this.task,
      stateHistory: [
        ...(this.task.stateHistory ?? []),
        { state: ev.state, date: today },
      ],
    };

    this.facade
      .updateTask(this.task.id, updated)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (t) => {
          if (t) this.task = t;
        },
        error: (err) => {
          console.error('[DETAIL] addState/updateTask error:', err);
          alert('No fue posible agregar el estado.');
        },
      });
  }
}