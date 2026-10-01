import { Movie } from '../api-models';
// src/app/movie-card/movie-card.component.ts
import { Component, OnInit } from '@angular/core';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MovieDetailsComponent } from '../movie-details/movie-details.component';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
})
export class MovieCardComponent implements OnInit {
  // arrays to hold movie and favorites data
  movies: Movie[] = [];
  favorites: string[] = [];

  constructor(
    public fetchApiData: FetchApiDataService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getMovies();
    this.getFavorite();
  }

  /**
   * gets all movies and populates movies array
   * @returns all movies
   */
  getMovies(): void {
    this.fetchApiData.getAllMovies().subscribe((resp) => {
      this.movies = resp;
      return this.movies;
    });
  }

  /**
   * gets user's favorite movies and populates favorites array
   * @returns user's favorite movies
   */
  getFavorite(): void {
    this.fetchApiData.getFavoriteMovies().subscribe((resp) => {
      this.favorites = resp;
      return this.favorites;
    });
  }

  /**
   * checks if movieId is in favorites list and returns boolean
   * @param movieId
   * @returns true or false boolean
   */
  isFavorite(movieId: string): boolean {
    if (this.favorites.includes(movieId)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * updates both database and favorites array with movieId
   * @param movieId
   */
  addFavorite(movieId: string): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.fetchApiData.addFavoriteMovie(movieId).subscribe(
        (response) => {
          this.favorites = response.FavoriteMovies;
          this.snackBar.open('Movie added to favorites', 'OK', {
            duration: 2000,
          });
        },
        () => {
          this.snackBar.open('Failed to add movie to favorites', 'OK', {
            duration: 2000,
          });
        }
      );
    }
  }

  /**
   * deletes movie from both database and favorites array
   * @param movieId
   */
  deleteFavorite(movieId: string): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.fetchApiData.deleteFavoriteMovie(movieId).subscribe(
        (response) => {
          // updates favorites array
          this.favorites = response.FavoriteMovies;
          this.snackBar.open('Movie deleted from favorites', 'OK', {
            duration: 2000,
          });
        },
        () => {
          this.snackBar.open('Failed to delete movie from favorites', 'OK', {
            duration: 2000,
          });
        }
      );
    }
  }

  /**
   * opens dialog with movie director details
   * @param name
   * @param bio
   * @returns director dialog with name and bio
   *
   */
  openDirectorDialog(name: string, bio: string): void {
    const dialogRef = this.dialog.open(MovieDetailsComponent, {
      data: {
        title: name,
        content: bio,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      console.log('Director dialog was closed');
    });
  }

  /**
   * opens dialog with movie genre details
   * @param name
   * @param description
   * @returns genre dialog with name and description
   *
   */
  openGenreDialog(name: string, description: string): void {
    const dialogRef = this.dialog.open(MovieDetailsComponent, {
      data: {
        title: name,
        content: description,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      console.log('Genre dialog was closed');
    });
  }

  /**
   * opens dialog with movie synopsis
   * @param description
   * @returns synopsis dialog with movie description
   *
   */
  openSynopsisDialog(description: string): void {
    const dialogRef = this.dialog.open(MovieDetailsComponent, {
      data: {
        title: 'Synopsis',
        content: description,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      console.log('Synopsis dialog was closed');
    });
  }
}
