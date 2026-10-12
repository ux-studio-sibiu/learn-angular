import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RichTextBlock } from './blocks';

// Structured rich text (≈ Sanity Portable Text): paragraphs of spans with marks, rendered as real elements.
// No [innerHTML]: nothing from the CMS is ever parsed as HTML, so there's nothing to sanitise or inject.
@Component({
  selector: 'app-rich-text-block',
  imports: [RouterLink],
  template: `
    <div class="nsc-rich-text-block">
      @for (paragraph of block().paragraphs; track $index) {
        <p>
          @for (span of paragraph; track $index) {
            @if (span.href?.startsWith('#')) {
              <a [href]="span.href">{{ span.text }}</a>
            } @else if (span.href) {
              <a [routerLink]="span.href">{{ span.text }}</a>
            } @else {
              @switch (span.mark) {
                @case ('strong') { <strong>{{ span.text }}</strong> }
                @case ('em') { <em>{{ span.text }}</em> }
                @default { {{ span.text }} }
              }
            }
          }
        </p>
      }
    </div>
  `,
  styles: `
    .nsc-rich-text-block { max-width: 62ch; font-size: 1.05rem; }
    a { color: var(--accent); }
  `
})
export class RichTextBlockComponent {
  readonly block = input.required<RichTextBlock>();
}
