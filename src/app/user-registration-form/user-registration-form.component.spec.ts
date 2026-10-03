import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { FetchApiDataService } from '../fetch-api-data.service';
import { User } from '../api-models';
import { UserRegistrationFormComponent } from './user-registration-form.component';

describe('UserRegistrationFormComponent routed form', () => {
  let fixture: ComponentFixture<UserRegistrationFormComponent>;
  let api: jasmine.SpyObj<FetchApiDataService>;
  let response: Subject<User>;
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
    await fill('Email', account.Email);
  };
  const submit = () => { form().requestSubmit(button()); fixture.detectChanges(); };

  beforeEach(async () => {
    saved = keys.map(key => localStorage.getItem(key));
    keys.forEach(key => localStorage.removeItem(key));
    response = new Subject();
    api = jasmine.createSpyObj('API', ['userRegistration']);
    api.userRegistration.and.returnValue(response.asObservable());
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      providers: [{ provide: FetchApiDataService, useValue: api }],
      declarations: [UserRegistrationFormComponent],
    });
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(UserRegistrationFormComponent);
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
    expect(input('Password').autocomplete).toBe('new-password');
    expect(root().querySelector('.auth-link')?.getAttribute('href')).toBe('/login');
    expect(root().querySelector('.auth-field-error')).toBeNull();
  });

  it('shows associated validation only after submission and does not request invalid data', () => {
    submit();
    expect(api.userRegistration).not.toHaveBeenCalled();
    expect(input('Username').getAttribute('aria-invalid')).toBe('true');
    expect(input('Username').getAttribute('aria-describedby')).toContain('signup-username-error');
    expect(root().querySelector('#signup-username-error')?.textContent).toContain('required');
  });

  it('submits the form once, exposes pending state and guards repeated submission', async () => {
    await fillValid();
    submit();
    expect(api.userRegistration).toHaveBeenCalledTimes(1);
    expect(api.userRegistration).toHaveBeenCalledWith({ Username: account.Username, Password: 'password', Email: account.Email, Birthday: '' });
    expect(form().getAttribute('aria-busy')).toBe('true');
    expect(button().disabled).toBeTrue();
    expect(button().textContent).toContain('Creating account...');
    form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(api.userRegistration).toHaveBeenCalledTimes(1);
  });

  it('keeps request failures inline, preserves values and stored session, and permits retry', async () => {
    keys.forEach(key => localStorage.setItem(key, 'existing-' + key));
    await fillValid();
    submit();
    response.error(new Error('private database details'));
    fixture.detectChanges();
    expect(root().querySelector('[role="alert"]')?.textContent).toBe('Registration unsuccessful. Please try again.');
    expect(form().getAttribute('aria-describedby')).toBe('signup-feedback');
    expect(form().getAttribute('aria-busy')).toBe('false');
    expect(button().disabled).toBeFalse();
    expect(input('Username').value).toBe(account.Username);
    expect(root().textContent).not.toContain('private database');
    keys.forEach(key => expect(localStorage.getItem(key)).toBe('existing-' + key));
    expect(router.navigate).not.toHaveBeenCalled();
    response = new Subject();
    api.userRegistration.and.returnValue(response.asObservable());
    submit();
    expect(api.userRegistration).toHaveBeenCalledTimes(2);
    expect(root().querySelector('[role="alert"]')).toBeNull();
  });

  it('preserves signup constraints and accepts an optional Birthday', async () => {
    await fillValid();
    await fill('Username', 'bad-name');
    input('Username').dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(root().querySelector('#signup-username-error')?.textContent).toContain('letters and numbers');
    submit();
    expect(api.userRegistration).not.toHaveBeenCalled();
    await fill('Username', 'abcd');
    submit();
    expect(api.userRegistration).not.toHaveBeenCalled();
    await fill('Username', account.Username);
    await fill('Password', '1234');
    submit();
    expect(api.userRegistration).not.toHaveBeenCalled();
    await fill('Password', 'password');
    await fill('Email', 'not-an-email');
    submit();
    expect(api.userRegistration).not.toHaveBeenCalled();
    await fill('Email', account.Email);
    expect(input('Birthday').required).toBeFalse();
    submit();
    expect(api.userRegistration).toHaveBeenCalledTimes(1);
  });

  it('announces signup success, clears the password and directs users to Login without authentication', async () => {
    await fillValid();
    await fill('Birthday', '1990-01-02');
    submit();
    expect(api.userRegistration.calls.mostRecent().args[0].Birthday).toBe('1990-01-02');
    response.next(account);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root().querySelector('[role="status"]')?.textContent).toBe('Registration successful. Please login.');
    expect(input('Password').value).toBe('');
    expect(input('Username').value).toBe(account.Username);
    expect(root().querySelector('.auth-field-error')).toBeNull();
    expect(button().disabled).toBeTrue();
    keys.forEach(key => expect(localStorage.getItem(key)).toBeNull());
    expect(router.navigate).not.toHaveBeenCalled();
    form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(api.userRegistration).toHaveBeenCalledTimes(1);
    expect(root().querySelector('.auth-link')?.getAttribute('href')).toBe('/login');
  });

  it('cancels an abandoned pending request when the routed page is destroyed', async () => {
    await fillValid();
    submit();
    fixture.destroy();
    response.next(account);
    keys.forEach(key => expect(localStorage.getItem(key)).toBeNull());
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
