import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskFacade } from '../../data-access/task-facade.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskCardComponent],
  templateUrl: './task-list-page.component.html',
  styleUrl: './task-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListPageComponent implements OnInit {
  private facade = inject(TaskFacade);
  private destroyRef = inject(DestroyRef);

  tasks$ = this.facade.tasks$;
  loading$ = this.facade.loading$;
  error$ = this.facade.error$;

  page$ = this.facade.page$;
  totalPages$ = this.facade.totalPages$;

ngOnInit(): void {
  this.facade.loadPage(1)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe();
}

  trackById = (_: number, t: Task) => t.id;

  onComplete(task: Task) {
    this.facade
      .markCompleted(task)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onDelete(id: string) {
    const ok = confirm('¿Seguro que deseas eliminar esta tarea?');
    if (!ok) return;

    this.facade
      .deleteTask(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

goTo(page: number) {
  this.facade.loadPage(page)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe();
}
}