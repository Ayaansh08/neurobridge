import { useEffect, useState } from 'react';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Dashboard } from './components/dashboard';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
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

  if (path === '/app' || isAuthenticated) {
    return <Dashboard />;
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
