import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { httpLogInterceptor } from './services/http-log';

// Shared by the browser and the server. app.config.server.ts merges server-only providers on top.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Router features are opt-in functions (lesson 06): params → component inputs, cross-fade between pages
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    // Lesson 07: makes HttpClient injectable. withFetch() uses fetch() under the hood instead of XHR (better for SSR)
    // Lesson 12: no URL rewriting needed for SSR: on the server Angular resolves relative URLs like /api/… itself
    provideHttpClient(withFetch(), withInterceptors([httpLogInterceptor])),
    // Lesson 12: reuse the server-rendered DOM instead of re-creating it. Includes the HTTP transfer cache.
    // withEventReplay: clicks made before hydration finishes are replayed. withIncrementalHydration: enables @defer (hydrate on …)
    provideClientHydration(withEventReplay(), withIncrementalHydration())
  ]
};
