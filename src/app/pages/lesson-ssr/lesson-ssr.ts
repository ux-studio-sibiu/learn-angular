import { isPlatformServer } from '@angular/common';
import { afterNextRender, Component, inject, makeStateKey, PLATFORM_ID, signal, TransferState } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TalksApi } from '../../services/talks-api';
import { HydrationProbe } from './hydration-probe';

const RENDERED_AT = makeStateKey<string>('ssr-lesson-rendered-at');

@Component({
  selector: 'app-lesson-ssr',
  imports: [HydrationProbe],
  templateUrl: './lesson-ssr.html',
  styleUrl: './lesson-ssr.scss'
})
export class LessonSsr {
  // Where is this code running right now? The constructor runs twice on a full page load: server, then browser.
  protected readonly platform = isPlatformServer(inject(PLATFORM_ID)) ? 'server' : 'browser';

  // TransferState: the server writes a value into the HTML (as JSON in a <script>), the browser reads it back.
  // Without it, the browser would compute its own time and the text would jump during hydration.
  private readonly state = inject(TransferState);
  protected readonly renderedAt = this.resolveRenderedAt();
  protected readonly hydratedAt = signal('');

  // Fetched on the server during SSR. The response is embedded in the HTML (HTTP transfer cache), so the
  // browser gets it without a second request.
  protected readonly talks = toSignal(inject(TalksApi).getAll(), { initialValue: [] });
  protected readonly networkRequests = signal<number | null>(null);

  constructor() {
    afterNextRender(() => {
      this.hydratedAt.set(new Date().toLocaleTimeString());
      // The browser's own record of real network traffic: a transfer cache hit never shows up here
      setTimeout(() => this.countNetworkRequests(), 1000);
    });
  }

  protected countNetworkRequests() {
    this.networkRequests.set(performance.getEntriesByType('resource').filter(e => e.name.endsWith('/api/talks.json')).length);
  }

  private resolveRenderedAt() {
    if (this.platform === 'server') {
      const now = new Date().toLocaleTimeString();
      this.state.set(RENDERED_AT, now);
      return now;
    }
    const value = this.state.get(RENDERED_AT, '');
    this.state.remove(RENDERED_AT); // read once: after client-side navigation there's no server render, so show ''
    return value;
  }
}
