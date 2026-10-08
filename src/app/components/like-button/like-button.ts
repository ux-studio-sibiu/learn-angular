import { Component } from '@angular/core';

// A reusable component: every <app-like-button> gets its own class instance (own state), like each <LikeButton/> in React.
// Inline template + styles are fine for tiny components (≈ one-file component).
@Component({
  selector: 'app-like-button',
  template: `<button type="button" class="nsc-like-button" [class.is-liked]="likes > 0" (click)="likes = likes + 1">♥ {{ likes }}</button>`,
  styles: `.nsc-like-button.is-liked { color: var(--accent); border-color: var(--accent); }`
})
export class LikeButton {
  protected likes = 0;
}
