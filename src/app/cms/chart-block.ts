import { Component, computed, input } from '@angular/core';
import { ChartBlock } from './blocks';

// The "heavy" block: rendered inside @defer (on viewport) by the block renderer, so its code is a separate chunk.
// In a real build this is where a D3 / chart library or a Three.js scene would live.
@Component({
  selector: 'app-chart-block',
  template: `
    <figure class="nsc-chart-block">
      <figcaption>{{ block().title }}</figcaption>
      <!-- An HTML/CSS bar chart: readable by screen readers as a list, no chart library needed -->
      <ul>
        @for (bar of block().bars; track bar.label) {
          <li>
            <span class="label">{{ bar.label }}</span>
            <span class="bar" [style.width.%]="(bar.value / max()) * 100"></span>
            <span class="value">{{ bar.value }} {{ block().unit }}</span>
          </li>
        }
      </ul>
    </figure>
  `,
  styles: `
    .nsc-chart-block { margin: 0; padding: 16px; border: 1px solid var(--line); border-radius: 8px; }
    figcaption { margin-bottom: 12px; font-weight: 700; }
    ul { margin: 0; padding: 0; list-style: none; }
    li { display: grid; grid-template-columns: 110px 1fr auto; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 0.9rem; }
    .bar { height: 14px; border-radius: 3px; background: var(--accent); }
    .value { color: var(--muted); font-variant-numeric: tabular-nums; }
  `
})
export class ChartBlockComponent {
  readonly block = input.required<ChartBlock>();
  protected readonly max = computed(() => Math.max(...this.block().bars.map(b => b.value)));
}
