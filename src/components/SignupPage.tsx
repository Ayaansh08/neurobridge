import { Logo } from './dashboard/Icons';
import React, { useState } from 'react';
import Aurora from './Aurora';
import { cognitoAuth } from '../services/authService';
import './LoginPage.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignupErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  confirmationCode?: string;
  form?: string;
}

export const SignupPage: React.FC = () => {
  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live password validation rules
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  const validateDetails = () => {
    const nextErrors: SignupErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (!hasMinLength || !hasNumber) {
      nextErrors.password = 'Password must meet the required rules';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !validateDetails()) return;

    setIsSubmitting(true);
    const result = await cognitoAuth.signUp(email.trim(), password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ form: result.error || 'Could not create account' });
      return;
    }

    setErrors({});
    setStep('confirm');
  };

  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!confirmationCode.trim()) {
      setErrors({ confirmationCode: 'Confirmation code is required' });
      return;
    }

    setIsSubmitting(true);
    const result = await cognitoAuth.confirmSignUp(email.trim(), confirmationCode.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ confirmationCode: result.error || 'Could not confirm your email' });
      return;
    }

    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <main className="auth-page auth-page--aurora" aria-labelledby="signup-heading">
      <Aurora
        colorStops={['#18121D', '#3D1C34', '#7A3D63']}
        amplitude={0.6}
        blend={0.45}
        speed={0.3}
      />
      <section className="auth-column">
        <header className="auth-header">
          <div className="auth-logo-mark" aria-hidden="true"><Logo size={28} /></div>
          <h1 id="signup-heading" className="auth-wordmark">
            NeuroBridge
          </h1>
          <p className="auth-tagline">
            {step === 'details'
              ? 'Create a private practice space in seconds.'
              : 'Confirm your email to finish setup.'}
          </p>
        </header>

        <div className="auth-card">
          {step === 'details' ? (
            <form className="auth-form" onSubmit={handleSignup} noValidate>
              {errors.form && (
                <div className="auth-error-banner" role="alert">
                  {errors.form}
                </div>
              )}

                            <div className="auth-field">
                <label className="auth-label" htmlFor="signup-name">
                  Display name (optional)
                </label>
                <input
                  id="signup-name"
                  className="auth-input"
                  type="text"
                  placeholder="How should we call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

<div className="auth-field">
                <label className="auth-label" htmlFor="signup-email">
                  Email
                </label>
                <input
                  id="signup-email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errors.email) setErrors((c) => ({ ...c, email: undefined }));
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'signup-email-error' : undefined}
                />
                {errors.email && (
                  <p className="auth-error" id="signup-email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-password">
                  Password
                </label>
                <div className="auth-password-wrapper">
                  <input
                    id="signup-password"
                    className="auth-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={password}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (errors.password) setErrors((c) => ({ ...c, password: undefined }));
                    }}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'signup-password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="auth-error" id="signup-password-error">
                    {errors.password}
                  </p>
                )}

                {/* Live Password Rules Hint */}
                <div className="auth-rules-list">
                  <span className={`auth-rule-item ${hasMinLength ? 'auth-rule-item--met' : ''}`}>
                    {hasMinLength ? '✓' : '·'} 8+ characters
                  </span>
                  <span className={`auth-rule-item ${hasNumber ? 'auth-rule-item--met' : ''}`}>
                    {hasNumber ? '✓' : '·'} At least 1 number
                  </span>
                  <span className={`auth-rule-item ${hasUppercase ? 'auth-rule-item--met' : ''}`}>
                    {hasUppercase ? '✓' : '·'} 1 uppercase
                  </span>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-confirm-password">
                  Confirm password
                </label>
                <input
                  id="signup-confirm-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (errors.confirmPassword) setErrors((c) => ({ ...c, confirmPassword: undefined }));
                  }}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
                />
                {errors.confirmPassword && (
                  <p className="auth-error" id="signup-confirm-error">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button className="auth-button auth-button--primary" type="submit" disabled={isSubmitting}>
                {isSubmitting && <span className="auth-spinner" aria-hidden="true" />}
                <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleConfirm} noValidate>
              <div className="auth-info-banner">
                <span>Enter the 6-digit confirmation code sent to <strong>{email.trim()}</strong>.</span>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-code">
                  Confirmation code
                </label>
                <input
                  id="signup-code"
                  className="auth-input auth-input--code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  maxLength={6}
                  value={confirmationCode}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setConfirmationCode(event.target.value);
                    if (errors.confirmationCode) setErrors((c) => ({ ...c, confirmationCode: undefined }));
                  }}
                  aria-invalid={!!errors.confirmationCode}
                  aria-describedby={errors.confirmationCode ? 'signup-code-error' : undefined}
                />
                {errors.confirmationCode && (
                  <p className="auth-error" id="signup-code-error">
                    {errors.confirmationCode}
                  </p>
                )}
              </div>

              <button className="auth-button auth-button--primary" type="submit" disabled={isSubmitting}>
                {isSubmitting && <span className="auth-spinner" aria-hidden="true" />}
                <span>{isSubmitting ? 'Confirming code...' : 'Confirm email & sign in'}</span>
              </button>
            </form>
          )}

          <div className="auth-bottom-row">
            <span>Already have an account?</span>{' '}
            <a className="auth-link auth-link--accent" href="/login">
              Sign in
            </a>
          </div>
        </div>

        <footer className="auth-disclaimer">
          Practice tool only · Not therapy or medical advice
        </footer>
      </section>
    </main>
  );
};

export default SignupPage;
