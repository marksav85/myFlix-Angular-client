import { RegistrationValidationDirective } from './user-registration-form/registration-validation.directive';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserRegistrationFormComponent } from './user-registration-form/user-registration-form.component';

import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { UserLoginFormComponent } from './user-login-form/user-login-form.component';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { MovieLibraryComponent } from './movie-library/movie-library.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';

import { DeleteAccountDialogComponent } from './delete-account-dialog/delete-account-dialog.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    RegistrationValidationDirective,
    UserRegistrationFormComponent,
    UserLoginFormComponent,
    MovieCardComponent,
    MovieLibraryComponent,
    UserProfileComponent,
    DeleteAccountDialogComponent,
    NavigationBarComponent,
    MovieDetailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
