import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Movie } from '../api-models';
import { MovieCardComponent } from './movie-card.component';

const movie: Movie = {
  _id: 'movie-1', Title: 'A very long movie title with a complete supported synopsis',
  Description: 'This is the entire synopsis, retained even when its excerpt is visually clamped.',
  Genre: { Name: 'Drama', Description: 'A genre description' },
  Director: { Name: 'A director', Bio: 'A complete director biography' }, ImagePath: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
};

describe('MovieCardComponent reusable presentation', () => {
  let fixture: ComponentFixture<MovieCardComponent>;
  const root = () => fixture.nativeElement as HTMLElement;
  const favorite = () => root().querySelector('.button-primary') as HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RouterTestingModule], declarations: [MovieCardComponent] });
    fixture = TestBed.createComponent(MovieCardComponent);
    fixture.componentRef.setInput('movie', movie);
    fixture.detectChanges();
  });

  it('renders a named article, heading, poster and real metadata without fetching data', () => {
    const article = root().querySelector('article') as HTMLElement;
    const heading = root().querySelector('h2') as HTMLElement;
    expect(heading.textContent).toBe(movie.Title);
    expect(article.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(root().querySelector('img')?.getAttribute('alt')).toBe(movie.Title + ' poster');
    expect(root().textContent).toContain(movie.Genre.Name);
    expect(root().textContent).toContain(movie.Director.Name);
    expect(root().querySelector('.movie-excerpt')?.textContent).toBe(movie.Description);
    expect(root().querySelector('a button, button button')).toBeNull();
  });

  it('provides a semantic details link separate from the favorite action', () => {
    const link = root().querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/movies/movie-1');
    expect(link.getAttribute('aria-label')).toBe('View Details for ' + movie.Title);
    expect(link.querySelector('button')).toBeNull();
    expect(favorite().closest('a')).toBeNull();
  });

  it('announces favorite membership, pending state and an associated safe failure', () => {
    const emitted = jasmine.createSpy('toggle');
    fixture.componentInstance.favoriteToggle.subscribe(emitted);
    expect(favorite().getAttribute('aria-pressed')).toBe('false');
    expect(favorite().getAttribute('aria-label')).toBe('Add to Favorites: ' + movie.Title);
    favorite().click();
    expect(emitted).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('isFavorite', true);
    fixture.componentRef.setInput('isPending', true);
    fixture.detectChanges();
    expect(favorite().getAttribute('aria-pressed')).toBe('true');
    expect(favorite().getAttribute('aria-busy')).toBe('true');
    expect(favorite().disabled).toBeTrue();
    expect(favorite().getAttribute('aria-label')).toContain(movie.Title);
    fixture.componentInstance.toggleFavorite();
    expect(emitted).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('isPending', false);
    fixture.componentRef.setInput('favoriteError', 'Favorites could not be updated. Please try again.');
    fixture.detectChanges();
    const error = root().querySelector('[role="alert"]') as HTMLElement;
    expect(favorite().getAttribute('aria-describedby')).toBe(error.id);
    expect(favorite().getAttribute('aria-label')).toBe('Remove from Favorites: ' + movie.Title);
  });

  it('supports a Favorites heading level and stable unique labeling per instance', () => {
    fixture.componentRef.setInput('headingLevel', 3);
    fixture.detectChanges();
    expect(root().querySelector('h2')).toBeNull();
    expect(root().querySelector('h3')?.textContent).toBe(movie.Title);
    const other = TestBed.createComponent(MovieCardComponent);
    other.componentRef.setInput('movie', movie);
    other.detectChanges();
    expect(other.componentInstance.titleId).not.toBe(fixture.componentInstance.titleId);
    other.destroy();
  });

  it('keeps missing metadata readable without empty supplemental controls', () => {
    fixture.componentRef.setInput('movie', {
      ...movie, Genre: { Name: '', Description: '' }, Director: { Name: '', Bio: '' },
    });
    fixture.detectChanges();
    expect(root().querySelectorAll('.metadata-action').length).toBe(0);
    expect(root().querySelectorAll('.movie-metadata')[0].textContent).toContain('Unknown');
    expect(root().querySelectorAll('.movie-metadata')[1].textContent).toContain('Unknown');
    expect(root().querySelector('.button-secondary')?.textContent).toBe('View Details');
  });

  it('uses a simple unavailable-poster state for missing or broken artwork', () => {
    (root().querySelector('img') as HTMLImageElement).dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(root().querySelector('img')).toBeNull();
    expect(root().querySelector('[role="img"]')?.getAttribute('aria-label')).toContain(movie.Title);
    fixture.componentRef.setInput('isFavorite', true);
    fixture.detectChanges();
    expect(root().querySelector('img')).toBeNull();
    fixture.componentRef.setInput('movie', { ...movie, ImagePath: undefined });
    fixture.detectChanges();
    expect(root().querySelector('[role="img"]')?.textContent).toBe('Poster unavailable');
  });
});
