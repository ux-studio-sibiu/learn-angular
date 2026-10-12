import { Component, input } from '@angular/core';
import { StatsBlock } from './blocks';

@Component({
  selector: 'app-stats-block',
  template: `
    <section class="nsc-stats-block">
      <dl>
        @for (item of block().items; track item.label) {
          <div class="stat"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></div>
        }
      </dl>
      @if (block().source; as source) { <p class="source">Source: {{ source }}</p> }
    </section>
  `,
  styles: `
    dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 0; }
    .stat { display: flex; flex-direction: column-reverse; padding: 16px; border-top: 3px solid var(--accent); background: var(--code-bg); }
    dd { margin: 0; font-size: 2rem; font-weight: 800; line-height: 1; }
    dt { margin-top: 6px; color: var(--muted); }
    .source { margin: 8px 0 0; color: var(--muted); font-size: 0.8rem; }
  `
})
export class StatsBlockComponent {
  readonly block = input.required<StatsBlock>();
}
