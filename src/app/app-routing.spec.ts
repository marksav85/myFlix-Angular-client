import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { NgZone } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { UserLoginFormComponent } from './user-login-form/user-login-form.component';
import { UserRegistrationFormComponent } from './user-registration-form/user-registration-form.component';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { MovieLibraryComponent } from './movie-library/movie-library.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

describe('Application route configuration', () => {
  it('registers login, signup, welcome, movies, profile and the root redirect in the routing module', () => {
    TestBed.configureTestingModule({ imports: [RouterTestingModule, AppRoutingModule] });
    const routes = TestBed.inject(Router).config;
    expect(routes.find(route => route.path === 'login')?.component).toBe(UserLoginFormComponent);
    expect(routes.find(route => route.path === 'signup')?.component).toBe(UserRegistrationFormComponent);
    expect(routes.find(route => route.path === 'welcome')?.redirectTo).toBe('login');
    expect(routes.find(route => route.path === 'welcome')?.pathMatch).toBe('full');
    expect(routes.find(route => route.path === 'welcome')?.component).toBeUndefined();
    expect(routes.find(route => route.path === 'movies/:movieId')?.component).toBe(MovieDetailComponent);
    expect(routes.find(route => route.path === 'movies')?.component).toBe(MovieLibraryComponent);
    expect(routes.find(route => route.path === 'profile')?.component).toBe(UserProfileComponent);
    expect(routes.find(route => route.path === '')?.redirectTo).toBe('login');
    expect(routes.find(route => route.path === '')?.pathMatch).toBe('full');
  });
  ['', '/welcome'].forEach(path => {
    it('resolves guest entry ' + (path || '/') + ' to /login', fakeAsync(() => {
      TestBed.configureTestingModule({ imports: [RouterTestingModule, AppRoutingModule] });
      const router = TestBed.inject(Router);
      TestBed.inject(NgZone).run(() => router.navigateByUrl(path || '/'));
      tick();
      expect(router.url).toBe('/login');
    }));
  });
});
