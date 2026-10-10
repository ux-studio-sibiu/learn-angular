import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { talksResolver } from './services/talks-api';
import { unsavedChangesGuard } from './services/unsaved-changes-guard';

// ≈ Next.js app/ folders, but declared in code (like MVC route tables).
// Lesson 06: pages are lazy. Each import() becomes its own chunk, downloaded on first visit (≈ next/dynamic).
export const routes: Routes = [
  { path: '', component: Home, title: 'Roadmap' }, // eager: the landing page ships in the main bundle
  { path: 'lessons/setup', loadComponent: () => import('./pages/lesson-setup/lesson-setup').then(m => m.LessonSetup), title: '00 Setup' },
  { path: 'lessons/components', loadComponent: () => import('./pages/lesson-components/lesson-components').then(m => m.LessonComponents), title: '01 Components' },
  { path: 'lessons/control-flow', loadComponent: () => import('./pages/lesson-control-flow/lesson-control-flow').then(m => m.LessonControlFlow), title: '02 Control flow' },
  { path: 'lessons/signals', loadComponent: () => import('./pages/lesson-signals/lesson-signals').then(m => m.LessonSignals), title: '03 Signals' },
  { path: 'lessons/inputs', loadComponent: () => import('./pages/lesson-inputs/lesson-inputs').then(m => m.LessonInputs), title: '04 Inputs & outputs' },
  { path: 'lessons/services', loadComponent: () => import('./pages/lesson-services/lesson-services').then(m => m.LessonServices), title: '05 Services & DI' },
  { path: 'lessons/routing', loadChildren: () => import('./pages/lesson-routing/routing.routes').then(m => m.routingRoutes) }, // a whole route subtree
  { path: 'lessons/http', loadComponent: () => import('./pages/lesson-http/lesson-http').then(m => m.LessonHttp), resolve: { talks: talksResolver }, title: '07 HTTP' },
  { path: 'lessons/forms', loadComponent: () => import('./pages/lesson-forms/lesson-forms').then(m => m.LessonForms), canDeactivate: [unsavedChangesGuard], title: '08 Forms' },
  { path: '**', redirectTo: '' }
];
