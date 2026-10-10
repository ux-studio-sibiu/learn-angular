import { httpResource } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { HttpLog } from '../../services/http-log';
import { Talk, TalksApi } from '../../services/talks-api';

@Component({
  selector: 'app-lesson-http',
  templateUrl: './lesson-http.html',
  styleUrl: './lesson-http.scss'
})
export class LessonHttp {
  protected readonly log = inject(HttpLog);
  private readonly api = inject(TalksApi);

  // 1. Resolver: data is already here when the page renders (route `resolve: { talks }` → input via withComponentInputBinding)
  readonly talks = input.required<Talk[]>();

  // 2. httpResource (experimental in v20) ≈ TanStack Query's useQuery: the URL function reads a signal,
  // so changing selectedId re-fetches automatically (and cancels the previous request). Returning undefined = idle.
  protected readonly selectedId = signal<number | undefined>(undefined);
  protected readonly talk = httpResource<Talk>(() => (this.selectedId() ? `/api/talks/${this.selectedId()}.json` : undefined));

  // 3. HttpClient by hand: subscribe and copy the result into signals (the classic way, ≈ fetch().then(setState))
  protected readonly manual = signal<Talk[] | null>(null);
  protected readonly manualLoading = signal(false);
  protected readonly manualError = signal('');

  protected load(missing = false) {
    this.manualLoading.set(true);
    this.manualError.set('');
    (missing ? this.api.getMissing() : this.api.getAll()).subscribe({
      next: talks => this.manual.set(talks),
      error: err => { this.manualError.set(`${err.status} ${err.statusText || 'error'}`); this.manualLoading.set(false); },
      complete: () => this.manualLoading.set(false) // HttpClient completes after one response, so no unsubscribe needed
    });
  }
}
