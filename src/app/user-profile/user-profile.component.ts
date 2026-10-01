import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FetchApiDataService } from '../fetch-api-data.service';
import { Movie, ProfileUpdatePayload, User } from '../api-models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  user: User = { _id: '', Username: '', Email: '', FavoriteMovies: [] };
  favorites: Movie[] = [];
  editMode = false;
  @Input() userData: ProfileUpdatePayload = { Username: '', Password: '', Email: '', Birthday: '' };

  constructor(
    public fetchApiData: FetchApiDataService,
    public snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  getUser(): void {
    forkJoin({ user: this.fetchApiData.getUser(), movies: this.fetchApiData.getAllMovies() }).subscribe({
      next: ({ user, movies }) => {
        this.setUser(user);
        this.favorites = movies.filter(movie => user.FavoriteMovies.includes(movie._id));
      },
      error: () => this.snackBar.open('Profile could not be loaded. Please try again.', 'OK', { duration: 2000 }),
    });
  }

  editUser(form: Pick<NgForm, 'valid'>): void {
    if (!form.valid) return;
    this.fetchApiData.editUser(this.userData).subscribe({
      next: user => {
        this.setUser(user);
        this.snackBar.open('User has been updated', 'OK', { duration: 2000 });
        this.getUser();
      },
      error: () => this.snackBar.open('User could not be updated. Please try again', 'OK', { duration: 2000 }),
    });
  }

  deleteUser(): void {
    if (!confirm('Are you sure?')) return;
    this.fetchApiData.deleteUser().subscribe({
      next: () => {
        ['user', 'token', 'Username'].forEach(key => localStorage.removeItem(key));
        this.snackBar.open('Account deleted successfully', 'OK', { duration: 2000 });
        this.router.navigate(['welcome']);
      },
      error: () => this.snackBar.open('Account could not be deleted. Please try again.', 'OK', { duration: 2000 }),
    });
  }

  private setUser(user: User): void {
    this.user = user;
    this.userData.Username = user.Username;
    this.userData.Email = user.Email;
    this.userData.Birthday = user.Birthday?.slice(0, 10) ?? '';
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('Username', user.Username);
  }
}
