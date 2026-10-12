import { afterNextRender, Component, input, signal } from '@angular/core';

// Shows whether this block's JavaScript is alive yet. On the server and before hydration: "server HTML only".
@Component({
  selector: 'app-hydration-probe',
  template: `
    <div class="nsc-hydration-probe" [class.is-hydrated]="hydratedAt()">
      <p class="title">{{ label() }}</p>
      <p>{{ hydratedAt() ? 'Hydrated at ' + hydratedAt() : 'Not hydrated: server HTML only, no JS yet' }}</p>
      <button type="button" (click)="clicks.set(clicks() + 1)">Clicked {{ clicks() }}×</button>
    </div>
  `,
  styles: `
    .nsc-hydration-probe { padding: 12px; border: 1px dashed var(--line); border-radius: 8px; }
    .nsc-hydration-probe.is-hydrated { border-style: solid; border-color: var(--accent); }
    .title { margin: 0 0 4px; font-weight: 700; }
    p { margin: 4px 0; font-size: 0.9rem; }
  `
})
export class HydrationProbe {
  readonly label = input('');
  protected readonly clicks = signal(0);
  protected readonly hydratedAt = signal('');
  constructor() { afterNextRender(() => this.hydratedAt.set(new Date().toLocaleTimeString())); } // browser only
}
