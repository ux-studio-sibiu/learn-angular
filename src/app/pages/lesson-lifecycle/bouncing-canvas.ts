import { afterNextRender, Component, DestroyRef, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { MotionPreference } from '../../services/motion-preference';

// Module-level state so the page can show what's running, even after a canvas is gone
export const activeLoops = signal(0);
const leaked: Array<() => void> = [];
export function stopLeakedLoops() { leaked.splice(0).forEach(stop => stop()); }

// The pattern every DOM library follows in Angular (GSAP, Three.js, charts, maps):
// viewChild → the element, afterNextRender → create, DestroyRef → destroy.
@Component({
  selector: 'app-bouncing-canvas',
  template: `<canvas #canvas class="nsc-bouncing-canvas"></canvas>`,
  styles: `
    :host { display: block; }
    .nsc-bouncing-canvas { display: block; width: 100%; height: 160px; border-radius: 6px; background: var(--code-bg); }
  `
})
export class BouncingCanvas {
  readonly leak = input(false);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas'); // ≈ useRef + ref={canvas}
  private readonly destroyRef = inject(DestroyRef);
  private readonly motion = inject(MotionPreference); // lesson 05: one switch for reduced motion

  constructor() {
    afterNextRender(() => {
      const el = this.canvas().nativeElement;
      const ctx = el.getContext('2d')!;
      const color = getComputedStyle(el).getPropertyValue('--accent').trim() || '#c3002f';
      const s = { w: 0, h: 0, x: 40, y: 40, vx: 3, vy: 2.2 };
      const loop = { id: 0 };

      // Measuring the DOM needs the real element, so it also lives here
      const resize = new ResizeObserver(() => {
        const r = el.getBoundingClientRect(), dpr = devicePixelRatio;
        el.width = r.width * dpr; el.height = r.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        s.w = r.width; s.h = r.height;
      });
      resize.observe(el);

      // Note: under zone.js every frame also triggers change detection. Lesson 10 fixes that with runOutsideAngular.
      const tick = () => {
        if (!this.motion.reduced()) {
          s.x += s.vx; s.y += s.vy;
          if (s.x < 16 || s.x > s.w - 16) s.vx *= -1;
          if (s.y < 16 || s.y > s.h - 16) s.vy *= -1;
        }
        ctx.clearRect(0, 0, s.w, s.h);
        ctx.beginPath(); ctx.arc(s.x, s.y, 16, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        loop.id = requestAnimationFrame(tick);
      };
      loop.id = requestAnimationFrame(tick);
      activeLoops.update(n => n + 1);

      this.destroyRef.onDestroy(() => {
        resize.disconnect();
        const stop = () => { cancelAnimationFrame(loop.id); activeLoops.update(n => n - 1); };
        if (this.leak()) leaked.push(stop); // ✘ "forgot" to cancel: the loop keeps drawing on a detached canvas
        else stop();                         // ✔ ≈ the cleanup function of useEffect, or plugin.destroy() in jQuery
      });
    });
  }
}
