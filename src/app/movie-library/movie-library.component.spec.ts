import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { Movie, User } from '../api-models';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MovieLibraryComponent } from './movie-library.component';

const movie: Movie = {
  _id: 'movie-1', Title: 'The Matrix', Description: 'A full synopsis.', ImagePath: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  Genre: { Name: 'Science Fiction', Description: 'Genre information.' },
  Director: { Name: 'Director', Bio: 'Director biography.' },
};
const user: User = { _id: 'user-1', Username: 'testuser', Email: 'user@example.com', FavoriteMovies: [] };

describe('MovieLibraryComponent data and interactions', () => {
  let fixture: ComponentFixture<MovieLibraryComponent>;
  let api: jasmine.SpyObj<FetchApiDataService>;
  let catalog: Subject<Movie[]>;
  let account: Subject<User>;
  let add: Subject<User>;
  let remove: Subject<User>;
  const keys = ['user', 'token', 'Username'];
  let saved: (string | null)[];
  const root = () => fixture.nativeElement as HTMLElement;
  const favorite = () => root().querySelector('.button-primary') as HTMLButtonElement;
  const load = (movies: Movie[] = [movie], favorites: string[] = []) => {
    catalog.next(movies);
    account.next({ ...user, FavoriteMovies: favorites });
    fixture.detectChanges();
  };
  const filter = async (value: string) => {
    const input = root().querySelector('input[type="search"]') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    saved = keys.map(key => localStorage.getItem(key));
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('Username', user.Username);
    localStorage.removeItem('user');
    catalog = new Subject(); account = new Subject(); add = new Subject(); remove = new Subject();
    api = jasmine.createSpyObj('API', ['getAllMovies', 'getUser', 'addFavoriteMovie', 'deleteFavoriteMovie']);
    api.getAllMovies.and.returnValue(catalog.asObservable());
    api.getUser.and.returnValue(account.asObservable());
    api.addFavoriteMovie.and.returnValue(add.asObservable());
    api.deleteFavoriteMovie.and.returnValue(remove.asObservable());
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [MovieLibraryComponent, MovieCardComponent],
      providers: [{ provide: FetchApiDataService, useValue: api }],
    });
    fixture = TestBed.createComponent(MovieLibraryComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    keys.forEach((key, index) => {
      const value = saved[index];
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    });
  });

  it('renders one page heading and labeled search, with loading then results', () => {
    expect(root().querySelectorAll('h1').length).toBe(1);
    expect(root().querySelector('h1')?.textContent).toBe('Movie Library');
    expect(document.activeElement).toBe(root().querySelector('h1'));
    const search = root().querySelector('input') as HTMLInputElement;
    expect(search.labels?.[0].textContent).toBe('Search movies');
    expect(root().querySelector('[role="status"]')?.textContent).toBe('Loading movies...');
    load();
    expect(root().querySelectorAll('article').length).toBe(1);
    expect(root().querySelector('[role="status"]')).toBeNull();
  });

  it('does not steal search focus when account or catalog responses arrive', () => {
    const search = root().querySelector('input') as HTMLInputElement;
    search.focus(); load();
    expect(document.activeElement).toBe(search);
  });

  it('shows a safe persistent catalog failure instead of an empty catalog', () => {
    catalog.error(new Error('private database details'));
    fixture.detectChanges();
    expect(root().querySelector('[role="alert"]')?.textContent).toContain('Movies could not be loaded.');
    expect(root().textContent).not.toContain('private database');
    expect(root().textContent).not.toContain('No movies are available.');
  });

  it('distinguishes a successfully empty catalog from search with no matches', async () => {
    load([]);
    expect(root().querySelector('[role="status"]')?.textContent).toBe('No movies are available.');
    await filter('unmatched');
    expect(root().textContent).not.toContain('No movies match your search.');
    catalog.next([movie]);
    fixture.detectChanges();
    expect(root().querySelector('[role="status"]')?.textContent).toBe('No movies match your search. Try another title.');
  });

  it('filters titles case-insensitively, trims whitespace and clears without refetching', async () => {
    load([movie, { ...movie, _id: 'movie-2', Title: 'Other movie' }]);
    await filter('  mAtRiX  ');
    expect(root().querySelectorAll('article').length).toBe(1);
    await filter('Director');
    expect(root().querySelectorAll('article').length).toBe(0);
    await filter('');
    expect(root().querySelectorAll('article').length).toBe(2);
    expect(api.getAllMovies).toHaveBeenCalledTimes(1);
  });

  it('links cards to movie-specific details instead of opening dialogs', () => {
    load();
    expect(root().querySelector('a.button-secondary')?.getAttribute('href')).toBe('/movies/movie-1');
  });

  it('waits for favorite membership and disables mutations when that load fails', () => {
    catalog.next([movie]);
    fixture.detectChanges();
    expect(root().querySelector('[role="status"]')?.textContent).toBe('Loading favorites...');
    expect(favorite().disabled).toBeTrue();
    account.error(new Error('private error'));
    fixture.detectChanges();
    expect(root().querySelector('[role="alert"]')?.textContent).toBe('Favorites could not be loaded. Please try again later.');
    expect(root().querySelectorAll('article').length).toBe(1);
    fixture.componentInstance.favoriteState.toggleFavorite(movie._id);
    expect(api.addFavoriteMovie).not.toHaveBeenCalled();
  });

  it('adds and removes using returned membership, persists the user and guards pending repeats', () => {
    load();
    favorite().click();
    fixture.detectChanges();
    fixture.componentInstance.favoriteState.toggleFavorite(movie._id);
    expect(api.addFavoriteMovie).toHaveBeenCalledOnceWith(movie._id);
    expect(favorite().getAttribute('aria-busy')).toBe('true');
    expect(favorite().getAttribute('aria-pressed')).toBe('false');
    add.next({ ...user, FavoriteMovies: [movie._id, 'server-only-id'] }); add.complete();
    fixture.detectChanges();
    expect(favorite().getAttribute('aria-pressed')).toBe('true');
    expect(favorite().disabled).toBeFalse();
    expect(JSON.parse(localStorage.getItem('user') || '{}').FavoriteMovies).toEqual([movie._id, 'server-only-id']);
    expect(localStorage.getItem('token')).toBe('test-token');
    favorite().click();
    expect(api.deleteFavoriteMovie).toHaveBeenCalledOnceWith(movie._id);
    remove.next({ ...user, FavoriteMovies: ['server-only-id'] }); remove.complete();
    fixture.detectChanges();
    expect(favorite().getAttribute('aria-pressed')).toBe('false');
    expect(fixture.componentInstance.favoriteState.favorites).toEqual(['server-only-id']);
  });

  it('preserves membership and storage on mutation failure, with inline error and retry', () => {
    load([movie], [movie._id]);
    const stored = localStorage.getItem('user');
    favorite().click();
    remove.error(new Error('private failure'));
    fixture.detectChanges();
    expect(favorite().getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('user')).toBe(stored);
    expect(root().querySelector('[role="alert"]')?.textContent).toBe('Favorites could not be updated. Please try again.');
    expect(favorite().getAttribute('aria-describedby')).toBe(root().querySelector('[role="alert"]')?.id ?? null);
    remove = new Subject();
    api.deleteFavoriteMovie.and.returnValue(remove.asObservable());
    favorite().click();
    fixture.detectChanges();
    expect(api.deleteFavoriteMovie).toHaveBeenCalledTimes(2);
    expect(root().querySelector('[role="alert"]')).toBeNull();
  });

  it('serializes different movie mutations to avoid overlapping full-user snapshots', () => {
    const second = { ...movie, _id: 'movie-2', Title: 'Second movie' };
    load([movie, second]);
    fixture.componentInstance.favoriteState.toggleFavorite(movie._id);
    fixture.componentInstance.favoriteState.toggleFavorite(second._id);
    expect(api.addFavoriteMovie.calls.allArgs()).toEqual([[movie._id]]);
    expect(fixture.componentInstance.favoriteState.pendingFavorites.has(second._id)).toBeTrue();
    add.next({ ...user, FavoriteMovies: [movie._id] });
    const secondResponse = new Subject<User>();
    api.addFavoriteMovie.and.returnValue(secondResponse.asObservable());
    add.complete();
    expect(api.addFavoriteMovie.calls.allArgs()).toEqual([[movie._id], [second._id]]);
    secondResponse.next({ ...user, FavoriteMovies: [movie._id, second._id] }); secondResponse.complete();
    expect(fixture.componentInstance.favoriteState.favorites).toEqual([movie._id, second._id]);
    expect(fixture.componentInstance.favoriteState.pendingFavorites.size).toBe(0);
  });

  it('does not assume a successful mutation added the requested movie', () => {
    load();
    favorite().click();
    add.next(user); add.complete();
    fixture.detectChanges();
    expect(favorite().getAttribute('aria-pressed')).toBe('false');
  });

  it('handles direct guest entry without an account selector or requests', () => {
    fixture.destroy();
    localStorage.removeItem('Username');
    api.getAllMovies.calls.reset();
    api.getUser.calls.reset();
    fixture = TestBed.createComponent(MovieLibraryComponent);
    fixture.detectChanges();
    expect(root().querySelector('[role="alert"]')?.textContent).toContain('Please log in');
    expect(root().querySelector('a')?.getAttribute('href')).toBe('/login');
    expect(api.getAllMovies).not.toHaveBeenCalled();
    expect(api.getUser).not.toHaveBeenCalled();
  });

  it('cancels pending work on leaving the Library and ignores late responses', () => {
    load();
    const stored = localStorage.getItem('user');
    favorite().click();
    fixture.destroy();
    add.next({ ...user, FavoriteMovies: [movie._id] }); add.complete();
    expect(localStorage.getItem('user')).toBe(stored);
  });
});
