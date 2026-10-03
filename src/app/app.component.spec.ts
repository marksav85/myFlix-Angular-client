import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    declarations: [AppComponent, NavigationBarComponent]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'myFlix-Angular-client'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('myFlix-Angular-client');
  });

  it('should render the route outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-navigation-bar').length).toBe(1);
    expect(compiled.querySelectorAll('header').length).toBe(1);
    expect(compiled.querySelectorAll('main').length).toBe(1);
    expect(compiled.querySelector('main#main-content router-outlet')).not.toBeNull();
  });
  it('moves keyboard focus to the main landmark through the skip link', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    spyOn(main, 'scrollIntoView');
    fixture.nativeElement.querySelector('.skip-link').click();
    expect(document.activeElement).toBe(main);
    expect(main.scrollIntoView).toHaveBeenCalled();
  });
});
