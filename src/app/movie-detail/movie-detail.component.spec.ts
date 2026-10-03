import { Component, NgZone } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Movie, User } from '../api-models';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MovieLibraryComponent } from '../movie-library/movie-library.component';
import { MovieDetailComponent } from './movie-detail.component';

@Component({ template: '<router-outlet></router-outlet>' })
class RouteHostComponent {}

const movie: Movie = {
  _id: 'movie-1', Title: 'The Matrix', Description: 'The complete synopsis.\nA second paragraph.',
  ImagePath: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', Genre: { Name: 'Science Fiction', Description: 'Full genre description.' },
  Director: { Name: 'Director', Bio: 'Full director biography.' },
};
const user: User = { _id: 'user-1', Username: 'testuser', Email: 'user@example.com', FavoriteMovies: [] };

describe('MovieDetailComponent routed screen', () => {
  let fixture: ComponentFixture<MovieDetailComponent>;
  let api: jasmine.SpyObj<FetchApiDataService>;
  let catalog: Subject<Movie[]>;
  let account: Subject<User>;
  let add: Subject<User>;
  let remove: Subject<User>;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  const keys = ['user', 'token', 'Username'];
  let saved: (string | null)[];
  const root = () => fixture.nativeElement as HTMLElement;
  const favorite = () => root().querySelector('button') as HTMLButtonElement;
  const load = (selected: Movie = movie, ids: string[] = []) => {
    catalog.next([selected]);
    account.next({ ...user, FavoriteMovies: ids });
    fixture.detectChanges();
  };

  beforeEach(() => {
    saved = keys.map(key => localStorage.getItem(key));
    localStorage.setItem('token', 'test-token'); localStorage.setItem('Username', user.Username);
    localStorage.removeItem('user');
    catalog = new Subject(); account = new Subject(); add = new Subject(); remove = new Subject();
    params = new BehaviorSubject(convertToParamMap({ movieId: movie._id }));
    api = jasmine.createSpyObj('API', ['getAllMovies', 'getUser', 'getMovie', 'addFavoriteMovie', 'deleteFavoriteMovie']);
    api.getAllMovies.and.returnValue(catalog.asObservable()); api.getUser.and.returnValue(account.asObservable());
    api.addFavoriteMovie.and.returnValue(add.asObservable()); api.deleteFavoriteMovie.and.returnValue(remove.asObservable());
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule.withRoutes([{ path: 'movies/:movieId', component: MovieDetailComponent }])],
      declarations: [MovieDetailComponent, MovieLibraryComponent, MovieCardComponent, RouteHostComponent],
      providers: [{ provide: FetchApiDataService, useValue: api }, { provide: ActivatedRoute, useValue: { paramMap: params.asObservable() } }],
    });
    fixture = TestBed.createComponent(MovieDetailComponent); fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    keys.forEach((key, index) => { const value = saved[index]; if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); });
  });

  it('loads by identifier from the catalog without calling the title endpoint', () => {
    expect(root().querySelector('[role="status"]')?.textContent).toBe('Loading movie details...');
    expect(root().querySelector('a')?.getAttribute('href')).toBe('/movies');
    load();
    expect(root().querySelectorAll('h1').length).toBe(1);
    expect(root().querySelector('h1')?.textContent).toBe(movie.Title);
    expect(document.activeElement).toBe(root().querySelector('h1'));
    expect(root().querySelector('img')?.getAttribute('alt')).toBe(movie.Title + ' poster');
    expect(root().querySelector('.detail-synopsis')?.textContent).toBe(movie.Description);
    expect(root().textContent).toContain(movie.Genre.Description);
    expect(root().textContent).toContain(movie.Director.Bio);
    expect(root().querySelectorAll('h2').length).toBe(2);
    expect(api.getMovie).not.toHaveBeenCalled();
  });

  it('distinguishes a safe API failure from a movie not found', () => {
    catalog.error(new Error('private database error')); fixture.detectChanges();
    expect(root().querySelector('[role="alert"]')?.textContent).toBe('Movie details could not be loaded. Please try again later.');
    expect(root().textContent).not.toContain('private database');
    expect(root().textContent).not.toContain('Movie not found.');
  });

  it('shows unknown IDs without substituting another movie', () => {
    params.next(convertToParamMap({ movieId: 'unknown' })); catalog.next([movie]); fixture.detectChanges();
    expect(root().querySelector('h1')?.textContent).toBe('Movie not found.');
    expect(root().querySelector('article')).toBeNull();
    expect(root().querySelector('a')?.getAttribute('href')).toBe('/movies');
  });

  it('omits absent supplemental content and provides a missing poster state', () => {
    load({ ...movie, ImagePath: undefined, Genre: { Name: '', Description: '' }, Director: { Name: '', Bio: '' } });
    expect(root().querySelectorAll('h2').length).toBe(0);
    expect(root().querySelector('img')).toBeNull();
    expect(root().querySelector('[role="img"]')?.getAttribute('aria-label')).toContain(movie.Title);
    expect(root().querySelector('dl')?.textContent).toContain('Unknown');
  });

  it('adds and removes from server membership, guards duplicates and preserves the token', () => {
    load(); favorite().click(); fixture.detectChanges(); fixture.componentInstance.favoriteState.toggleFavorite(movie._id);
    expect(api.addFavoriteMovie).toHaveBeenCalledOnceWith(movie._id);
    expect(favorite().getAttribute('aria-busy')).toBe('true'); expect(favorite().disabled).toBeTrue();
    expect(favorite().getAttribute('aria-pressed')).toBe('false');
    add.next({ ...user, FavoriteMovies: [movie._id, 'server-only'] }); add.complete(); fixture.detectChanges();
    expect(favorite().getAttribute('aria-pressed')).toBe('true');
    expect(favorite().getAttribute('aria-label')).toBe('Remove from Favorites: ' + movie.Title);
    expect(JSON.parse(localStorage.getItem('user') || '{}').FavoriteMovies).toEqual([movie._id, 'server-only']);
    expect(localStorage.getItem('token')).toBe('test-token');
    favorite().click(); expect(api.deleteFavoriteMovie).toHaveBeenCalledOnceWith(movie._id);
    remove.next({ ...user, FavoriteMovies: ['server-only'] }); remove.complete(); fixture.detectChanges();
    expect(favorite().getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps failures inline and preserves previous membership and persisted state', () => {
    load(movie, [movie._id]); const stored = localStorage.getItem('user'); favorite().click();
    remove.error(new Error('private failure')); fixture.detectChanges();
    expect(favorite().getAttribute('aria-pressed')).toBe('true'); expect(favorite().disabled).toBeFalse();
    expect(favorite().getAttribute('aria-describedby')).toBe('detail-favorite-error');
    expect(root().querySelector('[role="alert"]')?.textContent).toBe('Favorites could not be updated. Please try again.');
    expect(localStorage.getItem('user')).toBe(stored);
  });

  it('leaves content readable when membership fails to load', () => {
    catalog.next([movie]); account.error(new Error('failed')); fixture.detectChanges();
    expect(root().querySelector('article')).not.toBeNull(); expect(favorite().disabled).toBeTrue();
    expect(root().querySelector('[role="alert"]')?.textContent).toContain('Favorites could not be loaded.');
  });

  it('cancels an obsolete route request before resolving another ID', () => {
    const nextCatalog = new Subject<Movie[]>(); api.getAllMovies.and.returnValue(nextCatalog.asObservable());
    params.next(convertToParamMap({ movieId: 'movie-2' }));
    catalog.next([movie]); fixture.detectChanges(); expect(root().querySelector('article')).toBeNull();
    nextCatalog.next([{ ...movie, _id: 'movie-2', Title: 'Second movie' }]); fixture.detectChanges();
    expect(root().querySelector('h1')?.textContent).toBe('Second movie');
  });

  it('resolves an actual direct URL with no Library navigation state', async () => {
    fixture.destroy();
    api.getAllMovies.and.returnValue(of([movie])); api.getUser.and.returnValue(of(user));
    const host = TestBed.createComponent(RouteHostComponent); host.detectChanges();
    await TestBed.inject(NgZone).run(() => TestBed.inject(Router).navigateByUrl('/movies/movie-1')); host.detectChanges();
    expect(host.nativeElement.querySelector('h1')?.textContent).toBe(movie.Title);
    expect(host.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/movies'); host.destroy();
  });

  it('refreshes authoritative membership through Library → Detail → Library', () => {
    fixture.destroy(); api.getAllMovies.and.returnValue(of([movie])); api.getUser.and.returnValue(of(user));
    const library = TestBed.createComponent(MovieLibraryComponent); library.detectChanges();
    (library.nativeElement.querySelector('.button-primary') as HTMLButtonElement).click();
    const updated = { ...user, FavoriteMovies: [movie._id] }; add.next(updated); add.complete(); library.destroy();
    api.getUser.and.returnValue(of(updated)); fixture = TestBed.createComponent(MovieDetailComponent); fixture.detectChanges();
    expect(favorite().getAttribute('aria-pressed')).toBe('true'); favorite().click(); remove.next(user); remove.complete(); fixture.destroy();
    api.getUser.and.returnValue(of(user)); const returned = TestBed.createComponent(MovieLibraryComponent); returned.detectChanges();
    expect(returned.nativeElement.querySelector('.button-primary').getAttribute('aria-pressed')).toBe('false'); returned.destroy();
    expect(JSON.parse(localStorage.getItem('user') || '{}').FavoriteMovies).toEqual([]);
  });
});
