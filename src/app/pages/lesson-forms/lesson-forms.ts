import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncValidatorFn, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { map, timer } from 'rxjs';
import { HasUnsavedChanges } from '../../services/unsaved-changes-guard';

// Validators are plain functions: return null when valid, or an error object (≈ a DataAnnotation attribute / a zod refinement)
const ticketCode: ValidatorFn = c => (!c.value || /^WEF-\d{4}$/.test(c.value) ? null : { ticketCode: true });

// Cross-field rule lives on the group, because it needs two controls (≈ IValidatableObject in .NET, zod .refine on the object)
const guestNameIfBringing: ValidatorFn = g => (g.get('bringGuest')?.value && !g.get('guestName')?.value.trim() ? { guestName: true } : null);

// Async validator: pretend to ask the server whether the email is taken. While it runs, the control is 'PENDING'.
const emailAvailable: AsyncValidatorFn = c => timer(600).pipe(map(() => (c.value === 'taken@example.com' ? { taken: true } : null)));

@Component({
  selector: 'app-lesson-forms',
  imports: [ReactiveFormsModule, FormsModule, JsonPipe],
  templateUrl: './lesson-forms.html',
  styleUrl: './lesson-forms.scss'
})
export class LessonForms implements HasUnsavedChanges {
  protected readonly sessions = ['Opening plenary', 'AI governance workshop', 'Climate & nature panel'];

  // Reactive form: the model is defined in code, the template only binds to it. Typed: form.value.guests is a number.
  // NonNullable = reset() goes back to the initial values instead of null.
  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', { validators: [Validators.required, Validators.email], asyncValidators: [emailAvailable], updateOn: 'blur' }],
      session: [this.sessions[0]],
      guests: [1, [Validators.min(1), Validators.max(8)]],
      bringGuest: [false],
      guestName: [''],
      ticket: ['', ticketCode]
    },
    { validators: guestNameIfBringing }
  );

  // Observable → signal bridge (lesson 07): a live view of the form value
  protected readonly live = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly submitted = signal<object | null>(null);

  // Template-driven: the model is a signal, the template declares the rules with attributes (closer to plain HTML / jQuery validate)
  protected readonly newsletterEmail = signal('');
  protected readonly subscribedAs = signal('');

  protected submit() {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched(); // reveal every error at once, like ModelState errors after a POST
      return;
    }
    this.submitted.set(this.form.getRawValue());
    this.form.markAsPristine(); // no longer "unsaved", so the leave guard lets you go
  }

  protected reset() {
    this.form.reset();
    this.submitted.set(null);
  }

  protected showError(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  hasUnsavedChanges() { return this.form.dirty; } // read by unsavedChangesGuard (canDeactivate on this route)
}
