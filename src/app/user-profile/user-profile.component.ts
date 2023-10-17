import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserRegistrationService } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  user: any = {};
  
  favoriteMovies: any[] = [];

  editMode = false;

  @Input() userData = { Username: '', Password: '', Email: '', Birthday: '', };

  constructor(
    public fetchApiData: UserRegistrationService,
    public snackBar: MatSnackBar,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.getUser();
  }

  // toggles edit mode
  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

 // displays the user's info

  getUser(): void {
    this.fetchApiData.getUser().subscribe((response: any) => {
      console.log(response);
      this.user = response;
      this.userData.Username = this.user.Username;
      this.userData.Email = this.user.Email;
      this.userData.Birthday = this.user.Birthday; /* formatDate(this.user.Birthday, 'yyyy-MM-dd', 'en-US', 'UTC+0'); */


      /* this.fetchApiData.getAllMovies().subscribe((response: any) => {
        this.favoriteMovies = response.filter((m: { _id: any }) => this.user.FavoriteMovies.indexOf(m._id) >= 0)
      }) */
    })
  }

  // updates user info

  editUser(form: any): void {
    // form validation logic
    if (form.valid) {
      console.log('Form submitted successfully:', form.value);
    this.fetchApiData.editUser(this.userData).subscribe((data) => {
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('Username', data.Username);
      console.log(data);
      console.log(this.userData)
      this.snackBar.open('User has been updated', 'OK', {
        duration: 2000
      })
      window.location.reload();
    }, (result) => {
      this.snackBar.open(result, 'OK', {
        duration: 2000
      })
    });
  }
  }

  // deletes user

  deleteUser(): void {
    if (confirm('Are you sure?')) {
      this.router.navigate(['welcome']).then(() => {
        this.snackBar.open(
          'Account deleted successfully',
          'OK',
          {
            duration: 2000,
          }
        );
      });
      this.fetchApiData.deleteUser().subscribe((result) => {
        console.log(result);
        localStorage.clear();
      });
    }
  }

  
}
