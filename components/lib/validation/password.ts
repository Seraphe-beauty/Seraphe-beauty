export interface PasswordValidation {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  specialCharacter: boolean;
}

export function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialCharacter: /[^A-Za-z0-9\s]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  return Object.values(validatePassword(password)).every(Boolean);
}
