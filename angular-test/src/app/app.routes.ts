import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  {
    path: 'tasks',
    loadChildren: () =>
      import('../app/features/tasks/task.routes').then(m => m.TASKS_ROUTES),
  },
  { path: '**', redirectTo: 'tasks' },
];
