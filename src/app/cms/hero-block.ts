import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { HeroBlock } from './blocks';

@Component({
  selector: 'app-hero-block',
  imports: [NgOptimizedImage],
  template: `
    <header class="nsc-hero-block">
      <!-- priority: the first hero is usually the LCP image (lesson 11) -->
      <img [ngSrc]="block().image" fill [priority]="priority()" alt="" />
      <div class="content">
        <p class="kicker">{{ block().kicker }}</p>
        <h2>{{ block().heading }}</h2>
        <p class="intro">{{ block().intro }}</p>
      </div>
    </header>
  `,
  styles: `
    .nsc-hero-block { position: relative; display: grid; align-items: end; min-height: 320px; border-radius: 12px; overflow: hidden; color: #fafaf7; }
    img { object-fit: cover; }
    .content { position: relative; padding: 24px; background: linear-gradient(transparent, rgb(0 0 0 / 0.7)); }
    .kicker { margin: 0; color: #ff8a9b; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    h2 { margin: 6px 0; font-size: clamp(1.6rem, 4vw, 2.4rem); line-height: 1.1; }
    .intro { margin: 0; max-width: 50ch; color: #e6e6df; }
  `
})
export class HeroBlockComponent {
  readonly block = input.required<HeroBlock>();
  readonly priority = input(false);
}
