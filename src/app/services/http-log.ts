import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
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
export const httpLogInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);
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
