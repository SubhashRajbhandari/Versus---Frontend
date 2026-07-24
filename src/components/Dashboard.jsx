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

export default function Dashboard({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState('home'); // 'home' | 'matchmaking'
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Matchmaking State
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [showMoreSports, setShowMoreSports] = useState(false);
  const [selectedSport, setSelectedSport] = useState('3'); // Default Basketball

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
        setLoadingSports(false);
      }
    }

    fetchSports();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'Subhash Rajbhandari';
  const firstName = userDisplayName.split(' ')[0];
  const userInitials = userDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'S';

  const primarySports = sports.slice(0, 8);
  const secondarySports = sports.slice(8);

  return (
    <div className="vs-app-container">
      {/* Left Sidebar */}
      <aside className="vs-sidebar">
        <div className="vs-sidebar-top">
          <div className="vs-brand">
            <h1 className="vs-brand-title">Versus</h1>
            <span className="vs-brand-sub">Pro League</span>
          </div>

          <nav className="vs-nav">
            {/* Home Item */}
            <button
              className={`vs-nav-item ${activeNav === 'home' ? 'active' : ''}`}
              onClick={() => setActiveNav('home')}
            >
              <i className="fa-solid fa-house vs-nav-icon"></i>
              <span>Home</span>
            </button>

            {/* Match Making Item */}
            <button
              className={`vs-nav-item ${activeNav === 'matchmaking' ? 'active' : ''}`}
              onClick={() => setActiveNav('matchmaking')}
            >
              <i className="fa-solid fa-people-group vs-nav-icon"></i>
              <span>Match Making</span>
            </button>

            {/* Messages Item */}
            <button className="vs-nav-item disabled" title="Messages (Coming Soon)">
              <i className="fa-regular fa-envelope vs-nav-icon"></i>
              <span>Messages</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
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
        <header className="vs-top-bar-header">
          {activeNav === 'home' && (
            <div className="header-greeting">
              <h1>{getGreeting()}, {firstName}</h1>
              <p className="header-subtitle">Manage your upcoming matches.</p>
            </div>
          )}

          {activeNav === 'home' && (
            <div className="header-center">
              <button
                className="start-playing-btn"
                onClick={() => setActiveNav('matchmaking')}
              >
                <i className="fa-solid fa-users btn-icon-left"></i>
                Start Playing
              </button>
            </div>
          )}

          <div className="vs-top-bar-right ml-auto">
            <button className="vs-icon-btn" title="Notifications">
              <i className="fa-regular fa-bell"></i>
              <span className="vs-unread-dot"></span>
            </button>

            <div className="profile-menu-wrapper">
              <button
                className="vs-user-badge-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="vs-avatar">{userInitials}</div>
                <span className="vs-user-name">{userDisplayName}</span>
                <i className={`fa-solid fa-chevron-down vs-chevron ${showProfileMenu ? 'open' : ''}`}></i>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown-menu">
                  <div className="profile-dropdown-header">
                    <div className="avatar-circle-lg">{userInitials}</div>
                    <div className="user-info">
                      <p className="user-name">{userDisplayName}</p>
                      <p className="user-email">{user?.email || 'subhash.link123@gmail.com'}</p>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider"></div>
                  <div className="profile-details-list">
                    <div className="detail-item">
                      <i className="fa-solid fa-phone detail-icon"></i>
                      <span>{user?.phone || '9843294195'}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fa-solid fa-location-dot detail-icon"></i>
                      <span>{user?.address || 'Maitidevi, Kathmandu 44600'}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fa-regular fa-calendar detail-icon"></i>
                      <span>DOB: {user?.date_of_birth || '2000-02-23'}</span>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider"></div>
                  <button className="dropdown-logout-btn" onClick={onLogout}>
                    <i className="fa-solid fa-right-from-bracket"></i> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View Switch: HOME vs MATCHMAKING */}
        {activeNav === 'home' ? (
          /* HOME DASHBOARD VIEW */
          <div className="dashboard-content">
            {/* Section 1: Action Required */}
            <section className="dashboard-section">
              <h2 className="section-title">Action Required</h2>
              <div className="card action-card">
                <div className="card-top-bar">
                  <span className="badge badge-danger">
                    <i className="fa-solid fa-user-clock"></i> 1 Player Waiting for Approval
                  </span>
                  <span className="card-timestamp">Tomorrow, 7:00 PM</span>
                </div>

                <h3 className="card-event-title">5v5 Pickup Basketball</h3>
                <p className="card-event-venue">
                  <i className="fa-solid fa-location-dot venue-icon"></i> Downtown Community Center Court
                </p>

                <div className="applicant-box">
                  <div className="applicant-info">
                    <div className="applicant-avatar">
                      <i className="fa-solid fa-user-circle"></i>
                    </div>
                    <div>
                      <h4 className="applicant-name">Alex Mercer</h4>
                      <p className="applicant-rating">Rating: 4.8 • PG</p>
                    </div>
                  </div>

                  <div className="applicant-actions">
                    <button className="action-btn-circle reject-btn" title="Reject">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                    <button className="action-btn-circle accept-btn" title="Accept">
                      <i className="fa-solid fa-check"></i>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Upcoming Activity */}
            <section className="dashboard-section">
              <h2 className="section-title">Upcoming Activity</h2>

              <div className="activity-list">
                <div className="card activity-card">
                  <div className="card-top-bar">
                    <span className="badge badge-success">
                      <i className="fa-solid fa-check"></i> Accepted
                    </span>
                    <span className="card-timestamp">Friday, 6:30 PM</span>
                  </div>
                  <h3 className="card-event-title">Tennis Singles - Advanced</h3>
                  <div className="event-meta">
                    <span><i className="fa-regular fa-user"></i> Host: Sarah J.</span>
                    <span><i className="fa-solid fa-location-dot"></i> Venue: Tennis Club</span>
                  </div>
                  <div className="card-footer-action">
                    <button className="outline-btn">
                      <i className="fa-regular fa-message"></i> Message group
                    </button>
                  </div>
                </div>

                <div className="card activity-card">
                  <div className="card-top-bar">
                    <span className="badge badge-secondary">
                      <i className="fa-regular fa-clock"></i> Pending
                    </span>
                    <span className="card-timestamp">Saturday, 10:00 AM</span>
                  </div>
                  <h3 className="card-event-title">5v5 Basketball Pick-up</h3>
                  <div className="event-meta">
                    <span><i className="fa-regular fa-user"></i> Host: Mike R.</span>
                    <span><i className="fa-solid fa-location-dot"></i> Venue: City Center</span>
                  </div>
                </div>

                <div className="card activity-card">
                  <div className="card-top-bar">
                    <span className="badge badge-danger-soft">
                      <i className="fa-solid fa-xmark"></i> Rejected
                    </span>
                    <span className="card-timestamp">Sunday, 4:00 PM</span>
                  </div>
                  <h3 className="card-event-title">Weekend Soccer Scrimmage</h3>
                  <div className="event-meta">
                    <span><i className="fa-regular fa-user"></i> Host: David K.</span>
                    <span><i className="fa-solid fa-location-dot"></i> Venue: West Park</span>
                  </div>
                </div>

                <div className="card activity-card">
                  <div className="card-top-bar">
                    <span className="badge badge-secondary">
                      <i className="fa-solid fa-user-gear"></i> Host
                    </span>
                    <div className="right-meta">
                      <span className="card-timestamp">Saturday, 8:00 AM</span>
                      <span className="players-count">Total Players: 12 <span className="highlight-pending">Pending: 2</span></span>
                    </div>
                  </div>
                  <h3 className="card-event-title">Saturday Morning Football</h3>
                  <div className="event-meta">
                    <span><i className="fa-regular fa-user"></i> Host: Alex M.</span>
                    <span><i className="fa-solid fa-location-dot"></i> Venue: National Stadium</span>
                  </div>
                  <div className="card-footer-action">
                    <button className="outline-btn">
                      <i className="fa-regular fa-message"></i> Message group
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Game History */}
            <section className="dashboard-section">
              <h2 className="section-title">Game History</h2>

              <div className="card history-card">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sport</th>
                      <th>Host Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2023-10-25</td>
                      <td>Basketball</td>
                      <td>Alex M.</td>
                    </tr>
                    <tr>
                      <td>2023-10-22</td>
                      <td>Tennis</td>
                      <td>Sarah J.</td>
                    </tr>
                    <tr>
                      <td>2023-10-18</td>
                      <td>Soccer</td>
                      <td>David K.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          /* MATCHMAKING STEPPER & SPORT SELECTION GRID VIEW */
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
            {loadingSports ? (
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

                {/* Expandable "More Sports" Section */}
                {secondarySports.length > 0 && (
                  <div className="vs-more-sports">
                    <button
                      className="vs-more-btn"
                      onClick={() => setShowMoreSports(!showMoreSports)}
                    >
                      <span>
                        {showMoreSports
                          ? 'Show Less'
                          : `View More Sports (${secondarySports.length} remaining)`}
                      </span>
                      <i className={`fa-solid ${showMoreSports ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </button>

                    {showMoreSports && (
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
        )}
      </main>
    </div>
  );
}
