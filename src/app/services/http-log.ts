import { isPlatformServer } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { ApplicationRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { delay, tap } from 'rxjs';

export type LogEntry = { url: string; status: number | string; ms: number };

@Injectable({ providedIn: 'root' })
export class HttpLog {
  readonly entries = signal<LogEntry[]>([]);
  add(entry: LogEntry) { this.entries.update(list => [entry, ...list].slice(0, 6)); }
  clear() { this.entries.set([]); }
}

// An interceptor wraps every HttpClient request (≈ axios interceptors, $.ajaxSetup, .NET DelegatingHandler / middleware).
// Typical real uses: auth headers, base URLs, error toasts, retries. Here: fake latency + a request log.
let bootstrapping = true;

export const httpLogInterceptor: HttpInterceptorFn = (req, next) => {
  // Lesson 12: on the server, skip the fake latency and the log (it would only slow down the server render)
  if (!req.url.startsWith('/api') || isPlatformServer(inject(PLATFORM_ID))) return next(req);

  // Lesson 12: our interceptors run *before* Angular's HTTP transfer cache. While the app is starting up after SSR,
  // requests are answered from that cache without touching the network, so don't delay or log them.
  if (bootstrapping) {
    inject(ApplicationRef).whenStable().then(() => (bootstrapping = false));
    return next(req);
  }

  const log = inject(HttpLog); // interceptors run in an injection context
  const start = performance.now();
  const record = (status: number | string) => log.add({ url: req.url, status, ms: Math.round(performance.now() - start) });

  return next(req).pipe(
    delay(700), // pretend the API is slow so loading states are visible
    tap({
      next: event => { if (event instanceof HttpResponse) record(event.status); },
      error: (err: HttpErrorResponse) => record(err.status || 'error')
    })
  );
};
