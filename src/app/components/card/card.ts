import { booleanAttribute, Component, input } from '@angular/core';

// Content projection: the parent passes markup between the tags, and <ng-content> decides where it lands.
// Default <ng-content /> ≈ React {children}; select="[attr]" = named slots (≈ passing JSX in a `title` prop).
@Component({
  selector: 'app-card',
  host: { class: 'nsc-card', '[class.featured]': 'featured()' }, // classes on the host element itself (<app-card>)
  template: `
    <header class="header"><ng-content select="[card-title]" /></header>
    <div class="body"><ng-content /></div>
    <footer class="footer"><ng-content select="[card-footer]" /></footer>
  `,
  styleUrl: './card.scss'
})
export class Card {
  // booleanAttribute lets the parent write <app-card featured> instead of [featured]="true" (≈ <Card featured /> in JSX)
  readonly featured = input(false, { transform: booleanAttribute });
}
