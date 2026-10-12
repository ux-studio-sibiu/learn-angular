import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsap } from '../../services/gsap';

// A pinned, scroll-scrubbed story: the WEF "immersive report" pattern in miniature.
// Per-frame values (progress) go to a CSS variable; only the chapter index is a signal (loop strategy B + OnPush).
@Component({
  selector: 'app-scroll-story',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="nsc-scroll-story" [class.is-static]="reduced()">
      <div class="stage">
        <div class="orb"></div>
        <ol class="chapters">
          @for (c of chapters; track c.title; let i = $index) {
            <li [class.is-active]="i === chapter() || reduced()">
              <h3>{{ c.title }}</h3>
              <p>{{ c.text }}</p>
            </li>
          }
        </ol>
        <div class="progress"></div>
      </div>
    </section>
  `,
  styleUrl: './scroll-story.scss'
})
export class ScrollStory {
  protected readonly chapters = [
    { title: '1. The signal', text: 'Emissions are still rising, but more slowly than a decade ago.' },
    { title: '2. The shift', text: 'Renewables became the cheapest source of new power in most markets.' },
    { title: '3. The gap', text: 'Investment in grids and storage is the missing piece.' }
  ];
  protected readonly chapter = signal(0);
  protected readonly reduced = signal(false);

  constructor() {
    useGsap((scope, { reduced }) => {
      this.reduced.set(reduced);
      if (reduced) return; // reduced motion: no pinning, no scrubbing, all chapters visible

      const stage = scope.querySelector<HTMLElement>('.stage')!;
      gsap.timeline({
        scrollTrigger: {
          trigger: scope.querySelector('.nsc-scroll-story'),
          start: 'top top+=80',
          end: '+=1800',             // 1800px of scrolling drives the whole timeline
          pin: stage,
          scrub: 0.6,                // follow the scrollbar, smoothed
          onUpdate: (self: ScrollTrigger) => {
            stage.style.setProperty('--progress', self.progress.toFixed(3));        // every frame: DOM only
            const index = Math.min(this.chapters.length - 1, Math.floor(self.progress * this.chapters.length));
            if (index !== this.chapter()) this.chapter.set(index);                 // 3 times per scroll: a signal
          }
        }
      })
        .to('.orb', { scale: 2.2, rotate: 120, borderRadius: '30%', ease: 'none' })
        .to('.orb', { xPercent: 120, backgroundColor: '#1d1d1b', ease: 'none' });
    });
  }
}
