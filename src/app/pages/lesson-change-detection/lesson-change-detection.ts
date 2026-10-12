import { afterEveryRender, Component, DestroyRef, ElementRef, inject, NgZone, signal, viewChild } from '@angular/core';
import { BouncingCanvas } from '../lesson-lifecycle/bouncing-canvas';
import { CdDefaultCard, CdOnPushPlainCard, CdOnPushSignalCard } from './cd-cards';

@Component({
  selector: 'app-lesson-change-detection',
  imports: [BouncingCanvas, CdDefaultCard, CdOnPushPlainCard, CdOnPushSignalCard],
  templateUrl: './lesson-change-detection.html',
  styleUrl: './lesson-change-detection.scss'
})
export class LessonChangeDetection {
  protected readonly zoneMode = signal<'inside' | 'outside' | 'off'>('off');
  protected readonly pageClicks = signal(0);

  private readonly meter = viewChild.required<ElementRef<HTMLElement>>('meter');
  private total = 0;
  private stamps: number[] = [];

  constructor() {
    // Runs after every app-wide render pass. Only counts: setting a signal here would schedule another pass, forever.
    afterEveryRender(() => { this.total++; this.stamps.push(performance.now()); });

    // The meter's own refresh timer runs outside the zone, so measuring doesn't add passes. It writes to the DOM directly.
    const id = inject(NgZone).runOutsideAngular(() => setInterval(() => {
      const now = performance.now();
      this.stamps = this.stamps.filter(t => t > now - 1000);
      this.meter().nativeElement.textContent = `${this.stamps.length} per second · ${this.total} total`;
    }, 250));
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }
}
