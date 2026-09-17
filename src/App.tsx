import { useEffect, useState } from 'react';
import Aurora from './components/Aurora';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function AppRoutes() {
  const { isAuthenticated, logout, user } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => setPath(window.location.pathname);
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');

      if (!link || link.target || link.origin !== window.location.origin) return;

      event.preventDefault();
      navigate(link.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    document.addEventListener('click', handleLinkClick);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  if (path === '/' && !isAuthenticated) return <HomePage />;

  if (path === '/signup') return <SignupPage />;

  if (path === '/app' && isAuthenticated) {
    return (
      <main className="auth-page auth-page--aurora">
        <Aurora
          colorStops={['#1D4ED8', '#38BDF8', '#93C5FD']}
          amplitude={0.85}
          blend={0.42}
          speed={0.55}
        />
        <section className="auth-column">
          <header className="auth-header">
            <h1 className="auth-wordmark">NeuroBridge</h1>
            <p className="auth-tagline">Signed in as {user?.email}.</p>
          </header>
          <button className="auth-button auth-button--outline" type="button" onClick={logout}>
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return <LoginPage />;
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
