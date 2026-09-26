// ARTIFACT_META: {"artifactId":"SRC_SNAPSHOT_1","packId":"2026-09-26T22:22:20Z","generatedAt":"2026-09-26T22:22:20Z","generator":"prompt--artifact--generate-snapshot.md"}
// ===== FILE: src/main.ts =====
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// ===== FILE: src/app/app-routing.module.ts =====
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// ===== FILE: src/app/app.component.ts =====
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'myFlix-Angular-client';
}

// ===== FILE: src/app/app.component.html =====
<router-outlet></router-outlet>

// ===== FILE: src/app/app.component.scss =====
$mfblue: #213a55;
$mfpink: #f69272;
$mfwhite: #faf7f5;

#button {
  background-color: $mfblue;
  color: $mfwhite;
}

#button-navbar {
  background-color: #428d9e;
  color: $mfwhite;
}

// ===== FILE: src/app/app.module.ts =====
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserRegistrationFormComponent } from './user-registration-form/user-registration-form.component';

//  material design imports
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { UserLoginFormComponent } from './user-login-form/user-login-form.component';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
// routing
import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';

// navigation bar
import { MatToolbarModule } from '@angular/material/toolbar';
import { MovieDetailsComponent } from './movie-details/movie-details.component';

const appRoutes: Routes = [
  { path: 'welcome', component: WelcomePageComponent },
  { path: 'movies', component: MovieCardComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: '', redirectTo: 'welcome', pathMatch: 'prefix' },
];

@NgModule({
  declarations: [
    AppComponent,
    UserRegistrationFormComponent,
    UserLoginFormComponent,
    MovieCardComponent,
    WelcomePageComponent,
    UserProfileComponent,
    NavigationBarComponent,
    MovieDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, // Import HttpClientModule after BrowserModule
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    MatToolbarModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

// ===== FILE: src/app/fetch-api-data.service.ts =====
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

//Declaring the api url that will provide data for the client app
const apiUrl = 'https://movie-api-mreb.onrender.com/';
@Injectable({
  providedIn: 'root',
})
export class UserRegistrationService {
  // Inject the HttpClient module to the constructor params
  // This will provide HttpClient to the entire class, making it available via this.http
  constructor(private http: HttpClient) {}

  /**
   * make the api call for the user registration endpoint
   * @param userDetails - username, password, email, birthday
   * @returns a user that has been registered in the database
   * used in user-registration-form component
   */
  public userRegistration(userDetails: any): Observable<any> {
    return this.http
      .post(apiUrl + 'users', userDetails)
      .pipe(catchError(this.handleError));
  }

  /**
   * direct users to the login page
   * @param userDetails - username, password
   * @returns will login the user with a token and user info in the local storage
   * used in user-login-form component
   */
  public userLogin(userDetails: any): Observable<any> {
    return this.http
      .post(apiUrl + 'login', userDetails)
      .pipe(catchError(this.handleError));
  }

  /**
   * gets all of the movies in the database
   * @returns all of the movies in the database
   * used in the movie-card component
   */
  getAllMovies(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'movies', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * gets one movie by title
   * @param Title - movie title
   * @returns a movie title for the user
   */
  getMovie(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'movies/:Title', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * gets one director by name
   * @param Director.Name - director name
   * @returns the director by name
   * used in the movie-card component
   */
  getDirector(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'movies/director/:Name', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * gets one genre by name
   * @param Genre.Name - genre name
   * @returns the genre by name
   * used in the movie-card component
   */
  getGenre(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'movies/genre/:Name', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * get one of the users
   * @param username
   * @returns the user on the user-profile component
   */
  getUser(): Observable<any> {
    const username = localStorage.getItem('Username');
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'users/' + username, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * get the users favorite movies
   * @param username
   * @returns the users array of favorite movies
   */
  getFavoriteMovies(): Observable<any> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('Username');
    return this.http
      .get(apiUrl + 'users/' + username, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(
        map(this.extractResponseData),
        map((data) => data.FavoriteMovies),
        catchError(this.handleError)
      );
  }

  /**
   * add a movie to the users favorite movies array
   * @param userName
   * @param movieId - unique movie id
   * @returns a movie added to the users favorite movies array
   * used in the movie-card component
   */
  addFavoriteMovie(username: string, MovieID: string): Observable<any> {
    const token = localStorage.getItem('token');
    const requestMovie = { movie_id: MovieID };
    return this.http
      .post(apiUrl + 'users/' + username + '/movies/' + MovieID, requestMovie, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * update the users info in the database
   * @param username
   * @param updatedUser - username, password, email, birthday
   * @returns the updated user info from the database to display in the user-profile component
   */
  editUser(updateUser: any): Observable<any> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('Username');
    return this.http
      .put(apiUrl + 'users/' + username, updateUser, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * delete the users account
   * @param username
   */
  deleteUser(): Observable<any> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('Username');
    return this.http
      .delete(apiUrl + 'users/' + username, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * delete a movie from the users favorite movies array
   * @param username
   * @param movieId - unique movie id
   * @returns deletes the movie from the users favorite movies array
   * used in the movie-card component and the user-profile component
   */
  deleteFavoriteMovie(username: string, MovieID: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .delete(apiUrl + 'users/' + username + '/movies/' + MovieID, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      console.error('Some error occurred:', error.error.message);
    } else {
      console.error(
        `Error Status code ${error.status}, ` + `Error body is: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }

  // Non-typed response extraction
  private extractResponseData(res: any): any {
    const body = res;
    return body || {};
  }
}

// ===== FILE: src/app/movie-card/movie-card.component.ts =====
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
  // arrays to hold movie and favorites data
  movies: any[] = [];
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

  /**
   * gets all movies and populates movies array
   * @returns all movies
   */
  getMovies(): void {
    this.fetchApiData.getAllMovies().subscribe((resp: any) => {
      this.movies = resp;
      return this.movies;
    });
  }

  /**
   * gets user's favorite movies and populates favorites array
   * @returns user's favorite movies
   */
  getFavorite(): void {
    this.fetchApiData.getFavoriteMovies().subscribe((resp: any) => {
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
    const username = localStorage.getItem('Username');
    const token = localStorage.getItem('token');

    if (username && token) {
      this.fetchApiData.addFavoriteMovie(username, movieId).subscribe(
        (response) => {
          this.favorites.push(movieId); // updates favorites array
          this.snackBar.open('Movie added to favorites', 'OK', {
            duration: 2000,
          });
        },
        (error) => {
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
    const username = localStorage.getItem('Username');
    const token = localStorage.getItem('token');

    if (username && token) {
      this.fetchApiData.deleteFavoriteMovie(username, movieId).subscribe(
        (response) => {
          // updates favorites array
          this.favorites = this.favorites.filter((movie) => movie !== movieId);
          this.snackBar.open('Movie deleted from favorites', 'OK', {
            duration: 2000,
          });
        },
        (error) => {
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
    dialogRef.afterClosed().subscribe((result) => {
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
    dialogRef.afterClosed().subscribe((result) => {
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
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Synopsis dialog was closed');
    });
  }
}

// ===== FILE: src/app/movie-card/movie-card.component.html =====
<app-navigation-bar></app-navigation-bar>
<!-- src/app/movie-card/movie-card.component.html -->

<div class="card-container">
  <mat-card *ngFor="let movie of movies" style="flex: 1 1 auto">
    <mat-card-header>
      <mat-card-title>{{ movie.Title }}</mat-card-title>
      <mat-card-subtitle
        >Directed by: {{ movie.Director.Name }}</mat-card-subtitle
      >
    </mat-card-header>
    <img src="{{ movie.ImagePath }}" alt="{{ movie.Title }}" />
    <mat-card-actions>
      <button
        mat-button
        id="button-navbar"
        (click)="openGenreDialog(movie.Genre.Name, movie.Genre.Description)"
      >
        Genre
      </button>
      <button
        mat-button
        id="button-navbar"
        (click)="openDirectorDialog(movie.Director.Name, movie.Director.Bio)"
      >
        Director
      </button>
      <button
        mat-button
        id="button-navbar"
        (click)="openSynopsisDialog(movie.Description)"
      >
        Synopsis
      </button>
      <!-- if movie not in isFavorite list, displays favorite_border icon and button adds movie to favorites list -->
      <button
        *ngIf="!isFavorite(movie._id)"
        mat-icon-button
        (click)="addFavorite(movie._id)"
      >
        <mat-icon>favorite_border</mat-icon>
      </button>
      <!-- if movie is in isFavorite list, displays favorite icon and button removes movie from favorites list -->
      <button
        *ngIf="isFavorite(movie._id)"
        mat-button
        color="primary"
        (click)="deleteFavorite(movie._id)"
      >
        <mat-icon>favorite</mat-icon>
      </button>
    </mat-card-actions>
  </mat-card>
</div>

// ===== FILE: src/app/movie-card/movie-card.component.scss =====
@import "../app.component.scss";

.card-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  margin: 10px;
  border: 1px solid black;
  border-radius: 5px;
  background-color: #f5f5f5;
  box-shadow: 0 0 10px black;
}

mat-card {
  width: 300px;
  height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  padding: 10px;
  background-color: $mfpink;
  color: $mfwhite;
}

mat-card-header {
  display: flex;
  flex-direction: start;
  align-items: center;
  width: 90%;
  background-color: $mfblue;
  color: $mfwhite;
  border-radius: 5px;
}

mat-card-title {
  height: 50px;
  font-size: 1.2em;
  font-weight: bold;
  margin: 10px;
}

mat-card-subtitle {
  font-size: 0.8em;
  margin: 10px;
  color: $mfwhite;
}

img {
  height: 400px;
  width: 300px;
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

mat-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 300px;
  color: #f5f5f5;
}

// ===== FILE: src/app/movie-details/movie-details.component.ts =====
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string; content: string }
  ) {}
}

// ===== FILE: src/app/movie-details/movie-details.component.html =====
<mat-card>
  <mat-card-header>
    <mat-card-title>{{ data.title }}</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    {{ data.content }}
  </mat-card-content>
  <mat-card-actions>
    <button id="button" mat-button mat-dialog-close>Close</button>
  </mat-card-actions>
</mat-card>

// ===== FILE: src/app/movie-details/movie-details.component.scss =====
@import "../app.component.scss";

mat-card {
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

mat-card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 20%;
  background-color: $mfblue;
  color: $mfwhite;
  border-radius: 5px;
  padding: 10px;
}

mat-card-title {
  font-size: 1.2em;
  font-weight: bold;
}

mat-card-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 75%;
  font-size: 1em;
  margin: 10px;
}

mat-card-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20%;
  width: 90%;
}

// ===== FILE: src/app/navigation-bar/navigation-bar.component.ts =====
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss'],
})
export class NavigationBarComponent {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  toLogout(): void {
    this.router.navigate(['welcome']);
    localStorage.clear();
  }
}

// ===== FILE: src/app/navigation-bar/navigation-bar.component.html =====
<mat-toolbar class="navbar">
  <!-- <img class="navbar-image" src="../../assets/logo.png" alt="logo" /> -->
  <img class="navbar-image" src="assets/logo.png" alt="logo" />
  <span class="navbar-brand">myFlix</span>
  <span class="spacer"></span>
  <button id="button-navbar" mat-raised-button [routerLink]="['/movies']">
    <span>Movies</span>
  </button>

  <button id="button-navbar" mat-raised-button [routerLink]="['/profile']">
    Profile
  </button>
  <button id="button-navbar" mat-raised-button (click)="toLogout()">
    Logout
  </button>
</mat-toolbar>

// ===== FILE: src/app/navigation-bar/navigation-bar.component.scss =====
@import "../app.component.scss";

mat-toolbar {
  display: flex;
  justify-content: space-between;
  height: 15vh;
}

.navbar-image {
  height: 10vh;
  width: auto;
  margin: 0 10px;
  display: none;
}

.navbar-brand {
  font-size: 4rem;
  font-weight: bold;
  color: $mfwhite;
  margin-left: 20px;
}

.navbar {
  background-color: $mfblue;
  border-radius: 5px;
}

.spacer {
  flex: 1 1 auto;
}

button {
  margin: 10px;
}

@media screen and (max-width: 500px) {
  mat-toolbar {
    padding: 5px;
  }

  .navbar-image {
    display: flex;
    height: 10vh;
    width: auto;
    margin: 0 5px;
  }

  .navbar-brand {
    font-size: 2rem;
    display: none;
  }

  button {
    margin: 5px;
  }
}

// ===== FILE: src/app/user-login-form/user-login-form.component.ts =====
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
  styleUrls: ['./user-login-form.component.scss'],
})
export class UserLoginFormComponent implements OnInit {
  @Input() userData = { Username: '', Password: '' };

  constructor(
    public fetchApiData: UserRegistrationService,
    public dialogRef: MatDialogRef<UserLoginFormComponent>,
    public snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {}

  /**
   * updates user's information and refreshes user info
   * @param userData
   * @returns the user's information
   * @returns the user's token
   */
  loginUser(): void {
    this.fetchApiData.userLogin(this.userData).subscribe(
      (result) => {
        // Logic for a successful user login goes here!
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        localStorage.setItem('Username', result.user.Username);
        this.dialogRef.close(); // This will close the modal on success!
        this.snackBar.open('Login successful', 'OK', {
          duration: 2000,
        });
        this.router.navigate(['movies']);
      },
      (error) => {
        this.snackBar.open('Login unsuccessful. Please try again.', 'OK', {
          duration: 2000,
        });
      }
    );
  }
}

// ===== FILE: src/app/user-login-form/user-login-form.component.html =====
<!-- src/app/user-login-form/user-login-form.component.html -->
<mat-card>
  <mat-card-header>
    <mat-card-title>Login!</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <form>
      <mat-form-field>
        <input
          matInput
          [(ngModel)]="userData.Username"
          placeholder="Username"
          type="text"
          name="Username"
          required
        />
      </mat-form-field>
      <mat-form-field>
        <input
          matInput
          [(ngModel)]="userData.Password"
          type="password"
          placeholder="Password"
          name="Password"
          required
        />
      </mat-form-field>
    </form>
  </mat-card-content>
  <mat-card-actions>
    <button mat-raised-button (click)="loginUser()" id="button">Login</button>
  </mat-card-actions>
</mat-card>

// ===== FILE: src/app/user-login-form/user-login-form.component.scss =====
@import "../app.component.scss";

mat-card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10vh;
  background-color: $mfblue;
  color: $mfwhite;
  border-radius: 5px;
  padding: 2px;
  margin-bottom: 10px;
}

mat-card-title {
  font-size: 4vh;
  padding: 5px;
}

mat-card-actions {
  justify-content: center;
}

// ===== FILE: src/app/user-profile/user-profile.component.ts =====
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

// ===== FILE: src/app/user-profile/user-profile.component.html =====
<app-navigation-bar></app-navigation-bar>

<div class="container">
  <div class="user-info">
    <div class="profile-container">
      <div class="profile-info">
        <h2>Profile Information</h2>
        <p><strong>Username: </strong>{{ user.Username }}</p>
        <p><strong>Email: </strong>{{ user.Email }}</p>
      </div>

      <div class="edit-profile" *ngIf="editMode">
        <form #form="ngForm" (submit)="editUser(form)">
          <h2>Update Profile</h2>

          <br />

          <mat-form-field>
            <mat-label> Username </mat-label>
            <input
              matInput
              [(ngModel)]="userData.Username"
              type="text"
              name="Username"
              required
              minlength="5"
            />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Password</mat-label>
            <input
              matInput
              [(ngModel)]="userData.Password"
              type="password"
              placeholder="Password"
              name="Password"
              required
              minlength="5"
            />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Email</mat-label>
            <input
              matInput
              [(ngModel)]="userData.Email"
              type="email"
              name="Email"
              required
              email
            />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Birthday</mat-label>
            <input
              matInput
              [(ngModel)]="userData.Birthday"
              type="date"
              name="Birthday"
              required
            />
          </mat-form-field>

          <br />
          <div class="edit-profile-buttons">
            <button
              mat-raised-button
              id="button"
              type="submit"
              [disabled]="form.invalid"
            >
              Save
            </button>
            <button
              *ngIf="editMode"
              mat-raised-button
              id="button-navbar"
              (click)="toggleEditMode()"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <button
        class="edit-button"
        *ngIf="!editMode"
        mat-raised-button
        id="button"
        (click)="toggleEditMode()"
      >
        Edit Profile
      </button>
    </div>
    <div class="delete-profile">
      <h2>Delete Account</h2>
      <button
        class="delete-button"
        mat-raised-button
        id="button-navbar"
        (click)="deleteUser()"
      >
        Delete
      </button>
    </div>
  </div>
  <div class="favorites">
    <h2>Favourite Movies:</h2>
    <div class="card-container">
      <mat-card *ngFor="let favorite of favorites">
        <mat-card-header>
          <mat-card-title>{{ favorite.Title }}</mat-card-title>
        </mat-card-header>

        <img src="{{ favorite.ImagePath }}" alt="{{ favorite.Title }}" />
      </mat-card>
    </div>
  </div>
</div>

// ===== FILE: src/app/user-profile/user-profile.component.scss =====
@import "../app.component.scss";

.container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  color: $mfblue;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 30%;
  padding: 16px;
}

.edit-profile-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.favorites {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  padding: 16px;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 5px;
  border: 1px solid black;
  border-radius: 5px;
  background-color: #f5f5f5;
  box-shadow: 0 0 10px black;
}

mat-card {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1px;
  margin: 5px;
}

mat-card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 5vh;
  background-color: $mfblue;
  color: $mfwhite;
  border-radius: 5px;
  padding: 0px;
}

mat-card-title {
  font-size: 0.8em;
  font-weight: bold;
  padding: 0px 10px;
}

img {
  height: 300px;
  width: 99%;
  border-radius: 5px;
  padding-top: 1px;
}

@media screen and (max-width: 500px) {
  .container {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
}

// ===== FILE: src/app/user-registration-form/user-registration-form.component.ts =====
// src/app/user-registration-form/user-registration-form.component.ts
import { Component, OnInit, Input } from '@angular/core';

// You'll use this import to close the dialog on success
import { MatDialogRef } from '@angular/material/dialog';

// This import brings in the API calls we created in 6.2
import { UserRegistrationService } from '../fetch-api-data.service';

// This import is used to display notifications back to the user
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-registration-form',
  templateUrl: './user-registration-form.component.html',
  styleUrls: ['./user-registration-form.component.scss'],
})
export class UserRegistrationFormComponent implements OnInit {
  @Input() userData = { Username: '', Password: '', Email: '', Birthday: '' };

  constructor(
    public fetchApiData: UserRegistrationService,
    public dialogRef: MatDialogRef<UserRegistrationFormComponent>,
    public snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  /**
   * registers user and refreshes page
   * @param userData
   */
  registerUser(): void {
    this.fetchApiData.userRegistration(this.userData).subscribe(
      (result) => {
        // Logic for a successful user registration goes here!
        this.dialogRef.close(); // This will close the modal on success!
        this.snackBar.open('Registration successful. Please login.', 'OK', {
          duration: 2000,
        });
      },
      (error) => {
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

// ===== FILE: src/app/user-registration-form/user-registration-form.component.html =====
<!-- src/app/user-registration-form/user-registration-form.component.html -->
<mat-card>
  <mat-card-header>
    <mat-card-title>Sign Up!</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <form>
      <mat-form-field>
        <input
          matInput
          [(ngModel)]="userData.Username"
          placeholder="Username"
          type="text"
          name="Username"
          required
          minlength="5"
        />
      </mat-form-field>
      <mat-form-field>
        <input
          matInput
          [(ngModel)]="userData.Password"
          type="password"
          placeholder="Password"
          name="Password"
          required
          minlength="5"
        />
      </mat-form-field>
      <mat-form-field>
        <input
          matInput
          [(ngModel)]="userData.Email"
          type="email"
          placeholder="Email"
          name="Email"
          required
          email
        />
      </mat-form-field>
      <mat-form-field>
        <input
          matInput
          [(ngModel)]="userData.Birthday"
          type="date"
          placeholder="Birthday"
          name="Birthday"
        />
      </mat-form-field>
    </form>
  </mat-card-content>
  <mat-card-actions>
    <button mat-raised-button (click)="registerUser()" id="button">
      Sign Up
    </button>
  </mat-card-actions>
</mat-card>

// ===== FILE: src/app/user-registration-form/user-registration-form.component.scss =====
@import "../app.component.scss";

mat-card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10vh;
  background-color: $mfblue;
  color: $mfwhite;
  border-radius: 5px;
  padding: 2px;
  margin-bottom: 10px;
}

mat-card-title {
  font-size: 4vh;
  padding: 5px;
}

mat-card-actions {
  justify-content: center;
}

// ===== FILE: src/app/welcome-page/welcome-page.component.ts =====
import { Component, OnInit } from '@angular/core';
import { UserLoginFormComponent } from '../user-login-form/user-login-form.component';
import { UserRegistrationFormComponent } from '../user-registration-form/user-registration-form.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
})
export class WelcomePageComponent implements OnInit {
  constructor(public dialog: MatDialog) {}
  ngOnInit(): void {}
  openUserRegistrationDialog(): void {
    this.dialog.open(UserRegistrationFormComponent, {
      width: '280px',
    });
  }
  openUserLoginDialog(): void {
    this.dialog.open(UserLoginFormComponent, {
      width: '280px',
    });
  }
}

// ===== FILE: src/app/welcome-page/welcome-page.component.html =====
<div class="welcome-container">
  <header class="welcome-header">
    <h1>Welcome to myFlix!</h1>
  </header>
  <main class="welcome-content">
    <mat-card>
      <mat-card-header>
        <mat-card-title> Login or register here</mat-card-title>
      </mat-card-header>
      <mat-card-actions>
        <button
          id="button"
          mat-raised-button
          (click)="openUserLoginDialog()"
          style="margin-right: 10px"
        >
          Login
        </button>
        <button
          id="button"
          mat-raised-button
          (click)="openUserRegistrationDialog()"
          style="margin-right: 10px"
        >
          Sign Up
        </button>
      </mat-card-actions>
    </mat-card>
  </main>
</div>

// ===== FILE: src/app/welcome-page/welcome-page.component.scss =====
@import "../app.component.scss";

.welcome-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.welcome-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20vh;
  background-color: $mfblue;
  color: $mfwhite;
  font-size: 1.5rem;
}

h1 {
  font-size: 3rem;
  margin: 10px;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f69272;
}

mat-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 40%;
  min-width: 200px;
  height: 40%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

mat-card-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 10vh;
  background-color: #213a55;
  color: #faf7f5;
  padding: 0;
  border-radius: 5px;
}

mat-card-title {
  font-size: 3vh;
  font-weight: bold;
  padding: 5px;
}

mat-card-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
}

button {
  margin: 10px;
  padding: 10px;
}

@media screen and (max-width: 500px) {
  .welcome-container {
    height: 100%;
  }

  h1 {
    font-size: 2rem;
  }

  .welcome-header {
    height: 20vh;
  }

  .welcome-content {
    height: 80%;
  }

  mat-card {
    width: 70%;
    height: 40%;
  }

  mat-card-header {
    height: 20vh;
  }

  mat-card-title {
    font-size: 3vh;
  }

  mat-card-actions {
    height: 30vh;
  }
}
