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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        colorStops={['#1D4ED8', '#38BDF8', '#93C5FD']}
        amplitude={0.85}
        blend={0.42}
        speed={0.55}
      />
      <section className="auth-column">
        <header className="auth-header">
          <h1 id="login-heading" className="auth-wordmark">
            NeuroBridge
          </h1>
          <p className="auth-tagline">Practice difficult moments before they happen.</p>
        </header>

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
              value={email}
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
              <a className="auth-link auth-link--subtle" href="#forgot-password">
                Forgot password?
              </a>
            </div>
            <input
              id="login-password"
              className="auth-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
              }}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
            />
            {errors.password && (
              <p className="auth-error" id="login-password-error">
                {errors.password}
              </p>
            )}
          </div>

          <button className="auth-button auth-button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting && <span className="auth-spinner" aria-hidden="true" />}
            <span>{isSubmitting ? 'Signing in' : 'Sign in'}</span>
          </button>

          <div className="auth-divider" aria-hidden="true">
            <span />
            <span>or</span>
            <span />
          </div>

          <button
            className="auth-button auth-button--outline"
            type="button"
            disabled
            title="Coming soon"
          >
            Continue with Google
          </button>
        </form>

        <p className="auth-bottom-line">
          New to NeuroBridge?{' '}
          <a className="auth-link auth-link--accent" href="/signup">
            Create an account
          </a>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
