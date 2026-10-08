import { Component } from '@angular/core';
import { LikeButton } from '../../components/like-button/like-button';

type Talk = { id: number; title: string };
type Status = 'idle' | 'loading' | 'error' | 'done';

@Component({
  selector: 'app-lesson-control-flow',
  imports: [LikeButton], // @if / @for / @switch are built into the template syntax: nothing to import (the old *ngIf needed CommonModule)
  templateUrl: './lesson-control-flow.html',
  styleUrl: './lesson-control-flow.scss'
})
export class LessonControlFlow {
  protected user: { name: string; role: string } | null = null;
  protected status: Status = 'idle';
  protected statuses: Status[] = ['idle', 'loading', 'error', 'done'];

  private nextId = 4;
  protected talks: Talk[] = [
    { id: 1, title: 'The future of jobs' },
    { id: 2, title: 'Climate & nature' },
    { id: 3, title: 'AI governance' }
  ];

  protected toggleUser() { this.user = this.user ? null : { name: 'Razvan', role: 'Design engineer' }; }

  // Replace the array instead of mutating it: the React habit, and what signals will require in lesson 03
  protected add() { this.talks = [...this.talks, { id: this.nextId, title: `New talk #${this.nextId++}` }]; }
  protected remove(id: number) { this.talks = this.talks.filter(t => t.id !== id); }
  protected shuffle() { this.talks = [...this.talks].sort(() => Math.random() - 0.5); }
  protected clear() { this.talks = []; }
}
