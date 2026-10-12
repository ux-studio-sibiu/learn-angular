import { RenderMode, ServerRoute } from '@angular/ssr';
import { TALKS } from './pages/lesson-routing/talks';

// How each route is rendered (lesson 12). Same URLs as app.routes.ts; this file only adds the rendering strategy.
export const serverRoutes: ServerRoute[] = [
  // Prerender ≈ Next.js static generation (SSG): HTML written once at build time
  { path: '', renderMode: RenderMode.Prerender },
  {
    path: 'lessons/routing/talks/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() { return TALKS.map(t => ({ id: String(t.id) })); } // ≈ generateStaticParams
  },
  // Client ≈ a plain SPA route: the server sends an empty shell, the browser renders. Here because the guard
  // depends on a sign-in state that only exists in the browser.
  { path: 'lessons/routing/backstage', renderMode: RenderMode.Client },
  // Server ≈ Next.js dynamic rendering / a Razor view: rendered on every request (needed for /api data and REQUEST)
  { path: '**', renderMode: RenderMode.Server }
];
