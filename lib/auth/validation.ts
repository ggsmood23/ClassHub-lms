export type PasswordStrength = "Weak" | "Medium" | "Strong";

export type PasswordValidation = {
  isValid: boolean;
  strength: PasswordStrength;
  checks: Array<{
    label: string;
    passed: boolean;
  }>;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  return (
    normalizedEmail.length <= 254 &&
    emailPattern.test(normalizedEmail) &&
    !normalizedEmail.endsWith(".")
  );
}

export function validatePassword(password: string): PasswordValidation {
  const checks = [
    {
      label: "8 to 128 characters",
      passed: password.length >= 8 && password.length <= 128,
    },
    { label: "One uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "One lowercase letter", passed: /[a-z]/.test(password) },
    { label: "One number", passed: /\d/.test(password) },
    {
      label: "One special character",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];
  const passedCount = checks.filter((check) => check.passed).length;

  return {
    checks,
    isValid: passedCount === checks.length,
    strength:
      passedCount >= 5 ? "Strong" : passedCount >= 3 ? "Medium" : "Weak",
  };
}
