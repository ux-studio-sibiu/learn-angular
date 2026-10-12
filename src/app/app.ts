import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FavoritesStore } from './services/favorites-store';

// Root component ≈ Next.js app/layout.tsx. Standalone: it imports what its template uses.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  // host listeners ≈ document.addEventListener, removed automatically when the component is destroyed
  host: { '(document:click)': 'closeMenuOnOutsideClick($event)', '(document:keydown.escape)': 'closeMenu()' }
})
export class App {
  protected readonly favorites = inject(FavoritesStore);
  private readonly lessonsMenu = viewChild.required<ElementRef<HTMLDetailsElement>>('lessonsMenu');

  protected closeMenu() { this.lessonsMenu().nativeElement.open = false; }
  protected closeMenuOnOutsideClick(e: Event) {
    if (!this.lessonsMenu().nativeElement.contains(e.target as Node)) this.closeMenu();
  }
}
