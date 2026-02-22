import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TaskFacade } from './task-facade.service';
import { TaskApiService } from './task-api.service';
import { TaskStoreService } from './task-store.service';
import { Task } from '../models/task.model';

describe('TaskFacade', () => {
  let facade: TaskFacade;
  let api: jasmine.SpyObj<TaskApiService>;
  let store: TaskStoreService;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'T1',
      description: 'D1',
      dueDate: '2024-01-01',
      completed: false,
      stateHistory: [{ state: 'new', date: '2024-01-01' }],
      notes: ['n1'],
    },
  ];

  beforeEach(() => {
    api = jasmine.createSpyObj<TaskApiService>('TaskApiService', [
      'getTasks',
      'patchTask',
      'deleteTask',
      'getTask',
      'updateTask',
      'createTask',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TaskFacade,
        TaskStoreService,
        { provide: TaskApiService, useValue: api },
      ],
    });

    facade = TestBed.inject(TaskFacade);
    store = TestBed.inject(TaskStoreService);
  });

  it('loadPage should set tasks & total on success', (done) => {
    api.getTasks.and.returnValue(of({ data: mockTasks, total: 1 }));

    facade.loadPage(1).subscribe(() => {
      const snap = store.snapshot;
      expect(snap.page).toBe(1);
      expect(snap.tasks.length).toBe(1);
      expect(snap.total).toBe(1);
      expect(snap.loading).toBeFalse();
      expect(snap.error).toBeNull();
      done();
    });
  });

  it('loadPage should set error and empty tasks on error', (done) => {
    api.getTasks.and.returnValue(throwError(() => new Error('boom')));

    facade.loadPage(1).subscribe(() => {
      const snap = store.snapshot;
      expect(snap.tasks).toEqual([]);
      expect(snap.total).toBe(0);
      expect(snap.error).toContain('No fue posible cargar');
      expect(snap.loading).toBeFalse();
      done();
    });
  });

  it('markCompleted should patch completed=true and refresh page', (done) => {
    api.patchTask.and.returnValue(of(mockTasks[0] as any));
    api.getTasks.and.returnValue(of({ data: mockTasks, total: 1 }));

    // preload snapshot page
    store.setPage(1);

    facade.markCompleted(mockTasks[0]).subscribe(() => {
      expect(api.patchTask).toHaveBeenCalledWith('1', { completed: true });
      expect(api.getTasks).toHaveBeenCalled(); // refresh
      done();
    });
  });
});