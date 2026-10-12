import { DOCUMENT } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, ViewTransitionInfo, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { httpLogInterceptor } from './services/http-log';
import { MotionPreference } from './services/motion-preference';

function markRouteTransition({ transition }: ViewTransitionInfo) {
  if (inject(MotionPreference).reduced()) { transition.skipTransition(); return; }
  const html = inject(DOCUMENT).documentElement;
  html.classList.add('route-transition');
  transition.finished.finally(() => html.classList.remove('route-transition'));
}

// Shared by the browser and the server. app.config.server.ts merges server-only providers on top.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Router features are opt-in functions (lesson 06): params → component inputs, cross-fade between pages
    // Lesson 13: the callback runs in an injection context. Mark route transitions (styled in styles.scss) and skip them for reduced motion.
    provideRouter(routes, withComponentInputBinding(), withViewTransitions({ onViewTransitionCreated: markRouteTransition })),
    // Lesson 07: makes HttpClient injectable. withFetch() uses fetch() under the hood instead of XHR (better for SSR)
    // Lesson 12: no URL rewriting needed for SSR: on the server Angular resolves relative URLs like /api/… itself
    provideHttpClient(withFetch(), withInterceptors([httpLogInterceptor])),
    // Lesson 12: reuse the server-rendered DOM instead of re-creating it. Includes the HTTP transfer cache.
    // withEventReplay: clicks made before hydration finishes are replayed. withIncrementalHydration: enables @defer (hydrate on …)
    provideClientHydration(withEventReplay(), withIncrementalHydration())
  ]
};
