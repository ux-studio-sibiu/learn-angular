import { afterEveryRender, afterNextRender, DestroyRef, inject, NgZone } from '@angular/core';

// Counts Angular render passes per second and writes the number into an element (lessons 10 and 14, as a helper).
// Usage: useRenderMeter(() => this.meterEl().nativeElement)
export function useRenderMeter(target: () => HTMLElement) {
  const zone = inject(NgZone);
  const destroyRef = inject(DestroyRef);
  let stamps: number[] = [];

  afterEveryRender(() => stamps.push(performance.now())); // counting only: a signal here would cause another pass
  afterNextRender(() => {
    const id = zone.runOutsideAngular(() => setInterval(() => {
      const now = performance.now();
      stamps = stamps.filter(t => t > now - 1000);
      target().textContent = `${stamps.length} Angular render passes / second`;
    }, 250));
    destroyRef.onDestroy(() => clearInterval(id));
  });
}
