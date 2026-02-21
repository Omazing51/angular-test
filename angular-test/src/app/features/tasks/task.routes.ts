import { Routes } from '@angular/router';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/task-list-page/task-list-page.component')
        .then(c => c.TaskListPageComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/task-create-page/task-create-page.component')
        .then(c => c.TaskCreatePageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/task-detail-page/task-detail-page.component')
        .then(c => c.TaskDetailPageComponent),
  },
];
