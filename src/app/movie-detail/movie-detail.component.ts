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
