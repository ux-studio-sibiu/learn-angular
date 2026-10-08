import { Component, computed, effect, signal } from '@angular/core';

type Ticket = { id: number; name: string; price: number; qty: number };

const STORAGE_KEY = 'learn-angular:tickets';

function loadQty(): number[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}

@Component({
  selector: 'app-lesson-signals',
  templateUrl: './lesson-signals.html',
  styleUrl: './lesson-signals.scss'
})
export class LessonSignals {
  // 1. signal ≈ useState. readonly: you replace the value via set/update, never the signal itself.
  protected readonly count = signal(0);
  protected readonly double = computed(() => this.count() * 2); // ≈ useMemo, but no dependency array

  // 2. computed chains: each one re-runs only when a signal it read changes, and caches the result
  protected readonly query = signal('');
  private readonly saved = loadQty(); // field initializers run top to bottom, so this is ready for `tickets`
  protected readonly tickets = signal<Ticket[]>(
    [
      { id: 1, name: 'Opening plenary', price: 40, qty: 0 },
      { id: 2, name: 'AI governance workshop', price: 25, qty: 0 },
      { id: 3, name: 'Climate & nature panel', price: 30, qty: 0 }
    ].map((t, i) => ({ ...t, qty: this.saved[i] ?? 0 }))
  );
  protected readonly visible = computed(() => {
    const q = this.query().toLowerCase();
    return this.tickets().filter(t => t.name.toLowerCase().includes(q));
  });
  protected readonly totalQty = computed(() => this.tickets().reduce((sum, t) => sum + t.qty, 0));
  protected readonly totalPrice = computed(() => this.tickets().reduce((sum, t) => sum + t.qty * t.price, 0));

  constructor() {
    // 3. effect ≈ useEffect with auto-tracked deps. Side effects only (DOM, storage, logging, later GSAP).
    // Must be created in an injection context (constructor / field) so Angular can destroy it with the component.
    effect(() => { document.title = `Cart (${this.totalQty()}) · Signals`; });
    effect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tickets().map(t => t.qty))));
  }

  // ✔ New array + new object for the changed row, so the signal sees a new reference
  protected changeQty(id: number, delta: number) {
    this.tickets.update(list => list.map(t => (t.id === id ? { ...t, qty: Math.max(0, t.qty + delta) } : t)));
  }

  // ✘ Mutates in place: same array reference, so the signal never notifies and the computeds stay stale
  protected mutateQty(id: number) {
    this.tickets().find(t => t.id === id)!.qty++;
  }

  // A plain method re-runs on every change detection pass (no caching), so it sees the mutation the computed missed
  protected actualQty() { return this.tickets().reduce((sum, t) => sum + t.qty, 0); }

  protected reset() { this.tickets.update(list => list.map(t => ({ ...t, qty: 0 }))); }
}
