import { useState, useEffect } from 'react';
import { apiFetch, setAuthToken } from '../utils/api';

export const DEFAULT_SPORTS = [
  { id: 'c9569279-8525-434d-9f0f-c15b209f445b', name: 'Badminton' },
  { id: 'ffc9b1ca-c13f-4aaf-b755-672fe529adda', name: 'Pickleball' },
  { id: '287dae3a-cf4e-43dd-b842-e232cc378c36', name: 'Basketball' },
  { id: '1e11188f-fb25-461c-947b-309cba3a9a8d', name: 'Football' },
  { id: '70f40861-d81b-46c5-b4dd-a2f28993b796', name: 'Futsal' },
  { id: '2b319d51-1305-4fd6-a233-1f7fd3f1572d', name: 'Volleyball' },
  { id: '19d46582-4167-449d-9f25-0801b74a6463', name: 'Tennis' },
  { id: 'a8df83d3-aef2-41e3-8e85-b53b20642ac5', name: 'Table Tennis' },
  { id: '7b202a92-0361-4d6b-aa81-ed302fda94f8', name: 'Running' }
];

const renderSportIcon = (sportName) => {
  const lower = sportName.toLowerCase();
  if (lower === 'badminton') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sport-tile-icon">
        <circle cx="9" cy="9" r="6" />
        <path d="M13.5 13.5L20 20" />
        <line x1="6" y1="9" x2="12" y2="9" />
        <line x1="9" y1="6" x2="9" y2="12" />
        <circle cx="18" cy="6" r="1.5" fill="currentColor" />
      </svg>
    );
  }
  if (lower === 'pickleball') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sport-tile-icon">
        <rect x="4" y="3" width="11" height="12" rx="4" />
        <path d="M9.5 15v6" strokeWidth="2.5" />
        <circle cx="18" cy="8" r="2.5" />
        <circle cx="18" cy="8" r="0.7" fill="currentColor" />
      </svg>
    );
  }
  if (lower === 'tennis') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sport-tile-icon">
        <ellipse cx="10" cy="10" rx="6" ry="7" transform="rotate(-45 10 10)" />
        <path d="M14.5 14.5L21 21" />
        <line x1="7" y1="7" x2="13" y2="13" />
        <line x1="13" y1="7" x2="7" y2="13" />
      </svg>
    );
  }
  if (lower === 'basketball') {
    return <i className="fa-solid fa-basketball sport-tile-icon"></i>;
  }
  if (lower === 'football') {
    return <i className="fa-solid fa-football sport-tile-icon"></i>;
  }
  if (lower === 'futsal') {
    return <i className="fa-solid fa-futbol sport-tile-icon"></i>;
  }
  if (lower === 'volleyball') {
    return <i className="fa-solid fa-volleyball sport-tile-icon"></i>;
  }
  if (lower.includes('table')) {
    return <i className="fa-solid fa-table-tennis-paddle-ball sport-tile-icon"></i>;
  }
  if (lower === 'running') {
    return <i className="fa-solid fa-person-running sport-tile-icon"></i>;
  }
  return <i className="fa-solid fa-trophy sport-tile-icon"></i>;
};

function Auth({ onLoginSuccess, initialIsLogin = true, onBack }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setIsLogin(initialIsLogin);
  }, [initialIsLogin]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Sports selection state
  const [sportsList] = useState(DEFAULT_SPORTS);
  const [selectedSports, setSelectedSports] = useState([]);

  const [errors, setErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const toggleSport = (sportName) => {
    setSelectedSports((prev) =>
      prev.includes(sportName)
        ? prev.filter((s) => s !== sportName)
        : [...prev, sportName]
    );
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setSelectedSports([]);
    setErrors({});
    setGlobalMessage({ type: '', text: '' });
  };

  useEffect(() => {
    resetForm();
  }, []);

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
        const response = await apiFetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
          setGlobalMessage({ type: 'success', text: 'Authentication successful!' });
          setAuthToken(data.token);
          const loggedUser = data.user || { name: email.split('@')[0], email };
          localStorage.setItem('user', JSON.stringify(loggedUser));
          if (onLoginSuccess) {
            onLoginSuccess(loggedUser);
          }
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
          preferredSports: selectedSports
        };

        const response = await apiFetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          setGlobalMessage({ type: 'success', text: 'Registration successful!' });
          setAuthToken(data.token);
          const registeredUser = data.user || { name: name || email.split('@')[0], email };
          localStorage.setItem('user', JSON.stringify(registeredUser));
          if (onLoginSuccess) {
            onLoginSuccess(registeredUser);
          }
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

  // Render Login Form View
  if (isLogin) {
    return (
      <div className="login-container">
        <div className="login-card">
          {onBack && (
            <button type="button" className="auth-back-link" onClick={onBack}>
              <i className="fa-solid fa-arrow-left"></i> Back to Home
            </button>
          )}
          <h1 className="title">Welcome Back</h1>
          <p className="subtitle">Log in to your Versus account.</p>

          <form noValidate onSubmit={(e) => handleSubmit(e, 'login')}>
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

            <div className="form-group">
              <div className="password-labels">
                <label htmlFor="password">Password</label>
                <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                  Forgot Password?
                </a>
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
              <button
                type="submit"
                className="primary-btn"
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
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Redesigned Split Signup Form View (Matches Screenshot Layout)
  return (
    <div className="auth-split-container">
      {/* Left Dark Hero Sidebar */}
      <div className="auth-hero-sidebar">
        <div className="auth-hero-brand">
          <h2>Versus</h2>
          <p>Your High-Performance Matchmaking Utility.</p>
        </div>

        <div className="auth-hero-badge">
          <i className="fa-solid fa-circle-check"></i>
          <span>Join 10k+ Athletes</span>
        </div>
      </div>

      {/* Right Form Content */}
      <div className="auth-form-content">
        {onBack && (
          <button type="button" className="auth-back-link" onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i> Back to Home
          </button>
        )}
        <div className="auth-form-header">
          <h2>Build Your Profile</h2>
          <p>Step 1 of 2: Basic details & sports interests.</p>
        </div>

        <form noValidate onSubmit={(e) => handleSubmit(e, 'signup')}>
          <div className="form-grid-2col">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="name">Username / Full Name</label>
              <div className="input-wrapper">
                <i className="fa-regular fa-user input-icon-left"></i>
                <input
                  type="text"
                  id="name"
                  placeholder="johndoe88"
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

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <i className="fa-regular fa-envelope input-icon-left"></i>
                <input
                  type="email"
                  id="email"
                  placeholder="john@example.com"
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

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
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

            {/* Mobile Number */}
            <div className="form-group">
              <label htmlFor="phone">Mobile Number</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-phone input-icon-left"></i>
                <input
                  type="tel"
                  id="phone"
                  placeholder="+1 (555) 000-0000"
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

            {/* Single Address Field (Spans full width) */}
            <div className="form-group form-grid-full">
              <label htmlFor="address">Address</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-location-dot input-icon-left"></i>
                <input
                  type="text"
                  id="address"
                  placeholder="e.g. 123 Koteshwor, Kathmandu"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Select Your Sports Section */}
          <div className="sports-select-section">
            <div className="sports-select-header">
              <h3>Select Your Sports</h3>
              <p>Choose at least one to personalize your matchmaking.</p>
            </div>

            <div className="sports-select-grid">
              {sportsList.map((sport) => {
                const isSelected = selectedSports.includes(sport.name);
                return (
                  <div
                    key={sport.id}
                    className={`sport-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSport(sport.name)}
                  >
                    {isSelected && <i className="fa-solid fa-check sport-tile-check"></i>}
                    {renderSportIcon(sport.name)}
                    <span className="sport-tile-name">{sport.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {globalMessage.text && (
            <div className={`form-message ${globalMessage.type}`}>
              {globalMessage.text}
            </div>
          )}

          {/* Submit Action */}
          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="primary-btn"
              disabled={isLoading}
              style={{ width: '100%', padding: '0.9rem' }}
            >
              <span className="btn-text">{isLoading ? 'Creating Profile...' : 'Complete Profile'}</span>
              {isLoading ? (
                <i className="spinner"></i>
              ) : (
                <i className="fa-solid fa-arrow-right btn-icon"></i>
              )}
            </button>
          </div>

          {/* Link back to login */}
          <div className="auth-footer-link">
            <span>Already have an account?</span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                resetForm();
              }}
            >
              Log in to Versus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Auth;
