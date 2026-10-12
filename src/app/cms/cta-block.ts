import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CtaBlock } from './blocks';

@Component({
  selector: 'app-cta-block',
  imports: [RouterLink],
  template: `
    <aside class="nsc-cta-block">
      <h3>{{ block().heading }}</h3>
      @if (link(); as l) {
        <!-- Internal links from the CMS become router links (no full reload); external ones stay plain links -->
        @if (l.internal) {
          <a class="button" [routerLink]="l.path" [queryParams]="l.query">{{ block().label }} →</a>
        } @else {
          <a class="button" [href]="block().href" rel="noopener">{{ block().label }} →</a>
        }
      }
    </aside>
  `,
  styles: `
    .nsc-cta-block { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 20px; border-radius: 12px; background: var(--code-bg); }
    h3 { margin: 0; }
    .button { padding: 8px 16px; border-radius: 999px; background: var(--accent); color: #fff; font-weight: 600; text-decoration: none; }
  `
})
export class CtaBlockComponent {
  readonly block = input.required<CtaBlock>();
  // "/lessons/cms?page=x" → { path: '/lessons/cms', query: { page: 'x' } }, because routerLink takes them separately
  protected readonly link = computed(() => {
    const href = this.block().href;
    if (!href.startsWith('/')) return { internal: false, path: '', query: {} };
    const url = new URL(href, 'http://local');
    return { internal: true, path: url.pathname, query: Object.fromEntries(url.searchParams) };
  });
}
