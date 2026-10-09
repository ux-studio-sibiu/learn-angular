import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type MotionMode = 'system' | 'reduce' | 'full';

// One place that answers "should we animate?". Every animation (CSS, GSAP, Three.js) will read `reduced()`.
@Injectable({ providedIn: 'root' })
export class MotionPreference {
  // PLATFORM_ID is a built-in DI token: 'browser' or 'server'. matchMedia doesn't exist on the server (lesson 12).
  private readonly mq = isPlatformBrowser(inject(PLATFORM_ID)) ? matchMedia('(prefers-reduced-motion: reduce)') : null;

  private readonly systemReduced = signal(this.mq?.matches ?? false);
  readonly mode = signal<MotionMode>('system'); // the user's override on this site
  readonly reduced = computed(() => (this.mode() === 'system' ? this.systemReduced() : this.mode() === 'reduce'));

  constructor() {
    // Follow the OS setting live. A root service lives as long as the app, so no cleanup needed here.
    this.mq?.addEventListener('change', e => this.systemReduced.set(e.matches));
  }
}
