import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-chip',
  template: `<span class="nsc-chip">{{ label() }}<button type="button" (click)="remove.emit()" [attr.aria-label]="'Remove ' + label()">✕</button></span>`,
  styles: `
    .nsc-chip { display: inline-flex; align-items: center; gap: 6px; padding: 2px 4px 2px 10px; border: 1px solid var(--line); border-radius: 999px; font-size: 0.9rem; }
    button { padding: 0 6px; border: 0; background: none; color: var(--muted); cursor: pointer; }
    button:hover { color: var(--accent); }
  `
})
export class Chip {
  readonly label = input.required<string>(); // ≈ a required prop; read as this.label() because inputs are signals
  readonly remove = output();                // ≈ an onRemove callback prop; the parent listens with (remove)="…"
}
