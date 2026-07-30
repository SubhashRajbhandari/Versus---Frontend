import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import './index.css'; // Vite uses index.css as global
import { clearAuthSession, getAuthToken } from './utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  if (isAuthenticated) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <Auth onLoginSuccess={handleLoginSuccess} />;
}

export default App;
