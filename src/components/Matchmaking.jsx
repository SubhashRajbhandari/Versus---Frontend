import { useState, useEffect } from 'react';
import '../index.css';
import { apiFetch } from '../utils/api';

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

export default function Matchmaking({ user, onLogout }) {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [selectedSport, setSelectedSport] = useState(() => {
    return localStorage.getItem('gameId') || '287dae3a-cf4e-43dd-b842-e232cc378c36'; // Default Basketball UUID
  });

  useEffect(() => {
    if (selectedSport) {
      localStorage.setItem('gameId', selectedSport);
      localStorage.setItem('sportId', selectedSport);
    }
  }, [selectedSport]);

  useEffect(() => {
    async function fetchSports() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await apiFetch(`${apiUrl}/api/sports`);
        if (response.ok) {
          const data = await response.json();
          if (data.sports && data.sports.length > 0) {
            const formatted = data.sports.map((s) => ({
              id: s.id || SPORTS_JSON_MAP[s.name.toLowerCase()],
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
