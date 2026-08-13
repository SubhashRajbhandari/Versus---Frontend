import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import '../index.css';

// Curated high quality sport banner images for cards
const SPORT_IMAGES = {
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
  futsal: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
  soccer: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
  football: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
  tennis: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=600&q=80',
  pickleball: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=600&q=80',
  padel: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=600&q=80',
  badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80',
  volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80',
  cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
  swimming: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80'
};

const getSportImage = (sportName, eventName) => {
  const text = `${sportName || ''} ${eventName || ''}`.toLowerCase();
  for (const key of Object.keys(SPORT_IMAGES)) {
    if (key !== 'default' && text.includes(key)) {
      return SPORT_IMAGES[key];
    }
  }
  return SPORT_IMAGES.default;
};

// Helper to format ISO start time cleanly (e.g., "Tomorrow, 7:00 AM" or "Saturday, 10:00 AM")
const formatEventTime = (isoString) => {
  if (!isoString) return 'Tomorrow, 7:00 AM';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;

  const dayName = date.toLocaleDateString([], { weekday: 'long' });
  return `${dayName}, ${timeStr}`;
};

export default function GameDiscovery({ selectedSport, onBack, user, onJoinSuccess }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchDate, setSearchDate] = useState('');
  const [activeSearchDate, setActiveSearchDate] = useState('');
  const [joinedEventIds, setJoinedEventIds] = useState(() => {
    try {
      const saved = localStorage.getItem('vs_joined_event_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [requestedSportIds, setRequestedSportIds] = useState(() => {
    try {
      const saved = localStorage.getItem('vs_requested_sport_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [requestingId, setRequestingId] = useState(null);

  // Get current date string formatted as YYYY-MM-DD for setting min date restriction
  const todayString = new Date().toISOString().split('T')[0];

  const sportId = selectedSport?.id || 'aaeecab8-52bc-49fc-9099-0caba91c489c';
  const sportName = selectedSport?.name || 'Pickle Ball';

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        let endpoint = `${apiUrl}/api/events?sport_id=${sportId}`;
        if (activeSearchDate) {
          endpoint += `&scheduled_date=${encodeURIComponent(activeSearchDate)}`;
        }

        const response = await apiFetch(endpoint);

        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        } else {
          const errData = await response.json().catch(() => ({}));
          setError(errData.error || 'Failed to load events for this sport.');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Error connecting to events service.');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [sportId, activeSearchDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchDate && searchDate < todayString) {
      setError('Selected date cannot be in the past.');
      return;
    }
    setError(null);
    setActiveSearchDate(searchDate);
  };

  const handleClearDate = () => {
    setSearchDate('');
    setActiveSearchDate('');
    setError(null);
  };

  const handleRequestToJoin = async (evtObj) => {
    const eventId = typeof evtObj === 'string' ? evtObj : evtObj?.id;
    if (!eventId || requestingId) return;

    setRequestingId(eventId);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await apiFetch(`${apiUrl}/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok || response.status === 409) {
        // Success or already pending join request
        const successMessage = 'Join Request Sent Successfully!';

        setJoinedEventIds((prev) => {
          const next = new Set(prev).add(eventId);
          try {
            localStorage.setItem('vs_joined_event_ids', JSON.stringify(Array.from(next)));
          } catch {}
          return next;
        });

        setRequestedSportIds((prev) => {
          const next = new Set(prev).add(sportId);
          try {
            localStorage.setItem('vs_requested_sport_ids', JSON.stringify(Array.from(next)));
          } catch {}
          return next;
        });

        if (onJoinSuccess) {
          onJoinSuccess(evtObj, successMessage);
        }
      } else {
        setError(resData.error || 'Failed to submit join request.');
      }
    } catch (err) {
      console.error('Error submitting join request:', err);
      setError('Error connecting to events service.');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="vs-game-discovery-container">
      {/* Top Controls Bar with Back Button */}
      <div className="vs-discovery-top-nav">
        <button className="vs-back-link-btn" onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i> Back to Options
        </button>
      </div>

      {/* Header Heading */}
      <div className="vs-heading-group">
        <h2 className="vs-page-title">Game Discovery</h2>
        <p className="vs-page-subtitle">Find and join open games in your area.</p>
      </div>

      {/* Filter / Sport Banner Card matching the screenshot */}
      <div className="vs-sport-banner-card">
        <div className="vs-sport-banner-title">
          <h2>{sportName}</h2>
        </div>

        <form className="vs-banner-search-form" onSubmit={handleSearchSubmit}>
          <div className="vs-date-field-group">
            <label htmlFor="vs-date-picker">Date</label>
            <div className="vs-date-input-wrapper">
              <input
                id="vs-date-picker"
                type="date"
                className="vs-date-picker-input"
                min={todayString}
                value={searchDate}
                onChange={(e) => {
                  setSearchDate(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="yyyy-mm-dd"
              />
            </div>
          </div>

          <button type="submit" className="vs-search-btn">
            Search
          </button>

          {(searchDate || activeSearchDate) && (
            <button
              type="button"
              className="vs-clear-date-btn"
              onClick={handleClearDate}
              title="Clear date filter"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Events Grid section */}
      {loading ? (
        <div className="vs-loading-container">
          <div className="vs-loading-spinner"></div>
          <span className="vs-loading-text">Loading events for {sportName}...</span>
        </div>
      ) : error ? (
        <div className="vs-error-box">
          <i className="fa-solid fa-triangle-exclamation"></i> {error}
        </div>
      ) : events.length === 0 ? (
        <div className="vs-empty-events-card">
          <div className="vs-empty-icon">
            <i className="fa-solid fa-calendar-xmark"></i>
          </div>
          <h3>No Open Games Found</h3>
          <p>
            There are currently no scheduled games for <strong>{sportName}</strong>
            {activeSearchDate ? ` on ${activeSearchDate}` : ''}.
          </p>
          {activeSearchDate && (
            <button className="vs-clear-filter-btn" onClick={handleClearDate}>
              View All Dates
            </button>
          )}
        </div>
      ) : (
        <div className="vs-events-grid">
          {events.map((evt) => {
            const isEventRequested =
              joinedEventIds.has(evt.id) ||
              evt.has_requested_to_join ||
              evt.has_joined ||
              evt.user_participant_status === 'pending' ||
              evt.user_participant_status === 'approved' ||
              evt.user_participant_status === 'joined' ||
              requestedSportIds.has(evt.sport?.id || sportId);

            const isRequesting = requestingId === evt.id;
            const bgImage = getSportImage(evt.sport?.name || sportName, evt.event_name);

            // Compute players needed badge text
            const maxP = evt.max_players || 10;
            const neededCount = Math.max(1, maxP - 1);

            const displayTitle =
              evt.event_name ||
              `${evt.sport?.name || sportName} Session`;

            const venueName = evt.venue?.name || evt.venue?.address || 'Downtown Sports Center';
            const hostName = evt.host_member?.name || evt.host_member?.user?.name || evt.host_member?.email?.split('@')[0] || 'Mike R.';

            return (
              <div key={evt.id} className="vs-event-card">
                {/* Top Image Box with Badge */}
                <div
                  className="vs-event-card-image"
                  style={{ backgroundImage: `url(${bgImage})` }}
                >
                  <div className="vs-event-image-overlay"></div>
                  <span className="vs-needed-badge">
                    <i className="fa-solid fa-user-group"></i> {neededCount} Needed
                  </span>
                </div>

                {/* Card Content Details */}
                <div className="vs-event-card-body">
                  <h3 className="vs-event-card-title">{displayTitle}</h3>
                  <span className="vs-event-card-subtitle">{evt.sport?.name || sportName}</span>

                  <div className="vs-event-details-list">
                    <div className="vs-detail-row">
                      <i className="fa-solid fa-location-dot vs-detail-icon"></i>
                      <span className="vs-detail-text">{venueName}</span>
                    </div>

                    <div className="vs-detail-row">
                      <i className="fa-regular fa-clock vs-detail-icon"></i>
                      <span className="vs-detail-text">{formatEventTime(evt.start_time)}</span>
                    </div>

                    <div className="vs-detail-row">
                      <i className="fa-regular fa-user vs-detail-icon"></i>
                      <span className="vs-detail-text">Host: {hostName}</span>
                    </div>
                  </div>

                  {/* Card Action Area: Disappears when requested */}
                  {isRequesting ? (
                    <button className="vs-request-join-btn" disabled>
                      <span className="vs-btn-spinner"></span>
                      <span>Sending Request...</span>
                    </button>
                  ) : isEventRequested ? (
                    <div className="vs-request-pending-tag">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>Join Request Pending</span>
                    </div>
                  ) : (
                    <button
                      className="vs-request-join-btn"
                      onClick={() => handleRequestToJoin(evt)}
                    >
                      Request to Join
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

