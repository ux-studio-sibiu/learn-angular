import { Component } from '@angular/core';

// A component = class (logic) + template (markup) + styles. The class is created once, not re-run like a React function.
@Component({
  selector: 'app-lesson-setup', // the tag Angular renders in the real DOM: <app-lesson-setup>
  templateUrl: './lesson-setup.html',
  styleUrl: './lesson-setup.scss'
})
export class LessonSetup {
  protected angularVersion = '20'; // fields are readable in the template; `protected` = template-only, not a public API
}
