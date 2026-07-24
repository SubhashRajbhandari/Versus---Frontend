import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import './index.css'; // Vite uses index.css as global

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Additional Signup fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [errors, setErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    resetForm();
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setDateOfBirth('');
    setErrors({});
    setGlobalMessage({ type: '', text: '' });
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    if (!isLogin) {
      if (!name.trim()) {
        newErrors.name = 'Full name is required';
        isValid = false;
      }
      if (!phone.trim()) {
        newErrors.phone = 'Phone number is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    setGlobalMessage({ type: '', text: '' });

    if (!validate()) return;

    setIsLoading(true);

    try {
      if (action === 'login') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
          setGlobalMessage({ type: 'success', text: 'Authentication successful!' });
          localStorage.setItem('token', data.token);
          const loggedUser = data.user || { name: email.split('@')[0], email };
          localStorage.setItem('user', JSON.stringify(loggedUser));
          setCurrentUser(loggedUser);
          setIsAuthenticated(true);
        } else {
          setGlobalMessage({ type: 'error', text: data.error || 'Login failed. Please try again.' });
        }
      } else if (action === 'signup') {
        const payload = {
          name,
          email,
          password,
          phone,
          address: address || null,
          date_of_birth: dateOfBirth || null,
          preferredSports: [] // Empty by default for now
        };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          setGlobalMessage({ type: 'success', text: 'Registration successful!' });
          localStorage.setItem('token', data.token);
          const registeredUser = data.user || { name: name || email.split('@')[0], email };
          localStorage.setItem('user', JSON.stringify(registeredUser));
          setCurrentUser(registeredUser);
          setIsAuthenticated(true);
        } else {
          setGlobalMessage({ type: 'error', text: data.error || 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      setGlobalMessage({ type: 'error', text: 'Network error. Please check your connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="subtitle">
          {isLogin ? 'YOYO Log in to your Versus accountss.' : 'Sign up to get started with Versus.'}
        </p>

        <form noValidate>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <i className="fa-regular fa-user input-icon-left"></i>
                <input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors({ ...errors, name: '' });
                  }}
                  className={errors.name ? 'error' : ''}
                />
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope input-icon-left"></i>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: '' });
                }}
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-phone input-icon-left"></i>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="9812345678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors({ ...errors, phone: '' });
                    }}
                    className={errors.phone ? 'error' : ''}
                  />
                </div>
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-calendar input-icon-left"></i>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-location-dot input-icon-left"></i>
                  <input
                    type="text"
                    id="address"
                    placeholder="12A, Ward 5, Kathmandu"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <div className="password-labels">
              <label htmlFor="password">Password</label>
              {isLogin && (
                <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock input-icon-left"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: '' });
                }}
                className={errors.password ? 'error' : ''}
              />
              <i
                className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'} input-icon-right`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {globalMessage.text && (
            <div className={`form-message ${globalMessage.type}`}>
              {globalMessage.text}
            </div>
          )}

          <div className="button-group">
            {isLogin ? (
              <>
                <button
                  type="submit"
                  className="primary-btn"
                  onClick={(e) => handleSubmit(e, 'login')}
                  disabled={isLoading}
                >
                  <span className="btn-text">{isLoading ? 'Logging in...' : 'Login'}</span>
                  {isLoading ? (
                    <i className="spinner"></i>
                  ) : (
                    <i className="fa-solid fa-arrow-right btn-icon"></i>
                  )}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setIsLogin(false);
                    resetForm();
                  }}
                  disabled={isLoading}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  className="primary-btn"
                  onClick={(e) => handleSubmit(e, 'signup')}
                  disabled={isLoading}
                >
                  <span className="btn-text">{isLoading ? 'Signing up...' : 'Sign Up'}</span>
                  {isLoading ? (
                    <i className="spinner"></i>
                  ) : (
                    <i className="fa-solid fa-user-plus btn-icon"></i>
                  )}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setIsLogin(true);
                    resetForm();
                  }}
                  disabled={isLoading}
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
