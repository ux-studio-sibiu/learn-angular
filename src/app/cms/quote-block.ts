import { Component, input } from '@angular/core';
import { QuoteBlock } from './blocks';

@Component({
  selector: 'app-quote-block',
  template: `
    <figure class="nsc-quote-block">
      <blockquote>&ldquo;{{ block().text }}&rdquo;</blockquote>
      <figcaption>{{ block().author }}@if (block().role) {, {{ block().role }}}</figcaption>
    </figure>
  `,
  styles: `
    .nsc-quote-block { margin: 0; padding: 8px 0 8px 20px; border-left: 4px solid var(--accent); }
    blockquote { margin: 0; font-size: clamp(1.3rem, 3vw, 1.7rem); line-height: 1.25; font-weight: 600; }
    figcaption { margin-top: 8px; color: var(--muted); }
  `
})
export class QuoteBlockComponent {
  readonly block = input.required<QuoteBlock>();
}
