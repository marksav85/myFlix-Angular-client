import { FormControl } from '@angular/forms';
import { RegistrationValidationDirective } from './registration-validation.directive';

describe('RegistrationValidationDirective', () => {
  const validator = new RegistrationValidationDirective();
  it('checks real calendar dates and exact date-only format while allowing an omitted birthday', () => {
    validator.appRegistrationValidation = 'birthday';
    ['', '2000-02-29', new Date().toISOString().slice(0, 10)].forEach(value => {
      expect(validator.validate(new FormControl(value))).toBeNull();
    });
    ['2023-02-29', '2024-04-31', '2024-13-01', '2024-01-01T00:00:00.000Z', '2999-01-01'].forEach(value => {
      expect(validator.validate(new FormControl(value))).toEqual({ birthday: true });
    });
  });
  it('accepts 72 ASCII bytes and counts supplementary Unicode characters for minimum length', () => {
    validator.appRegistrationValidation = 'password';
    expect(validator.validate(new FormControl('a'.repeat(72)))).toBeNull();
    expect(validator.validate(new FormControl('😀'.repeat(4)))).toEqual({ minlength: true });
    expect(validator.validate(new FormControl('😀'.repeat(8)))).toBeNull();
  });
});
