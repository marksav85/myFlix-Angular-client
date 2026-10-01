import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../src/environments/environment';
import { environment as development } from '../../src/environments/environment.development';
import { FetchApiDataService } from '../../src/app/fetch-api-data.service';
import { UserLoginFormComponent } from '../../src/app/user-login-form/user-login-form.component';
import { UserProfileComponent } from '../../src/app/user-profile/user-profile.component';
import { NavigationBarComponent } from '../../src/app/navigation-bar/navigation-bar.component';

async function waitFor(condition: () => boolean): Promise<void> {
  const deadline = Date.now() + 10000;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error('Timed out waiting for client response handling');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

// Opt-in suite: scripts/validate-integration.cjs starts the isolated real backend.
// Normal npm test discovers only src specs and does not require a backend.
describe('Angular client against the real disposable backend', () => {
  it('completes auth, movie, favourite, profile, logout and deletion flows over HTTP', async () => {
    const keys = ['user', 'token', 'Username'];
    const saved = keys.map(key => localStorage.getItem(key));
    const savedApiUrl = environment.apiUrl;
    let api: FetchApiDataService | undefined;
    let deleted = false;
    try {
      keys.forEach(key => localStorage.removeItem(key));
      environment.apiUrl = development.apiUrl;
      expect(environment.apiUrl).toBe('http://localhost:8080');
      TestBed.configureTestingModule({ imports: [HttpClientModule] });
      api = TestBed.inject(FetchApiDataService);
      const username = 'angular' + crypto.randomUUID().replace(/-/g, '');
      const password = crypto.randomUUID();
      const registered = await firstValueFrom(api.userRegistration({ Username: username, Password: password, Email: username + '@example.test', Birthday: '1990-01-02' }));
      expect(registered.Username).toBe(username);
      expect(registered.Birthday?.slice(0, 10)).toBe('1990-01-02');
      expect(registered.FavoriteMovies).toEqual([]);
      expect(Object.prototype.hasOwnProperty.call(registered, 'Password')).toBeFalse();
      const snack = jasmine.createSpyObj<MatSnackBar>('SnackBar', ['open']);
      const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
      router.navigate.and.returnValue(Promise.resolve(true));
      const dialog = jasmine.createSpyObj<MatDialogRef<UserLoginFormComponent>>('Dialog', ['close']);
      const login = new UserLoginFormComponent(api, dialog, snack, router);
      login.userData = { Username: username, Password: password };
      login.loginUser();
      await waitFor(() => router.navigate.calls.count() === 1);
      expect(localStorage.getItem('Username')).toBe(username);
      expect(JSON.parse(localStorage.getItem('user') || '{}')._id).toBe(registered._id);
      expect(localStorage.getItem('token')).toBeTruthy();
      expect(dialog.close).toHaveBeenCalledTimes(1);
      const token = localStorage.getItem('token');
      login.userData.Password = 'incorrect';
      snack.open.calls.reset();
      login.loginUser();
      await waitFor(() => snack.open.calls.count() > 0);
      expect(localStorage.getItem('token')).toBe(token);
      expect(snack.open.calls.mostRecent().args[0]).toContain('unsuccessful');
      const movies = await firstValueFrom(api.getAllMovies());
      expect(movies.length).toBe(1);
      const movie = movies[0];
      expect(movie.Director.Bio).toBe('Test biography');
      expect(movie.Genre.Description).toBe('Test genre');
      expect((await firstValueFrom(api.getMovie(movie.Title)))._id).toBe(movie._id);
      expect((await firstValueFrom(api.getDirector(movie.Director.Name)))[0]._id).toBe(movie._id);
      expect((await firstValueFrom(api.getGenre(movie.Genre.Name)))[0]._id).toBe(movie._id);
      await firstValueFrom(api.addFavoriteMovie(movie._id));
      expect((await firstValueFrom(api.addFavoriteMovie(movie._id))).FavoriteMovies).toEqual([movie._id]);
      expect(await firstValueFrom(api.getFavoriteMovies())).toEqual([movie._id]);
      const profile = new UserProfileComponent(api, snack, router);
      profile.getUser();
      await waitFor(() => profile.user._id === registered._id);
      expect(profile.favorites.map(item => item._id)).toEqual([movie._id]);
      expect(profile.userData.Birthday).toBe('1990-01-02');
      expect((await firstValueFrom(api.deleteFavoriteMovie(movie._id))).FavoriteMovies).toEqual([]);
      profile.userData = { Username: username + 'renamed', Password: password, Email: 'updated@example.test', Birthday: '1991-02-03' };
      profile.editUser({ valid: true });
      await waitFor(() => localStorage.getItem('Username') === username + 'renamed');
      await waitFor(() => profile.favorites.length === 0 && profile.userData.Birthday === '1991-02-03');
      expect((await firstValueFrom(api.getUser())).Username).toBe(username + 'renamed');
      expect(localStorage.getItem('token')).toBe(token);
      new NavigationBarComponent(router).toLogout();
      keys.forEach(key => expect(localStorage.getItem(key)).toBeNull());
      await expectAsync(firstValueFrom(api.getAllMovies())).toBeRejected();
      login.userData = { Username: username + 'renamed', Password: password };
      const navigationCount = router.navigate.calls.count();
      login.loginUser();
      await waitFor(() => router.navigate.calls.count() > navigationCount);
      const validToken = localStorage.getItem('token');
      localStorage.setItem('token', 'invalid-token');
      router.navigate.calls.reset();
      snack.open.calls.reset();
      spyOn(window, 'confirm').and.returnValue(true);
      profile.deleteUser();
      await waitFor(() => snack.open.calls.count() > 0);
      expect(snack.open.calls.mostRecent().args[0]).toContain('could not be deleted');
      expect(router.navigate).not.toHaveBeenCalled();
      expect(localStorage.getItem('Username')).toBe(username + 'renamed');
      expect(localStorage.getItem('token')).toBe('invalid-token');
      localStorage.setItem('token', validToken || '');
      snack.open.calls.reset();
      profile.deleteUser();
      await waitFor(() => router.navigate.calls.count() === 1);
      deleted = true;
      keys.forEach(key => expect(localStorage.getItem(key)).toBeNull());
      expect(router.navigate).toHaveBeenCalledWith(['welcome']);
      expect(snack.open.calls.mostRecent().args[0]).toContain('successfully');
      localStorage.setItem('token', validToken || '');
      await expectAsync(firstValueFrom(api.getAllMovies())).toBeRejected();
    } finally {
      if (api && !deleted && localStorage.getItem('Username') && localStorage.getItem('token')) {
        try { await firstValueFrom(api.deleteUser()); } catch { /* Runner destroys the entire isolated database on failure. */ }
      }
      environment.apiUrl = savedApiUrl;
      keys.forEach((key, index) => {
        const value = saved[index];
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      });
    }
  }, 120000);
});
