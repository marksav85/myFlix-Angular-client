// src/app/user-login-form/user-login-form.component.ts
import { Component, OnInit, Input } from '@angular/core';

// You'll use this import to close the dialog on success
import { MatDialogRef } from '@angular/material/dialog';

// This import brings in the API calls we created in 6.2
import { UserRegistrationService } from '../fetch-api-data.service';

// This import is used to display notifications back to the user
import { MatSnackBar } from '@angular/material/snack-bar';

// routing
import { Router } from '@angular/router';


@Component({
  selector: 'app-user-login-form',
  templateUrl: './user-login-form.component.html',
  styleUrls: ['./user-login-form.component.scss']
})

export class UserLoginFormComponent implements OnInit {

  @Input() userData = { Username: '', Password: ''};

constructor(
    public fetchApiData: UserRegistrationService,
    public dialogRef: MatDialogRef<UserLoginFormComponent>,
    public snackBar: MatSnackBar,
    private router: Router
    ) { }

ngOnInit(): void {
}

// This is the function responsible for sending the form inputs to the backend
loginUser(): void {
    this.fetchApiData.userLogin(this.userData).subscribe((data) => {
  // Logic for a successful user login goes here!
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token);
      localStorage.setItem('Username', data.user.Username)
    /* localStorage.setItem('user', result.user.Username);
    localStorage.setItem('token', result.token); */
     this.dialogRef.close(); // This will close the modal on success!
     this.snackBar.open(data, 'OK', {
        duration: 2000
     });
     this.router.navigate(['movies']);
    }, (result) => {
      this.snackBar.open(result, 'OK', {
        duration: 2000
      });
    });
    
  }


  }
