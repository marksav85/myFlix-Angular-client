import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { FetchApiDataService } from '../fetch-api-data.service';

@Component({
  selector: 'app-delete-account-dialog',
  templateUrl: './delete-account-dialog.component.html',
  styleUrls: ['./delete-account-dialog.component.scss'],
})
export class DeleteAccountDialogComponent implements OnDestroy {
  @ViewChild('heading', { static: true }) heading?: ElementRef<HTMLHeadingElement>;
  isDeleting = false;
  error = '';
  private deletionSucceeded = false;
  private readonly destroyed = new Subject<void>();

  constructor(private api: FetchApiDataService, private dialogRef: MatDialogRef<DeleteAccountDialogComponent, boolean>) {}

  deleteAccount(): void {
    if (this.isDeleting) return;
    this.isDeleting = true;
    this.error = '';
    this.dialogRef.disableClose = true;
    this.heading?.nativeElement.focus();
    this.api.deleteUser().pipe(takeUntil(this.destroyed), finalize(() => {
      if (!this.deletionSucceeded) {
        this.isDeleting = false;
        this.dialogRef.disableClose = false;
      }
    })).subscribe({
      next: () => { this.deletionSucceeded = true; this.dialogRef.close(true); },
      error: () => this.error = 'Your account could not be deleted. Please try again.',
    });
  }

  cancel(): void { if (!this.isDeleting) this.dialogRef.close(false); }

  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); }
}
