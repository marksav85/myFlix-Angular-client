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
