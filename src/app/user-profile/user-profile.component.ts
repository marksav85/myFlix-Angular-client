import { Component, OnInit, Input } from '@angular/core';
import { UserRegistrationService } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  // arrays to hold user data
  user: any = {};
  favorites: any[] = [];
  // boolean to toggle edit mode
  editMode = false;
  // user input data to be updated
  @Input() userData = { Username: '', Password: '', Email: '', Birthday: '' };

  constructor(
    public fetchApiData: UserRegistrationService,
    public snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  // toggles edit mode
  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  /**
   * gets user's information and all movies, then sfilters user's favorites
   * @returns the user's information
   * @returns the all movies
   */
  getUser(): void {
    this.fetchApiData.getUser().subscribe((response: any) => {
      this.user = response;
      this.userData.Username = this.user.Username;
      this.userData.Email = this.user.Email;
      this.userData.Birthday = this.user.Birthday;
    });
    this.fetchApiData.getAllMovies().subscribe((resp: any) => {
      const movies = resp;
      movies.forEach((movie: any) => {
        if (this.user.FavoriteMovies.includes(movie._id)) {
          this.favorites.push(movie);
        }
      });
    });
  }

  /**
   * updates user's information and refreshes user info
   * @param userData
   * @returns the user's information
   */
  editUser(form: any): void {
    // form validation logic
    if (form.valid) {
      console.log('Form submitted successfully:', form.value);
      this.fetchApiData.editUser(this.userData).subscribe(
        (result) => {
          localStorage.setItem('user', JSON.stringify(result));
          localStorage.setItem('Username', result.Username);
          this.snackBar.open('User has been updated', 'OK', {
            duration: 2000,
          });
          // refreshes user info
          this.getUser();
        },
        (error) => {
          this.snackBar.open(
            'User could not be updated. Please try again',
            'OK',
            {
              duration: 2000,
            }
          );
        }
      );
    }
  }

  /**
   * deletes the user's account
   */
  deleteUser(): void {
    if (confirm('Are you sure?')) {
      this.router.navigate(['welcome']).then(() => {
        this.snackBar.open('Account deleted successfully', 'OK', {
          duration: 2000,
        });
      });
      this.fetchApiData.deleteUser().subscribe((result) => {
        console.log(result);
        localStorage.clear();
      });
    }
  }
}
