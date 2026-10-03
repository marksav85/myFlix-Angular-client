import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'myFlix-Angular-client';

  focusMain(main: HTMLElement, event: Event): void {
    event.preventDefault();
    main.focus();
    main.scrollIntoView({ block: 'start' });
  }
}
