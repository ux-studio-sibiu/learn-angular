import { Component, inject, input } from '@angular/core';
import { CounterStore } from '../../services/counter-store';

// `providers` creates a fresh CounterStore for this panel. Everything projected inside it injects that same instance.
@Component({
  selector: 'app-scoped-panel',
  providers: [CounterStore],
  template: `
    <div class="nsc-scoped-panel">
      <p class="title">{{ label() }}: <strong>{{ store.value() }}</strong></p>
      <div class="buttons"><ng-content /></div>
    </div>
  `,
  styles: `
    .nsc-scoped-panel { padding: 12px; border: 1px dashed var(--line); border-radius: 8px; }
    .title { margin: 0 0 8px; }
    .buttons { display: flex; gap: 8px; }
  `
})
export class ScopedPanel {
  readonly label = input('Panel');
  protected readonly store = inject(CounterStore);
}

// The child doesn't know which panel it's in: DI walks up the element tree to the nearest provider.
@Component({
  selector: 'app-counter-button',
  template: `<button type="button" (click)="store.increment()">+1 ({{ store.value() }})</button>`
})
export class CounterButton {
  protected readonly store = inject(CounterStore);
}
