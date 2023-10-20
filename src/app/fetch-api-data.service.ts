import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

//Declaring the api url that will provide data for the client app
const apiUrl = 'https://my-flix-films-d4434240379d.herokuapp.com/';
@Injectable({
  providedIn: 'root',
})
export class UserRegistrationService {
  // Inject the HttpClient module to the constructor params
  // This will provide HttpClient to the entire class, making it available via this.http
  constructor(private http: HttpClient) {}

  /**
   * make the api call for the user registration endpoint
   * @param userDetails - username, password, email, birthday
   * @returns a user that has been registered in the database
   * used in user-registration-form component
   */
  public userRegistration(userDetails: any): Observable<any> {
    return this.http
      .post(apiUrl + 'users', userDetails)
      .pipe(catchError(this.handleError));
  }

  /**
   * direct users to the login page
   * @param userDetails - username, password
   * @returns will login the user with a token and user info in the local storage
   * used in user-login-form component
   */
  public userLogin(userDetails: any): Observable<any> {
    return this.http
      .post(apiUrl + 'login', userDetails)
      .pipe(catchError(this.handleError));
  }

  /**
   * gets all of the movies in the database
   * @returns all of the movies in the database
   * used in the movie-card component
   */
  getAllMovies(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'movies', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * gets one movie by title
   * @param Title - movie title
   * @returns a movie title for the user
   */
  getMovie(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'movies/:Title', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * gets one director by name
   * @param Director.Name - director name
   * @returns the director by name
   * used in the movie-card component
   */
  getDirector(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'movies/director/:Name', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * gets one genre by name
   * @param Genre.Name - genre name
   * @returns the genre by name
   * used in the movie-card component
   */
  getGenre(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'movies/genre/:Name', {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * get one of the users
   * @param username
   * @returns the user on the user-profile component
   */
  getUser(): Observable<any> {
    const username = localStorage.getItem('Username');
    const token = localStorage.getItem('token');
    return this.http
      .get(apiUrl + 'users/' + username, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * get the users favorite movies
   * @param username
   * @returns the users array of favorite movies
   */
  getFavoriteMovies(): Observable<any> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('Username');
    return this.http
      .get(apiUrl + 'users/' + username, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(
        map(this.extractResponseData),
        map((data) => data.FavoriteMovies),
        catchError(this.handleError)
      );
  }

  /**
   * add a movie to the users favorite movies array
   * @param userName
   * @param movieId - unique movie id
   * @returns a movie added to the users favorite movies array
   * used in the movie-card component
   */
  addFavoriteMovie(username: string, MovieID: string): Observable<any> {
    const token = localStorage.getItem('token');
    const requestMovie = { movie_id: MovieID };
    return this.http
      .post(apiUrl + 'users/' + username + '/movies/' + MovieID, requestMovie, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * update the users info in the database
   * @param username
   * @param updatedUser - username, password, email, birthday
   * @returns the updated user info from the database to display in the user-profile component
   */
  editUser(updateUser: any): Observable<any> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('Username');
    return this.http
      .put(apiUrl + 'users/' + username, updateUser, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * delete the users account
   * @param username
   */
  deleteUser(): Observable<any> {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('Username');
    return this.http
      .delete(apiUrl + 'users/' + username, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  /**
   * delete a movie from the users favorite movies array
   * @param username
   * @param movieId - unique movie id
   * @returns deletes the movie from the users favorite movies array
   * used in the movie-card component and the user-profile component
   */
  deleteFavoriteMovie(username: string, MovieID: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http
      .delete(apiUrl + 'users/' + username + '/movies/' + MovieID, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      })
      .pipe(map(this.extractResponseData), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      console.error('Some error occurred:', error.error.message);
    } else {
      console.error(
        `Error Status code ${error.status}, ` + `Error body is: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }

  // Non-typed response extraction
  private extractResponseData(res: any): any {
    const body = res;
    return body || {};
  }
}
