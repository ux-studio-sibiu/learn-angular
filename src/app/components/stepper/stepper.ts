import { Component, input, model } from '@angular/core';

// model() = an input + an output in one: the parent binds it two-way with [(value)]="someSignal"
// (≈ React's value + onChange pair, or MVC model binding on a form field)
@Component({
  selector: 'app-stepper',
  template: `
    <span class="nsc-stepper">
      <button type="button" (click)="step(-1)" [disabled]="value() <= min()" aria-label="Decrease">−</button>
      <output>{{ value() }}</output>
      <button type="button" (click)="step(1)" [disabled]="value() >= max()" aria-label="Increase">+</button>
    </span>
  `,
  styles: `
    .nsc-stepper { display: inline-flex; align-items: center; gap: 8px; }
    output { min-width: 2ch; text-align: center; font-weight: 700; }
  `
})
export class Stepper {
  readonly value = model(0);
  readonly min = input(0);
  readonly max = input(10);

  protected step(delta: number) {
    this.value.update(v => Math.min(this.max(), Math.max(this.min(), v + delta))); // writing a model() notifies the parent
  }
}
