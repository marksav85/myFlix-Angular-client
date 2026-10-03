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
