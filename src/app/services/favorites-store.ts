import { computed, Injectable, signal } from '@angular/core';

// providedIn: 'root' = one instance for the whole app, created the first time someone injects it.
// ≈ a Zustand store / context at the root in React; services.AddSingleton<T>() in ASP.NET.
@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  private readonly ids = signal<number[]>([]); // private writable state…
  readonly count = computed(() => this.ids().length); // …public read-only views

  has(id: number) { return this.ids().includes(id); }
  toggle(id: number) { this.ids.update(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id])); }
  clear() { this.ids.set([]); }
}
