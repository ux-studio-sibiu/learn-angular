import { Component, inject } from '@angular/core';
import { FavoriteToggle } from '../../components/favorite-toggle/favorite-toggle';
import { CounterButton, ScopedPanel } from '../../components/scoped-panel/scoped-panel';
import { FavoritesStore } from '../../services/favorites-store';
import { MotionMode, MotionPreference } from '../../services/motion-preference';

@Component({
  selector: 'app-lesson-services',
  imports: [FavoriteToggle, ScopedPanel, CounterButton],
  templateUrl: './lesson-services.html',
  styleUrl: './lesson-services.scss'
})
export class LessonServices {
  // inject() runs once, when the class is created. Only allowed in field initializers or the constructor.
  protected readonly favorites = inject(FavoritesStore);
  protected readonly motion = inject(MotionPreference);
  protected readonly modes: MotionMode[] = ['system', 'reduce', 'full'];

  protected readonly talks = [
    { id: 1, title: 'The future of jobs' },
    { id: 2, title: 'Climate & nature' },
    { id: 3, title: 'AI governance' },
    { id: 4, title: 'Global health' }
  ];
}
