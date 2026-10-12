import { NgOptimizedImage } from '@angular/common';
import { Component, signal } from '@angular/core';
import { liveRenderers, SceneStats } from './scene-stats';
import { ThreeScene } from './three-scene';

@Component({
  selector: 'app-lesson-three',
  // ThreeScene is only used inside @defer, so it (and three.js) lands in its own lazy chunk
  imports: [NgOptimizedImage, ThreeScene],
  templateUrl: './lesson-three.html',
  styleUrl: './lesson-three.scss'
})
export class LessonThree {
  protected readonly colors = ['#c3002f', '#1f6feb', '#2da44e', '#e3b341'];
  protected readonly color = signal(this.colors[0]);
  protected readonly detail = signal(1);
  protected readonly autoRotate = signal(true);
  protected readonly mounted = signal(true);
  protected readonly leak = signal(false);
  protected readonly stats = signal<SceneStats | null>(null);
  protected readonly liveRenderers = liveRenderers;

  protected setDetail(value: string) { this.detail.set(Number(value)); }
}
