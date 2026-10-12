import { afterNextRender, effect, ElementRef, inject, NgZone, signal, untracked } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MotionPreference } from './motion-preference';

let registered = false;

// ≈ the useGSAP hook from @gsap/react, for Angular. Everything from lessons 05, 09, 10 and 12 in one place:
// - afterNextRender: browser only (SSR-safe) and the DOM exists
// - runOutsideAngular: GSAP's ticker (its rAF loop) starts outside the zone, so tweens don't trigger change detection
// - gsap.context(…, host): every tween, ScrollTrigger and SplitText created in setup is scoped to this component
//   and undone by ctx.revert() (≈ the useGSAP cleanup)
// - effect + MotionPreference: if reduced motion is toggled, revert and run setup again with the new value
export function useGsap(setup: (scope: HTMLElement, options: { reduced: boolean }) => void) {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const zone = inject(NgZone);
  const motion = inject(MotionPreference);
  const ready = signal(false);

  afterNextRender(() => {
    if (!registered) { gsap.registerPlugin(ScrollTrigger, SplitText); registered = true; }
    ready.set(true);
  });

  effect(onCleanup => {
    if (!ready()) return;                      // false on the server and before the first render
    const reduced = motion.reduced();          // the only signal this effect tracks…
    const ctx = zone.runOutsideAngular(() =>
      gsap.context(() => untracked(() => setup(host, { reduced })), host) // …signals read inside setup are not tracked
    );
    onCleanup(() => ctx.revert());             // runs before a re-run and when the component is destroyed
  });
}

// For event handlers: clicks run inside the zone. If GSAP's ticker is asleep, a tween started there would wake it
// *inside* the zone and every frame of that tween would trigger change detection.
export function useOutsideZone() {
  const zone = inject(NgZone);
  return (fn: () => void) => zone.runOutsideAngular(fn);
}
