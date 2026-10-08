import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LessonSetup } from './pages/lesson-setup/lesson-setup';
import { LessonComponents } from './pages/lesson-components/lesson-components';
// ≈ Next.js app/ folders, but declared in code (like MVC route tables). Lazy loading comes in a later lesson.
export const routes: Routes = [
  { path: '', component: Home, title: 'Roadmap' },
  { path: 'lessons/setup', component: LessonSetup, title: '00 Setup' },
  { path: 'lessons/components', component: LessonComponents, title: '01 Components' },  { path: '**', redirectTo: '' }
];
