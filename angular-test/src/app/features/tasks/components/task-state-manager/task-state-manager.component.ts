import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { State, Task } from '../../models/task.model';

@Component({
  selector: 'app-task-state-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-state-manager.component.html',
  styleUrl: './task-state-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStateManagerComponent {
  @Input({ required: true }) task!: Task;
  @Input({ required: true }) states: State[] = [];

  @Output() addState = new EventEmitter<{ state: string }>();

  selected = '';

  get currentState(): string {
    const last = this.task.stateHistory?.[this.task.stateHistory.length - 1];
    return last?.state ?? 'unknown';
  }

  onAdd() {
    const s = this.selected.trim();
    if (!s) return;
    this.addState.emit({ state: s });
    this.selected = '';
  }
}