import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { activeLoops, BouncingCanvas, stopLeakedLoops } from './bouncing-canvas';
import { LifecycleLog, LifecycleProbe } from './lifecycle-probe';

@Component({
  selector: 'app-lesson-lifecycle',
  imports: [LifecycleProbe, BouncingCanvas],
  providers: [LifecycleLog],
  templateUrl: './lesson-lifecycle.html',
  styleUrl: './lesson-lifecycle.scss'
})
export class LessonLifecycle {
  // 1. Lifecycle probe
  protected readonly log = inject(LifecycleLog);
  protected readonly showProbe = signal(true);
  protected readonly label = signal('A');
  protected nextLabel() { this.label.update(l => String.fromCharCode(((l.charCodeAt(0) - 64) % 26) + 65)); }

  // 2. viewChild: a signal holding the element once it's rendered (≈ useRef(null) + ref={...})
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');
  protected readonly measured = signal('');
  protected focusInput() { this.nameInput().nativeElement.focus(); }
  protected measure() {
    const r = this.nameInput().nativeElement.getBoundingClientRect();
    this.measured.set(`${Math.round(r.width)} × ${Math.round(r.height)} px`);
  }

  // 3. Canvas loop
  protected readonly showCanvas = signal(true);
  protected readonly leak = signal(false);
  protected readonly activeLoops = activeLoops;
  protected readonly stopLeakedLoops = stopLeakedLoops;
}
