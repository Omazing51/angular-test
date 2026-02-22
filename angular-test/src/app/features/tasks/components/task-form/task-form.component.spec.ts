import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { State, Task } from '../../models/task.model';

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;
  let component: TaskFormComponent;

  const states: State[] = [
    { id: 's1', name: 'new' },
    { id: 's2', name: 'active' },
  ];

  const initialTask: Task = {
    id: 't1',
    title: 'Old',
    description: 'Old desc',
    dueDate: '2024-01-01',
    completed: false,
    stateHistory: [{ state: 'new', date: '2024-01-01' }],
    notes: ['note1'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;

    component.states = states;
    component.initialValue = initialTask;

    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should patch initial values', () => {
    expect(component.form.value.title).toBe('Old');
    expect(component.form.value.description).toBe('Old desc');
    expect(component.form.value.dueDate).toBe('2024-01-01');
    expect(component.form.value.completed).toBeFalse();
  });

  it('should emit submitForm with mapped payload on valid submit', () => {
    const spy = spyOn(component.submitForm, 'emit');

    component.form.patchValue({
      title: 'New title',
      description: 'New desc',
      dueDate: '2024-02-02',
      state: 'active',
      completed: true,
    });

    // ensure at least one non-empty note
    component.notes.at(0).setValue('hello');

    component.onSubmit();

    expect(spy).toHaveBeenCalled();
    const payload = spy.calls.mostRecent().args[0] as any;
expect(payload).toBeTruthy();
expect(payload.title).toBe('New title');

    expect(payload.title).toBe('New title');
    expect(payload.completed).toBeTrue();
    expect(payload.notes).toEqual(['hello']);
    expect(payload.stateHistory.length).toBe(1);
    expect(payload.stateHistory[0].state).toBe('active');
  });

  it('should not emit when invalid', () => {
    const spy = spyOn(component.submitForm, 'emit');

    component.form.patchValue({
      title: '',
      description: '',
      dueDate: '',
      state: '',
    });

    component.onSubmit();

    expect(spy).not.toHaveBeenCalled();
  });
});