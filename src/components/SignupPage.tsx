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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateDetails = () => {
    const nextErrors: SignupErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
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
        colorStops={['#1D4ED8', '#38BDF8', '#93C5FD']}
        amplitude={0.85}
        blend={0.42}
        speed={0.55}
      />
      <section className="auth-column">
        <header className="auth-header">
          <h1 id="signup-heading" className="auth-wordmark">
            NeuroBridge
          </h1>
          <p className="auth-tagline">
            {step === 'details' ? 'Create an account to start practicing.' : 'Confirm your email to finish setup.'}
          </p>
        </header>

        {step === 'details' ? (
          <form className="auth-form" onSubmit={handleSignup} noValidate>
            {errors.form && <p className="auth-error">{errors.form}</p>}

            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-email">
                Email
              </label>
              <input
                id="signup-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="auth-error">{errors.email}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                className="auth-input"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className="auth-error">{errors.password}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-confirm-password">
                Confirm password
              </label>
              <input
                id="signup-confirm-password"
                className="auth-input"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
            </div>

            <button className="auth-button auth-button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting && <span className="auth-spinner" aria-hidden="true" />}
              <span>{isSubmitting ? 'Creating account' : 'Create account'}</span>
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleConfirm} noValidate>
            <p className="auth-note">Enter the confirmation code sent to {email.trim()}.</p>

            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-code">
                Confirmation code
              </label>
              <input
                id="signup-code"
                className="auth-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={confirmationCode}
                onChange={(event) => setConfirmationCode(event.target.value)}
                aria-invalid={!!errors.confirmationCode}
              />
              {errors.confirmationCode && <p className="auth-error">{errors.confirmationCode}</p>}
            </div>

            <button className="auth-button auth-button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting && <span className="auth-spinner" aria-hidden="true" />}
              <span>{isSubmitting ? 'Confirming email' : 'Confirm email'}</span>
            </button>
          </form>
        )}

        <p className="auth-bottom-line">
          Already have an account?{' '}
          <a className="auth-link auth-link--accent" href="/login">
            Sign in
          </a>
        </p>
      </section>
    </main>
  );
};

export default SignupPage;
