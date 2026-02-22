import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;

  @Output() complete = new EventEmitter<Task>();
  @Output() remove = new EventEmitter<string>();

  get currentState(): string {
    const last = this.task.stateHistory?.[this.task.stateHistory.length - 1];
    return last?.state ?? 'unknown';
  }

  onComplete() {
    this.complete.emit(this.task);
  }

  onRemove() {
    this.remove.emit(this.task.id);
  }

  trackByIndex = (i: number) => i;
}