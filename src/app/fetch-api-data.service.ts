import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

//Declaring the api url that will provide data for the client app
const apiUrl = 'https://my-flix-films-d4434240379d.herokuapp.com/';
@Injectable({
  providedIn: 'root'
})
export class UserRegistrationService {
  // Inject the HttpClient module to the constructor params
 // This will provide HttpClient to the entire class, making it available via this.http
  constructor(private http: HttpClient) {
  }
 // Making the api call for the user registration endpoint
  public userRegistration(userDetails: any): Observable<any> {
    console.log(userDetails);
    return this.http.post(apiUrl + 'users', userDetails).pipe(
    catchError(this.handleError)
    );
  }

  // Making the api call for the user login endpoint
  public userLogin(userDetails: any): Observable<any> {
    console.log(userDetails);
    return this.http.post(apiUrl + 'login', userDetails).pipe(
    catchError(this.handleError)
    );
  }

  // Making the api call for the get all movies endpoint
  getAllMovies(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies', {
    headers: new HttpHeaders({
    Authorization: 'Bearer ' + token,
    }),
    }).pipe(
    map(this.extractResponseData),
    catchError(this.handleError)
    );
  }

  // Making the api call for the get one movie endpoint
  getMovie(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies/:Title', {
    headers: new HttpHeaders({
    Authorization: 'Bearer ' + token,
    }),
    }).pipe(
    map(this.extractResponseData),
    catchError(this.handleError)
    );
  }

  // Making the api call for the get director endpoint
  getDirector(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies/director/:Name', {
    headers: new HttpHeaders({
    Authorization: 'Bearer ' + token,
    }),
    }).pipe(
    map(this.extractResponseData),
    catchError(this.handleError)
    );
  }

  // Making the api call for the get genre endpoint
  getGenre(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'movies/genre/:Name', {
    headers: new HttpHeaders({
    Authorization: 'Bearer ' + token,
    }),
    }).pipe(
    map(this.extractResponseData),
    catchError(this.handleError)
    );
  }

  // Making the api call for the get user endpoint
  getUser(): Observable<any> {
    const username = localStorage.getItem('Username');
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'users/' + username, {
    headers: new HttpHeaders({
    Authorization: 'Bearer ' + token,
    }),
    }).pipe(
    map(this.extractResponseData),
    catchError(this.handleError)
    );
  }

  // Making the api call to get favourite movies for a user
  getFavoriteMovies(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(apiUrl + 'users/:Username/movies', {
    headers: new HttpHeaders({
    Authorization: 'Bearer ' + token,
    }),
    }).pipe(
    map(this.extractResponseData),
    catchError(this.handleError)
    );
  }

  // Making the api call for the add favorite endpoint
  addFavorite(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(apiUrl + 'users/:Username/movies/:MovieID', {
    headers: new HttpHeaders({
    Authorization: 'Bearer ' + token,
    }),
    }).pipe(
    map(this.extractResponseData),
    catchError(this.handleError)
    );
  }

  // Making the api call for the update user endpoint
  editUser(updateUser: any): Observable<any> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('Username');
    return this.http.put(apiUrl + 'users/' + username, updateUser, {
    headers: new HttpHeaders({
    Authorization: 'Bearer ' + token,
    }),
    }).pipe(
    map(this.extractResponseData),
    catchError(this.handleError)
    );
  }

  // Making the api call for the delete user endpoint
  deleteUser(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(apiUrl + 'users/:Username', {
    headers: new HttpHeaders({
    Authorization: 'Bearer ' + token,
    }),
    }).pipe(
    map(this.extractResponseData),
    catchError(this.handleError)
    );
  }

  // Making the api call for the delete favorite endpoint
  deleteFavorite(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(apiUrl + 'users/:Username/movies/:MovieID', {
    headers: new HttpHeaders({
    Authorization: 'Bearer ' + token,
    }),
    }).pipe(
    map(this.extractResponseData),
    catchError(this.handleError)
    );
  }
  

private handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
    console.error('Some error occurred:', error.error.message);
    } else {
    console.error(
        `Error Status code ${error.status}, ` +
        `Error body is: ${error.error}`);
    }
    return throwError(
    'Something bad happened; please try again later.');
  }

  // Non-typed response extraction
  private extractResponseData(res: any): any {
    const body = res;
    return body || { };
  }
}


