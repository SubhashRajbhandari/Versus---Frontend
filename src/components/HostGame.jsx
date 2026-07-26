import { useState, useEffect } from 'react';
import '../index.css';

// Criteria matrix from attached image for specific included sports (Maximum limit caps)
const getPlayerBoundsForSport = (sportName) => {
  const name = (sportName || '').toLowerCase();
  if (name.includes('badminton')) return { max: 4, defaultVal: 4 };
  if (name.includes('pickleball')) return { max: 4, defaultVal: 4 };
  if (name.includes('basketball')) return { max: 10, defaultVal: 10 };
  if (name.includes('futsal')) return { max: 10, defaultVal: 10 };
  if (name.includes('football') || name.includes('soccer')) return { max: 22, defaultVal: 22 };
  if (name.includes('table tennis') || name.includes('ping pong')) return { max: 4, defaultVal: 4 };
  if (name.includes('tennis')) return { max: 4, defaultVal: 4 };
  if (name.includes('volleyball')) return { max: 12, defaultVal: 12 };
  if (name.includes('running') || name.includes('hiking')) return { max: 30, defaultVal: 10 };
  return { max: 20, defaultVal: 10 };
};

// Fallback default venues sorted by sport_id column if backend is unavailable
const DEFAULT_VENUES = [
  { id: '9a21b3c4-1111-4222-8333-555555555551', name: 'National Sports Complex Futsal Arena', address: '456 Stadium Way, Kathmandu', sport_id: '70f40861-d81b-46c5-b4dd-a2f28993b796' },
  { id: '9a21b3c4-1111-4222-8333-555555555552', name: 'Westside Futsal & Turf Center', address: '789 Park Ave, Lalitpur', sport_id: '70f40861-d81b-46c5-b4dd-a2f28993b796' },
  { id: '9a21b3c4-1111-4222-8333-555555555553', name: 'Apex Futsal Club', address: '101 Arena Way, Bhaktapur', sport_id: '70f40861-d81b-46c5-b4dd-a2f28993b796' },
  { id: '9a21b3c4-1111-4222-8333-555555555554', name: 'Downtown Community Center Basketball Court', address: '123 Main St, Downtown', sport_id: '287dae3a-cf4e-43dd-b842-e232cc378c36' },
  { id: '9a21b3c4-1111-4222-8333-555555555555', name: 'Metro Basketball Arena', address: '88 Hoop St, City Center', sport_id: '287dae3a-cf4e-43dd-b842-e232cc378c36' },
  { id: '9a21b3c4-1111-4222-8333-555555555556', name: 'Westside Soccer & Football Turf', address: '789 Park Ave, Westside', sport_id: '1e11188f-fb25-461c-947b-309cba3a9a8d' },
  { id: '9a21b3c4-1111-4222-8333-555555555557', name: 'Apex Indoor Badminton Club', address: '321 Sports Center Dr', sport_id: 'c9569279-8525-434d-9f0f-c15b209f445b' },
  { id: '9a21b3c4-1111-4222-8333-555555555558', name: 'City Center Tennis & Pickleball Courts', address: '654 Grand Ave', sport_id: '19d46582-4167-449d-9f25-0801b74a6463' },
  { id: '9a21b3c4-1111-4222-8333-555555555559', name: 'Valley Volleyball Dome', address: '987 Valley Rd', sport_id: '2b319d51-1305-4fd6-a233-1f7fd3f1572d' }
];

// Strictly match sportId from local storage / selected sport with venue table's sport_id column
const filterVenuesForSport = (venuesList, targetSportId) => {
  if (!venuesList || venuesList.length === 0 || !targetSportId) return [];

  return venuesList.filter(
    (v) => v.sport_id && String(v.sport_id).toLowerCase() === String(targetSportId).toLowerCase()
  );
};

export default function HostGame({ user, selectedSport, onCancel, onSuccess, onLogout }) {
  const sportName = selectedSport?.name || 'Basketball';
  const initialSportId = selectedSport?.id || '287dae3a-cf4e-43dd-b842-e232cc378c36';

  const playerBounds = getPlayerBoundsForSport(sportName);

  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('2026-08-01');
  const [time, setTime] = useState('10:00');

  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [loadingVenues, setLoadingVenues] = useState(true);

  // Resolved sport_id from tallying sports table
  const [resolvedSportId, setResolvedSportId] = useState(initialSportId);

  const [playersNeeded, setPlayersNeeded] = useState(playerBounds.defaultVal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Update bounds when sport changes
  useEffect(() => {
    const bounds = getPlayerBoundsForSport(sportName);
    setPlayersNeeded(bounds.defaultVal);
  }, [sportName]);

  // Tally sport ID from table named sports
  useEffect(() => {
    async function fetchSportFromTable() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/sports`);
        if (response.ok) {
          const data = await response.json();
          if (data.sports && data.sports.length > 0) {
            // Find ID of selected sport in step 1 of matchmaking page by tallying name
            const match = data.sports.find(
              (s) =>
                s.name.toLowerCase() === sportName.toLowerCase() ||
                s.id === initialSportId
            );
            if (match) {
              setResolvedSportId(match.id);
            }
          }
        }
      } catch (err) {
        console.warn('Could not tally sport ID from sports table:', err);
      }
    }

    fetchSportFromTable();
  }, [sportName, initialSportId]);

  // Retrieve venues matching sportId from local storage and sport_id column in venue table
  useEffect(() => {
    async function fetchVenues() {
      try {
        setLoadingVenues(true);
        // Priority: local storage 'sportId' / 'gameId', resolvedSportId, initialSportId
        const localStorageSportId = localStorage.getItem('sportId') || localStorage.getItem('gameId');
        const targetSportId = localStorageSportId || resolvedSportId || initialSportId;

        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/venues?sport_id=${targetSportId}`);
        let fetchedList = DEFAULT_VENUES;
        if (response.ok) {
          const data = await response.json();
          if (data.venues && data.venues.length > 0) {
            fetchedList = data.venues;
          }
        }
        const relevantVenues = filterVenuesForSport(fetchedList, targetSportId);
        setVenues(relevantVenues);
        if (relevantVenues.length > 0) {
          setSelectedVenueId(relevantVenues[0].id);
        } else {
          setSelectedVenueId('');
        }
      } catch (err) {
        console.warn('Could not fetch venues from API, filtering default venues:', err);
        const localStorageSportId = localStorage.getItem('sportId') || localStorage.getItem('gameId');
        const targetSportId = localStorageSportId || resolvedSportId || initialSportId;
        const relevantVenues = filterVenuesForSport(DEFAULT_VENUES, targetSportId);
        setVenues(relevantVenues);
        if (relevantVenues.length > 0) {
          setSelectedVenueId(relevantVenues[0].id);
        } else {
          setSelectedVenueId('');
        }
      } finally {
        setLoadingVenues(false);
      }
    }

    fetchVenues();
  }, [sportName, resolvedSportId, initialSportId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedVenueId) {
      setErrorMessage('Please select a venue for your match.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build ISO start time and scheduled date
      const startTimeIso = new Date(`${date}T${time}:00`).toISOString();
      const scheduledDateIso = new Date(`${date}T00:00:00.000Z`).toISOString();

      // Retrieve user's member ID from user object or local storage fallback
      const hostMemberId =
        user?.member_id ||
        user?.memberId ||
        user?.id ||
        'd3b07384-d113-460a-4c91-000000000001';

      const finalSportId = resolvedSportId || initialSportId;

      // Payload specification
      const payload = {
        host_member_id: hostMemberId,
        venue_id: selectedVenueId,
        sport_id: finalSportId,
        start_time: startTimeIso,
        max_players: playersNeeded,
        status: 'open',
        scheduled_date: scheduledDateIso,
        event_name: eventName || `Pick-up ${sportName}`
      };

      // Record in localstorage
      localStorage.setItem('vs_hosted_game', JSON.stringify(payload));
      localStorage.setItem('gameId', finalSportId);
      localStorage.setItem('sportId', finalSportId);
      localStorage.setItem('userPreference', 'host_a_game');

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/matches/host`, {
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

          <div className="vs-host-card">
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
                    placeholder="e.g., Saturday Morning Pick-up"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="vs-input"
                  />
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
                    title={`Maximum for ${sportName}: ${playerBounds.max}`}
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
                <span className="vs-players-bounds-hint">
                  {sportName} maximum limit: {playerBounds.max} players
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
