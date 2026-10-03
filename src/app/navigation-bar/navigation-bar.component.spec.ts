import { Component, NgZone } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationBarComponent } from './navigation-bar.component';

@Component({ template: '' })
class RouteStubComponent {}

describe('NavigationBarComponent shell navigation', () => {
  let fixture: ComponentFixture<NavigationBarComponent>;
  const keys = ['user', 'token', 'Username'];
  let saved: (string | null)[];
  const root = () => fixture.nativeElement as HTMLElement;
  const menu = () => (root().querySelector('.menu-toggle') as HTMLButtonElement);

  beforeEach(() => {
    saved = keys.map(key => localStorage.getItem(key));
    keys.forEach(key => localStorage.removeItem(key));
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        { path: 'movies', component: RouteStubComponent },
        { path: 'profile', component: RouteStubComponent },
        { path: 'login', component: RouteStubComponent },
        { path: 'signup', component: RouteStubComponent },
      ])],
      declarations: [NavigationBarComponent, RouteStubComponent],
    });
    // Exercise disclosure focus behavior independently of the runner's desktop viewport.
    TestBed.overrideComponent(NavigationBarComponent, { set: {
      styleUrls: [], styles: ['.menu-toggle { display: inline-flex; }'],
    } });
    fixture = TestBed.createComponent(NavigationBarComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    keys.forEach((key, index) => {
      const value = saved[index];
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    });
  });

  it('offers guest router links and a login wordmark destination', fakeAsync(() => {
    expect(root().querySelector('.wordmark')?.getAttribute('href')).toBe('/login');
    const links = Array.from(root().querySelectorAll<HTMLAnchorElement>('.nav-link'));
    expect(links.map(link => link.textContent?.trim())).toEqual(['Login', 'Signup']);
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/login', '/signup']);
    links[0].click();
    tick();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(root().querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Login');
    links[1].click();
    tick();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/signup');
    expect(root().querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Signup');
  }));

  it('updates authenticated presentation from the existing stored session', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('Username', 'test-user');
    fixture.detectChanges();
    expect(root().querySelector('.wordmark')?.getAttribute('href')).toBe('/movies');
    expect(Array.from(root().querySelectorAll('.nav-link')).map(link => link.textContent?.trim())).toEqual(['Movies', 'My Profile']);
    expect(root().querySelector('.navigation-items button')?.textContent?.trim()).toBe('Logout');
    localStorage.removeItem('token');
    fixture.detectChanges();
    expect(root().querySelector('.nav-link')?.textContent?.trim()).toBe('Login');
  });

  it('announces current routes and closes the menu after router navigation', fakeAsync(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('Username', 'test-user');
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    TestBed.inject(NgZone).run(() => router.navigateByUrl('/movies'));
    tick();
    fixture.detectChanges();
    expect(root().querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Movies');
    menu().click();
    fixture.detectChanges();
    expect(menu().getAttribute('aria-expanded')).toBe('true');
    TestBed.inject(NgZone).run(() => router.navigateByUrl('/profile'));
    tick();
    fixture.detectChanges();
    expect(menu().getAttribute('aria-expanded')).toBe('false');
    expect(root().querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('My Profile');
  }));

  it('closes immediately when a current navigation link is activated', fakeAsync(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('Username', 'test-user');
    fixture.detectChanges();
    TestBed.inject(NgZone).run(() => TestBed.inject(Router).navigateByUrl('/movies'));
    tick();
    menu().click();
    fixture.detectChanges();
    (root().querySelector('.nav-link') as HTMLAnchorElement).click();
    tick();
    fixture.detectChanges();
    expect(menu().getAttribute('aria-expanded')).toBe('false');
  }));

  it('exposes disclosure state, closes on Escape and returns focus to its control', () => {
    menu().click();
    fixture.detectChanges();
    expect(menu().getAttribute('aria-label')).toBe('Close main menu');
    expect(menu().getAttribute('aria-controls')).toBe('main-navigation-items');
    (root().querySelector('nav') as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(menu().getAttribute('aria-expanded')).toBe('false');
    expect(menu().getAttribute('aria-label')).toBe('Open main menu');
    expect(document.activeElement).toBe(menu());
  });

  it('closes the disclosure when a guest auth link is activated', fakeAsync(() => {
    menu().click();
    fixture.detectChanges();
    (root().querySelector('.nav-link') as HTMLAnchorElement).click();
    tick();
    fixture.detectChanges();
    expect(menu().getAttribute('aria-expanded')).toBe('false');
    expect(TestBed.inject(Router).url).toBe('/login');
  }));
});
