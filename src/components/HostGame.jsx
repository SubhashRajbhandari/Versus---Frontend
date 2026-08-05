import { useState, useEffect } from 'react';
import '../index.css';
import { apiFetch } from '../utils/api';
import LoadingOverlay from './LoadingOverlay';

// Criteria matrix for sport maximum limit caps
const getPlayerBoundsForSport = (sportName) => {
  const name = (sportName || '').toLowerCase();
  if (name.includes('badminton')) return { max: 6, defaultVal: 4 };
  if (name.includes('pickleball')) return { max: 6, defaultVal: 4 };
  if (name.includes('basketball')) return { max: 15, defaultVal: 10 };
  if (name.includes('futsal')) return { max: 15, defaultVal: 10 };
  if (name.includes('football') || name.includes('soccer')) return { max: 30, defaultVal: 22 };
  if (name.includes('table tennis') || name.includes('ping pong')) return { max: 6, defaultVal: 4 };
  if (name.includes('tennis')) return { max: 6, defaultVal: 4 };
  if (name.includes('volleyball')) return { max: 18, defaultVal: 12 };
  if (name.includes('running') || name.includes('hiking')) return { max: 100, defaultVal: 10 };
  return { max: 20, defaultVal: 10 };
};

export default function HostGame({ user, selectedSport, onCancel, onSuccess, onLogout }) {
  // Sports state
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [selectedSportId, setSelectedSportId] = useState(selectedSport?.id || '');
  const [selectedSportName, setSelectedSportName] = useState(selectedSport?.name || '');

  // Helper to format today's local date as YYYY-MM-DD for min date restriction
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const minDateStr = getTodayDateString();

  // Form states
  const [eventName, setEventName] = useState('');
  
  // Default date to today's date formatted as YYYY-MM-DD
  const [date, setDate] = useState(minDateStr);
  const [time, setTime] = useState('18:00');

  // Venues state
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [loadingVenues, setLoadingVenues] = useState(false);

  // Player count bounds
  const playerBounds = getPlayerBoundsForSport(selectedSportName);
  const [playersNeeded, setPlayersNeeded] = useState(playerBounds.defaultVal);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Fetch available sports from /api/sports
  useEffect(() => {
    async function fetchSports() {
      try {
        setLoadingSports(true);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await apiFetch(`${apiUrl}/api/sports`);
        if (response.ok) {
          const data = await response.json();
          if (data.sports && data.sports.length > 0) {
            setSports(data.sports);
            
            // If no initial sport is selected or invalid, default to matching or first sport from API
            let current = data.sports.find(
              (s) => s.id === selectedSportId || s.name.toLowerCase() === selectedSportName.toLowerCase()
            );
            if (!current) {
              current = data.sports[0];
            }
            setSelectedSportId(current.id);
            setSelectedSportName(current.name);
            const bounds = getPlayerBoundsForSport(current.name);
            setPlayersNeeded(bounds.defaultVal);
          }
        }
      } catch (err) {
        console.warn('Could not fetch sports from /api/sports:', err);
      } finally {
        setLoadingSports(false);
      }
    }

    fetchSports();
  }, []);

  // 2. Fetch venues matching the selected sport ID from /api/venues?sport_ids=<sport_id>
  useEffect(() => {
    if (!selectedSportId) return;

    async function fetchVenues() {
      try {
        setLoadingVenues(true);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await apiFetch(`${apiUrl}/api/venues?sport_ids=${selectedSportId}`);
        if (response.ok) {
          const data = await response.json();
          const fetchedVenues = data.venues || [];
          setVenues(fetchedVenues);
          if (fetchedVenues.length > 0) {
            setSelectedVenueId(fetchedVenues[0].id);
          } else {
            setSelectedVenueId('');
          }
        } else {
          setVenues([]);
          setSelectedVenueId('');
        }
      } catch (err) {
        console.error('Could not fetch venues for sport ID:', err);
        setVenues([]);
        setSelectedVenueId('');
      } finally {
        setLoadingVenues(false);
      }
    }

    fetchVenues();
  }, [selectedSportId]);

  // Handle Sport dropdown change
  const handleSportChange = (sportId) => {
    setSelectedSportId(sportId);
    const foundSport = sports.find((s) => s.id === sportId);
    const newSportName = foundSport ? foundSport.name : '';
    setSelectedSportName(newSportName);
    const bounds = getPlayerBoundsForSport(newSportName);
    setPlayersNeeded(bounds.defaultVal);
  };

  const handleDecrement = () => {
    if (playersNeeded > 1) {
      setPlayersNeeded((prev) => prev - 1);
    }
  };

  const handleIncrement = () => {
    if (playersNeeded < playerBounds.max) {
      setPlayersNeeded((prev) => prev + 1);
    }
  };

  // 3. Submit hosted game to /api/matches/host
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedVenueId) {
      setErrorMessage('Please select a venue for your match.');
      return;
    }

    const finalEventName = eventName.trim() || `${selectedSportName || 'Pickup'} Match`;
    if (finalEventName.length < 5 || finalEventName.length > 50) {
      setErrorMessage('Event Name must be between 5 and 50 characters long.');
      return;
    }

    if (date < minDateStr) {
      setErrorMessage('Date cannot be in the past. Please select current date or a future date.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format start_time as ISO string and scheduled_date as YYYY-MM-DD string
      const startTimeIso = new Date(`${date}T${time}:00`).toISOString();
      const hostMemberId =
        user?.member_id ||
        user?.memberId ||
        user?.id ||
        'd3b07384-d113-460a-4c91-000000000001';

      const payload = {
        event_name: finalEventName,
        sport_id: selectedSportId,
        venue_id: selectedVenueId,
        start_time: startTimeIso,
        scheduled_date: date,
        max_players: Number(playersNeeded),
        host_member_id: hostMemberId
      };

      // Store in local storage for session reference
      localStorage.setItem('vs_hosted_game', JSON.stringify(payload));
      localStorage.setItem('gameId', selectedSportId);
      localStorage.setItem('sportId', selectedSportId);
      localStorage.setItem('userPreference', 'host_a_game');

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await apiFetch(`${apiUrl}/api/matches/host`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok || response.status === 201) {
        setSuccessMessage('Match hosted successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess(payload);
        }, 1200);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.error || errorData.message || 'Failed to host game. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting hosted game:', err);
      setErrorMessage(err.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'Subhash Rajbhandari';
  const userInitials = userDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'S';

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
            <button className="vs-nav-item" onClick={onCancel}>
              <i className="fa-solid fa-house vs-nav-icon"></i>
              <span>Home</span>
            </button>

            <button className="vs-nav-item active">
              <i className="fa-solid fa-people-group vs-nav-icon"></i>
              <span>Match Making</span>
            </button>

            <button className="vs-nav-item disabled" title="Messages (Coming Soon)">
              <i className="fa-regular fa-envelope vs-nav-icon"></i>
              <span>Messages</span>
            </button>
          </nav>
        </div>

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

      {/* Main Area */}
      <main className="vs-main">
        {/* Header Bar */}
        <header className="vs-top-bar-header">
          <div className="vs-top-bar-right ml-auto">
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

        {/* Page Container */}
        <div className="vs-host-page-container">
          <h1 className="vs-host-page-title">Host a Game</h1>

          <div className="vs-host-card" style={{ position: 'relative' }}>
            <LoadingOverlay
              isLoading={loadingSports || loadingVenues || isSubmitting}
              message={
                isSubmitting
                  ? 'Hosting match...'
                  : loadingSports
                  ? 'Loading sports...'
                  : 'Loading venues...'
              }
            />
            <div className="vs-host-card-header">
              <h2 className="vs-host-card-title">Create New Game</h2>
              <p className="vs-host-card-subtitle">
                Fill out the details below to broadcast your match to potential players in your area.
              </p>
            </div>

            {errorMessage && <div className="vs-alert vs-alert-error">{errorMessage}</div>}
            {successMessage && <div className="vs-alert vs-alert-success">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="vs-host-form">
              {/* Event Name */}
              <div className="vs-form-group">
                <label htmlFor="eventName">Event Name</label>
                <div className="vs-input-wrapper">
                  <input
                    type="text"
                    id="eventName"
                    placeholder="e.g., Friday Badminton Clash"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="vs-input"
                  />
                </div>
              </div>

              {/* Sport Selection */}
              <div className="vs-form-group">
                <label htmlFor="eventSport">Sport</label>
                <div className="vs-input-wrapper">
                  <i className="fa-solid fa-trophy vs-input-icon-left"></i>
                  <select
                    id="eventSport"
                    value={selectedSportId}
                    onChange={(e) => handleSportChange(e.target.value)}
                    className="vs-input vs-input-has-icon vs-select"
                    required
                  >
                    {loadingSports ? (
                      <option value="">Loading sports...</option>
                    ) : (
                      sports.map((sport) => (
                        <option key={sport.id} value={sport.id}>
                          {sport.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="vs-form-row">
                <div className="vs-form-group">
                  <label htmlFor="eventDate">Date</label>
                  <div className="vs-input-wrapper">
                    <i className="fa-regular fa-calendar vs-input-icon-left"></i>
                    <input
                      type="date"
                      id="eventDate"
                      min={minDateStr}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="vs-input vs-input-has-icon"
                      required
                    />
                  </div>
                </div>

                <div className="vs-form-group">
                  <label htmlFor="eventTime">Estimated Start Time</label>
                  <div className="vs-input-wrapper">
                    <i className="fa-regular fa-clock vs-input-icon-left"></i>
                    <input
                      type="time"
                      id="eventTime"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="vs-input vs-input-has-icon"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Venue Selection */}
              <div className="vs-form-group">
                <label htmlFor="eventVenue">Venue</label>
                <div className="vs-input-wrapper">
                  <i className="fa-solid fa-location-dot vs-input-icon-left"></i>
                  <select
                    id="eventVenue"
                    value={selectedVenueId}
                    onChange={(e) => setSelectedVenueId(e.target.value)}
                    className="vs-input vs-input-has-icon vs-select"
                    required
                  >
                    {loadingVenues ? (
                      <option value="">Loading venues...</option>
                    ) : venues.length > 0 ? (
                      venues.map((venue) => (
                        <option key={venue.id} value={venue.id}>
                          {venue.name} — {venue.address}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        no venue available for now
                      </option>
                    )}
                  </select>
                  <i className="fa-solid fa-map-location-dot vs-input-icon-right"></i>
                </div>
                <span className="vs-field-caption">
                  <i className="fa-regular fa-circle-info"></i> Precise location helps find players nearby.
                </span>
              </div>

              {/* Players Needed Criteria Box */}
              <div className="vs-players-box">
                <span className="vs-players-label">Players Needed</span>
                <div className="vs-players-counter">
                  <button
                    type="button"
                    className="vs-counter-btn"
                    onClick={handleDecrement}
                    disabled={playersNeeded <= 1}
                    title="Decrease players needed"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>

                  <div className="vs-counter-value">{playersNeeded}</div>

                  <button
                    type="button"
                    className="vs-counter-btn"
                    onClick={handleIncrement}
                    disabled={playersNeeded >= playerBounds.max}
                    title={`Maximum for ${selectedSportName}: ${playerBounds.max}`}
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
                <span className="vs-players-bounds-hint">
                  {selectedSportName} maximum limit: {playerBounds.max} players
                </span>
              </div>

              {/* Action Buttons */}
              <div className="vs-host-actions">
                <button
                  type="button"
                  className="vs-host-cancel-btn"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="vs-host-submit-btn"
                  disabled={isSubmitting}
                >
                  <i className="fa-solid fa-bullhorn"></i>
                  <span>{isSubmitting ? 'Hosting...' : 'Host Game'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

