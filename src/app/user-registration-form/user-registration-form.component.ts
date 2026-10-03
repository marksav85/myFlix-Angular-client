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
    this.isSubmitting = true;
    this.fetchApiData.userRegistration({ ...this.userData })
      .pipe(takeUntil(this.destroyed)).subscribe({
        next: () => {
          this.registrationSucceeded = true;
          this.isSubmitting = false;
          // Keep useful account details, clear the password and reset submitted validation.
          this.userData.Password = '';
          form.resetForm({ ...this.userData });
        },
        error: () => {
          this.isSubmitting = false;
          this.error = 'Registration unsuccessful. Please try again.';
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
