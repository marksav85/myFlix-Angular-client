import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { NavigationBarComponent } from './navigation-bar.component';

describe('NavigationBarComponent logout', () => {
  it('clears auth storage, preserves unrelated storage and returns to login', () => {
    const keys = ['user', 'token', 'Username', 'unrelated'];
    const saved = keys.map(key => localStorage.getItem(key));
    try {
      keys.forEach(key => localStorage.setItem(key, 'existing-' + key));
      const router = jasmine.createSpyObj<Router>('Router', ['navigate'], { events: new Subject() });
      router.navigate.and.returnValue(Promise.resolve(true));
      const component = new NavigationBarComponent(router);
      component.toLogout();
      component.ngOnDestroy();
      ['user', 'token', 'Username'].forEach(key => expect(localStorage.getItem(key)).toBeNull());
      expect(localStorage.getItem('unrelated')).toBe('existing-unrelated');
      expect(router.navigate).toHaveBeenCalledOnceWith(['login']);
    } finally {
      keys.forEach((key, index) => {
        const value = saved[index];
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      });
    }
  });
});
