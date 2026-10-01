import { RegistrationPayload } from '../api-models';
// src/app/user-registration-form/user-registration-form.component.ts
import { Component, Input } from '@angular/core';

// You'll use this import to close the dialog on success
import { MatDialogRef } from '@angular/material/dialog';

// This import brings in the API calls we created in 6.2
import { FetchApiDataService } from '../fetch-api-data.service';

// This import is used to display notifications back to the user
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-registration-form',
  templateUrl: './user-registration-form.component.html',
  styleUrls: ['./user-registration-form.component.scss'],
})
export class UserRegistrationFormComponent {
  @Input() userData: RegistrationPayload = { Username: '', Password: '', Email: '', Birthday: '' };

  constructor(
    public fetchApiData: FetchApiDataService,
    public dialogRef: MatDialogRef<UserRegistrationFormComponent>,
    public snackBar: MatSnackBar
  ) {}


  /**
   * registers user and refreshes page
   * @param userData
   */
  registerUser(): void {
    this.fetchApiData.userRegistration(this.userData).subscribe(
      () => {
        // Logic for a successful user registration goes here!
        this.dialogRef.close(); // This will close the modal on success!
        this.snackBar.open('Registration successful. Please login.', 'OK', {
          duration: 2000,
        });
      },
      () => {
        this.snackBar.open(
          'Registration unsuccessful. Please try again.',
          'OK',
          {
            duration: 2000,
          }
        );
      }
    );
  }
}
