import { DOCUMENT } from '@angular/common';
import { AnimationCallbackEvent, ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { MotionPreference } from '../../services/motion-preference';

type Toast = { id: number; text: string };
type Tile = { id: number; title: string };

const MESSAGES = ['Talk saved to favourites', 'Session starts in 10 minutes', 'New report published', 'Seat confirmed'];

@Component({
  selector: 'app-lesson-animation',
  templateUrl: './lesson-animation.html',
  styleUrl: './lesson-animation.scss'
})
export class LessonAnimation {
  protected readonly motion = inject(MotionPreference); // lesson 05: one reduced-motion switch for every demo

  // 1. Plain CSS, driven by a class binding
  protected readonly open = signal(false);

  // 2. animate.enter / animate.leave
  private nextId = 1;
  protected readonly toasts = signal<Toast[]>([]);
  protected readonly showPanel = signal(true);

  protected addToast() {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, text: MESSAGES[id % MESSAGES.length] }]);
  }
  protected dismiss(id: number) { this.toasts.update(list => list.filter(t => t.id !== id)); }

  // (animate.leave) with a function: Angular keeps the element in the DOM until we call animationComplete().
  // Here it's the Web Animations API; in lesson 14 the same hook will run a GSAP tween.
  protected flyOut(event: AnimationCallbackEvent) {
    if (this.motion.reduced()) { event.animationComplete(); return; }
    const anim = (event.target as HTMLElement).animate(
      [{ transform: 'none', opacity: 1 }, { transform: 'translateX(110%) rotate(6deg)', opacity: 0 }],
      { duration: 450, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' }
    );
    anim.finished.then(() => event.animationComplete());
  }

  // 3. View Transitions inside a page
  private readonly document = inject(DOCUMENT);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly layout = signal<'grid' | 'list'>('grid');
  protected readonly tiles = signal<Tile[]>([
    { id: 1, title: 'The future of jobs' },
    { id: 2, title: 'Climate & nature' },
    { id: 3, title: 'AI governance' },
    { id: 4, title: 'Global health' },
    { id: 5, title: 'Cities of 2050' },
    { id: 6, title: 'Energy transition' }
  ]);

  protected toggleLayout() { this.withViewTransition(() => this.layout.update(l => (l === 'grid' ? 'list' : 'grid'))); }
  protected shuffle() { this.withViewTransition(() => this.tiles.update(list => [...list].sort(() => Math.random() - 0.5))); }

  // The browser snapshots the old DOM, runs the callback, snapshots the new DOM and morphs between them.
  // Angular normally updates the DOM a moment *after* a signal changes, so detectChanges() forces it to happen
  // inside the callback, while the browser is waiting.
  private withViewTransition(update: () => void) {
    if (!this.document.startViewTransition || this.motion.reduced()) { update(); return; }
    this.document.startViewTransition(() => { update(); this.cdr.detectChanges(); });
  }
}
