// src/app/movie-card/movie-card.component.ts
import { Component, OnInit } from '@angular/core';
import { UserRegistrationService } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MovieDetailsComponent } from '../movie-details/movie-details.component';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
})
export class MovieCardComponent {
  // arrays to hold movie data
  movies: any[] = [];
  directors: any[] = [];
  genres: any[] = [];
  favorites: any[] = [];

  constructor(
    public fetchApiData: UserRegistrationService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getMovies();
    this.getFavorite();
  }

  // gets all movies and populates movies array
  getMovies(): void {
    this.fetchApiData.getAllMovies().subscribe((resp: any) => {
      this.movies = resp;
      console.log(this.movies);
      return this.movies;
    });
  }

  // gets favourtie movies and populates favorites array
  getFavorite(): void {
    this.fetchApiData.getFavoriteMovies().subscribe((resp: any) => {
      this.favorites = resp;
      console.log(this.favorites);
      return this.favorites;
    });
  }

  // checks if movieId is in favorites list and returns boolean
  isFavorite(movieId: string): boolean {
    if (this.favorites.includes(movieId)) {
      return true;
    } else {
      return false;
    }
  }

  // calls addFavoriteMovie() to update both DB and favorites array
  addFavorite(movieId: string): void {
    const username = localStorage.getItem('Username');
    const token = localStorage.getItem('token');

    console.log(username);
    console.log(movieId);

    console.log('Adding to favorites:', movieId);

    if (username && token) {
      this.fetchApiData.addFavoriteMovie(username, movieId).subscribe(
        (response) => {
          console.log('Successfully added to favorites:', response);
          this.favorites.push(movieId); // updates favorites array
          this.snackBar.open('Movie added to favorites', 'OK', {
            duration: 2000,
          });
        },
        (error) => {
          console.error('Failed to add movie to favorites:', error);
          this.snackBar.open('Failed to add movie to favorites', 'OK', {
            duration: 2000,
          });
        }
      );
    } else {
      console.log('User data (username or token) is missing or undefined');
    }
  }

  // calls deleteFavoriteMovie() to update both DB and favorites array
  deleteFavorite(movieId: string): void {
    const username = localStorage.getItem('Username');

    const token = localStorage.getItem('token');

    console.log(username);
    console.log(movieId);

    console.log('Deleting from favorites:', movieId);

    if (username && token) {
      this.fetchApiData.deleteFavoriteMovie(username, movieId).subscribe(
        (response) => {
          console.log('Successfully deleted from favorites:', response);
          // updates favorites array
          this.favorites = this.favorites.filter((movie) => movie !== movieId);
          this.snackBar.open('Movie deleted from favorites', 'OK', {
            duration: 2000,
          });
        },
        (error) => {
          console.error('Failed to delete movie from favorites:', error);
          this.snackBar.open('Failed to delete movie from favorites', 'OK', {
            duration: 2000,
          });
        }
      );
    } else {
      console.log('User data (username or token) is missing or undefined');
    }
  }

  // opens dialog with movie director details
  openDirectorDialog(name: string, bio: string): void {
    const dialogRef = this.dialog.open(MovieDetailsComponent, {
      width: '250px',
      data: {
        title: name,
        content: bio,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Director dialog was closed');
    });
  }

  // opens dialog with movie genre details
  openGenreDialog(name: string, description: string): void {
    const dialogRef = this.dialog.open(MovieDetailsComponent, {
      width: '250px',
      data: {
        title: name,
        content: description,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Genre dialog was closed');
    });
  }

  // opens dialog with movie synopsis details
  openSynopsisDialog(description: string): void {
    const dialogRef = this.dialog.open(MovieDetailsComponent, {
      width: '250px',
      data: {
        title: 'Synopsis',
        content: description,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Synopsis dialog was closed');
    });
  }
}
