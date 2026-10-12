import { Component, input, isDevMode } from '@angular/core';
import { Block } from './blocks';
import { ChartBlockComponent } from './chart-block';
import { CtaBlockComponent } from './cta-block';
import { HeroBlockComponent } from './hero-block';
import { QuoteBlockComponent } from './quote-block';
import { RichTextBlockComponent } from './rich-text-block';
import { StatsBlockComponent } from './stats-block';

// The page builder: a list of CMS blocks in, the matching component out for each one.
// ≈ the `components` map you pass to <PortableText> / a Next.js `blocks.map(b => <Block {...b} />)` switch.
@Component({
  selector: 'app-block-renderer',
  imports: [HeroBlockComponent, RichTextBlockComponent, StatsBlockComponent, QuoteBlockComponent, ChartBlockComponent, CtaBlockComponent],
  host: { class: 'nsc-block-renderer', '[class.show-outlines]': 'outlines()' },
  template: `
    @for (block of blocks(); track block._key; let first = $first) {
      <!-- data-block: used by the "show block outlines" editor overlay (≈ Sanity's Presentation tool) -->
      <div class="block" [attr.data-block]="block._type">
        <!-- @switch narrows the union: inside @case ('hero'), block is a HeroBlock, so [block] type-checks -->
        @switch (block._type) {
          @case ('hero') { <app-hero-block [block]="block" [priority]="first" /> }
          @case ('richText') { <app-rich-text-block [block]="block" /> }
          @case ('stats') { <app-stats-block [block]="block" /> }
          @case ('quote') { <app-quote-block [block]="block" /> }
          @case ('chart') {
            <!-- Heavy blocks can be deferred individually: the chart's code loads when it scrolls into view -->
            @defer (on viewport) {
              <app-chart-block [block]="block" />
            } @placeholder {
              <div class="chart-placeholder">Chart</div>
            }
          }
          @case ('cta') { <app-cta-block [block]="block" /> }
          @default {
            <!-- A block type this frontend doesn't know yet (the CMS schema moved faster than the code).
                 Visible in development, silently skipped in production. -->
            @if (devMode) { <p class="unknown">Unknown block type &ldquo;<code>{{ $any(block)._type }}</code>&rdquo;: add a component for it.</p> }
          }
        }
      </div>
    }
  `,
  styleUrl: './block-renderer.scss'
})
export class BlockRenderer {
  readonly blocks = input.required<Block[]>();
  readonly outlines = input(false);
  protected readonly devMode = isDevMode();
}
