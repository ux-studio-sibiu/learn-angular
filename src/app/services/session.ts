import { inject, Injectable, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class Session {
  readonly signedIn = signal(false);
  toggle() { this.signedIn.update(v => !v); }
}

// A functional guard: runs before the route activates. Return true to allow, or a UrlTree to redirect.
// ≈ Next.js middleware.ts redirect, or [Authorize] on an MVC controller. It can inject() like a component.
export const signedInGuard: CanActivateFn = () =>
  inject(Session).signedIn() || inject(Router).createUrlTree(['/lessons/routing'], { queryParams: { denied: 1 } });
