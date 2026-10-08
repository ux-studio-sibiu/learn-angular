import { Component } from '@angular/core';
import { LikeButton } from '../../components/like-button/like-button';

@Component({
  selector: 'app-lesson-components',
  imports: [LikeButton], // ≈ `import LikeButton from ...` in React: a template can only use what is listed here
  templateUrl: './lesson-components.html',
  styleUrl: './lesson-components.scss'
})
export class LessonComponents {
  // Plain fields for now. They still update the screen because zone.js re-checks bindings after every DOM event.
  // Lesson 03 replaces these with signals, which is the modern way.
  protected name = 'Razvan';
  protected submitted = '';
  protected count = 0;
  protected isActive = false;
  protected width = 40;

  protected greet() { return `Hello, ${this.name || 'stranger'}!`; }
  protected grow() { this.width = this.width >= 100 ? 20 : this.width + 20; }
}
