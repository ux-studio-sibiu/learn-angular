import { afterNextRender, AfterViewInit, Component, DestroyRef, effect, inject, Injectable, input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges } from '@angular/core';

// Page-scoped log (provided by the lesson page, lesson 05 style)
@Injectable()
export class LifecycleLog {
  readonly lines = signal<string[]>([]);
  private n = 0;
  // Deferred with queueMicrotask so writing the log *during* change detection doesn't change the parent's view mid-check
  add(line: string) { const entry = `${++this.n}. ${line}`; queueMicrotask(() => this.lines.update(list => [...list, entry])); }
  clear() { this.n = 0; this.lines.set([]); }
}

@Component({
  selector: 'app-lifecycle-probe',
  template: `<p class="nsc-lifecycle-probe">I'm probe “{{ label() }}”</p>`,
  styles: `.nsc-lifecycle-probe { margin: 0; padding: 8px 12px; border: 1px dashed var(--accent); border-radius: 6px; }`
})
export class LifecycleProbe implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  readonly label = input('');
  private readonly log = inject(LifecycleLog);

  constructor() {
    // Runs first, once. Inputs are NOT bound yet: label() is still the default ''.
    this.log.add(`constructor: label = "${this.label()}" (not bound yet)`);

    // Modern: react to input changes with an effect (≈ useEffect(..., [label]))
    effect(() => this.log.add(`effect: label is "${this.label()}"`));

    // Modern: run once after the DOM exists, browser only (≈ useEffect(..., []) / $(document).ready)
    afterNextRender(() => this.log.add('afterNextRender: DOM is ready → attach GSAP / Three.js here'));

    // Modern: register cleanup from anywhere in an injection context (≈ the function returned from useEffect)
    inject(DestroyRef).onDestroy(() => this.log.add('DestroyRef.onDestroy: clean up here'));
  }

  // Classic interface hooks: still everywhere in existing code, and still valid
  ngOnChanges(changes: SimpleChanges) {
    const c = changes['label'];
    this.log.add(`ngOnChanges: label "${c.previousValue ?? '(none)'}" → "${c.currentValue}"`);
  }
  ngOnInit() { this.log.add(`ngOnInit: inputs are set, label = "${this.label()}"`); }
  ngAfterViewInit() { this.log.add('ngAfterViewInit: own template rendered, viewChild queries are ready'); }
  ngOnDestroy() { this.log.add('ngOnDestroy'); }
}
