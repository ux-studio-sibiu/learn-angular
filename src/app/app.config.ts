import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { httpLogInterceptor } from './services/http-log';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Router features are opt-in functions (lesson 06): params → component inputs, cross-fade between pages
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    // Lesson 07: makes HttpClient injectable. withFetch() uses fetch() under the hood instead of XHR (better for SSR)
    provideHttpClient(withFetch(), withInterceptors([httpLogInterceptor]))
  ]
};
