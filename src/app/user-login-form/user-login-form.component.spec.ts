import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { FetchApiDataService } from '../fetch-api-data.service';
import { LoginResponse } from '../api-models';
import { UserLoginFormComponent } from './user-login-form.component';

describe('UserLoginFormComponent routed form', () => {
  let fixture: ComponentFixture<UserLoginFormComponent>;
  let api: jasmine.SpyObj<FetchApiDataService>;
  let response: Subject<LoginResponse>;
  let router: Router;
  const keys = ['user', 'token', 'Username'];
  let saved: (string | null)[];
  const account = { _id: 'user-1', Username: 'testuser', Email: 'user@example.com', Birthday: '1990-01-02', FavoriteMovies: [] };
  const root = () => fixture.nativeElement as HTMLElement;
  const form = () => root().querySelector('form') as HTMLFormElement;
  const button = () => root().querySelector('button[type="submit"]') as HTMLButtonElement;
  const input = (name: string) => root().querySelector('input[name="' + name + '"]') as HTMLInputElement;
  const fill = async (name: string, value: string) => {
    input(name).value = value;
    input(name).dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const fillValid = async () => {
    await fill('Username', account.Username);
    await fill('Password', 'password');
  };
  const submit = () => { form().requestSubmit(button()); fixture.detectChanges(); };

  beforeEach(async () => {
    saved = keys.map(key => localStorage.getItem(key));
    keys.forEach(key => localStorage.removeItem(key));
    response = new Subject();
    api = jasmine.createSpyObj('API', ['userLogin']);
    api.userLogin.and.returnValue(response.asObservable());
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      providers: [{ provide: FetchApiDataService, useValue: api }],
      declarations: [UserLoginFormComponent],
    });
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(UserLoginFormComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    response.complete();
    keys.forEach((key, index) => {
      const value = saved[index];
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    });
  });

  it('renders a labeled page without dialog providers and focuses its heading', () => {
    expect(root().querySelectorAll('h1').length).toBe(1);
    expect(document.activeElement).toBe(root().querySelector('h1'));
    expect(root().querySelector('[role="dialog"]')).toBeNull();
    expect(button().type).toBe('submit');
    expect(input('Username').labels?.[0].textContent).toContain('Username');
    expect(input('Password').autocomplete).toBe('current-password');
    expect(root().querySelector('.auth-link')?.getAttribute('href')).toBe('/signup');
    expect(root().querySelector('.auth-field-error')).toBeNull();
  });

  it('shows associated validation only after submission and does not request invalid data', () => {
    submit();
    expect(api.userLogin).not.toHaveBeenCalled();
    expect(input('Username').getAttribute('aria-invalid')).toBe('true');
    expect(input('Username').getAttribute('aria-describedby')).toContain('login-username-error');
    expect(root().querySelector('#login-username-error')?.textContent).toContain('required');
  });

  it('submits the form once, exposes pending state and guards repeated submission', async () => {
    await fillValid();
    submit();
    expect(api.userLogin).toHaveBeenCalledTimes(1);
    expect(api.userLogin).toHaveBeenCalledWith({ Username: account.Username, Password: 'password' });
    expect(form().getAttribute('aria-busy')).toBe('true');
    expect(button().disabled).toBeTrue();
    expect(button().textContent).toContain('Signing in...');
    form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(api.userLogin).toHaveBeenCalledTimes(1);
  });

  it('keeps request failures inline, preserves values and stored session, and permits retry', async () => {
    keys.forEach(key => localStorage.setItem(key, 'existing-' + key));
    await fillValid();
    submit();
    response.error(new Error('private database details'));
    fixture.detectChanges();
    expect(root().querySelector('[role="alert"]')?.textContent).toBe('Login unsuccessful. Please try again.');
    expect(form().getAttribute('aria-describedby')).toBe('login-feedback');
    expect(form().getAttribute('aria-busy')).toBe('false');
    expect(button().disabled).toBeFalse();
    expect(input('Username').value).toBe(account.Username);
    expect(root().textContent).not.toContain('private database');
    keys.forEach(key => expect(localStorage.getItem(key)).toBe('existing-' + key));
    expect(router.navigate).not.toHaveBeenCalled();
    response = new Subject();
    api.userLogin.and.returnValue(response.asObservable());
    submit();
    expect(api.userLogin).toHaveBeenCalledTimes(2);
    expect(root().querySelector('[role="alert"]')).toBeNull();
  });

  it('stores the existing session contract and navigates only on successful login', async () => {
    await fillValid();
    submit();
    keys.forEach(key => expect(localStorage.getItem(key)).toBeNull());
    expect(router.navigate).not.toHaveBeenCalled();
    response.next({ user: account, token: 'issued-token' });
    fixture.detectChanges();
    expect(localStorage.getItem('user')).toBe(JSON.stringify(account));
    expect(localStorage.getItem('token')).toBe('issued-token');
    expect(localStorage.getItem('Username')).toBe(account.Username);
    expect(router.navigate).toHaveBeenCalledOnceWith(['movies']);
  });

  it('cancels an abandoned pending request when the routed page is destroyed', async () => {
    await fillValid();
    submit();
    fixture.destroy();
    response.next({ user: account, token: 'late-token' });
    keys.forEach(key => expect(localStorage.getItem(key)).toBeNull());
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
