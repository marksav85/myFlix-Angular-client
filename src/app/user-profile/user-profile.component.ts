import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { FetchApiDataService } from '../fetch-api-data.service';
import { Movie, ProfileUpdatePayload, User } from '../api-models';
import { MovieFavoritesService } from '../movie-favorites.service';
import { DeleteAccountDialogComponent } from '../delete-account-dialog/delete-account-dialog.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  providers: [MovieFavoritesService],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  @ViewChild('pageHeading', { static: true }) pageHeading?: ElementRef<HTMLHeadingElement>;
  user: User = { _id: '', Username: '', Email: '', FavoriteMovies: [] };
  userData: ProfileUpdatePayload = { Username: '', Password: '', Email: '', Birthday: '' };
  movies: Movie[] = [];
  isLoadingCatalog = true;
  catalogError = '';
  isSaving = false;
  updateError = '';
  updateSuccess = '';
  dialogOpen = false;
  private initializedForm = false;
  private dialogRef?: MatDialogRef<DeleteAccountDialogComponent, boolean>;
  private readonly destroyed = new Subject<void>();

  constructor(
    public fetchApiData: FetchApiDataService,
    public favoriteState: MovieFavoritesService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  get accountReady(): boolean { return Boolean(this.user._id); }
  get accountError(): boolean { return Boolean(this.favoriteState.favoriteLoadError) || !this.favoriteState.hasSession; }
  get accountActionsDisabled(): boolean {
    return !this.accountReady || this.isSaving || this.dialogOpen || this.favoriteState.pendingFavorites.size > 0;
  }
  get birthday(): string { return this.user.Birthday?.slice(0, 10) ?? ''; }
  get favorites(): Movie[] { return this.movies.filter(movie => this.favoriteState.isFavorite(movie._id)); }
  get unresolvedFavorites(): boolean {
    return this.favoriteState.favorites.some(id => !this.movies.some(movie => movie._id === id));
  }

  ngOnInit(): void {
    this.pageHeading?.nativeElement.focus();
    this.favoriteState.userChanges.pipe(takeUntil(this.destroyed)).subscribe(user => {
      this.user = user;
      // Favorite responses update account information without discarding an unsaved form.
      if (!this.initializedForm) { this.resetDraft(); this.initializedForm = true; }
    });
    this.favoriteState.load();
    if (!this.favoriteState.hasSession) { this.isLoadingCatalog = false; return; }
    this.fetchApiData.getAllMovies().pipe(takeUntil(this.destroyed)).subscribe({
      next: movies => { this.movies = movies; this.isLoadingCatalog = false; },
      error: () => {
        this.catalogError = 'The movie catalog could not be loaded. Please try again later.';
        this.isLoadingCatalog = false;
      },
    });
  }

  editUser(form: Pick<NgForm, 'valid'> & Partial<Pick<NgForm, 'resetForm'>>): void {
    if (!form.valid || this.accountActionsDisabled) return;
    this.isSaving = true;
    this.updateError = '';
    this.updateSuccess = '';
    this.fetchApiData.editUser({ ...this.userData }).pipe(
      takeUntil(this.destroyed), finalize(() => this.isSaving = false),
    ).subscribe({
      next: user => {
        this.favoriteState.setUser(user);
        this.resetDraft();
        form.resetForm?.(this.userData);
        this.updateSuccess = 'Your account has been updated.';
      },
      error: () => this.updateError = 'Your account could not be updated. Please try again.',
    });
  }

  toggleFavorite(movieId: string): void {
    if (!this.isSaving && !this.dialogOpen) this.favoriteState.toggleFavorite(movieId);
  }

  deleteUser(): void {
    if (this.accountActionsDisabled) return;
    this.dialogOpen = true;
    this.dialogRef = this.dialog.open<DeleteAccountDialogComponent, undefined, boolean>(DeleteAccountDialogComponent, {
      width: '448px', maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - 32px)',
      panelClass: 'warm-delete-dialog', ariaLabelledBy: 'delete-account-title',
      ariaDescribedBy: 'delete-account-description', autoFocus: '.delete-cancel', restoreFocus: true,
    });
    this.dialogRef.afterClosed().pipe(takeUntil(this.destroyed)).subscribe(deleted => {
      this.dialogOpen = false;
      this.dialogRef = undefined;
      if (deleted) {
        ['user', 'token', 'Username'].forEach(key => localStorage.removeItem(key));
        this.router.navigate(['/login']);
      }
    });
  }

  private resetDraft(): void {
    this.userData = { Username: this.user.Username, Email: this.user.Email, Birthday: this.birthday, Password: '' };
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
    this.dialogRef?.close();
  }
}
