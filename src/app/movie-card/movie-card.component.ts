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
