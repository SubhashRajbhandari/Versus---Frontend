import { useState, useEffect } from 'react';
import HostGame from './HostGame';
import '../index.css';

// Default list of sports matching the reference UI + additional sports for the "More" section
const DEFAULT_SPORTS = [
  { id: '1e11188f-fb25-461c-947b-309cba3a9a8d', name: 'Football', icon: 'fa-football', category: 'Team Sport' },
  { id: '70f40861-d81b-46c5-b4dd-a2f28993b796', name: 'Futsal', icon: 'fa-futbol', category: 'Team Sport' },
  { id: 'ac7433be-1583-4452-9381-8b236d50d342', name: 'Cricket', icon: 'fa-person-running', category: 'Team Sport' },
  { id: '2b319d51-1305-4fd6-a233-1f7fd3f1572d', name: 'Volleyball', icon: 'fa-volleyball', category: 'Team Sport' },
  { id: '287dae3a-cf4e-43dd-b842-e232cc378c36', name: 'Basketball', icon: 'fa-basketball', category: 'Court Sport' },
  { id: 'c9569279-8525-434d-9f0f-c15b209f445b', name: 'Badminton', icon: 'fa-table-tennis-paddle-ball', category: 'Racket Sport' },
  { id: 'a8df83d3-aef2-41e3-8e85-b53b20642ac5', name: 'Table Tennis', icon: 'fa-gamepad', category: 'Indoor Sport' },
  { id: '19d46582-4167-449d-9f25-0801b74a6463', name: 'Tennis', icon: 'fa-table-tennis-paddle-ball', category: 'Racket Sport' },
  { id: 'ffc9b1ca-c13f-4aaf-b755-672fe529adda', name: 'Pickleball', icon: 'fa-table-tennis-paddle-ball', category: 'Racket Sport' },
  { id: '1bf69367-2277-4c13-90f3-404ec48327bb', name: 'Padel', icon: 'fa-table-tennis-paddle-ball', category: 'Racket Sport' },
  { id: '8780b1f5-b7d0-48af-8566-0fd7e919ff2d', name: 'Mountain Biking', icon: 'fa-bicycle', category: 'Outdoor' },
  { id: 'c58af691-a1ec-4fe9-8858-8d2a6057dd59', name: 'Cycling', icon: 'fa-bicycle', category: 'Outdoor' },
  { id: '061f4a17-d150-46aa-af00-d76270ec1e3e', name: 'Sport Climbing', icon: 'fa-mountain', category: 'Outdoor' },
  { id: 'bbeb7919-d697-4362-9808-a209f2229a9d', name: 'Bouldering', icon: 'fa-mountain', category: 'Outdoor' },
  { id: '2e08838c-a072-4f89-a6c6-39661c8b6f3f', name: 'Skateboarding', icon: 'fa-person-skating', category: 'Urban Sport' },
  { id: '4ba3e146-7d44-4ab5-a571-807148692777', name: 'Inline Freestyle Skating', icon: 'fa-person-skating', category: 'Urban Sport' },
  { id: '4e9d926d-37bc-48a0-86fb-3455bb6934cb', name: 'White Water Rafting', icon: 'fa-water', category: 'Water Sport' },
  { id: '45dffec8-4e14-454b-860d-c078e984a420', name: 'Kayaking', icon: 'fa-water', category: 'Water Sport' },
  { id: '7b202a92-0361-4d6b-aa81-ed302fda94f8', name: 'Trail Running', icon: 'fa-person-running', category: 'Outdoor' },
  { id: '382aff40-8012-4c30-803b-dc0f03879778', name: 'Hiking', icon: 'fa-person-hiking', category: 'Outdoor' }
];

const SPORTS_JSON_MAP = {
  'football': '1e11188f-fb25-461c-947b-309cba3a9a8d',
  'futsal': '70f40861-d81b-46c5-b4dd-a2f28993b796',
  'cricket': 'ac7433be-1583-4452-9381-8b236d50d342',
  'volleyball': '2b319d51-1305-4fd6-a233-1f7fd3f1572d',
  'basketball': '287dae3a-cf4e-43dd-b842-e232cc378c36',
  'badminton': 'c9569279-8525-434d-9f0f-c15b209f445b',
  'table tennis': 'a8df83d3-aef2-41e3-8e85-b53b20642ac5',
  'tennis': '19d46582-4167-449d-9f25-0801b74a6463',
  'pickleball': 'ffc9b1ca-c13f-4aaf-b755-672fe529adda',
  'padel': '1bf69367-2277-4c13-90f3-404ec48327bb',
  'mountain biking': '8780b1f5-b7d0-48af-8566-0fd7e919ff2d',
  'cycling': 'c58af691-a1ec-4fe9-8858-8d2a6057dd59',
  'sport climbing': '061f4a17-d150-46aa-af00-d76270ec1e3e',
  'bouldering': 'bbeb7919-d697-4362-9808-a209f2229a9d',
  'skateboarding': '2e08838c-a072-4f89-a6c6-39661c8b6f3f',
  'inline freestyle skating': '4ba3e146-7d44-4ab5-a571-807148692777',
  'white water rafting': '4e9d926d-37bc-48a0-86fb-3455bb6934cb',
  'kayaking': '45dffec8-4e14-454b-860d-c078e984a420',
  'trail running': '7b202a92-0361-4d6b-aa81-ed302fda94f8',
  'hiking': '382aff40-8012-4c30-803b-dc0f03879778'
};

// Helper to map sport names from backend API to FontAwesome icons
const getSportIcon = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('badminton')) return 'fa-table-tennis-paddle-ball';
  if (normalized.includes('pickleball')) return 'fa-table-tennis-paddle-ball';
  if (normalized.includes('padel')) return 'fa-table-tennis-paddle-ball';
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
  if (normalized.includes('cycling') || normalized.includes('biking')) return 'fa-bicycle';
  if (normalized.includes('climbing') || normalized.includes('bouldering')) return 'fa-mountain';
  if (normalized.includes('skating') || normalized.includes('skateboarding')) return 'fa-person-skating';
  if (normalized.includes('rafting') || normalized.includes('kayaking')) return 'fa-water';
  if (normalized.includes('running')) return 'fa-person-running';
  if (normalized.includes('hiking')) return 'fa-person-hiking';
  return 'fa-trophy';
};

export default function Dashboard({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState('home'); // 'home' | 'matchmaking' | 'host_game'
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Matchmaking Stepper State (3 Steps: 1. Sport, 2. Type, 3. Action)
  const [wizardStep, setWizardStep] = useState(1);

  // Locally recorded inputs payload state
  const [matchmakingData, setMatchmakingData] = useState(() => {
    const saved = localStorage.getItem('vs_matchmaking_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sportId || parsed.gameId) return parsed;
      } catch {
        // Fallback
      }
    }
    return {
      gameId: '287dae3a-cf4e-43dd-b842-e232cc378c36', // Default Basketball ID
      sportId: '287dae3a-cf4e-43dd-b842-e232cc378c36',
      sportName: 'Basketball',
      gameType: null, // 'host' | 'join'
      userPreference: null // 'host_a_game' | 'find_a_match'
    };
  });

  // Sports list state
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [showMoreSports, setShowMoreSports] = useState(false);

  // Persist matchmaking draft locally whenever it changes
  useEffect(() => {
    localStorage.setItem('vs_matchmaking_draft', JSON.stringify(matchmakingData));
    if (matchmakingData.gameId || matchmakingData.sportId) {
      const idToStore = matchmakingData.gameId || matchmakingData.sportId;
      localStorage.setItem('gameId', idToStore);
      localStorage.setItem('sportId', idToStore);
    }
    if (matchmakingData.userPreference) {
      localStorage.setItem('userPreference', matchmakingData.userPreference);
    } else if (matchmakingData.gameType) {
      localStorage.setItem('userPreference', matchmakingData.gameType === 'host' ? 'host_a_game' : 'find_a_match');
    }
  }, [matchmakingData]);

  useEffect(() => {
    async function fetchSports() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/sports`);
        if (response.ok) {
          const data = await response.json();
          if (data.sports && data.sports.length > 0) {
            const formatted = data.sports.map((s) => ({
              id: s.id || SPORTS_JSON_MAP[s.name.toLowerCase()],
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

  // Handlers for selection
  const handleSportSelect = (sport) => {
    setMatchmakingData((prev) => ({
      ...prev,
      gameId: sport.id,
      sportId: sport.id,
      sportName: sport.name
    }));
  };

  const handleStep1Continue = () => {
    if (matchmakingData.sportId || matchmakingData.gameId) {
      setWizardStep(2);
    }
  };

  const handleGameTypeSelect = (type) => {
    const userPref = type === 'host' ? 'host_a_game' : 'find_a_match';
    setMatchmakingData((prev) => ({
      ...prev,
      gameType: type,
      userPreference: userPref
    }));
    if (type === 'host') {
      setActiveNav('host_game');
    }
  };

  const handleStep2Continue = () => {
    if (matchmakingData.gameType === 'host') {
      setActiveNav('host_game');
    } else if (matchmakingData.gameType) {
      setWizardStep(3);
    }
  };

  if (activeNav === 'host_game') {
    const currentSport = sports.find((s) => s.id === matchmakingData.sportId) || {
      id: matchmakingData.sportId || '287dae3a-cf4e-43dd-b842-e232cc378c36',
      name: matchmakingData.sportName || 'Basketball'
    };
    return (
      <HostGame
        user={user}
        selectedSport={currentSport}
        onCancel={() => {
          setActiveNav('matchmaking');
          setWizardStep(1);
        }}
        onSuccess={() => setActiveNav('home')}
        onLogout={onLogout}
      />
    );
  }

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

            {/* Match Making Item - Redirects to Select Sport Section (Step 1) */}
            <button
              className={`vs-nav-item ${activeNav === 'matchmaking' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('matchmaking');
                setWizardStep(1);
              }}
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
                onClick={() => {
                  setActiveNav('matchmaking');
                  setWizardStep(1);
                }}
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
          /* MATCHMAKING 3-STEP WIZARD VIEW */
          <div className="vs-wizard-container">
            {/* 3-Step Completion Stepper Bar */}
            <div className="vs-stepper">
              <div className="vs-stepper-track">
                <div
                  className="vs-stepper-progress"
                  style={{
                    width: wizardStep === 1 ? '25%' : wizardStep === 2 ? '50%' : '100%'
                  }}
                ></div>
              </div>

              {/* Step 1: Sport */}
              <div className={`vs-step ${wizardStep === 1 ? 'active' : wizardStep > 1 ? 'completed' : ''}`}>
                <div className="vs-step-circle">
                  {wizardStep > 1 ? <i className="fa-solid fa-check"></i> : '1'}
                </div>
                <span className="vs-step-label">Sport</span>
              </div>

              {/* Step 2: Type */}
              <div className={`vs-step ${wizardStep === 2 ? 'active' : wizardStep > 2 ? 'completed' : ''}`}>
                <div className="vs-step-circle">
                  {wizardStep > 2 ? <i className="fa-solid fa-check"></i> : '2'}
                </div>
                <span className="vs-step-label">Type</span>
              </div>

              {/* Step 3: Action */}
              <div className={`vs-step ${wizardStep === 3 ? 'active' : ''}`}>
                <div className="vs-step-circle">3</div>
                <span className="vs-step-label">Action</span>
              </div>
            </div>

            {/* STEP 1: SPORT SELECTION */}
            {wizardStep === 1 && (
              <>
                <div className="vs-heading-group">
                  <h2 className="vs-page-title">Select your Sport</h2>
                  <p className="vs-page-subtitle">
                    Choose the sport you want to play to find the best match.
                  </p>
                </div>

                {loadingSports ? (
                  <div className="vs-loading">
                    <i className="spinner vs-spinner"></i>
                    <p>Loading sports...</p>
                  </div>
                ) : (
                  <>
                    <div className="vs-sports-grid">
                      {primarySports.map((sport) => {
                        const isSelected = matchmakingData.sportId === sport.id;
                        return (
                          <div
                            key={sport.id}
                            className={`vs-sport-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSportSelect(sport)}
                          >
                            <div className="vs-card-icon-circle">
                              <i className={`fa-solid ${sport.icon}`}></i>
                            </div>
                            <span className="vs-card-title">{sport.name}</span>
                          </div>
                        );
                      })}
                    </div>

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
                              const isSelected = matchmakingData.sportId === sport.id;
                              return (
                                <div
                                  key={sport.id}
                                  className={`vs-sport-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSportSelect(sport)}
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

                    <div className="vs-action-footer">
                      <button
                        className="vs-continue-btn"
                        disabled={!matchmakingData.sportId}
                        onClick={handleStep1Continue}
                      >
                        <span>Continue</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* STEP 2: TYPE (HOW DO YOU WANT TO PLAY? - HOST VS JOIN) */}
            {wizardStep === 2 && (
              <>
                <div className="vs-heading-group">
                  <h2 className="vs-page-title">Find Your Match</h2>
                  <p className="vs-page-subtitle">
                    Configure your game settings to hit the field.
                  </p>
                </div>

                <div className="vs-section-subhead">
                  <h3>How do you want to play?</h3>
                </div>

                <div className="vs-type-grid">
                  {/* Host a Game Option */}
                  <div
                    className={`vs-type-card ${matchmakingData.gameType === 'host' ? 'selected' : ''}`}
                    onClick={() => handleGameTypeSelect('host')}
                  >
                    <div className="vs-type-icon-circle">
                      <i className="fa-solid fa-bullhorn"></i>
                    </div>
                    <h3 className="vs-type-card-title">Host a Game</h3>
                    <p className="vs-type-card-desc">
                      Create a new lobby, set the rules, and invite players or wait for challengers to join your field.
                    </p>
                    <button
                      type="button"
                      className={`vs-type-btn ${matchmakingData.gameType === 'host' ? 'active-type' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGameTypeSelect('host');
                      }}
                    >
                      Select Host
                    </button>
                  </div>

                  {/* Join Existing Game Option */}
                  <div
                    className={`vs-type-card ${matchmakingData.gameType === 'join' ? 'selected' : ''}`}
                    onClick={() => handleGameTypeSelect('join')}
                  >
                    <div className="vs-type-icon-circle">
                      <i className="fa-solid fa-users"></i>
                    </div>
                    <h3 className="vs-type-card-title">Join Existing Game</h3>
                    <p className="vs-type-card-desc">
                      Browse open lobbies and drop into an active session. Perfect for jumping straight into the action.
                    </p>
                    <button
                      type="button"
                      className={`vs-type-btn ${matchmakingData.gameType === 'join' ? 'active-type' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGameTypeSelect('join');
                      }}
                    >
                      Select Join
                    </button>
                  </div>
                </div>

                <div className="vs-action-footer vs-between">
                  <button className="vs-back-btn" onClick={() => setWizardStep(1)}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Back</span>
                  </button>

                  <button
                    className="vs-continue-btn"
                    disabled={!matchmakingData.gameType}
                    onClick={handleStep2Continue}
                  >
                    <span>Continue</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: ACTION / SUMMARY */}
            {wizardStep === 3 && (
              <>
                <div className="vs-heading-group">
                  <h2 className="vs-page-title">Match Action Details</h2>
                  <p className="vs-page-subtitle">
                    Review your game parameters before submitting to the network.
                  </p>
                </div>

                <div className="card vs-summary-card">
                  <h3 className="vs-summary-title">Recorded Payload Summary</h3>
                  <div className="vs-summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Selected Sport:</span>
                      <strong className="summary-value">{matchmakingData.sportName}</strong>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Game Mode / Type:</span>
                      <strong className="summary-value">
                        {matchmakingData.gameType === 'host' ? 'Host a Game' : 'Join Existing Game'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="vs-action-footer vs-between">
                  <button className="vs-back-btn" onClick={() => setWizardStep(2)}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Back</span>
                  </button>

                  <button
                    className="vs-continue-btn"
                    onClick={() => {
                      alert(`Payload ready to submit:\n${JSON.stringify(matchmakingData, null, 2)}`);
                    }}
                  >
                    <span>Submit Request</span>
                    <i className="fa-solid fa-paper-plane"></i>
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
