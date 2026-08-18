import { useState, useEffect } from 'react';
import '../index.css';
import { apiFetch } from '../utils/api';
import { DEFAULT_SPORTS } from './Auth';

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
  const [primarySports, setPrimarySports] = useState([]);
  const [secondarySports, setSecondarySports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);

  useEffect(() => {
    localStorage.removeItem('gameId');
    localStorage.removeItem('sportId');
  }, []);

  useEffect(() => {
    async function fetchSports() {
      const defaultSportsFormatted = DEFAULT_SPORTS.map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.icon || getSportIcon(s.name)
      }));

      // Check if background prefetch data exists in sessionStorage for instant load (0ms delay)
      try {
        const cachedPref = sessionStorage.getItem('vs_preferred_sports_cache');
        const cachedAll = sessionStorage.getItem('vs_all_sports_cache');
        if (cachedPref && cachedAll) {
          const prefData = JSON.parse(cachedPref);
          const allData = JSON.parse(cachedAll);

          const preferredList = prefData.map((s) => ({
            id: s.sportId || s.id,
            name: s.name,
            icon: getSportIcon(s.name)
          }));

          const allList = allData.map((s) => ({
            id: s.id,
            name: s.name,
            icon: getSportIcon(s.name)
          }));

          const preferredIds = new Set(preferredList.map((p) => p.id));
          const preferredNames = new Set(preferredList.map((p) => p.name.toLowerCase()));
          const remaining = allList.filter(
            (s) => !preferredIds.has(s.id) && !preferredNames.has(s.name.toLowerCase())
          );

          setPrimarySports(preferredList);
          setSecondarySports(remaining);
          setLoading(false);
        }
      } catch {
        // Fallthrough to API fetch if cache parse fails
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        
        // Fetch preferred sports & all available sports concurrently
        const [preferredRes, allRes] = await Promise.allSettled([
          apiFetch(`${apiUrl}/api/sports/preferred`),
          apiFetch(`${apiUrl}/api/sports`)
        ]);

        let preferredList = [];
        if (preferredRes.status === 'fulfilled' && preferredRes.value.ok) {
          const prefData = await preferredRes.value.json();
          if (prefData.preferredSports && prefData.preferredSports.length > 0) {
            sessionStorage.setItem('vs_preferred_sports_cache', JSON.stringify(prefData.preferredSports));
            preferredList = prefData.preferredSports.map((s) => ({
              id: s.sportId || s.id,
              name: s.name,
              icon: getSportIcon(s.name)
            }));
          }
        }

        let allList = [];
        if (allRes.status === 'fulfilled' && allRes.value.ok) {
          const allData = await allRes.value.json();
          if (allData.sports && allData.sports.length > 0) {
            sessionStorage.setItem('vs_all_sports_cache', JSON.stringify(allData.sports));
            allList = allData.sports.map((s) => ({
              id: s.id,
              name: s.name,
              icon: getSportIcon(s.name)
            }));
          }
        }

        if (allList.length === 0) {
          allList = defaultSportsFormatted;
        }

        if (preferredList.length > 0) {
          const preferredIds = new Set(preferredList.map((p) => p.id));
          const preferredNames = new Set(preferredList.map((p) => p.name.toLowerCase()));

          const remaining = allList.filter(
            (s) => !preferredIds.has(s.id) && !preferredNames.has(s.name.toLowerCase())
          );

          setPrimarySports(preferredList);
          setSecondarySports(remaining);

        } else {
          setPrimarySports(allList.slice(0, 8));
          setSecondarySports(allList.slice(8));
        }
      } catch (err) {
        console.warn('Could not fetch sports from API, using defaults:', err);
        if (!sessionStorage.getItem('vs_preferred_sports_cache')) {
          setPrimarySports(defaultSportsFormatted.slice(0, 8));
          setSecondarySports(defaultSportsFormatted.slice(8));
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSports();
  }, []);

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
            <div className="vs-loading-container">
              <div className="vs-loading-spinner"></div>
              <span className="vs-loading-text">Loading sports...</span>
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
