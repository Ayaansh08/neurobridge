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
  const { user, isAuthenticated, isRestoring: isAuthRestoring } = useAuth();
  const [path, setPath] = useState(window.location.pathname);
  const [isSessionRestoring, setIsSessionRestoring] = useState(false);
  const [restoredSessionData, setRestoredSessionData] = useState<any>(null);
  const [sessionRestoreAttempted, setSessionRestoreAttempted] = useState(false);
  
  // Wait for auth to finish restoring before trying to restore session
  useEffect(() => {
    if (isAuthRestoring) return;
    
    const tryRestoreSession = async () => {
      setIsSessionRestoring(true);
      const email = user?.email || 'guest';
      const activeSessionKey = `nb_active_session_${email}`;
      const savedSessionStr = localStorage.getItem(activeSessionKey);
      
      if (!savedSessionStr) {
        setIsSessionRestoring(false);
        setSessionRestoreAttempted(true);
        return;
      }
      
      try {
        const savedSession = JSON.parse(savedSessionStr);
        if (!savedSession.sessionId || !savedSession.scenarioId) {
          throw new Error('Invalid saved session');
        }
        
        // Fetch session from backend
        const { authConfig } = await import('./config/auth');
        const endpoint = authConfig.apiEndpoint.replace(/\/+$/, '');
        const res = await fetch(`${endpoint}/sessions/${savedSession.sessionId}`);
        
        if (!res.ok) {
          throw new Error('Session not found or expired');
        }
        
        const data = await res.json();
        setRestoredSessionData({
          scenarioId: savedSession.scenarioId,
          sessionRecord: data
        });
        if (window.location.pathname === '/app' || window.location.pathname === '/' || window.location.pathname === '/app/practice') {
          navigate(`/app/practice/${savedSession.scenarioId}`);
        }
      } catch (err) {
        console.warn('Could not restore session:', err);
        localStorage.removeItem(activeSessionKey);
        // We will signal Dashboard to show an error on Scenarios tab if they were on practice
        if (window.location.pathname.startsWith('/app/practice')) {
          window.dispatchEvent(new CustomEvent('nb_session_restore_failed'));
        }
      } finally {
        setIsSessionRestoring(false);
        setSessionRestoreAttempted(true);
      }
    };
    
    tryRestoreSession();
  }, [isAuthRestoring, user?.email]);

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
  
  if (isAuthRestoring || isSessionRestoring || (!sessionRestoreAttempted && path.startsWith('/app'))) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--nb-charcoal-base)', color: 'var(--nb-gray-400)', fontFamily: 'Inter, sans-serif' }}>
        <div className="dashboard-toast" style={{ position: 'static', transform: 'none' }}>
          <span className="toast-dot" />
          <span>Restoring your practice...</span>
        </div>
      </div>
    );
  }

  if (path === '/' && !isAuthenticated) return <HomePage />;

  if (path === '/signup') return <SignupPage />;

  if (path.startsWith('/app') || isAuthenticated) {
    let tab = 'dashboard';
    let scenarioId: string | undefined = undefined;

    if (path.startsWith('/app/practice/')) {
      tab = 'practice';
      scenarioId = path.replace('/app/practice/', '');
    } else if (path === '/app/practice') {
      tab = 'scenarios';
      setTimeout(() => navigate('/app/scenarios?redirect=no_session'), 0);
    } else if (path === '/app/scenarios') {
      tab = 'scenarios';
    } else if (path === '/app/progress') {
      tab = 'progress';
    } else if (path === '/app/settings') {
      tab = 'settings';
    } else if (path === '/app' || path === '/app/') {
      tab = 'dashboard';
    }

    return (
      <Dashboard
        initialTab={tab}
        initialScenarioId={scenarioId}
        onNavigate={navigate}
        restoredSessionData={restoredSessionData}
      />
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

