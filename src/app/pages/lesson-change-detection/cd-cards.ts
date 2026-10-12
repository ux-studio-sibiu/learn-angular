import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';

// An inject()-based helper ≈ a custom React hook: call it in a field initializer, get a function back.
// The template calls track() in a binding, so it runs every time Angular re-evaluates that template.
// It flashes the card and writes the count straight to the DOM (a signal here would trigger yet another check).
function useRenderTracker() {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  let renders = 0;
  return () => {
    const counter = host.querySelector('.count');
    if (counter) counter.textContent = String(++renders);
    host.animate([{ outlineColor: 'var(--accent)' }, { outlineColor: 'transparent' }], 400);
    return '';
  };
}

// A ticking timer started in the constructor (inside the zone, so each tick triggers an app-wide check)
function useInterval(fn: () => void) {
  const id = setInterval(fn, 1000);
  inject(DestroyRef).onDestroy(() => clearInterval(id));
}

const styles = `
  :host { display: block; padding: 12px; border: 1px solid var(--line); border-radius: 8px; outline: 2px solid transparent; outline-offset: 2px; }
  .title { margin: 0 0 4px; font-weight: 700; }
  p { margin: 4px 0; font-size: 0.9rem; }
  .count { font-weight: 700; }
`;

@Component({
  selector: 'app-cd-default-card',
  template: `
    <p class="title">Default + plain field</p>
    <p>seconds: <strong>{{ seconds }}</strong></p>
    <p>template checked <span class="count">0</span>×{{ track() }}</p>
    <button type="button" (click)="clicks = clicks + 1">Click inside ({{ clicks }})</button>
  `,
  styles
})
export class CdDefaultCard {
  protected seconds = 0;
  protected clicks = 0;
  protected readonly track = useRenderTracker();
  constructor() { useInterval(() => this.seconds++); }
}

@Component({
  selector: 'app-cd-onpush-plain-card',
  changeDetection: ChangeDetectionStrategy.OnPush, // ≈ React.memo: skip me unless my inputs, my events or my signals changed
  template: `
    <p class="title">OnPush + plain field ✘</p>
    <p>seconds: <strong>{{ seconds }}</strong></p>
    <p>template checked <span class="count">0</span>×{{ track() }}</p>
    <button type="button" (click)="clicks = clicks + 1">Click inside ({{ clicks }})</button>
  `,
  styles
})
export class CdOnPushPlainCard {
  protected seconds = 0; // changes every second, but nothing tells Angular, so the view stays stale
  protected clicks = 0;
  protected readonly track = useRenderTracker();
  constructor() { useInterval(() => this.seconds++); }
}

@Component({
  selector: 'app-cd-onpush-signal-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="title">OnPush + signal ✔</p>
    <p>seconds: <strong>{{ seconds() }}</strong></p>
    <p>template checked <span class="count">0</span>×{{ track() }}</p>
    <button type="button" (click)="clicks.set(clicks() + 1)">Click inside ({{ clicks() }})</button>
  `,
  styles
})
export class CdOnPushSignalCard {
  protected readonly seconds = signal(0); // the template reads it, so set() marks exactly this component for checking
  protected readonly clicks = signal(0);
  protected readonly track = useRenderTracker();
  constructor() { useInterval(() => this.seconds.update(s => s + 1)); }
}
