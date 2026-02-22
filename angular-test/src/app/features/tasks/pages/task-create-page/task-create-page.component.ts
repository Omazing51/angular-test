import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskApiService } from '../../data-access/task-api.service';
import { TaskFacade } from '../../data-access/task-facade.service';
import { State } from '../../models/task.model';
import { TaskFormComponent, TaskFormValue } from '../../components/task-form/task-form.component';

@Component({
  selector: 'app-task-create-page',
  standalone: true,
  imports: [CommonModule, TaskFormComponent],
  templateUrl: './task-create-page.component.html',
  styleUrl: './task-create-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCreatePageComponent implements OnInit {
  private api = inject(TaskApiService);
  private facade = inject(TaskFacade);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  states: State[] = [];
  loading$ = this.facade.loading$;
  error$ = this.facade.error$;

  ngOnInit(): void {
    this.api.getStates().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (s) => (this.states = s),
      error: () => {}, // el interceptor/estado lo manejamos si quieres luego
    });
  }

  onSubmit(payload: TaskFormValue) {
    this.facade.createTask(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
    });
  }

  onCancel() {
    this.router.navigateByUrl('/tasks');
  }
}