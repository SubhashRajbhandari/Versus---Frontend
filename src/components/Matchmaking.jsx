import { useState, useEffect } from 'react';
import '../index.css';

// Default list of sports matching the reference UI + additional sports for the "More" section
const DEFAULT_SPORTS = [
  { id: '1', name: 'Badminton', icon: 'fa-table-tennis-paddle-ball', category: 'Racket Sport' },
  { id: '2', name: 'Pickleball', icon: 'fa-table-tennis-paddle-ball', category: 'Racket Sport' },
  { id: '3', name: 'Basketball', icon: 'fa-basketball', category: 'Court Sport' },
  { id: '4', name: 'Football', icon: 'fa-football', category: 'Team Sport' },
  { id: '5', name: 'Futsal', icon: 'fa-futbol', category: 'Team Sport' },
  { id: '6', name: 'Volleyball', icon: 'fa-volleyball', category: 'Team Sport' },
  { id: '7', name: 'Tennis', icon: 'fa-table-tennis-paddle-ball', category: 'Racket Sport' },
  { id: '8', name: 'Table Tennis', icon: 'fa-gamepad', category: 'Indoor Sport' },
  { id: '9', name: 'Cricket', icon: 'fa-person-running', category: 'Team Sport' },
  { id: '10', name: 'Swimming', icon: 'fa-person-swimming', category: 'Individual' },
  { id: '11', name: 'Squash', icon: 'fa-square-poll-vertical', category: 'Racket Sport' },
  { id: '12', name: 'Golf', icon: 'fa-golf-ball-tee', category: 'Individual' },
  { id: '13', name: 'Boxing', icon: 'fa-hand-back-fist', category: 'Combat Sport' },
  { id: '14', name: 'Cycling', icon: 'fa-bicycle', category: 'Outdoor' }
];

// Helper to map sport names from backend API to FontAwesome icons
const getSportIcon = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('badminton')) return 'fa-table-tennis-paddle-ball';
  if (normalized.includes('pickleball')) return 'fa-table-tennis-paddle-ball';
  if (normalized.includes('basketball')) return 'fa-basketball';
  if (normalized.includes('futsal')) return 'fa-futbol';
  if (normalized.includes('football') || normalized.includes('soccer')) return 'fa-football';
  if (normalized.includes('volleyball')) return 'fa-volleyball';
  if (normalized.includes('tennis') && !normalized.includes('table')) return 'fa-table-tennis-paddle-ball';
  if (normalized.includes('table tennis') || normalized.includes('ping pong')) return 'fa-gamepad';
  if (normalized.includes('cricket')) return 'fa-person-running';
  if (normalized.includes('swimming')) return 'fa-person-swimming';
  if (normalized.includes('golf')) return 'fa-golf-ball-tee';
  if (normalized.includes('boxing')) return 'fa-hand-back-fist';
  if (normalized.includes('cycling')) return 'fa-bicycle';
  return 'fa-trophy';
};

export default function Matchmaking({ user, onLogout }) {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [selectedSport, setSelectedSport] = useState('3'); // Default to Basketball as in mockup

  useEffect(() => {
    async function fetchSports() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/sports`);
        if (response.ok) {
          const data = await response.json();
          if (data.sports && data.sports.length > 0) {
            const formatted = data.sports.map((s) => ({
              id: s.id,
              name: s.name,
              icon: getSportIcon(s.name)
            }));
            // If less than 8 returned from backend API, supplement with defaults
            if (formatted.length < 8) {
              const names = new Set(formatted.map((item) => item.name.toLowerCase()));
              const extraDefaults = DEFAULT_SPORTS.filter(
                (item) => !names.has(item.name.toLowerCase())
              );
              setSports([...formatted, ...extraDefaults]);
            } else {
              setSports(formatted);
            }
          } else {
            setSports(DEFAULT_SPORTS);
          }
        } else {
          setSports(DEFAULT_SPORTS);
        }
      } catch (err) {
        console.warn('Could not fetch sports from API, using defaults:', err);
        setSports(DEFAULT_SPORTS);
      } finally {
        setLoading(false);
      }
    }

    fetchSports();
  }, []);

  // Display 8 sports in the primary grid, remaining in the "More" section
  const primarySports = sports.slice(0, 8);
  const secondarySports = sports.slice(8);

  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'John Doe';
  const userInitials = userDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'JD';

  return (
    <div className="vs-app-container">
      {/* Left Dark Sidebar Navigation */}
      <aside className="vs-sidebar">
        <div className="vs-sidebar-top">
          <div className="vs-brand">
            <h1 className="vs-brand-title">Versus</h1>
            <span className="vs-brand-sub">Pro League</span>
          </div>

          <nav className="vs-nav">
            {/* Non-functional / Inactive Home */}
            <button className="vs-nav-item disabled" title="Home (Coming Soon)">
              <i className="fa-solid fa-house vs-nav-icon"></i>
              <span>Home</span>
            </button>

            {/* Activated Matchmaking Menu */}
            <button className="vs-nav-item active" title="Match Making (Active)">
              <i className="fa-solid fa-people-group vs-nav-icon"></i>
              <span>Match Making</span>
            </button>

            {/* Non-functional / Inactive Messages */}
            <button className="vs-nav-item disabled" title="Messages (Coming Soon)">
              <i className="fa-regular fa-envelope vs-nav-icon"></i>
              <span>Messages</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Support & Logout */}
        <div className="vs-sidebar-bottom">
          <button className="vs-nav-item disabled" title="Support (Coming Soon)">
            <i className="fa-regular fa-circle-question vs-nav-icon"></i>
            <span>Support</span>
          </button>
          
          <button className="vs-logout-btn" onClick={onLogout} title="Log Out">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="vs-main">
        {/* Top Header Bar */}
        <header className="vs-top-bar">
          <div className="vs-top-bar-right">
            <button className="vs-icon-btn" title="Notifications">
              <i className="fa-regular fa-bell"></i>
              <span className="vs-unread-dot"></span>
            </button>

            <div className="vs-user-badge">
              <div className="vs-avatar">{userInitials}</div>
              <span className="vs-user-name">{userDisplayName}</span>
            </div>
          </div>
        </header>

        {/* Matchmaking Wizard Container */}
        <div className="vs-wizard-container">
          {/* Stepper Bar */}
          <div className="vs-stepper">
            <div className="vs-stepper-track">
              <div className="vs-stepper-progress"></div>
            </div>

            <div className="vs-step active">
              <div className="vs-step-circle">1</div>
              <span className="vs-step-label">Sport</span>
            </div>

            <div className="vs-step">
              <div className="vs-step-circle">2</div>
              <span className="vs-step-label">Type</span>
            </div>

            <div className="vs-step">
              <div className="vs-step-circle">3</div>
              <span className="vs-step-label">Action</span>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="vs-heading-group">
            <h2 className="vs-page-title">Select your Sport</h2>
            <p className="vs-page-subtitle">
              Choose the sport you want to play to find the best match.
            </p>
          </div>

          {/* Sports Grid */}
          {loading ? (
            <div className="vs-loading">
              <i className="spinner vs-spinner"></i>
              <p>Loading sports...</p>
            </div>
          ) : (
            <>
              {/* Primary 8 Sports Grid */}
              <div className="vs-sports-grid">
                {primarySports.map((sport) => {
                  const isSelected = selectedSport === sport.id;
                  return (
                    <div
                      key={sport.id}
                      className={`vs-sport-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSport(sport.id)}
                    >
                      <div className="vs-card-icon-circle">
                        <i className={`fa-solid ${sport.icon}`}></i>
                      </div>
                      <span className="vs-card-title">{sport.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Expandable "More Sports" Section for Remaining Sports */}
              {secondarySports.length > 0 && (
                <div className="vs-more-sports">
                  <button
                    className="vs-more-btn"
                    onClick={() => setShowMore(!showMore)}
                  >
                    <span>
                      {showMore
                        ? 'Show Less'
                        : `View More Sports (${secondarySports.length} remaining)`}
                    </span>
                    <i className={`fa-solid ${showMore ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </button>

                  {showMore && (
                    <div className="vs-sports-grid vs-more-grid">
                      {secondarySports.map((sport) => {
                        const isSelected = selectedSport === sport.id;
                        return (
                          <div
                            key={sport.id}
                            className={`vs-sport-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedSport(sport.id)}
                          >
                            <div className="vs-card-icon-circle">
                              <i className={`fa-solid ${sport.icon}`}></i>
                            </div>
                            <span className="vs-card-title">{sport.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Continue Action Button */}
              <div className="vs-action-footer">
                <button
                  className="vs-continue-btn"
                  disabled={!selectedSport}
                  onClick={() => alert(`Selected Sport ID: ${selectedSport}`)}
                >
                  <span>Continue</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
