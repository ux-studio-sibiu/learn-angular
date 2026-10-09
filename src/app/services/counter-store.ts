import { Injectable, signal } from '@angular/core';

// No providedIn: this service only exists where a component lists it in `providers: [CounterStore]`.
// Each such component gets its own instance, shared by everything inside it (≈ a <Context.Provider> around a subtree).
@Injectable()
export class CounterStore {
  readonly value = signal(0);
  increment() { this.value.update(v => v + 1); }
}
