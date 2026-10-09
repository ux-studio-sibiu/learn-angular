import { Component, inject } from '@angular/core';
import { Session } from '../../services/session';

@Component({
  selector: 'app-backstage',
  template: `
    <div class="nsc-backstage">
      <h3>Backstage</h3>
      <p>You only got here because <code>signedInGuard</code> returned true.</p>
      <p class="note">Now sign out with the button above: you stay on this page. Guards only run on navigation, not when a signal changes. Reacting to that is the component's job (or an effect that navigates away).</p>
      @if (!session.signedIn()) {
        <p class="warning">Signed out, but still here.</p>
      }
    </div>
  `,
  styleUrl: './lesson-routing.scss'
})
export class Backstage {
  protected readonly session = inject(Session);
}
