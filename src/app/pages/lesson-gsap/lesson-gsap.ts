import { afterEveryRender, afterNextRender, AnimationCallbackEvent, Component, DestroyRef, ElementRef, inject, NgZone, signal, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { MotionPreference } from '../../services/motion-preference';
import { useGsap, useOutsideZone } from '../../services/gsap';
import { ScrollStory } from './scroll-story';

type Item = { id: number; title: string };

@Component({
  selector: 'app-lesson-gsap',
  imports: [ScrollStory],
  templateUrl: './lesson-gsap.html',
  styleUrl: './lesson-gsap.scss'
})
export class LessonGsap {
  private readonly motion = inject(MotionPreference);
  private readonly outsideZone = useOutsideZone();
  private readonly zone = inject(NgZone);
  private tl?: gsap.core.Timeline;
  private readonly progressOut = viewChild.required<ElementRef<HTMLElement>>('progressOut');
  private readonly scrubber = viewChild.required<ElementRef<HTMLInputElement>>('scrubber');

  constructor() {
    // 1. A timeline with SplitText. Created once (and re-created if reduced motion is toggled), reverted on destroy.
    useGsap((scope, { reduced }) => {
      const split = SplitText.create(scope.querySelector('.hero-title'), { type: 'words,chars' });
      this.tl = gsap.timeline({
        paused: reduced,
        defaults: { ease: 'power3.out' },
        // Loop strategy A: per-frame progress goes straight to the DOM, never into a signal
        onUpdate: () => {
          const p = this.tl!.progress();
          this.progressOut().nativeElement.textContent = `${Math.round(p * 100)}%`;
          this.scrubber().nativeElement.value = String(p);
        }
      })
        .from(split.chars, { yPercent: 110, opacity: 0, rotate: 8, duration: 0.7, stagger: 0.02 })
        .from('.hero-sub', { y: 16, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('.shape', { scale: 0, rotate: -90, duration: 0.8, stagger: { each: 0.08, from: 'center' }, ease: 'back.out(2)' }, '-=0.4');
      if (reduced) this.tl.progress(1); // reduced motion: show the end state, don't animate
    });

    this.startMeter();
  }

  // Controls: wrapped in outsideZone, so a sleeping GSAP ticker wakes up outside Angular's zone
  protected play() { this.outsideZone(() => this.tl?.play()); }
  protected reverse() { this.outsideZone(() => this.tl?.reverse()); }
  protected restart() { this.outsideZone(() => this.tl?.restart()); }
  protected restartInsideZone() { gsap.ticker.sleep(); this.tl?.restart(); } // ✘ the pitfall, on purpose
  protected scrub(value: string) { this.tl?.pause().progress(Number(value)); }

  // 3. GSAP inside Angular's enter/leave hooks (lesson 13): Angular waits until we call animationComplete()
  private nextId = 4;
  protected readonly items = signal<Item[]>([
    { id: 1, title: 'Future of jobs' },
    { id: 2, title: 'Climate & nature' },
    { id: 3, title: 'AI governance' }
  ]);
  protected add() { const id = this.nextId++; this.items.update(list => [...list, { id, title: `New briefing #${id}` }]); }
  protected remove(id: number) { this.items.update(list => list.filter(i => i.id !== id)); }

  protected gsapEnter(e: AnimationCallbackEvent) {
    if (this.motion.reduced()) { e.animationComplete(); return; }
    this.outsideZone(() => gsap.from(e.target, { y: -14, opacity: 0, duration: 0.45, ease: 'back.out(2)', onComplete: () => e.animationComplete() }));
  }
  protected gsapLeave(e: AnimationCallbackEvent) {
    if (this.motion.reduced()) { e.animationComplete(); return; }
    this.outsideZone(() => gsap.to(e.target, {
      x: 60, opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, marginBottom: 0,
      duration: 0.45, ease: 'power2.in', onComplete: () => e.animationComplete()
    }));
  }

  // Render-pass meter (same idea as lesson 10): shows whether animations are triggering change detection
  private readonly meter = viewChild.required<ElementRef<HTMLElement>>('meter');
  private stamps: number[] = [];
  private startMeter() {
    const destroyRef = inject(DestroyRef);
    afterEveryRender(() => this.stamps.push(performance.now()));
    afterNextRender(() => {
      const id = this.zone.runOutsideAngular(() => setInterval(() => {
        const now = performance.now();
        this.stamps = this.stamps.filter(t => t > now - 1000);
        this.meter().nativeElement.textContent = `${this.stamps.length} render passes per second`;
      }, 250));
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }
}
