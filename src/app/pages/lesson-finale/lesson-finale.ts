import { NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, viewChild } from '@angular/core';
import { useRenderMeter } from '../../services/render-meter';
import { ScrollScene } from './scroll-scene';

@Component({
  selector: 'app-lesson-finale',
  imports: [NgOptimizedImage, ScrollScene], // ScrollScene only appears inside @defer → GSAP + three.js load on demand
  templateUrl: './lesson-finale.html',
  styleUrl: './lesson-finale.scss'
})
export class LessonFinale {
  private readonly meter = viewChild.required<ElementRef<HTMLElement>>('meter');
  constructor() { useRenderMeter(() => this.meter().nativeElement); }
}
