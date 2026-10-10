import { CanDeactivateFn } from '@angular/router';

// Any routed component can opt in by implementing this (≈ a beforeunload prompt, but for in-app navigation)
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

// Runs when you try to leave the route. Returning false cancels the navigation.
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = page =>
  !page.hasUnsavedChanges() || confirm('You have unsaved changes. Leave anyway?');
