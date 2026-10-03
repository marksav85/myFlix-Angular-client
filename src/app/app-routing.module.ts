import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MovieLibraryComponent } from './movie-library/movie-library.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

import { UserLoginFormComponent } from './user-login-form/user-login-form.component';
import { UserRegistrationFormComponent } from './user-registration-form/user-registration-form.component';

import { MovieDetailComponent } from './movie-detail/movie-detail.component';

const routes: Routes = [
  { path: 'movies/:movieId', component: MovieDetailComponent },
  { path: 'login', component: UserLoginFormComponent },
  { path: 'signup', component: UserRegistrationFormComponent },
  { path: 'welcome', redirectTo: 'login', pathMatch: 'full' },
  { path: 'movies', component: MovieLibraryComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
