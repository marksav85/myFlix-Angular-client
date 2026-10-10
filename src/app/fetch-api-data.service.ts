import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { LoginPayload, LoginResponse, Movie, ProfileUpdatePayload, RegistrationPayload, User } from './api-models';

@Injectable({ providedIn: 'root' })
export class FetchApiDataService {
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  constructor(private http: HttpClient) {}

  userRegistration(details: RegistrationPayload): Observable<User> {
    return this.http.post<User>(this.url('users'), details).pipe(catchError(error =>
      error instanceof HttpErrorResponse && (error.status === 422 || error.status === 400)
        ? throwError(() => error) : this.handleError(),
    ));
  }

  userLogin(details: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url('login'), details).pipe(catchError(this.handleError));
  }

  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.url('movies'), this.authOptions()).pipe(catchError(this.handleError));
  }

  getMovie(title: string): Observable<Movie> {
    return this.http.get<Movie>(this.url('movies/' + encodeURIComponent(title)), this.authOptions()).pipe(catchError(this.handleError));
  }

  // The backend returns movie collections for director and genre searches.
  getDirector(name: string): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.url('movies/director/' + encodeURIComponent(name)), this.authOptions()).pipe(catchError(this.handleError));
  }

  getGenre(name: string): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.url('movies/genre/' + encodeURIComponent(name)), this.authOptions()).pipe(catchError(this.handleError));
  }

  getUser(): Observable<User> {
    return this.http.get<User>(this.userUrl(), this.authOptions()).pipe(catchError(this.handleError));
  }

  getFavoriteMovies(): Observable<string[]> {
    return this.getUser().pipe(map(user => user.FavoriteMovies));
  }

  addFavoriteMovie(movieId: string): Observable<User> {
    return this.http.post<User>(this.userUrl() + '/movies/' + encodeURIComponent(movieId), {}, this.authOptions()).pipe(catchError(this.handleError));
  }

  deleteFavoriteMovie(movieId: string): Observable<User> {
    return this.http.delete<User>(this.userUrl() + '/movies/' + encodeURIComponent(movieId), this.authOptions()).pipe(catchError(this.handleError));
  }

  editUser(details: ProfileUpdatePayload): Observable<User> {
    return this.http.put<User>(this.userUrl(), details, this.authOptions()).pipe(catchError(this.handleError));
  }

  deleteUser(): Observable<string> {
    return this.http.delete(this.userUrl(), { ...this.authOptions(), responseType: 'text' }).pipe(catchError(this.handleError));
  }

  private url(path: string): string {
    return this.apiUrl + '/' + path;
  }

  private userUrl(): string {
    // The finalized backend requires this selector and verifies ownership using JWT.
    // Username is refreshed from successful login/profile responses, never supplied by callers.
    const username = localStorage.getItem('Username');
    if (!username) throw new Error('Please log in before accessing your account.');
    return this.url('users/' + encodeURIComponent(username));
  }

  private authOptions(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({ Authorization: 'Bearer ' + localStorage.getItem('token') }) };
  }

  private handleError(): Observable<never> {
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
