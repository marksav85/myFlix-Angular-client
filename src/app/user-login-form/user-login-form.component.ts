import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoginPayload } from '../api-models';
import { FetchApiDataService } from '../fetch-api-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login-form',
  templateUrl: './user-login-form.component.html',
  styleUrls: ['./user-login-form.component.scss'],
})
export class UserLoginFormComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pageHeading') pageHeading?: ElementRef<HTMLHeadingElement>;
  @Input() userData: LoginPayload = { Username: '', Password: '' };
  isSubmitting = false;
  error = '';

  private readonly destroyed = new Subject<void>();

  constructor(private fetchApiData: FetchApiDataService, private router: Router) {}

  ngAfterViewInit(): void {
    this.pageHeading?.nativeElement.focus();
  }

  loginUser(form: Pick<NgForm, 'valid'>): void {
    if (!form.valid || this.isSubmitting) return;
    this.error = '';
    this.isSubmitting = true;
    this.fetchApiData.userLogin({ ...this.userData })
      .pipe(takeUntil(this.destroyed)).subscribe({
        next: result => {
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('token', result.token);
          localStorage.setItem('Username', result.user.Username);
          this.isSubmitting = false;
          this.router.navigate(['movies']);
        },
        error: () => {
          this.isSubmitting = false;
          this.error = 'Login unsuccessful. Please try again.';
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
