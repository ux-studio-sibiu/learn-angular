import { Component, computed, signal } from '@angular/core';
import { Card } from '../../components/card/card';
import { Chip } from '../../components/chip/chip';
import { LikeButton } from '../../components/like-button/like-button';
import { Stepper } from '../../components/stepper/stepper';

@Component({
  selector: 'app-lesson-inputs',
  imports: [Card, Chip, LikeButton, Stepper],
  templateUrl: './lesson-inputs.html',
  styleUrl: './lesson-inputs.scss'
})
export class LessonInputs {
  // Data flows down via inputs, events flow up via outputs: the same one-way flow as React
  protected readonly tags = signal(['Angular', 'GSAP', 'Three.js']);
  protected readonly lastRemoved = signal('');

  protected readonly guests = signal(2); // owned here, edited by <app-stepper [(value)]="guests">
  protected readonly total = computed(() => this.guests() * 40);

  protected addTag(raw: string) {
    const tag = raw.trim();
    if (tag && !this.tags().includes(tag)) this.tags.update(list => [...list, tag]);
  }

  protected removeTag(tag: string) {
    this.tags.update(list => list.filter(t => t !== tag));
    this.lastRemoved.set(tag);
  }
}
