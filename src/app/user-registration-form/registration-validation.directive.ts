import { Directive, forwardRef, Input, OnChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appRegistrationValidation]',
  providers: [{ provide: NG_VALIDATORS, useExisting: forwardRef(() => RegistrationValidationDirective), multi: true }],
})
export class RegistrationValidationDirective implements Validator, OnChanges {
  @Input() appRegistrationValidation: 'password' | 'confirmation' | 'birthday' = 'password';
  @Input() matchingPassword = '';
  private changed?: () => void;

  ngOnChanges(): void {
    // Template-driven ngModel updates also settle asynchronously. Revalidate after bindings settle.
    Promise.resolve().then(() => this.changed?.());
  }
  registerOnValidatorChange(fn: () => void): void { this.changed = fn; }

  validate(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value ?? '';
    if (!value) return null; // Angular's required validator handles required fields.
    if (this.appRegistrationValidation === 'password') {
      if (Array.from(value).length < 8) return { minlength: true };
      return new TextEncoder().encode(value).length > 72 ? { passwordBytes: true } : null;
    }
    if (this.appRegistrationValidation === 'confirmation') {
      return value !== this.matchingPassword ? { passwordMismatch: true } : null;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { birthday: true };
    const date = new Date(value + 'T00:00:00.000Z');
    const todayString = new Date().toISOString().slice(0, 10);
    return !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value || value > todayString
      ? { birthday: true } : null;
  }
}
