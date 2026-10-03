import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss'],
})
export class NavigationBarComponent implements OnDestroy {
  @ViewChild('wordmark') wordmark?: ElementRef<HTMLAnchorElement>;
  @ViewChild('menuButton') menuButton?: ElementRef<HTMLButtonElement>;
  isMenuOpen = false;
  private readonly navigationSubscription: Subscription;

  constructor(private router: Router) {
    this.navigationSubscription = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) this.closeMenu();
    });
  }

  // Presentation only: backend authorization remains authoritative.
  get isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('token') && localStorage.getItem('Username'));
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    if (this.isMenuOpen) {
      const button = this.menuButton?.nativeElement;
      if (button?.getClientRects().length) button.focus();
      else this.wordmark?.nativeElement.focus();
    }
    this.isMenuOpen = false;
  }

  @HostListener('keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (!this.isMenuOpen) return;
    event.preventDefault();
    this.closeMenu();
  }

  toLogout(): void {
    if (!this.isMenuOpen) this.wordmark?.nativeElement.focus();
    this.closeMenu();
    ['user', 'token', 'Username'].forEach(key => localStorage.removeItem(key));
    this.router.navigate(['login']);
  }

  ngOnDestroy(): void {
    this.navigationSubscription.unsubscribe();
  }
}
