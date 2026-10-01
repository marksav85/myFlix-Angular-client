import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MovieCardComponent } from './movie-card.component';

describe('MovieCardComponent self-only favourites', () => {
  let api: jasmine.SpyObj<FetchApiDataService>;
  let component: MovieCardComponent;
  let saved: (string | null)[];
  const keys = ['Username', 'token'];

  beforeEach(() => {
    saved = keys.map(key => localStorage.getItem(key));
    localStorage.removeItem('Username');
    localStorage.setItem('token', 'test-token');
    api = jasmine.createSpyObj('API', ['addFavoriteMovie', 'deleteFavoriteMovie']);
    component = new MovieCardComponent(api, jasmine.createSpyObj<MatSnackBar>('SnackBar', ['open']), jasmine.createSpyObj<MatDialog>('Dialog', ['open']));
  });

  afterEach(() => {
    keys.forEach((key, index) => {
      const value = saved[index];
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    });
  });

  it('passes only the movie ID and adopts server favourites without duplication', () => {
    const user = { _id: 'user-1', Username: 'current-user', Email: 'user@example.com', FavoriteMovies: ['movie-1'] };
    api.addFavoriteMovie.and.returnValue(of(user));
    component.addFavorite('movie-1');
    component.addFavorite('movie-1');
    expect(api.addFavoriteMovie.calls.allArgs()).toEqual([['movie-1'], ['movie-1']]);
    expect(component.favorites).toEqual(['movie-1']);
    api.deleteFavoriteMovie.and.returnValue(of({ ...user, FavoriteMovies: [] }));
    component.deleteFavorite('movie-1');
    expect(api.deleteFavoriteMovie).toHaveBeenCalledOnceWith('movie-1');
    expect(component.favorites).toEqual([]);
  });

  it('preserves favourites when a mutation fails', () => {
    component.favorites = ['movie-1'];
    api.deleteFavoriteMovie.and.returnValue(throwError(() => new Error('Denied')));
    component.deleteFavorite('movie-1');
    expect(component.favorites).toEqual(['movie-1']);
  });
});
