import { environment } from '../environments/environment';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FetchApiDataService } from './fetch-api-data.service';

describe('FetchApiDataService API contracts', () => {
  const base = environment.apiUrl.replace(/\/+$/, '') + '/';
  const user = { _id: 'user-1', Username: 'phase1-user', Email: 'user@example.com', Birthday: '1990-01-02', FavoriteMovies: ['movie-1'] };
  const keys = ['token', 'Username'];
  let saved: (string | null)[];
  let service: FetchApiDataService;
  let http: HttpTestingController;

  beforeEach(() => {
    saved = keys.map(key => localStorage.getItem(key));
    localStorage.setItem('token', 'phase1-token');
    localStorage.setItem('Username', user.Username);
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(FetchApiDataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    keys.forEach((key, index) => {
      const value = saved[index];
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    });
    http.verify();
  });

  it('posts login credentials and emits the user/token response', () => {
    const credentials = { Username: user.Username, Password: 'test-password' };
    const result = { user, token: 'issued-token' };
    const next = jasmine.createSpy('next');
    service.userLogin(credentials).subscribe(next);
    const request = http.expectOne(base + 'login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush(result);
    expect(next).toHaveBeenCalledOnceWith(result);
  });

  it('posts registration details including Birthday and emits the registered user', () => {
    const details = { Username: user.Username, Password: 'test-password', Email: user.Email, Birthday: user.Birthday };
    const next = jasmine.createSpy('next');
    service.userRegistration(details).subscribe(next);
    const request = http.expectOne(base + 'users');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(details);
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush(user);
    expect(next).toHaveBeenCalledOnceWith(user);
  });

  it('gets movies using the token present at call time', () => {
    localStorage.setItem('token', 'replacement-token');
    const movies = [{ _id: 'movie-1', Title: 'Test movie' }];
    const next = jasmine.createSpy('next');
    service.getAllMovies().subscribe(next);
    const request = http.expectOne(base + 'movies');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer replacement-token');
    request.flush(movies);
    expect(next).toHaveBeenCalledOnceWith(movies);
  });

  it('gets the current user using the stored Username', () => {
    localStorage.setItem('Username', 'current-user');
    const next = jasmine.createSpy('next');
    service.getUser().subscribe(next);
    const request = http.expectOne(base + 'users/current-user');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer phase1-token');
    request.flush(user);
    expect(next).toHaveBeenCalledOnceWith(user);
  });

  it('extracts FavoriteMovies from the user response', () => {
    const next = jasmine.createSpy('next');
    service.getFavoriteMovies().subscribe(next);
    const request = http.expectOne(base + 'users/' + user.Username);
    expect(request.request.method).toBe('GET');
    request.flush(user);
    expect(next).toHaveBeenCalledOnceWith(user.FavoriteMovies);
  });

  it('puts profile details including Birthday to the current user endpoint', () => {
    const details = { Username: 'renamed-user', Password: 'new-password', Email: 'new@example.com', Birthday: '1991-02-03' };
    const updatedUser = { ...user, Username: details.Username, Email: details.Email, Birthday: '1991-02-03T00:00:00.000Z' };
    const next = jasmine.createSpy('next');
    service.editUser(details).subscribe(next);
    const request = http.expectOne(base + 'users/' + user.Username);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(details);
    expect(request.request.headers.get('Authorization')).toBe('Bearer phase1-token');
    request.flush(updatedUser);
    expect(next).toHaveBeenCalledOnceWith(updatedUser);
    expect(Object.prototype.hasOwnProperty.call(next.calls.mostRecent().args[0], 'Password')).toBeFalse();
  });

  it('posts a favourite for the current user and supplied movie ID', () => {
    const next = jasmine.createSpy('next');
    service.addFavoriteMovie('movie-1').subscribe(next);
    const request = http.expectOne(base + 'users/' + user.Username + '/movies/movie-1');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    expect(request.request.headers.get('Authorization')).toBe('Bearer phase1-token');
    request.flush(user);
    expect(next).toHaveBeenCalledOnceWith(user);
  });

  it('deletes a favourite for the current user and supplied movie ID', () => {
    const next = jasmine.createSpy('next');
    service.deleteFavoriteMovie('movie-1').subscribe(next);
    const request = http.expectOne(base + 'users/' + user.Username + '/movies/movie-1');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toBeNull();
    expect(request.request.headers.get('Authorization')).toBe('Bearer phase1-token');
    request.flush(user);
    expect(next).toHaveBeenCalledOnceWith(user);
  });

  it('deletes the current account and emits the server response only after it arrives', () => {
    const next = jasmine.createSpy('next');
    service.deleteUser().subscribe(next);
    const request = http.expectOne(base + 'users/' + user.Username);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.responseType).toBe('text');
    expect(request.request.headers.get('Authorization')).toBe('Bearer phase1-token');
    expect(next).not.toHaveBeenCalled();
    request.flush('Account deleted');
    expect(next).toHaveBeenCalledOnceWith('Account deleted');
  });

  it('delivers failed account deletion through the error channel', () => {
    spyOn(console, 'error');
    const next = jasmine.createSpy('next');
    const error = jasmine.createSpy('error');
    service.deleteUser().subscribe({ next, error });
    http.expectOne(base + 'users/' + user.Username).flush('Denied', { status: 403, statusText: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
  });
  it('encodes the current username as a resource selector', () => {
    localStorage.setItem('Username', 'user/name');
    service.getUser().subscribe();
    http.expectOne(base + 'users/user%2Fname').flush(user);
  });

  [
    { method: 'movie', path: 'movies/A%2FB%20%26%20C' },
    { method: 'director', path: 'movies/director/A%2FB%20%26%20C' },
    { method: 'genre', path: 'movies/genre/A%2FB%20%26%20C' },
  ].forEach(({ method, path }) => {
    it('encodes dynamic ' + method + ' searches and sends Bearer auth', () => {
      const next = jasmine.createSpy('next');
      if (method === 'movie') service.getMovie('A/B & C').subscribe(next);
      else if (method === 'director') service.getDirector('A/B & C').subscribe(next);
      else service.getGenre('A/B & C').subscribe(next);
      const request = http.expectOne(base + path);
      expect(request.request.method).toBe('GET');
      expect(request.request.headers.get('Authorization')).toBe('Bearer phase1-token');
      const result = method === 'movie' ? { _id: 'movie-1' } : [{ _id: 'movie-1' }];
      request.flush(result);
      expect(next).toHaveBeenCalledOnceWith(result);
    });
  });

  [422, 400].forEach(status => {
    it('preserves registration error details for status ' + status, () => {
      const error = jasmine.createSpy('error');
      service.userRegistration({ Username: 'testuser', Password: 'password', Email: 'user@example.com' }).subscribe({ error });
      const body = status === 422 ? { errors: [{ path: 'Email', msg: 'Invalid email' }] } : 'testuser already exists';
      http.expectOne(base + 'users').flush(body, { status, statusText: 'Invalid registration' });
      expect(error.calls.mostRecent().args[0].status).toBe(status);
      expect(error.calls.mostRecent().args[0].error).toEqual(body);
    });
  });

});
