import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TALKS } from './talks';

@Component({
  selector: 'app-talk-detail',
  imports: [RouterLink],
  template: `
    <div class="nsc-talk-detail">
      @if (talk(); as t) {
        <h3>{{ t.title }}</h3>
        <p class="speaker">{{ t.speaker }}</p>
        <p>{{ t.summary }}</p>
      } @else {
        <h3>Talk “{{ id() }}” not found</h3>
      }
      <p class="links">
        <a routerLink="/lessons/routing">← All talks</a>
        <a [routerLink]="['/lessons/routing/talks', nextId()]">Next talk →</a>
        <button type="button" (click)="random()">Random (Router.navigate)</button>
      </p>
      <p class="note">This component instance was created at <strong>{{ createdAt }}</strong>. Click "Next talk": the time stays the same.</p>
    </div>
  `,
  styleUrl: './lesson-routing.scss'
})
export class TalkDetail {
  // :id arrives as an input (≈ the `params` prop of a Next.js page). Always a string: URLs have no numbers.
  readonly id = input.required<string>();
  protected readonly talk = computed(() => TALKS.find(t => t.id === Number(this.id())));
  protected readonly nextId = computed(() => (Number(this.id()) % TALKS.length) + 1);
  protected readonly createdAt = new Date().toLocaleTimeString();

  private readonly router = inject(Router);

  // ≈ router.push() in Next.js, RedirectToAction in MVC, window.location in jQuery (but without a reload)
  protected random() {
    const pick = TALKS[Math.floor(Math.random() * TALKS.length)];
    this.router.navigate(['/lessons/routing/talks', pick.id]);
  }
}
