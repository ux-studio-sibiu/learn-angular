import { ResolveFn, Routes } from '@angular/router';
import { signedInGuard } from '../../services/session';
import { Backstage } from './backstage';
import { LessonRouting } from './lesson-routing';
import { TalkDetail } from './talk-detail';
import { TalkList } from './talk-list';
import { TALKS } from './talks';

// Dynamic tab title from the route param (≈ generateMetadata in Next.js)
const talkTitle: ResolveFn<string> = route => TALKS.find(t => t.id === Number(route.paramMap.get('id')))?.title ?? 'Talk not found';

// Loaded with loadChildren from app.routes.ts, so this whole section is one lazy chunk
export const routingRoutes: Routes = [
  {
    path: '',
    component: LessonRouting, // a layout: its template has its own <router-outlet /> (≈ a nested layout.tsx)
    title: '06 Routing',
    children: [
      { path: '', component: TalkList },
      { path: 'talks/:id', component: TalkDetail, title: talkTitle }, // :id ≈ app/talks/[id]/page.tsx
      { path: 'backstage', component: Backstage, canActivate: [signedInGuard], title: 'Backstage' }
    ]
  }
];
