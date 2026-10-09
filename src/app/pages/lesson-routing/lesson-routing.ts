import { booleanAttribute, Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Session } from '../../services/session';

@Component({
  selector: 'app-lesson-routing',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './lesson-routing.html',
  styleUrl: './lesson-routing.scss'
})
export class LessonRouting {
  readonly denied = input(false, { transform: booleanAttribute }); // ?denied=1, set by the guard's redirect
  protected readonly session = inject(Session);
}
