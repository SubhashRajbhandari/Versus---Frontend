import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import './index.css'; // Vite uses index.css as global
import { clearAuthSession, getAuthToken } from './utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState(null); // null = LandingPage, 'login', 'signup'

  useEffect(() => {
    const token = getAuthToken();
    const savedUser = localStorage.getItem('user');
    if (token) {
      setIsAuthenticated(true);
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch {
          setCurrentUser(null);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthMode(null);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAuthMode(null);
  };

  if (isAuthenticated) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (authMode) {
    return (
      <Auth
        initialIsLogin={authMode === 'login'}
        onBack={() => setAuthMode(null)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <LandingPage
      onOpenLogin={() => setAuthMode('login')}
      onOpenSignup={() => setAuthMode('signup')}
    />
  );
}

export default App;
