import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TALKS } from './talks';

@Component({
  selector: 'app-talk-list',
  imports: [RouterLink],
  template: `
    <div class="nsc-talk-list">
      <p class="sort">
        Sort:
        <!-- queryParams ≈ ?sort=title (Next.js searchParams). Same route, so the component stays and only the input changes -->
        <a routerLink="." [queryParams]="{ sort: null }" [class.is-active]="!sort()">default</a>
        <a routerLink="." [queryParams]="{ sort: 'title' }" [class.is-active]="sort() === 'title'">by title</a>
      </p>
      <ul>
        @for (t of talks(); track t.id) {
          <li><a [routerLink]="['/lessons/routing/talks', t.id]">{{ t.title }}</a> <span class="speaker">{{ t.speaker }}</span></li>
        }
      </ul>
    </div>
  `,
  styleUrl: './lesson-routing.scss'
})
export class TalkList {
  readonly sort = input<string>(); // bound from ?sort= by withComponentInputBinding(); undefined when absent
  protected readonly talks = computed(() => (this.sort() === 'title' ? [...TALKS].sort((a, b) => a.title.localeCompare(b.title)) : TALKS));
}
