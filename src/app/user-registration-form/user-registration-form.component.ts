import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RegistrationPayload } from '../api-models';
import { FetchApiDataService } from '../fetch-api-data.service';

@Component({
  selector: 'app-user-registration-form',
  templateUrl: './user-registration-form.component.html',
  styleUrls: ['./user-registration-form.component.scss'],
})
export class UserRegistrationFormComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pageHeading') pageHeading?: ElementRef<HTMLHeadingElement>;
  @Input() userData: RegistrationPayload = { Username: '', Password: '', Email: '', Birthday: '' };
  confirmPassword = '';
  fieldErrors: Partial<Record<keyof RegistrationPayload, string>> = {};
  isSubmitting = false;
  error = '';
  registrationSucceeded = false;
  private readonly destroyed = new Subject<void>();

  constructor(private fetchApiData: FetchApiDataService) {}

  ngAfterViewInit(): void {
    this.pageHeading?.nativeElement.focus();
  }

  registerUser(form: Pick<NgForm, 'valid' | 'resetForm'>): void {
    if (!form.valid || this.isSubmitting || this.registrationSucceeded) return;
    this.error = '';
    this.fieldErrors = {};
    this.isSubmitting = true;
    this.fetchApiData.userRegistration({
      Username: this.userData.Username, Password: this.userData.Password, Email: this.userData.Email,
      ...(this.userData.Birthday ? { Birthday: this.userData.Birthday } : {}),
    })
      .pipe(takeUntil(this.destroyed)).subscribe({
        next: () => {
          this.registrationSucceeded = true;
          this.isSubmitting = false;
          // Keep useful account details, clear the password and reset submitted validation.
          this.userData.Password = '';
          this.confirmPassword = '';
          form.resetForm({ ...this.userData });
        },
        error: (response: unknown) => {
          this.isSubmitting = false;
          this.showRegistrationError(response);
        },
      });
  }

  clearFieldError(field: keyof RegistrationPayload): void { delete this.fieldErrors[field]; }

  private showRegistrationError(response: unknown): void {
    this.error = 'Registration unsuccessful. Please try again.';
    if (!(response instanceof HttpErrorResponse)) return;
    if (response.status === 400 && typeof response.error === 'string' && /already exists|duplicate|already taken/i.test(response.error)) {
      this.fieldErrors.Username = 'This username is already taken. Please choose another.';
    } else if (response.status === 422 && Array.isArray(response.error?.errors)) {
      for (const item of response.error.errors) {
        const field = item?.path ?? item?.param;
        if (['Username', 'Password', 'Email', 'Birthday'].includes(field) && typeof item.msg === 'string') {
          this.fieldErrors[field as keyof RegistrationPayload] = item.msg;
        }
      }
    }
    if (Object.keys(this.fieldErrors).length) this.error = 'Please correct the highlighted fields and try again.';
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
