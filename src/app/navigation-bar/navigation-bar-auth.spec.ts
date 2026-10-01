import { Router } from '@angular/router';
import { NavigationBarComponent } from './navigation-bar.component';

describe('NavigationBarComponent logout', () => {
  it('clears auth storage, preserves unrelated storage and returns to welcome', () => {
    const keys = ['user', 'token', 'Username', 'unrelated'];
    const saved = keys.map(key => localStorage.getItem(key));
    try {
      keys.forEach(key => localStorage.setItem(key, 'existing-' + key));
      const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
      router.navigate.and.returnValue(Promise.resolve(true));
      new NavigationBarComponent(router).toLogout();
      ['user', 'token', 'Username'].forEach(key => expect(localStorage.getItem(key)).toBeNull());
      expect(localStorage.getItem('unrelated')).toBe('existing-unrelated');
      expect(router.navigate).toHaveBeenCalledOnceWith(['welcome']);
    } finally {
      keys.forEach((key, index) => {
        const value = saved[index];
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      });
    }
  });
});
