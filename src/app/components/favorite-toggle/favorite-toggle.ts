import { Component, inject, input } from '@angular/core';
import { FavoritesStore } from '../../services/favorites-store';

// Reads and writes shared state without props or callbacks: inject() ≈ useContext() / a store hook
@Component({
  selector: 'app-favorite-toggle',
  template: `<button type="button" class="nsc-favorite-toggle" [class.is-on]="favorites.has(id())" [attr.aria-pressed]="favorites.has(id())" (click)="favorites.toggle(id())">{{ favorites.has(id()) ? '★' : '☆' }}</button>`,
  styles: `.nsc-favorite-toggle.is-on { color: var(--accent); border-color: var(--accent); }`
})
export class FavoriteToggle {
  readonly id = input.required<number>();
  protected readonly favorites = inject(FavoritesStore);
}
