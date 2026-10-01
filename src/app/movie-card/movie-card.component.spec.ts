import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { FetchApiDataService } from '../fetch-api-data.service';
import { NavigationBarComponent } from '../navigation-bar/navigation-bar.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieCardComponent } from './movie-card.component';

describe('MovieCardComponent', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule, MatCardModule, MatButtonModule, MatIconModule, MatToolbarModule, MatDialogModule, MatSnackBarModule, NoopAnimationsModule],
      providers: [{ provide: FetchApiDataService, useValue: {
        getAllMovies: () => of([]),
        getFavoriteMovies: () => of([]),
      } }],
      declarations: [MovieCardComponent, NavigationBarComponent]
    });
    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
