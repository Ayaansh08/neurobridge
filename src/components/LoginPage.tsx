import React, { useState } from 'react';
import Aurora from './Aurora';
import { useAuth } from '../context/AuthContext';
import { cognitoAuth } from '../services/authService';
import './LoginPage.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

export const LoginPage: React.FC = () => {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    const result = await cognitoAuth.signIn(email.trim(), password);
    setIsSubmitting(false);

    if (!result.success || !result.data) {
      setErrors((current) => ({
        ...current,
        password: result.error || 'Incorrect email or password',
      }));
      return;
    }

    setAuth(result.data.email, result.data.tokens);
    window.history.pushState({}, '', '/app');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <main className="auth-page auth-page--aurora" aria-labelledby="login-heading">
      <Aurora
        colorStops={['#18121D', '#3D1C34', '#7A3D63']}
        amplitude={0.6}
        blend={0.45}
        speed={0.3}
      />
      <section className="auth-column">
        <header className="auth-header">
          <div className="auth-logo-mark" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
              <path d="M9 21h6" />
            </svg>
          </div>
          <h1 id="login-heading" className="auth-wordmark">
            NeuroBridge
          </h1>
          <p className="auth-tagline">Practice difficult moments before they happen.</p>
        </header>

        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                disabled={isSubmitting}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
                }}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
              />
              {errors.email && (
                <p className="auth-error" id="login-email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-password-wrapper">
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
                  }}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                <p className="auth-error" id="login-password-error">
                  {errors.password}
                </p>
              )}
            </div>

            {showForgotNotice && (
              <div className="auth-info-banner" role="status">
                <span>To reset your demo account password, please register a new test account or contact your team admin.</span>
              </div>
            )}

            <button className="auth-button auth-button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting && <span className="auth-spinner" aria-hidden="true" />}
              <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
            </button>
          </form>

          <div className="auth-bottom-row">
            <span>New to NeuroBridge?</span>{' '}
            <a className="auth-link auth-link--accent" href="/signup">
              Create an account
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

export default LoginPage;
