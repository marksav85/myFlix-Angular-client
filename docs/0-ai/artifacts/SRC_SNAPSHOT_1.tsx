// ARTIFACT_META: {"artifactId":"SRC_SNAPSHOT_1","packId":"2026-10-09T14:02:02Z","generatedAt":"2026-10-09T14:02:02Z","generator":"prompt--artifact--generate-snapshot.md"}

// ===== FILE: src/app/api-models.ts =====
export interface User {
  _id: string;
  Username: string;
  Email: string;
  Birthday?: string | null;
  FavoriteMovies: string[];
}

export interface LoginPayload {
  Username: string;
  Password: string;
}

export interface RegistrationPayload extends LoginPayload {
  Email: string;
  Birthday: string;
}

export type ProfileUpdatePayload = RegistrationPayload;

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Director {
  Name: string;
  Bio: string;
}

export interface Genre {
  Name: string;
  Description: string;
}

export interface Movie {
  _id: string;
  Title: string;
  Description: string;
  Genre: Genre;
  Director: Director;
  ImagePath?: string;
  Featured?: boolean;
}

// ===== FILE: src/app/app-routing.module.ts =====
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MovieLibraryComponent } from './movie-library/movie-library.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

import { UserLoginFormComponent } from './user-login-form/user-login-form.component';
import { UserRegistrationFormComponent } from './user-registration-form/user-registration-form.component';

import { MovieDetailComponent } from './movie-detail/movie-detail.component';

const routes: Routes = [
  { path: 'movies/:movieId', component: MovieDetailComponent },
  { path: 'login', component: UserLoginFormComponent },
  { path: 'signup', component: UserRegistrationFormComponent },
  { path: 'welcome', redirectTo: 'login', pathMatch: 'full' },
  { path: 'movies', component: MovieLibraryComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// ===== FILE: src/app/app.component.html =====
<a class="skip-link" href="#main-content" (click)="focusMain(mainContent, $event)">Skip to main content</a>
<app-navigation-bar></app-navigation-bar>
<main #mainContent id="main-content" tabindex="-1" class="page-container application-main">
  <router-outlet></router-outlet>
</main>

// ===== FILE: src/app/app.component.ts =====
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'myFlix-Angular-client';

  focusMain(main: HTMLElement, event: Event): void {
    event.preventDefault();
    main.focus();
    main.scrollIntoView({ block: 'start' });
  }
}

// ===== FILE: src/app/app.module.ts =====
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserRegistrationFormComponent } from './user-registration-form/user-registration-form.component';

import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { UserLoginFormComponent } from './user-login-form/user-login-form.component';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { MovieLibraryComponent } from './movie-library/movie-library.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';

import { DeleteAccountDialogComponent } from './delete-account-dialog/delete-account-dialog.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    UserRegistrationFormComponent,
    UserLoginFormComponent,
    MovieCardComponent,
    MovieLibraryComponent,
    UserProfileComponent,
    DeleteAccountDialogComponent,
    NavigationBarComponent,
    MovieDetailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

// ===== FILE: src/app/delete-account-dialog/delete-account-dialog.component.html =====
<div [attr.aria-busy]="isDeleting">
  <h2 mat-dialog-title #heading tabindex="-1" id="delete-account-title">Delete Account</h2>
  <mat-dialog-content>
    <p id="delete-account-description">Delete your account and favorites permanently? This action cannot be undone.</p>
    <p *ngIf="error" id="delete-account-error" class="feedback" role="alert">{{ error }}</p>
    <p *ngIf="isDeleting" role="status">Deleting your account...</p>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button type="button" class="button button-secondary delete-cancel" [disabled]="isDeleting" (click)="cancel()">Cancel</button>
    <button type="button" class="button button-danger" [disabled]="isDeleting" (click)="deleteAccount()"
      [attr.aria-describedby]="error ? 'delete-account-error' : null">{{ isDeleting ? 'Deleting...' : 'Delete Account' }}</button>
  </mat-dialog-actions>
</div>

// ===== FILE: src/app/delete-account-dialog/delete-account-dialog.component.scss =====
:host { display: block; background: var(--color-surface-elevated); color: var(--color-text-primary); }
mat-dialog-content { overflow-wrap: anywhere; }
mat-dialog-actions { gap: var(--space-3); padding: var(--space-4) var(--space-6) var(--space-6); }
@media (max-width: 479px) { mat-dialog-actions { flex-direction: column; align-items: stretch; } }

// ===== FILE: src/app/delete-account-dialog/delete-account-dialog.component.ts =====
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { FetchApiDataService } from '../fetch-api-data.service';

@Component({
  selector: 'app-delete-account-dialog',
  templateUrl: './delete-account-dialog.component.html',
  styleUrls: ['./delete-account-dialog.component.scss'],
})
export class DeleteAccountDialogComponent implements OnDestroy {
  @ViewChild('heading', { static: true }) heading?: ElementRef<HTMLHeadingElement>;
  isDeleting = false;
  error = '';
  private deletionSucceeded = false;
  private readonly destroyed = new Subject<void>();

  constructor(private api: FetchApiDataService, private dialogRef: MatDialogRef<DeleteAccountDialogComponent, boolean>) {}

  deleteAccount(): void {
    if (this.isDeleting) return;
    this.isDeleting = true;
    this.error = '';
    this.dialogRef.disableClose = true;
    this.heading?.nativeElement.focus();
    this.api.deleteUser().pipe(takeUntil(this.destroyed), finalize(() => {
      if (!this.deletionSucceeded) {
        this.isDeleting = false;
        this.dialogRef.disableClose = false;
      }
    })).subscribe({
      next: () => { this.deletionSucceeded = true; this.dialogRef.close(true); },
      error: () => this.error = 'Your account could not be deleted. Please try again.',
    });
  }

  cancel(): void { if (!this.isDeleting) this.dialogRef.close(false); }

  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); }
}

// ===== FILE: src/app/fetch-api-data.service.ts =====
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { LoginPayload, LoginResponse, Movie, ProfileUpdatePayload, RegistrationPayload, User } from './api-models';

@Injectable({ providedIn: 'root' })
export class FetchApiDataService {
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  constructor(private http: HttpClient) {}

  userRegistration(details: RegistrationPayload): Observable<User> {
    return this.http.post<User>(this.url('users'), details).pipe(catchError(this.handleError));
  }

  userLogin(details: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url('login'), details).pipe(catchError(this.handleError));
  }

  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.url('movies'), this.authOptions()).pipe(catchError(this.handleError));
  }

  getMovie(title: string): Observable<Movie> {
    return this.http.get<Movie>(this.url('movies/' + encodeURIComponent(title)), this.authOptions()).pipe(catchError(this.handleError));
  }

  // The backend returns movie collections for director and genre searches.
  getDirector(name: string): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.url('movies/director/' + encodeURIComponent(name)), this.authOptions()).pipe(catchError(this.handleError));
  }

  getGenre(name: string): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.url('movies/genre/' + encodeURIComponent(name)), this.authOptions()).pipe(catchError(this.handleError));
  }

  getUser(): Observable<User> {
    return this.http.get<User>(this.userUrl(), this.authOptions()).pipe(catchError(this.handleError));
  }

  getFavoriteMovies(): Observable<string[]> {
    return this.getUser().pipe(map(user => user.FavoriteMovies));
  }

  addFavoriteMovie(movieId: string): Observable<User> {
    return this.http.post<User>(this.userUrl() + '/movies/' + encodeURIComponent(movieId), {}, this.authOptions()).pipe(catchError(this.handleError));
  }

  deleteFavoriteMovie(movieId: string): Observable<User> {
    return this.http.delete<User>(this.userUrl() + '/movies/' + encodeURIComponent(movieId), this.authOptions()).pipe(catchError(this.handleError));
  }

  editUser(details: ProfileUpdatePayload): Observable<User> {
    return this.http.put<User>(this.userUrl(), details, this.authOptions()).pipe(catchError(this.handleError));
  }

  deleteUser(): Observable<string> {
    return this.http.delete(this.userUrl(), { ...this.authOptions(), responseType: 'text' }).pipe(catchError(this.handleError));
  }

  private url(path: string): string {
    return this.apiUrl + '/' + path;
  }

  private userUrl(): string {
    // The finalized backend requires this selector and verifies ownership using JWT.
    // Username is refreshed from successful login/profile responses, never supplied by callers.
    const username = localStorage.getItem('Username');
    if (!username) throw new Error('Please log in before accessing your account.');
    return this.url('users/' + encodeURIComponent(username));
  }

  private authOptions(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({ Authorization: 'Bearer ' + localStorage.getItem('token') }) };
  }

  private handleError(): Observable<never> {
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}

// ===== FILE: src/app/movie-card/movie-card.component.html =====
<article class="movie-card surface" [attr.aria-labelledby]="titleId">
  <img *ngIf="movie.ImagePath && !posterUnavailable; else missingPoster" class="movie-poster"
    [src]="movie.ImagePath" [alt]="movie.Title + ' poster'" loading="lazy" (error)="posterUnavailable = true" />
  <ng-template #missingPoster>
    <div class="movie-poster poster-placeholder" role="img" [attr.aria-label]="'Poster unavailable for ' + movie.Title">Poster unavailable</div>
  </ng-template>
  <div class="movie-card-content">
    <h2 *ngIf="headingLevel === 2" [id]="titleId" class="movie-card-title">{{ movie.Title }}</h2>
    <h3 *ngIf="headingLevel === 3" [id]="titleId" class="movie-card-title">{{ movie.Title }}</h3>
    <p class="movie-metadata">Genre: {{ genreName }}</p>
    <p class="movie-metadata">Director: {{ directorName }}</p>
    <p class="movie-excerpt">{{ movie.Description }}</p>
    <div class="movie-card-actions">
      <a class="button button-secondary" [routerLink]="['/movies', movie._id]"
        [attr.aria-label]="'View Details for ' + movie.Title">View Details</a>
      <button type="button" class="button button-primary" (click)="toggleFavorite()"
        [disabled]="isPending || favoriteDisabled" [attr.aria-label]="favoriteLabel"
        [attr.aria-pressed]="isFavorite" [attr.aria-busy]="isPending"
        [attr.aria-describedby]="favoriteError ? errorId : null">
        {{ isPending ? 'Updating...' : isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
      </button>
      <p *ngIf="favoriteError" [id]="errorId" role="alert" class="movie-favorite-error">{{ favoriteError }}</p>
    </div>
  </div>
</article>

// ===== FILE: src/app/movie-card/movie-card.component.scss =====
:host { display: flex; min-width: 0; }
.movie-card { display: flex; flex-direction: column; width: 100%; min-width: 0; overflow: hidden; transition: border-color 180ms, box-shadow 180ms; }
.movie-card:hover { border-color: var(--color-border-strong); box-shadow: var(--shadow-subtle); }
.movie-poster { display: block; width: 100%; aspect-ratio: 2 / 3; object-fit: cover; }
.poster-placeholder { display: flex; align-items: center; justify-content: center; padding: var(--space-4); background: var(--color-surface-2); color: var(--color-text-secondary); }
.movie-card-content { display: flex; flex: 1; flex-direction: column; min-width: 0; padding: var(--space-4); }
.movie-card-title { font-size: 18px; line-height: 26px; font-weight: 600; min-height: 52px; margin: 0 0 var(--space-3); }
.movie-card-title, .movie-excerpt { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.movie-card-title { -webkit-line-clamp: 2; }
.movie-metadata { margin: 0 0 var(--space-2); font-size: 13px; line-height: 18px; color: var(--color-text-secondary); }
.movie-excerpt { -webkit-line-clamp: 3; margin: 0 0 var(--space-5); font-size: 14px; line-height: 22px; color: var(--color-text-secondary); }
.movie-card-actions { display: flex; flex-direction: column; gap: var(--space-2); margin-top: auto; }
.movie-favorite-error { margin: 0; font-size: 13px; line-height: 18px; color: var(--color-text-secondary); }

// ===== FILE: src/app/movie-card/movie-card.component.ts =====
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Movie } from '../api-models';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
})
export class MovieCardComponent implements OnChanges {
  private static nextId = 0;
  readonly titleId = 'movie-card-title-' + ++MovieCardComponent.nextId;
  readonly errorId = this.titleId + '-error';
  @Input({ required: true }) movie!: Movie;
  @Input() headingLevel: 2 | 3 = 2;
  @Input() isFavorite = false;
  @Input() isPending = false;
  @Input() favoriteDisabled = false;
  @Input() favoriteError = '';
  @Output() favoriteToggle = new EventEmitter<void>();
  posterUnavailable = false;

  get genreName(): string { return this.movie.Genre?.Name || 'Unknown'; }
  get directorName(): string { return this.movie.Director?.Name || 'Unknown'; }
  get favoriteLabel(): string {
    return (this.isPending ? 'Updating favorites for ' :
      this.isFavorite ? 'Remove from Favorites: ' : 'Add to Favorites: ') + this.movie.Title;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movie']) this.posterUnavailable = false;
  }

  toggleFavorite(): void {
    if (!this.isPending && !this.favoriteDisabled) this.favoriteToggle.emit();
  }
}

// ===== FILE: src/app/movie-detail/movie-detail.component.html =====
<a class="button button-secondary detail-back" routerLink="/movies">Back to Movies</a>
<section *ngIf="isLoading || error || !movie" aria-labelledby="movie-detail-state-title">
  <h1 #pageHeading id="movie-detail-state-title" tabindex="-1" class="page-heading">{{ !isLoading && !error ? 'Movie not found.' : 'Movie Detail' }}</h1>
  <p *ngIf="isLoading" class="feedback" role="status">Loading movie details...</p>
  <p *ngIf="error" class="feedback" role="alert">{{ error }}</p>
  <a *ngIf="error && !favoriteState.hasSession" class="auth-link" routerLink="/login">Login</a>
  <p *ngIf="!isLoading && !error" class="feedback" role="status">This movie is not available in the current catalog.</p>
</section>
<article *ngIf="!isLoading && !error && movie as item" class="movie-detail surface" aria-labelledby="movie-detail-title">
  <img *ngIf="item.ImagePath && !posterUnavailable; else missingPoster" class="detail-poster"
    [src]="item.ImagePath" [alt]="item.Title + ' poster'" (error)="posterUnavailable = true" />
  <ng-template #missingPoster>
    <div class="detail-poster detail-placeholder" role="img" [attr.aria-label]="'Poster unavailable for ' + item.Title">Poster unavailable</div>
  </ng-template>
  <div class="detail-content">
    <h1 #pageHeading id="movie-detail-title" tabindex="-1" class="page-heading">{{ item.Title }}</h1>
    <p class="detail-synopsis">{{ item.Description }}</p>
    <dl class="detail-metadata">
      <div><dt>Genre</dt><dd>{{ genreName }}</dd></div>
      <div><dt>Director</dt><dd>{{ directorName }}</dd></div>
    </dl>
    <section *ngIf="genreDescription" aria-labelledby="genre-description-title" class="detail-supplement">
      <h2 id="genre-description-title">About the Genre</h2>
      <p>{{ genreDescription }}</p>
    </section>
    <section *ngIf="directorBiography" aria-labelledby="director-biography-title" class="detail-supplement">
      <h2 id="director-biography-title">Director Biography</h2>
      <p>{{ directorBiography }}</p>
    </section>
    <p *ngIf="favoriteState.isLoadingFavorites" class="feedback" role="status">Loading favorites...</p>
    <p *ngIf="favoriteState.favoriteLoadError" class="feedback" role="alert">{{ favoriteState.favoriteLoadError }}</p>
    <button type="button" class="button button-primary" (click)="favoriteState.toggleFavorite(item._id)"
      [disabled]="favoriteState.favoriteControlsDisabled || favoriteState.pendingFavorites.has(item._id)"
      [attr.aria-label]="favoriteLabel" [attr.aria-pressed]="favoriteState.isFavorite(item._id)"
      [attr.aria-busy]="favoriteState.pendingFavorites.has(item._id)"
      [attr.aria-describedby]="favoriteState.favoriteErrors[item._id] ? 'detail-favorite-error' : null">
      {{ favoriteState.pendingFavorites.has(item._id) ? 'Updating...' : favoriteState.isFavorite(item._id) ? 'Remove from Favorites' : 'Add to Favorites' }}
    </button>
    <p *ngIf="favoriteState.favoriteErrors[item._id]" id="detail-favorite-error" class="feedback" role="alert">{{ favoriteState.favoriteErrors[item._id] }}</p>
  </div>
</article>

// ===== FILE: src/app/movie-detail/movie-detail.component.scss =====
:host { display: block; min-width: 0; }
.detail-content > .feedback, section > .feedback { margin-block: var(--space-4); }
.detail-back { margin-bottom: var(--space-5); }
.movie-detail { display: grid; align-items: start; overflow: hidden; }
.detail-poster { display: block; width: 100%; max-width: 320px; margin-inline: auto; aspect-ratio: 2 / 3; object-fit: cover; }
.detail-placeholder { display: flex; align-items: center; justify-content: center; padding: var(--space-4); background: var(--color-surface-2); }
.detail-content { min-width: 0; padding: var(--space-5); overflow-wrap: anywhere; }
.detail-synopsis { margin-block: var(--space-5); font-size: 16px; line-height: 26px; white-space: pre-line; color: var(--color-text-secondary); }
.detail-metadata { margin: 0 0 var(--space-5); }
.detail-metadata div { margin-bottom: var(--space-4); }
.detail-metadata dt { font-weight: 600; color: var(--color-text-secondary); }
.detail-metadata dd { margin: var(--space-1) 0 0; font-size: 16px; line-height: 26px; }
.detail-supplement { margin-bottom: var(--space-5); }
.detail-supplement h2 { margin: 0 0 var(--space-3); font-size: 18px; line-height: 26px; font-weight: 600; }
.detail-supplement p { margin: 0; white-space: pre-line; color: var(--color-text-secondary); }
@media (min-width: 768px) {
  .movie-detail { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); }
  .detail-poster { max-width: 420px; }
  .detail-content { padding: var(--space-6); }
}

// ===== FILE: src/app/movie-detail/movie-detail.component.ts =====
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Movie } from '../api-models';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MovieFavoritesService } from '../movie-favorites.service';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'],
  providers: [MovieFavoritesService],
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  movie?: Movie;
  isLoading = true;
  error = '';
  posterUnavailable = false;
  private readonly destroyed = new Subject<void>();

  @ViewChild('pageHeading') set pageHeading(heading: ElementRef<HTMLHeadingElement> | undefined) {
    heading?.nativeElement.focus();
  }

  constructor(private route: ActivatedRoute, private api: FetchApiDataService,
    public favoriteState: MovieFavoritesService) {}

  get genreName(): string { return this.movie?.Genre?.Name || 'Unknown'; }
  get directorName(): string { return this.movie?.Director?.Name || 'Unknown'; }
  get genreDescription(): string { return this.movie?.Genre?.Description || ''; }
  get directorBiography(): string { return this.movie?.Director?.Bio || ''; }
  get favoriteLabel(): string {
    const id = this.movie?._id || '';
    return (this.favoriteState.pendingFavorites.has(id) ? 'Updating favorites for ' :
      this.favoriteState.isFavorite(id) ? 'Remove from Favorites: ' : 'Add to Favorites: ') + this.movie?.Title;
  }

  ngOnInit(): void {
    this.favoriteState.load();
    this.route.paramMap.pipe(
      tap(() => { this.movie = undefined; this.error = ''; this.isLoading = true; this.posterUnavailable = false; }),
      switchMap(params => {
        if (!this.favoriteState.hasSession) {
          this.error = 'Please log in to view movie details.';
          this.isLoading = false;
          return EMPTY;
        }
        return this.api.getAllMovies().pipe(
          tap(movies => { this.movie = movies.find(movie => movie._id === params.get('movieId')); this.isLoading = false; }),
          catchError(() => { this.error = 'Movie details could not be loaded. Please try again later.'; this.isLoading = false; return EMPTY; }),
        );
      }),
      takeUntil(this.destroyed),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}

// ===== FILE: src/app/movie-favorites.service.ts =====
import { Injectable, OnDestroy } from '@angular/core';
import { EMPTY, ReplaySubject, Subject, defer } from 'rxjs';
import { catchError, concatMap, finalize, takeUntil, tap } from 'rxjs/operators';
import { User } from './api-models';
import { FetchApiDataService } from './fetch-api-data.service';

@Injectable()
export class MovieFavoritesService implements OnDestroy {
  favorites: string[] = [];
  isLoadingFavorites = true;
  favoriteLoadError = '';
  readonly pendingFavorites = new Set<string>();
  readonly favoriteErrors: Record<string, string> = {};
  readonly userChanges = new ReplaySubject<User>(1);
  private readonly favoriteRequests = new Subject<string>();
  private readonly destroyed = new Subject<void>();

  constructor(private api: FetchApiDataService) {
    // Each response contains full membership. Serial requests avoid stale overlapping snapshots.
    this.favoriteRequests.pipe(
      concatMap(movieId => defer(() => this.isFavorite(movieId)
        ? this.api.deleteFavoriteMovie(movieId) : this.api.addFavoriteMovie(movieId)).pipe(
        tap(user => this.setUser(user)),
        catchError(() => {
          this.favoriteErrors[movieId] = 'Favorites could not be updated. Please try again.';
          return EMPTY;
        }),
        finalize(() => this.pendingFavorites.delete(movieId)),
      )),
      takeUntil(this.destroyed),
    ).subscribe();
  }
  get hasSession(): boolean {
    return Boolean(localStorage.getItem('token') && localStorage.getItem('Username'));
  }

  get favoriteControlsDisabled(): boolean {
    return this.isLoadingFavorites || Boolean(this.favoriteLoadError) || !this.hasSession;
  }

  load(): void {
    if (!this.hasSession) { this.isLoadingFavorites = false; return; }
    this.api.getUser().pipe(takeUntil(this.destroyed)).subscribe({
      next: user => { this.setUser(user); this.isLoadingFavorites = false; },
      error: () => {
        this.favoriteLoadError = 'Favorites could not be loaded. Please try again later.';
        this.isLoadingFavorites = false;
      },
    });
  }
  isFavorite(movieId: string): boolean {
    return this.favorites.includes(movieId);
  }

  toggleFavorite(movieId: string): void {
    if (this.favoriteControlsDisabled || this.pendingFavorites.has(movieId)) return;
    this.pendingFavorites.add(movieId);
    delete this.favoriteErrors[movieId];
    this.favoriteRequests.next(movieId);
  }

  setUser(user: User): void {
    this.favorites = user.FavoriteMovies;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('Username', user.Username);
    this.userChanges.next(user);
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
    this.favoriteRequests.complete();
    this.userChanges.complete();
  }
}

// ===== FILE: src/app/movie-library/movie-library.component.html =====
<section aria-labelledby="movie-library-title">
  <h1 #pageHeading tabindex="-1" id="movie-library-title" class="page-heading">Movie Library</h1>
  <div role="search" aria-label="Movie library" class="library-search">
    <label for="movie-search" class="form-label">Search movies</label>
    <input id="movie-search" name="movieSearch" type="search" class="form-input"
      placeholder="Search by title..." [(ngModel)]="search" />
  </div>
  <p *ngIf="isLoading" class="feedback" role="status">Loading movies...</p>
  <div *ngIf="!isLoading && error" class="feedback" role="alert">
    <p>{{ error }}</p>
    <a *ngIf="!hasSession" class="auth-link" routerLink="/login">Login</a>
  </div>
  <ng-container *ngIf="!isLoading && !error">
    <p *ngIf="favoriteState.isLoadingFavorites" class="feedback library-account-status" role="status">Loading favorites...</p>
    <p *ngIf="favoriteState.favoriteLoadError" class="feedback library-account-status" role="alert">{{ favoriteState.favoriteLoadError }}</p>
    <p *ngIf="movies.length === 0" class="feedback" role="status">No movies are available.</p>
    <p *ngIf="movies.length > 0 && filteredMovies.length === 0" class="feedback" role="status">No movies match your search. Try another title.</p>
    <div class="movie-grid" *ngIf="filteredMovies.length > 0">
      <app-movie-card *ngFor="let movie of filteredMovies; trackBy: trackMovie" [movie]="movie"
        [isFavorite]="favoriteState.isFavorite(movie._id)" [isPending]="favoriteState.pendingFavorites.has(movie._id)"
        [favoriteDisabled]="favoriteState.favoriteControlsDisabled" [favoriteError]="favoriteState.favoriteErrors[movie._id] || ''"
        (favoriteToggle)="favoriteState.toggleFavorite(movie._id)">
      </app-movie-card>
    </div>
  </ng-container>
</section>

// ===== FILE: src/app/movie-library/movie-library.component.scss =====
:host { display: block; min-width: 0; }
.library-search { max-width: 448px; margin-block: var(--space-5); }
.library-account-status { margin-bottom: var(--space-5); }

// ===== FILE: src/app/movie-library/movie-library.component.ts =====
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Movie } from '../api-models';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MovieFavoritesService } from '../movie-favorites.service';

@Component({
  selector: 'app-movie-library',
  templateUrl: './movie-library.component.html',
  styleUrls: ['./movie-library.component.scss'],
  providers: [MovieFavoritesService],
})
export class MovieLibraryComponent implements OnInit, OnDestroy {
  @ViewChild('pageHeading', { static: true }) pageHeading?: ElementRef<HTMLHeadingElement>;
  movies: Movie[] = [];
  search = '';
  isLoading = true;
  error = '';
  private readonly destroyed = new Subject<void>();

  constructor(private api: FetchApiDataService, public favoriteState: MovieFavoritesService) {}

  get hasSession(): boolean { return this.favoriteState.hasSession; }

  get filteredMovies(): Movie[] {
    const term = this.search.trim().toLowerCase();
    return this.movies.filter(movie => movie.Title.toLowerCase().includes(term));
  }

  ngOnInit(): void {
    this.pageHeading?.nativeElement.focus();
    this.favoriteState.load();
    if (!this.hasSession) {
      this.isLoading = false;
      this.error = 'Please log in to view the Movie Library.';
      return;
    }
    this.api.getAllMovies().pipe(takeUntil(this.destroyed)).subscribe({
      next: movies => { this.movies = movies; this.isLoading = false; },
      error: () => { this.error = 'Movies could not be loaded. Please try again later.'; this.isLoading = false; },
    });
  }

  trackMovie(_index: number, movie: Movie): string { return movie._id; }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}

// ===== FILE: src/app/navigation-bar/navigation-bar.component.html =====
<header class="application-header">
  <nav class="page-container" aria-label="Main navigation">
    <div class="navigation-layout">
      <a #wordmark class="wordmark" [routerLink]="isAuthenticated ? '/movies' : '/login'" (click)="closeMenu()">myFlix</a>
      <button #menuButton type="button" class="button button-secondary menu-toggle"
        aria-controls="main-navigation-items" [attr.aria-expanded]="isMenuOpen"
        [attr.aria-label]="isMenuOpen ? 'Close main menu' : 'Open main menu'" (click)="toggleMenu()">
        <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path [attr.d]="isMenuOpen ? 'M6 6l12 12M6 18L18 6' : 'M4 6h16M4 12h16M4 18h16'" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
      <div id="main-navigation-items" class="navigation-items" [class.is-open]="isMenuOpen">
        <ng-container *ngIf="isAuthenticated; else guestNavigation">
          <a class="nav-link" routerLink="/movies" routerLinkActive="is-current" ariaCurrentWhenActive="page" (click)="closeMenu()">Movies</a>
          <a class="nav-link" routerLink="/profile" routerLinkActive="is-current" ariaCurrentWhenActive="page" (click)="closeMenu()">My Profile</a>
          <button type="button" class="button button-secondary" (click)="toLogout()">Logout</button>
        </ng-container>
        <ng-template #guestNavigation>
          <a class="nav-link" routerLink="/login" routerLinkActive="is-current" ariaCurrentWhenActive="page" (click)="closeMenu()">Login</a>
          <a class="nav-link" routerLink="/signup" routerLinkActive="is-current" ariaCurrentWhenActive="page" (click)="closeMenu()">Signup</a>
        </ng-template>
      </div>
    </div>
  </nav>
</header>

// ===== FILE: src/app/navigation-bar/navigation-bar.component.scss =====
.application-header {
  background: var(--color-surface-1);
  border-bottom: 1px solid var(--color-border-subtle);
}
.navigation-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 72px;
  padding-block: var(--space-3);
}
.wordmark {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--color-primary);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-decoration: none;
  border-radius: var(--radius-default);
}
.navigation-items { display: flex; align-items: center; gap: var(--space-2); }
.menu-toggle { display: none; }
@media (max-width: 639px) {
  .navigation-layout { flex-wrap: wrap; }
  .menu-toggle { display: inline-flex; }
  .navigation-items { display: none; flex-basis: 100%; }
  .navigation-items.is-open {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding-top: var(--space-3);
    border-top: 1px solid var(--color-border-subtle);
  }
}

// ===== FILE: src/app/navigation-bar/navigation-bar.component.ts =====
import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss'],
})
export class NavigationBarComponent implements OnDestroy {
  @ViewChild('wordmark') wordmark?: ElementRef<HTMLAnchorElement>;
  @ViewChild('menuButton') menuButton?: ElementRef<HTMLButtonElement>;
  isMenuOpen = false;
  private readonly navigationSubscription: Subscription;

  constructor(private router: Router) {
    this.navigationSubscription = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) this.closeMenu();
    });
  }

  // Presentation only: backend authorization remains authoritative.
  get isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('token') && localStorage.getItem('Username'));
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    if (this.isMenuOpen) {
      const button = this.menuButton?.nativeElement;
      if (button?.getClientRects().length) button.focus();
      else this.wordmark?.nativeElement.focus();
    }
    this.isMenuOpen = false;
  }

  @HostListener('keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (!this.isMenuOpen) return;
    event.preventDefault();
    this.closeMenu();
  }

  toLogout(): void {
    if (!this.isMenuOpen) this.wordmark?.nativeElement.focus();
    this.closeMenu();
    ['user', 'token', 'Username'].forEach(key => localStorage.removeItem(key));
    this.router.navigate(['login']);
  }

  ngOnDestroy(): void {
    this.navigationSubscription.unsubscribe();
  }
}

// ===== FILE: src/app/user-login-form/user-login-form.component.html =====
<div class="auth-layout">
  <section class="auth-panel surface" aria-labelledby="login-title">
    <h1 #pageHeading id="login-title" tabindex="-1" class="auth-heading">Login</h1>
      <p class="auth-help form-requirements">All fields are required.</p>
    <form #form="ngForm" (ngSubmit)="loginUser(form)" class="auth-form"
      [attr.aria-busy]="isSubmitting" [attr.aria-describedby]="error ? 'login-feedback' : null">
      <div>
        <label class="form-label" for="login-username">Username</label>
        <input id="login-username" class="form-input" name="Username" type="text" autocomplete="username"
          [(ngModel)]="userData.Username" #username="ngModel" required
          [readonly]="isSubmitting"
          [attr.aria-invalid]="(username.invalid && (username.touched || form.submitted)) ? 'true' : null"
          [attr.aria-describedby]="(username.invalid && (username.touched || form.submitted)) ? 'login-username-error' : null" />
        <p *ngIf="username.invalid && (username.touched || form.submitted)" id="login-username-error" class="auth-field-error">Username is required.</p>
      </div>
      <div>
        <label class="form-label" for="login-password">Password</label>
        <input id="login-password" class="form-input" name="Password" type="password" autocomplete="current-password"
          [(ngModel)]="userData.Password" #password="ngModel" required
          [readonly]="isSubmitting"
          [attr.aria-invalid]="(password.invalid && (password.touched || form.submitted)) ? 'true' : null"
          [attr.aria-describedby]="(password.invalid && (password.touched || form.submitted)) ? 'login-password-error' : null" />
        <p *ngIf="password.invalid && (password.touched || form.submitted)" id="login-password-error" class="auth-field-error">Password is required.</p>
      </div>
      <button type="submit" class="button button-primary auth-submit" [disabled]="isSubmitting">
        {{ isSubmitting ? 'Signing in...' : 'Login' }}
      </button>
    </form>
    <p *ngIf="error" id="login-feedback" class="feedback auth-feedback" role="alert">{{ error }}</p>
    <p class="auth-alternative">Need an account?
      <a class="auth-link" routerLink="/signup">Signup</a>
    </p>
  </section>
</div>

// ===== FILE: src/app/user-login-form/user-login-form.component.scss =====
:host { display: block; min-width: 0; }

// ===== FILE: src/app/user-login-form/user-login-form.component.ts =====
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

// ===== FILE: src/app/user-profile/user-profile.component.html =====
<div class="profile-page">
  <h1 #pageHeading tabindex="-1" class="page-heading">Profile</h1>
  <div class="account-grid">
    <section class="profile-panel surface" aria-labelledby="account-title" [attr.aria-busy]="favoriteState.isLoadingFavorites">
      <h2 id="account-title">Account Information</h2>
      <p *ngIf="favoriteState.isLoadingFavorites" role="status">Loading account information...</p>
      <p *ngIf="accountError" role="alert" class="feedback">Account information could not be loaded. Please try again later.</p>
      <dl *ngIf="accountReady">
        <div><dt>Username</dt><dd>{{ user.Username }}</dd></div>
        <div><dt>Email</dt><dd>{{ user.Email }}</dd></div>
        <div *ngIf="birthday"><dt>Birthday</dt><dd><time [attr.datetime]="birthday">{{ birthday }}</time></dd></div>
      </dl>
    </section>
    <section class="profile-panel surface" aria-labelledby="update-title">
      <h2 id="update-title">Update Account</h2>
      <p class="auth-help form-requirements">Username, email and password are required to save changes. Birthday is optional.</p>
      <form #form="ngForm" (ngSubmit)="editUser(form)" class="auth-form" [attr.aria-busy]="isSaving"
        [attr.aria-describedby]="updateError ? 'profile-update-error' : null">
        <div>
          <label class="form-label" for="profile-username">Username</label>
          <input id="profile-username" class="form-input" name="Username" type="text" autocomplete="username"
            [(ngModel)]="userData.Username" #username="ngModel" required minlength="5" [readonly]="accountActionsDisabled"
            [attr.aria-invalid]="username.invalid && (username.touched || form.submitted) ? 'true' : null"
            [attr.aria-describedby]="username.invalid && (username.touched || form.submitted) ? 'profile-username-error' : null" />
          <p *ngIf="username.invalid && (username.touched || form.submitted)" id="profile-username-error" class="auth-field-error">Enter a username with at least 5 characters.</p>
        </div>
        <div>
          <label class="form-label" for="profile-email">Email</label>
          <input id="profile-email" class="form-input" name="Email" type="email" autocomplete="email"
            [(ngModel)]="userData.Email" #email="ngModel" required email [readonly]="accountActionsDisabled"
            [attr.aria-invalid]="email.invalid && (email.touched || form.submitted) ? 'true' : null"
            [attr.aria-describedby]="email.invalid && (email.touched || form.submitted) ? 'profile-email-error' : null" />
          <p *ngIf="email.invalid && (email.touched || form.submitted)" id="profile-email-error" class="auth-field-error">Enter a valid email address.</p>
        </div>
        <div>
          <label class="form-label" for="profile-birthday">Birthday (optional)</label>
          <input id="profile-birthday" class="form-input" name="Birthday" type="date" autocomplete="bday"
            [(ngModel)]="userData.Birthday" #birthdayField="ngModel" [readonly]="accountActionsDisabled"
            [attr.aria-invalid]="birthdayField.invalid && (birthdayField.touched || form.submitted) ? 'true' : null"
            [attr.aria-describedby]="birthdayField.invalid && (birthdayField.touched || form.submitted) ? 'profile-birthday-error' : null" />
          <p *ngIf="birthdayField.invalid && (birthdayField.touched || form.submitted)" id="profile-birthday-error" class="auth-field-error">Enter a valid birthday or leave it blank.</p>
        </div>
        <div>
          <label class="form-label" for="profile-password">Password (required to save changes)</label>
          <input id="profile-password" class="form-input" name="Password" type="password" autocomplete="new-password"
            [(ngModel)]="userData.Password" #password="ngModel" required minlength="5" [readonly]="accountActionsDisabled"
            [attr.aria-invalid]="password.invalid && (password.touched || form.submitted) ? 'true' : null"
            [attr.aria-describedby]="password.invalid && (password.touched || form.submitted) ? 'profile-password-help profile-password-error' : 'profile-password-help'" />
          <p id="profile-password-help" class="auth-help">Every update requires a password of at least 5 characters. Enter your current password to keep it, or a new password to replace it.</p>
          <p *ngIf="password.invalid && (password.touched || form.submitted)" id="profile-password-error" class="auth-field-error">Enter a password with at least 5 characters.</p>
        </div>
        <button type="submit" class="button button-primary" [disabled]="accountActionsDisabled">{{ isSaving ? 'Saving...' : 'Save Changes' }}</button>
      </form>
      <p *ngIf="updateSuccess" role="status" class="feedback auth-feedback">{{ updateSuccess }}</p>
      <p *ngIf="updateError" id="profile-update-error" role="alert" class="feedback auth-feedback">{{ updateError }}</p>
    </section>
  </div>
  <section aria-labelledby="favorites-title" [attr.aria-busy]="favoriteState.isLoadingFavorites || isLoadingCatalog">
    <h2 id="favorites-title">Favorite Movies</h2>
    <p *ngIf="favoriteState.isLoadingFavorites || isLoadingCatalog" class="feedback" role="status">Loading favorite movies...</p>
    <ng-container *ngIf="!favoriteState.isLoadingFavorites && !isLoadingCatalog">
      <p *ngIf="accountError" class="feedback" role="alert">Favorite membership could not be loaded. Please try again later.</p>
      <p *ngIf="!accountError && catalogError" class="feedback" role="alert">{{ catalogError }}</p>
      <ng-container *ngIf="!accountError && !catalogError">
        <p *ngIf="!favoriteState.favorites.length" class="feedback" role="status">You haven't added any favorite movies yet.</p>
        <p *ngIf="unresolvedFavorites" class="feedback" role="status">{{ favorites.length ? 'Some favorite movies are not available in the current catalog.' : 'Your favorite movies are not available in the current catalog.' }}</p>
        <div *ngIf="favorites.length" class="movie-grid">
          <app-movie-card *ngFor="let movie of favorites" [movie]="movie" [headingLevel]="3" [isFavorite]="true"
            [isPending]="favoriteState.pendingFavorites.has(movie._id)"
            [favoriteDisabled]="favoriteState.favoriteControlsDisabled || isSaving || dialogOpen"
            [favoriteError]="favoriteState.favoriteErrors[movie._id] || ''" (favoriteToggle)="toggleFavorite(movie._id)"></app-movie-card>
        </div>
      </ng-container>
    </ng-container>
  </section>
  <section class="profile-panel danger-zone" aria-labelledby="danger-title">
    <h2 id="danger-title">Danger Zone</h2>
    <p>Deleting your account permanently removes your account information and favorites.</p>
    <button type="button" class="button button-danger" [disabled]="!accountReady || isSaving || favoriteState.pendingFavorites.size > 0" (click)="deleteUser()">Delete Account</button>
  </section>
</div>

// ===== FILE: src/app/user-profile/user-profile.component.scss =====
:host { display: block; min-width: 0; }
.profile-page { display: grid; gap: var(--space-6); }
.account-grid { display: grid; gap: var(--space-5); align-items: start; }
.profile-panel { min-width: 0; padding: var(--space-5); }
h2 { margin: 0 0 var(--space-5); }
dl { display: grid; gap: var(--space-4); margin: 0; }
dt { color: var(--color-text-secondary); font-weight: 600; }
dd { margin: var(--space-1) 0 0; overflow-wrap: anywhere; }
.danger-zone {
  background: var(--color-danger-subtle);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-default);
}
.danger-zone p { margin-bottom: var(--space-5); }
@media (min-width: 640px) { .profile-panel { padding: var(--space-6); } }
@media (min-width: 1024px) { .account-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

// ===== FILE: src/app/user-profile/user-profile.component.ts =====
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { FetchApiDataService } from '../fetch-api-data.service';
import { Movie, ProfileUpdatePayload, User } from '../api-models';
import { MovieFavoritesService } from '../movie-favorites.service';
import { DeleteAccountDialogComponent } from '../delete-account-dialog/delete-account-dialog.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  providers: [MovieFavoritesService],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  @ViewChild('pageHeading', { static: true }) pageHeading?: ElementRef<HTMLHeadingElement>;
  user: User = { _id: '', Username: '', Email: '', FavoriteMovies: [] };
  userData: ProfileUpdatePayload = { Username: '', Password: '', Email: '', Birthday: '' };
  movies: Movie[] = [];
  isLoadingCatalog = true;
  catalogError = '';
  isSaving = false;
  updateError = '';
  updateSuccess = '';
  dialogOpen = false;
  private initializedForm = false;
  private dialogRef?: MatDialogRef<DeleteAccountDialogComponent, boolean>;
  private readonly destroyed = new Subject<void>();

  constructor(
    public fetchApiData: FetchApiDataService,
    public favoriteState: MovieFavoritesService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  get accountReady(): boolean { return Boolean(this.user._id); }
  get accountError(): boolean { return Boolean(this.favoriteState.favoriteLoadError) || !this.favoriteState.hasSession; }
  get accountActionsDisabled(): boolean {
    return !this.accountReady || this.isSaving || this.dialogOpen || this.favoriteState.pendingFavorites.size > 0;
  }
  get birthday(): string { return this.user.Birthday?.slice(0, 10) ?? ''; }
  get favorites(): Movie[] { return this.movies.filter(movie => this.favoriteState.isFavorite(movie._id)); }
  get unresolvedFavorites(): boolean {
    return this.favoriteState.favorites.some(id => !this.movies.some(movie => movie._id === id));
  }

  ngOnInit(): void {
    this.pageHeading?.nativeElement.focus();
    this.favoriteState.userChanges.pipe(takeUntil(this.destroyed)).subscribe(user => {
      this.user = user;
      // Favorite responses update account information without discarding an unsaved form.
      if (!this.initializedForm) { this.resetDraft(); this.initializedForm = true; }
    });
    this.favoriteState.load();
    if (!this.favoriteState.hasSession) { this.isLoadingCatalog = false; return; }
    this.fetchApiData.getAllMovies().pipe(takeUntil(this.destroyed)).subscribe({
      next: movies => { this.movies = movies; this.isLoadingCatalog = false; },
      error: () => {
        this.catalogError = 'The movie catalog could not be loaded. Please try again later.';
        this.isLoadingCatalog = false;
      },
    });
  }

  editUser(form: Pick<NgForm, 'valid'> & Partial<Pick<NgForm, 'resetForm'>>): void {
    if (!form.valid || this.accountActionsDisabled) return;
    this.isSaving = true;
    this.updateError = '';
    this.updateSuccess = '';
    this.fetchApiData.editUser({ ...this.userData }).pipe(
      takeUntil(this.destroyed), finalize(() => this.isSaving = false),
    ).subscribe({
      next: user => {
        this.favoriteState.setUser(user);
        this.resetDraft();
        form.resetForm?.(this.userData);
        this.updateSuccess = 'Your account has been updated.';
      },
      error: () => this.updateError = 'Your account could not be updated. Please try again.',
    });
  }

  toggleFavorite(movieId: string): void {
    if (!this.isSaving && !this.dialogOpen) this.favoriteState.toggleFavorite(movieId);
  }

  deleteUser(): void {
    if (this.accountActionsDisabled) return;
    this.dialogOpen = true;
    this.dialogRef = this.dialog.open<DeleteAccountDialogComponent, undefined, boolean>(DeleteAccountDialogComponent, {
      width: '448px', maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - 32px)',
      panelClass: 'warm-delete-dialog', ariaLabelledBy: 'delete-account-title',
      ariaDescribedBy: 'delete-account-description', autoFocus: '.delete-cancel', restoreFocus: true,
    });
    this.dialogRef.afterClosed().pipe(takeUntil(this.destroyed)).subscribe(deleted => {
      this.dialogOpen = false;
      this.dialogRef = undefined;
      if (deleted) {
        ['user', 'token', 'Username'].forEach(key => localStorage.removeItem(key));
        this.router.navigate(['/login']);
      }
    });
  }

  private resetDraft(): void {
    this.userData = { Username: this.user.Username, Email: this.user.Email, Birthday: this.birthday, Password: '' };
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
    this.dialogRef?.close();
  }
}

// ===== FILE: src/app/user-registration-form/user-registration-form.component.html =====
<div class="auth-layout">
  <section class="auth-panel surface" aria-labelledby="signup-title">
    <h1 #pageHeading id="signup-title" tabindex="-1" class="auth-heading">Signup</h1>
      <p class="auth-help form-requirements">All fields are required except Birthday.</p>
    <form #form="ngForm" (ngSubmit)="registerUser(form)" class="auth-form"
      [attr.aria-busy]="isSubmitting" [attr.aria-describedby]="error ? 'signup-feedback' : registrationSucceeded ? 'signup-success' : null">
      <div>
        <label class="form-label" for="signup-username">Username</label>
        <input id="signup-username" class="form-input" name="Username" type="text" autocomplete="username"
          [(ngModel)]="userData.Username" #username="ngModel" required minlength="5" pattern="[a-zA-Z0-9]+"
          [readonly]="isSubmitting || registrationSucceeded"
          [attr.aria-invalid]="(username.invalid && (username.touched || form.submitted)) ? 'true' : null"
          [attr.aria-describedby]="(username.invalid && (username.touched || form.submitted)) ? 'signup-username-help signup-username-error' : 'signup-username-help'" />
        <p id="signup-username-help" class="auth-help">At least 5 characters. Use letters and numbers only.</p>
        <p *ngIf="username.invalid && (username.touched || form.submitted)" id="signup-username-error" class="auth-field-error">{{ username.hasError('required') ? 'Username is required.' : 'Use at least 5 characters with letters and numbers only.' }}</p>
      </div>
      <div>
        <label class="form-label" for="signup-password">Password</label>
        <input id="signup-password" class="form-input" name="Password" type="password" autocomplete="new-password"
          [(ngModel)]="userData.Password" #password="ngModel" required minlength="5"
          [readonly]="isSubmitting || registrationSucceeded"
          [attr.aria-invalid]="(password.invalid && (password.touched || form.submitted)) ? 'true' : null"
          [attr.aria-describedby]="(password.invalid && (password.touched || form.submitted)) ? 'signup-password-error' : null" />
        <p *ngIf="password.invalid && (password.touched || form.submitted)" id="signup-password-error" class="auth-field-error">{{ password.hasError('required') ? 'Password is required.' : 'Use at least 5 characters.' }}</p>
      </div>
      <div>
        <label class="form-label" for="signup-email">Email</label>
        <input id="signup-email" class="form-input" name="Email" type="email" autocomplete="email"
          [(ngModel)]="userData.Email" #email="ngModel" required email
          [readonly]="isSubmitting || registrationSucceeded"
          [attr.aria-invalid]="(email.invalid && (email.touched || form.submitted)) ? 'true' : null"
          [attr.aria-describedby]="(email.invalid && (email.touched || form.submitted)) ? 'signup-email-error' : null" />
        <p *ngIf="email.invalid && (email.touched || form.submitted)" id="signup-email-error" class="auth-field-error">{{ email.hasError('required') ? 'Email is required.' : 'Enter a valid email address.' }}</p>
      </div>
      <div>
        <label class="form-label" for="signup-birthday">Birthday (optional)</label>
        <input id="signup-birthday" class="form-input" name="Birthday" type="date" autocomplete="bday"
          [(ngModel)]="userData.Birthday" #birthday="ngModel"
          [readonly]="isSubmitting || registrationSucceeded"
          [attr.aria-invalid]="(birthday.invalid && (birthday.touched || form.submitted)) ? 'true' : null"
          [attr.aria-describedby]="'signup-birthday-help'" />
        <p id="signup-birthday-help" class="auth-help">You can leave this blank.</p>
      </div>
      <button type="submit" class="button button-primary auth-submit" [disabled]="isSubmitting || registrationSucceeded">
        {{ isSubmitting ? 'Creating account...' : 'Signup' }}
      </button>
    </form>
    <p *ngIf="error" id="signup-feedback" class="feedback auth-feedback" role="alert">{{ error }}</p>
    <p *ngIf="registrationSucceeded" id="signup-success" class="feedback auth-feedback" role="status">Registration successful. Please login.</p>
    <p class="auth-alternative">Already have an account?
      <a class="auth-link" routerLink="/login">Login</a>
    </p>
  </section>
</div>

// ===== FILE: src/app/user-registration-form/user-registration-form.component.scss =====
:host { display: block; min-width: 0; }

// ===== FILE: src/app/user-registration-form/user-registration-form.component.ts =====
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

// ===== FILE: src/_design-tokens.scss =====
// Shared source for runtime tokens and Angular Material's compile-time palettes.
$font-family: '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
$colors: (
  canvas: #EDE4D3, surface-1: #F8F3E9, surface-2: #FFFDF8, surface-elevated: #FFFFFF,
  border-subtle: #D8CCB8, border-strong: #BFAF98,
  text-primary: #2B211D, text-secondary: #62554D, text-muted: #81736A,
  primary: #8F1D2C, primary-hover: #741724, primary-subtle: #F2DDE0, on-primary: #FFFFFF,
  secondary: #496F6A, secondary-subtle: #DDE9E5, focus: #496F6A,
  danger: #C9364F, danger-hover: #A92840, danger-subtle: #FBE7EA, on-danger: #FFFFFF
);
$spacing: (1: 4px, 2: 8px, 3: 12px, 4: 16px, 5: 24px, 6: 32px, 7: 40px, 8: 56px, 9: 72px);
$radii: (small: 4px, default: 8px, medium: 12px, large: 16px, full: 9999px);

// ===== FILE: src/environments/environment.development.ts =====
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
};

// ===== FILE: src/environments/environment.ts =====
export const environment = {
  production: true,
  apiUrl: 'https://api.myflix.marksavilledesigns.com',
};

// ===== FILE: src/index.html =====
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>MyFlixAngularClient</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  </head>
  <body class="mat-typography">
    <app-root></app-root>
  </body>
</html>

// ===== FILE: src/main.ts =====
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// ===== FILE: src/styles.scss =====
@use 'sass:map';
@use '@angular/material' as mat;
@use './design-tokens' as tokens;

@include mat.core();

// Material 16 palettes use semantic rest, subtle and hover colors from one source.
@function semantic-palette($base, $subtle, $hover, $on) {
  @return mat.define-palette((
    100: map.get(tokens.$colors, $subtle),
    500: map.get(tokens.$colors, $base),
    700: map.get(tokens.$colors, $hover),
    contrast: (100: map.get(tokens.$colors, text-primary),
      500: map.get(tokens.$colors, $on), 700: map.get(tokens.$colors, $on))
  ), 500, 100, 700);
}
$typography: mat.define-typography-config(
  $font-family: tokens.$font-family,
  $headline-5: mat.define-typography-level(32px, 40px, 700),
  $headline-6: mat.define-typography-level(24px, 32px, 600),
  $subtitle-1: mat.define-typography-level(18px, 26px, 600),
  $body-1: mat.define-typography-level(16px, 26px, 400),
  $body-2: mat.define-typography-level(14px, 22px, 400),
  $caption: mat.define-typography-level(13px, 18px, 400),
  $button: mat.define-typography-level(14px, 20px, 600)
);
$theme: mat.define-light-theme((
  color: (
    primary: semantic-palette(primary, primary-subtle, primary-hover, on-primary),
    accent: semantic-palette(secondary, secondary-subtle, secondary, on-primary),
    warn: semantic-palette(danger, danger-subtle, danger-hover, on-danger)
  ),
  typography: $typography,
  density: 0
));
@include mat.all-component-themes($theme);
@include mat.typography-hierarchy($typography);

:root {
  @each $role, $value in tokens.$colors { --color-#{$role}: #{$value}; }
  @each $step, $value in tokens.$spacing { --space-#{$step}: #{$value}; }
  @each $size, $value in tokens.$radii { --radius-#{$size}: #{$value}; }
  --font-family: #{tokens.$font-family};
  --shadow-subtle: 0 2px 8px rgb(43 33 29 / 8%);
  color-scheme: light;
}
*, *::before, *::after { box-sizing: border-box; }
html { min-height: 100%; }
body {
  margin: 0;
  min-height: 100vh;
  background: var(--color-canvas);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 22px;
  overflow-wrap: anywhere;
}
app-root { display: block; min-height: 100vh; }
button, input, select, textarea { font-family: var(--font-family); }
a { color: var(--color-primary); text-underline-offset: 4px; }
a:hover { color: var(--color-primary-hover); }
.page-container {
  width: 100%;
  max-width: 1440px;
  margin-inline: auto;
  padding-inline: var(--space-4);
  min-width: 0;
}
.application-main { padding-block: var(--space-5); }
.surface, .surface-elevated, .feedback {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-default);
  background: var(--color-surface-1);
  color: var(--color-text-primary);
}
.surface-elevated {
  background: var(--color-surface-elevated);
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-subtle);
}
.feedback { padding: var(--space-4); background: var(--color-surface-2); }
.button, .nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 0;
  max-width: 100%;
  padding: var(--space-2) var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-default);
  font: 600 14px/20px var(--font-family);
  text-align: center;
  white-space: normal;
  overflow-wrap: anywhere;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 180ms, border-color 180ms, color 180ms;
}
.button-primary { background: var(--color-primary); color: var(--color-on-primary); }
.button-primary:hover:not(:disabled), .button-primary:active:not(:disabled) {
  background: var(--color-primary-hover); color: var(--color-on-primary);
}
.button-secondary {
  background: var(--color-surface-1);
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}
.button-secondary:hover:not(:disabled) { background: var(--color-surface-2); color: var(--color-text-primary); }
.button-secondary:active:not(:disabled) { background: var(--color-surface-elevated); }
.button-danger { background: var(--color-danger); color: var(--color-on-danger); }
.button-danger:hover:not(:disabled), .button-danger:active:not(:disabled) {
  background: var(--color-danger-hover); color: var(--color-on-danger);
}
.button:disabled { cursor: not-allowed; opacity: 0.6; }
.nav-link { color: var(--color-text-secondary); }
.nav-link:hover { background: var(--color-surface-2); color: var(--color-text-primary); }
.nav-link:active { background: var(--color-surface-elevated); }
.nav-link[aria-current='page'] {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-subtle);
  text-decoration: underline;
}
.form-label { display: block; margin-bottom: var(--space-2); font-weight: 600; }
.form-input {
  width: 100%;
  min-width: 0;
  min-height: 48px;
  padding: var(--space-3);
  border: 1px solid var(--color-text-muted);
  border-radius: var(--radius-default);
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 22px;
}
.form-input:hover:not(:disabled) { border-color: var(--color-text-secondary); }
.form-input:focus-visible { border-color: var(--color-focus); }
.form-input[aria-invalid='true'] { border-color: var(--color-danger); }
.form-input:disabled { cursor: not-allowed; opacity: 0.6; }
:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 4px; }
.skip-link {
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  z-index: 1000;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-default);
  background: var(--color-primary);
  color: var(--color-on-primary);
  transform: translateY(calc(-100% - 24px));
}
.skip-link:focus { transform: translateY(0); color: var(--color-on-primary); }
@media (min-width: 640px) { .page-container { padding-inline: var(--space-6); } }
@media (min-width: 1024px) { .page-container { padding-inline: 48px; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

// Shared routed authentication composition.
.auth-layout { display: flex; justify-content: center; padding-block: var(--space-4); }
.auth-panel { width: 100%; max-width: 448px; min-width: 0; padding: var(--space-5); }
.mat-typography .auth-heading {
  margin: 0 0 var(--space-5);
  font-size: 26px;
  line-height: 34px;
  font-weight: 700;
}
.auth-form { display: flex; flex-direction: column; gap: var(--space-4); }
.auth-submit { width: 100%; }
.auth-help, .auth-field-error { margin: var(--space-2) 0 0; font-size: 13px; line-height: 18px; }
.auth-help { color: var(--color-text-secondary); }
.form-requirements { margin: 0 0 var(--space-4); }
.auth-field-error { color: var(--color-danger-hover); }
.auth-feedback { margin: var(--space-4) 0 0; }
.auth-alternative { margin: var(--space-5) 0 0; color: var(--color-text-secondary); }
.auth-link { display: inline-flex; align-items: center; min-height: 44px; font-weight: 600; border-radius: var(--radius-default); }
@media (min-width: 640px) {
  .auth-layout { padding-block: var(--space-6); }
  .auth-panel { padding: var(--space-6); }
  .mat-typography .auth-heading { font-size: 32px; line-height: 40px; }
}

// Shared movie presentation for Library and Profile favorites.
.mat-typography .page-heading { margin: 0; font-size: 26px; line-height: 34px; font-weight: 700; }
.movie-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-5); }
@media (min-width: 480px) { .movie-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 768px) { .movie-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1024px) {
  .movie-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (min-width: 640px) { .mat-typography .page-heading { font-size: 32px; line-height: 40px; } }

// Only the account confirmation overlay uses this elevated treatment.
.warm-delete-dialog {
  --mdc-dialog-container-color: var(--color-surface-elevated);
  --mdc-dialog-container-shape: var(--radius-default);
}
