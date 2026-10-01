import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';

describe('Application route configuration', () => {
  it('registers welcome, movies, profile and the root redirect in the routing module', () => {
    TestBed.configureTestingModule({ imports: [AppRoutingModule] });
    const routes = TestBed.inject(Router).config;
    expect(routes.find(route => route.path === 'welcome')?.component).toBe(WelcomePageComponent);
    expect(routes.find(route => route.path === 'movies')?.component).toBe(MovieCardComponent);
    expect(routes.find(route => route.path === 'profile')?.component).toBe(UserProfileComponent);
    expect(routes.find(route => route.path === '')?.redirectTo).toBe('welcome');
    expect(routes.find(route => route.path === '')?.pathMatch).toBe('full');
  });
});
