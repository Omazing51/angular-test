import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl,FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { State, Task } from '../../models/task.model';

export type TaskFormValue = Omit<Task, 'id'>;

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent {
  @Input({ required: true }) states: State[] = [];
  @Input() initialValue: Task | null = null;
  @Input() submitLabel = 'Save';

  @Output() submitForm = new EventEmitter<TaskFormValue>();
  @Output() cancel = new EventEmitter<void>();

  private fb = new FormBuilder();

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    dueDate: ['', Validators.required],
    state: ['', Validators.required], // “current state” para crear/editar
    notes: this.fb.array<string>([]),
    completed: [false],
  });

  ngOnInit(): void {
    if (this.initialValue) {
      const lastState =
        this.initialValue.stateHistory?.[this.initialValue.stateHistory.length - 1]?.state ?? '';

      this.form.patchValue({
        title: this.initialValue.title,
        description: this.initialValue.description,
        dueDate: this.initialValue.dueDate,
        state: lastState,
        completed: this.initialValue.completed,
      });

      this.notes.clear();
      for (const n of this.initialValue.notes ?? []) {
        this.notes.push(this.fb.control(n, { nonNullable: true }));
      }
    }

    // si no trae notas, inicializamos 1
    if (this.notes.length === 0) {
      this.addNote();
    }
  }

get notes(): FormArray<FormControl<string>> {
  return this.form.get('notes') as FormArray<FormControl<string>>;
}

 addNote() {
  this.notes.push(new FormControl<string>('', { nonNullable: true }));
}
  removeNote(i: number) {
    this.notes.removeAt(i);
    if (this.notes.length === 0) this.addNote();
  }

  trackByIndex = (i: number) => i;

  private hasAtLeastOneNonEmptyNote(): boolean {
    const values = (this.notes.value as string[]).map(v => (v ?? '').trim());
    return values.some(v => v.length > 0);
  }

  onSubmit() {
     console.log('[TaskForm] submit clicked', this.form.value);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;
    if (!this.hasAtLeastOneNonEmptyNote()) {
      this.form.setErrors({ notesRequired: true });
      return;
    }

    const v = this.form.getRawValue();

    const payload: TaskFormValue = {
      title: v.title!,
      description: v.description!,
      dueDate: v.dueDate!,
      completed: !!v.completed,
      notes: (v.notes as string[]).map(n => n.trim()).filter(Boolean),
      stateHistory: [
        // current state como primer/último item
        { state: v.state!, date: new Date().toISOString() },
      ],
    };

    this.submitForm.emit(payload);
  }

  onCancel() {
    this.cancel.emit();
  }

  // helpers
  isInvalid(ctrl: AbstractControl | null) {
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }
}