import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, of, throwError } from 'rxjs';
import { Movie, User } from '../api-models';
import { DeleteAccountDialogComponent } from '../delete-account-dialog/delete-account-dialog.component';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { UserProfileComponent } from './user-profile.component';

// Render the real card, template-driven form and Material overlay; no native confirmation.
describe('Warm Editorial Profile', () => {
  const user: User = { _id: 'user-1', Username: 'profile-user', Email: 'user@example.com', Birthday: '1990-01-02T00:00:00.000Z', FavoriteMovies: ['movie-1'] };
  const movie: Movie = { _id: 'movie-1', Title: 'Test movie', Description: 'Synopsis', Genre: { Name: 'Drama', Description: 'Drama' }, Director: { Name: 'Director', Bio: 'Bio' } };
  const keys = ['user', 'token', 'Username', 'unrelated'];
  let saved: (string | null)[];
  let api: jasmine.SpyObj<FetchApiDataService>;
  let fixture: ComponentFixture<UserProfileComponent>;
  let component: UserProfileComponent;
  let navigate: jasmine.Spy;
  const text = () => (fixture.nativeElement as HTMLElement).textContent || '';
  const query = <T extends Element>(selector: string): T => fixture.nativeElement.querySelector(selector);
  const overlayElement = <T extends HTMLElement>(selector: string, type: { new(): T }): T => {
    const element = document.querySelector(selector);
    if (!(element instanceof type)) throw new Error('Expected overlay element: ' + selector);
    return element;
  };
  const render = () => { fixture.detectChanges(); tick(); fixture.detectChanges(); };
  const start = () => { fixture = TestBed.createComponent(UserProfileComponent); component = fixture.componentInstance; render(); };
  const input = (id: string, value: string) => {
    const field = query<HTMLInputElement>('#' + id); field.value = value; field.dispatchEvent(new Event('input')); render();
  };
  const submit = () => { query<HTMLFormElement>('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); render(); };
  const open = () => {
    const trigger = query<HTMLButtonElement>('.danger-zone button'); trigger.focus(); trigger.click(); render(); flush();
    return TestBed.inject(MatDialog).openDialogs[0];
  };

  beforeEach(() => {
    saved = keys.map(key => localStorage.getItem(key));
    keys.forEach(key => localStorage.setItem(key, 'existing-' + key));
    api = jasmine.createSpyObj('API', ['getUser', 'getAllMovies', 'editUser', 'deleteUser', 'deleteFavoriteMovie', 'addFavoriteMovie']);
    api.getUser.and.returnValue(of(user)); api.getAllMovies.and.returnValue(of([movie]));
    TestBed.configureTestingModule({
      declarations: [UserProfileComponent, MovieCardComponent, DeleteAccountDialogComponent],
      imports: [FormsModule, RouterTestingModule, MatDialogModule, NoopAnimationsModule],
      providers: [{ provide: FetchApiDataService, useValue: api }],
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
  });
  afterEach(() => {
    TestBed.inject(MatDialog).closeAll();
    fixture?.destroy();
    keys.forEach((key, index) => { const value = saved[index]; if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); });
  });

  [true, false].forEach(moviesFirst => {
    it('loads independent account/catalog responses, moviesFirst=' + moviesFirst, fakeAsync(() => {
      const users = new Subject<User>(); const movies = new Subject<Movie[]>();
      api.getUser.and.returnValue(users); api.getAllMovies.and.returnValue(movies); start();
      expect(text()).toContain('Loading account information'); expect(text()).toContain('Loading favorite movies');
      if (moviesFirst) movies.next([movie]); else users.next(user);
      render(); expect(component.favorites.length).toBe(0);
      if (!moviesFirst) expect(query('dl').textContent).toContain(user.Username);
      if (moviesFirst) users.next(user); else movies.next([movie]);
      render(); expect(component.favorites).toEqual([movie]); expect(query('dl').textContent).toContain(user.Username);
    }));
  });
  it('renders account details even when catalog fails', fakeAsync(() => {
    api.getAllMovies.and.returnValue(throwError(() => new Error('raw secret'))); start();
    expect(query('dl').textContent).toContain(user.Email); expect(text()).toContain('catalog could not be loaded'); expect(text()).not.toContain('raw secret');
  }));
  it('reports account failure separately and prevents unsafe actions', fakeAsync(() => {
    api.getUser.and.returnValue(throwError(() => new Error('raw secret'))); start();
    expect(text()).toContain('Account information could not be loaded'); expect(text()).toContain('Favorite membership could not be loaded');
    expect(query('dl')).toBeNull(); expect(query<HTMLButtonElement>('form button').disabled).toBeTrue();
    component.editUser({ valid: true }); component.deleteUser(); expect(api.editUser).not.toHaveBeenCalled(); expect(TestBed.inject(MatDialog).openDialogs.length).toBe(0);
  }));
  it('has semantic hierarchy, supported account values and prefilled form with required blank password', fakeAsync(() => {
    start(); expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(Array.from(fixture.nativeElement.querySelectorAll('h2')).map(node => (node as HTMLElement).textContent?.trim())).toEqual(['Account Information', 'Update Account', 'Favorite Movies', 'Danger Zone']);
    expect(query('dl').textContent).toContain(user.Username); expect(query('dl').textContent).toContain(user.Email);
    expect(query('time').getAttribute('datetime')).toBe('1990-01-02'); expect(query<HTMLInputElement>('#profile-birthday').value).toBe('1990-01-02');
    expect(query<HTMLInputElement>('#profile-password').value).toBe(''); expect(query<HTMLInputElement>('#profile-password').required).toBeTrue();
    submit(); expect(api.editUser).not.toHaveBeenCalled(); expect(query<HTMLInputElement>('#profile-password').getAttribute('aria-describedby')).toContain('profile-password-error');
  }));
  it('omits unavailable birthday and never invents account data', fakeAsync(() => {
    api.getUser.and.returnValue(of({ ...user, Birthday: null })); start(); expect(query('time')).toBeNull(); expect(component.userData.Birthday).toBe('');
  }));
  it('saves other valid changes for an account without a birthday', fakeAsync(() => {
    const withoutBirthday = { ...user, Birthday: null };
    api.getUser.and.returnValue(of(withoutBirthday));
    api.editUser.and.returnValue(of({ ...withoutBirthday, Email: 'updated@example.com' }));
    start();
    expect(query<HTMLInputElement>('#profile-birthday').required).toBeFalse();
    expect(text()).toContain('Birthday is optional.');
    input('profile-email', 'updated@example.com'); input('profile-password', 'valid-password'); submit();
    expect(api.editUser).toHaveBeenCalledOnceWith({ Username: user.Username, Email: 'updated@example.com', Birthday: '', Password: 'valid-password' });
    expect(component.user.Email).toBe('updated@example.com');
    expect(component.userData.Birthday).toBe('');
    expect(text()).toContain('Your account has been updated');
    expect(query('#profile-birthday-error')).toBeNull();
  }));
  it('rejects short username/password and invalid email', fakeAsync(() => {
    start(); input('profile-password', 'valid-password');
    const invalid: [string, string, string][] = [['profile-username', 'a', user.Username], ['profile-password', 'a', 'valid-password'], ['profile-email', 'bad', user.Email]];
    invalid.forEach(([id, value, valid]) => { input(id, value); submit(); expect(api.editUser).not.toHaveBeenCalled(); input(id, valid); });
  }));
  it('guards pending updates and persists authoritative returned user without changing token', fakeAsync(() => {
    const response = new Subject<User>(); api.editUser.and.returnValue(response); start();
    input('profile-password', 'valid-password'); input('profile-username', 'draft-rename'); submit(); submit();
    expect(api.editUser.calls.mostRecent().args[0].Birthday).toBe('1990-01-02');
    expect(api.editUser).toHaveBeenCalledTimes(1); expect(query('form').getAttribute('aria-busy')).toBe('true');
    expect(navigate).not.toHaveBeenCalled(); expect(component.user.Username).toBe(user.Username);
    const returned = { ...user, Username: 'server-rename', FavoriteMovies: [] }; response.next(returned); response.complete(); render();
    expect(component.user).toEqual(returned); expect(component.favorites).toEqual([]); expect(component.userData.Password).toBe('');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(returned)); expect(localStorage.getItem('Username')).toBe(returned.Username); expect(localStorage.getItem('token')).toBe('existing-token');
    expect(text()).toContain('Your account has been updated'); expect(api.getUser).toHaveBeenCalledTimes(1);
    expect(query('#profile-password-error')).toBeNull();
  }));
  it('preserves account/session and drafts on update failure, then permits retry', fakeAsync(() => {
    api.editUser.and.returnValue(throwError(() => new Error('raw secret'))); start(); input('profile-password', 'valid-password');
    const stored = localStorage.getItem('user'); submit();
    expect(component.user).toEqual(user); expect(localStorage.getItem('user')).toBe(stored); expect(component.userData.Password).toBe('valid-password');
    expect(text()).toContain('could not be updated'); expect(text()).not.toContain('raw secret'); expect(navigate).not.toHaveBeenCalled();
    api.editUser.and.returnValue(of(user)); submit(); expect(component.updateError).toBe(''); expect(component.updateSuccess).toBeTruthy();
  }));
  it('renders shared h3 cards with metadata and routed View Details', fakeAsync(() => {
    start(); expect(query('app-movie-card h3').textContent).toBe(movie.Title); expect(text()).toContain('Genre: Drama'); expect(text()).toContain('Director: Director'); expect(text()).toContain('Synopsis');
    expect(query('app-movie-card a').getAttribute('href')).toBe('/movies/movie-1'); expect(query('app-movie-card button').getAttribute('aria-pressed')).toBe('true');
  }));
  it('distinguishes no favorites from unresolved membership, including partial resolution', fakeAsync(() => {
    api.getUser.and.returnValue(of({ ...user, FavoriteMovies: [] })); start(); expect(text()).toContain("haven't added any");
    component.favoriteState.setUser({ ...user, FavoriteMovies: ['missing'] }); render(); expect(text()).toContain('Your favorite movies are not available'); expect(query('app-movie-card')).toBeNull();
    component.favoriteState.setUser({ ...user, FavoriteMovies: ['missing', movie._id] }); render(); expect(text()).toContain('Some favorite movies are not available'); expect(query('app-movie-card')).not.toBeNull();
  }));
  it('removes only after server success, prevents duplicate removal and overlapping account actions', fakeAsync(() => {
    const response = new Subject<User>(); api.deleteFavoriteMovie.and.returnValue(response); start();
    input('profile-password', 'valid-password'); const button = query<HTMLButtonElement>('app-movie-card button'); button.click(); render(); component.toggleFavorite(movie._id);
    submit(); component.deleteUser(); expect(api.editUser).not.toHaveBeenCalled(); expect(api.deleteFavoriteMovie).toHaveBeenCalledOnceWith(movie._id);
    expect(component.favorites).toEqual([movie]); expect(button.disabled).toBeTrue();
    response.next({ ...user, FavoriteMovies: [] }); response.complete(); render(); expect(query('app-movie-card')).toBeNull(); expect(JSON.parse(localStorage.getItem('user') || '{}').FavoriteMovies).toEqual([]);
    expect(component.userData.Password).toBe('valid-password');
  }));
  it('keeps favorite and draft on failure with persistent safe card feedback and retry', fakeAsync(() => {
    api.deleteFavoriteMovie.and.returnValue(throwError(() => new Error('raw secret'))); start(); input('profile-username', 'draft-name');
    query<HTMLButtonElement>('app-movie-card button').click(); render(); expect(component.favorites).toEqual([movie]); expect(text()).toContain('Favorites could not be updated'); expect(text()).not.toContain('raw secret'); expect(component.userData.Username).toBe('draft-name');
    api.deleteFavoriteMovie.and.returnValue(of({ ...user, FavoriteMovies: [] })); query<HTMLButtonElement>('app-movie-card button').click(); render(); expect(component.favorites).toEqual([]);
  }));
  it('opens named/described dialog with Cancel focus and restores trigger after cancel', fakeAsync(() => {
    start(); open(); const container = overlayElement('[role="dialog"]', HTMLElement);
    expect(container.getAttribute('aria-labelledby')).toBe('delete-account-title'); expect(container.getAttribute('aria-describedby')).toBe('delete-account-description');
    const cancel = overlayElement('.delete-cancel', HTMLButtonElement); expect(document.activeElement).toBe(cancel); cancel.click(); render(); flush();
    expect(api.deleteUser).not.toHaveBeenCalled(); expect(navigate).not.toHaveBeenCalled(); expect(document.activeElement).toBe(query('.danger-zone button'));
  }));
  it('Escape cancels without deleting and restores focus', fakeAsync(() => {
    start(); open(); const container = overlayElement('[role="dialog"]', HTMLElement);
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true })); render(); flush();
    expect(TestBed.inject(MatDialog).openDialogs.length).toBe(0); expect(api.deleteUser).not.toHaveBeenCalled(); expect(document.activeElement).toBe(query('.danger-zone button'));
  }));
  it('prevents duplicate deletion and Escape while pending; clears only on successful deletion', fakeAsync(() => {
    const response = new Subject<string>(); api.deleteUser.and.returnValue(response); start(); const ref = open(); const dialog = ref.componentInstance;
    dialog.deleteAccount(); dialog.deleteAccount(); render(); expect(api.deleteUser).toHaveBeenCalledTimes(1); expect(ref.disableClose).toBeTrue();
    const container = overlayElement('[role="dialog"]', HTMLElement); container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true })); render();
    expect(TestBed.inject(MatDialog).openDialogs.length).toBe(1); expect(localStorage.getItem('token')).toBe('existing-token'); expect(navigate).not.toHaveBeenCalled();
    response.next('Deleted'); response.complete(); render(); flush();
    ['user', 'token', 'Username'].forEach(key => expect(localStorage.getItem(key)).toBeNull()); expect(localStorage.getItem('unrelated')).toBe('existing-unrelated'); expect(navigate).toHaveBeenCalledOnceWith(['/login']);
  }));
  it('retains dialog, account and session on deletion failure and allows a successful retry', fakeAsync(() => {
    api.deleteUser.and.returnValue(throwError(() => new Error('raw secret'))); start(); const stored = localStorage.getItem('user'); const ref = open();
    ref.componentInstance.deleteAccount(); render(); expect(document.querySelector('[role="dialog"]')?.textContent).toContain('could not be deleted'); expect(document.querySelector('[role="dialog"]')?.textContent).not.toContain('raw secret');
    expect(localStorage.getItem('user')).toBe(stored); expect(localStorage.getItem('token')).toBe('existing-token'); expect(component.user).toEqual(user); expect(component.favorites).toEqual([movie]); expect(navigate).not.toHaveBeenCalled(); expect(ref.disableClose).toBeFalse();
    api.deleteUser.and.returnValue(of('Deleted')); ref.componentInstance.deleteAccount(); render(); flush(); expect(api.deleteUser).toHaveBeenCalledTimes(2); expect(navigate).toHaveBeenCalledOnceWith(['/login']);
  }));
  it('blocks favorite mutation during saving and while deletion dialog is open', fakeAsync(() => {
    const response = new Subject<User>(); api.editUser.and.returnValue(response); start(); input('profile-password', 'valid-password'); submit();
    component.toggleFavorite(movie._id); expect(api.deleteFavoriteMovie).not.toHaveBeenCalled();
    response.next(user); response.complete(); render(); const ref = open(); component.toggleFavorite(movie._id);
    expect(api.deleteFavoriteMovie).not.toHaveBeenCalled(); ref.componentInstance.cancel(); render(); flush();
  }));
  it('does not repeat successful deletion during dialog closing', fakeAsync(() => {
    api.deleteUser.and.returnValue(of('Deleted')); start(); const ref = open(); const dialog = ref.componentInstance;
    dialog.deleteAccount(); dialog.deleteAccount(); expect(api.deleteUser).toHaveBeenCalledTimes(1); render(); flush();
  }));
  it('cancels a pending deletion when leaving Profile without clearing session', fakeAsync(() => {
    const response = new Subject<string>(); api.deleteUser.and.returnValue(response); start(); const ref = open(); ref.componentInstance.deleteAccount(); render();
    fixture.destroy(); flush(); response.next('Deleted'); expect(localStorage.getItem('token')).toBe('existing-token'); expect(navigate).not.toHaveBeenCalled();
  }));
  it('ignores late update responses after leaving the page', fakeAsync(() => {
    const response = new Subject<User>(); api.editUser.and.returnValue(response); start(); input('profile-password', 'valid-password'); submit(); const stored = localStorage.getItem('user');
    fixture.destroy(); response.next({ ...user, Username: 'late-user' }); expect(localStorage.getItem('user')).toBe(stored);
  }));
});
