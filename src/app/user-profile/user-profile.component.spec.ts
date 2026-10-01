import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { Movie, User } from '../api-models';
import { FetchApiDataService } from '../fetch-api-data.service';
import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent account behavior', () => {
  const user: User = { _id: 'user-1', Username: 'profile-user', Email: 'user@example.com', Birthday: '1990-01-02T00:00:00.000Z', FavoriteMovies: ['movie-1'] };
  const movie: Movie = { _id: 'movie-1', Title: 'Test movie', Description: 'Synopsis', Genre: { Name: 'Drama', Description: 'Drama' }, Director: { Name: 'Director', Bio: 'Bio' } };
  const keys = ['user', 'token', 'Username', 'unrelated'];
  let saved: (string | null)[];
  let api: jasmine.SpyObj<FetchApiDataService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;
  let component: UserProfileComponent;

  beforeEach(() => {
    saved = keys.map(key => localStorage.getItem(key));
    keys.forEach(key => localStorage.setItem(key, 'existing-' + key));
    api = jasmine.createSpyObj('API', ['getUser', 'getAllMovies', 'editUser', 'deleteUser']);
    api.getUser.and.returnValue(of(user));
    api.getAllMovies.and.returnValue(of([movie]));
    snackBar = jasmine.createSpyObj('SnackBar', ['open']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));
    component = new UserProfileComponent(api, snackBar, router);
  });

  afterEach(() => {
    keys.forEach((key, index) => {
      const value = saved[index];
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    });
  });

  [true, false].forEach(moviesFirst => {
    it('waits for both responses with moviesFirst=' + moviesFirst + ' and replaces favourites on refresh', () => {
      const users = new Subject<User>();
      const movies = new Subject<Movie[]>();
      api.getUser.and.returnValue(users);
      api.getAllMovies.and.returnValue(movies);
      component.getUser();
      if (moviesFirst) { movies.next([movie]); movies.complete(); }
      else { users.next(user); users.complete(); }
      expect(component.favorites).toEqual([]);
      if (moviesFirst) { users.next(user); users.complete(); }
      else { movies.next([movie]); movies.complete(); }
      expect(component.favorites).toEqual([movie]);
      expect(component.userData.Birthday).toBe('1990-01-02');
      api.getUser.and.returnValue(of(user));
      api.getAllMovies.and.returnValue(of([movie]));
      component.getUser();
      expect(component.favorites).toEqual([movie]);
      api.getUser.and.returnValue(of({ ...user, FavoriteMovies: [] }));
      component.getUser();
      expect(component.favorites).toEqual([]);
    });
  });

  it('stores the renamed user before refreshing and preserves the token on update success', () => {
    const updated = { ...user, Username: 'renamed-user' };
    const response = new Subject<User>();
    api.editUser.and.returnValue(response);
    api.getUser.and.callFake(() => {
      expect(localStorage.getItem('Username')).toBe(updated.Username);
      return of(updated);
    });
    component.userData = { Username: updated.Username, Password: 'new-password', Email: updated.Email, Birthday: '1990-01-02' };
    component.editUser({ valid: true });
    expect(api.editUser).toHaveBeenCalledOnceWith(component.userData);
    expect(localStorage.getItem('user')).toBe('existing-user');
    response.next(updated);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(updated));
    expect(localStorage.getItem('token')).toBe('existing-token');
    expect(component.user).toEqual(updated);
  });

  it('preserves storage and does not refresh after a failed update', () => {
    const response = new Subject<User>();
    api.editUser.and.returnValue(response);
    component.editUser({ valid: true });
    response.error(new Error('Denied'));
    keys.forEach(key => expect(localStorage.getItem(key)).toBe('existing-' + key));
    expect(api.getUser).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledOnceWith('User could not be updated. Please try again', 'OK', { duration: 2000 });
  });

  it('does not submit an invalid update form', () => {
    component.editUser({ valid: false });
    expect(api.editUser).not.toHaveBeenCalled();
  });

  it('clears auth, reports success and navigates only after deletion succeeds', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const response = new Subject<string>();
    api.deleteUser.and.returnValue(response);
    router.navigate.and.callFake(() => {
      ['user', 'token', 'Username'].forEach(key => expect(localStorage.getItem(key)).toBeNull());
      expect(snackBar.open).toHaveBeenCalledOnceWith('Account deleted successfully', 'OK', { duration: 2000 });
      return Promise.resolve(true);
    });
    component.deleteUser();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('existing-token');
    response.next('Deleted');
    expect(localStorage.getItem('unrelated')).toBe('existing-unrelated');
    expect(router.navigate).toHaveBeenCalledOnceWith(['welcome']);
  });

  it('preserves auth and page state and shows failure when deletion fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const response = new Subject<string>();
    api.deleteUser.and.returnValue(response);
    component.user = user;
    component.favorites = [movie];
    component.deleteUser();
    response.error(new Error('Denied'));
    keys.forEach(key => expect(localStorage.getItem(key)).toBe('existing-' + key));
    expect(component.user).toEqual(user);
    expect(component.favorites).toEqual([movie]);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledOnceWith('Account could not be deleted. Please try again.', 'OK', { duration: 2000 });
  });

  it('does not delete when confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteUser();
    expect(api.deleteUser).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
