import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { FetchApiDataService } from '../fetch-api-data.service';
import { UserLoginFormComponent } from './user-login-form.component';

describe('UserLoginFormComponent login behavior', () => {
  const keys = ['user', 'token', 'Username'];
  const user = { _id: 'user-1', Username: 'phase1-user', Email: 'user@example.com', Birthday: '1990-01-02', FavoriteMovies: [] };
  let saved: (string | null)[];
  let response: Subject<{ user: typeof user; token: string }>;
  let component: UserLoginFormComponent;
  let api: jasmine.SpyObj<FetchApiDataService>;
  let dialog: jasmine.SpyObj<MatDialogRef<UserLoginFormComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    saved = keys.map(key => localStorage.getItem(key));
    keys.forEach(key => localStorage.removeItem(key));
    response = new Subject();
    api = jasmine.createSpyObj('API', ['userLogin']);
    api.userLogin.and.returnValue(response.asObservable());
    dialog = jasmine.createSpyObj('Dialog', ['close']);
    snackBar = jasmine.createSpyObj('SnackBar', ['open']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));
    component = new UserLoginFormComponent(api, dialog, snackBar, router);
    component.userData = { Username: user.Username, Password: 'test-password' };
  });

  afterEach(() => {
    response.complete();
    keys.forEach((key, index) => {
      const value = saved[index];
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    });
  });

  it('stores user, token and Username and navigates after successful login', () => {
    component.loginUser();
    expect(api.userLogin).toHaveBeenCalledOnceWith(component.userData);
    keys.forEach(key => expect(localStorage.getItem(key)).toBeNull());
    expect(router.navigate).not.toHaveBeenCalled();
    response.next({ user, token: 'issued-token' });
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
    expect(localStorage.getItem('token')).toBe('issued-token');
    expect(localStorage.getItem('Username')).toBe(user.Username);
    expect(dialog.close).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['movies']);
  });

  it('preserves stored credentials and keeps the dialog open on failed login', () => {
    keys.forEach(key => localStorage.setItem(key, 'existing-' + key));
    component.loginUser();
    response.error('Login failed');
    keys.forEach(key => expect(localStorage.getItem(key)).toBe('existing-' + key));
    expect(dialog.close).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledOnceWith('Login unsuccessful. Please try again.', 'OK', { duration: 2000 });
  });
});
