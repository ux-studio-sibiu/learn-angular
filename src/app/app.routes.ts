import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LessonSetup } from './pages/lesson-setup/lesson-setup';
import { LessonComponents } from './pages/lesson-components/lesson-components';
import { LessonControlFlow } from './pages/lesson-control-flow/lesson-control-flow';
import { LessonSignals } from './pages/lesson-signals/lesson-signals';
// ≈ Next.js app/ folders, but declared in code (like MVC route tables). Lazy loading comes in a later lesson.
export const routes: Routes = [
  { path: '', component: Home, title: 'Roadmap' },
  { path: 'lessons/setup', component: LessonSetup, title: '00 Setup' },
  { path: 'lessons/components', component: LessonComponents, title: '01 Components' },
  { path: 'lessons/control-flow', component: LessonControlFlow, title: '02 Control flow' },
  { path: 'lessons/signals', component: LessonSignals, title: '03 Signals' },  { path: '**', redirectTo: '' }
];
