import { useEffect, useState } from 'react';

const DEFAULT_SPORTS = [
  { id: '287dae3a-cf4e-43dd-b842-e232cc378c36', name: 'Basketball' },
  { id: '1e11188f-fb25-461c-947b-309cba3a9a8d', name: 'Football' },
  { id: '70f40861-d81b-46c5-b4dd-a2f28993b796', name: 'Futsal' }
];

const getStoredMemberId = (user) => {
  if (typeof window === 'undefined') return '';

  const rawUser = localStorage.getItem('user');
  let parsedUser = null;

  if (rawUser) {
    try {
      parsedUser = JSON.parse(rawUser);
    } catch {
      parsedUser = null;
    }
  }

  return (
    localStorage.getItem('member_id') ||
    parsedUser?.member_id ||
    parsedUser?.memberId ||
    parsedUser?.id ||
    user?.member_id ||
    user?.memberId ||
    user?.id ||
    ''
  );
};

export default function AddVenueForm({ user, onCancel }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [price, setPrice] = useState('1500');
  const [sportId, setSportId] = useState('');
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function fetchSports() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/sports`);

        if (!response.ok) {
          setSports(DEFAULT_SPORTS);
          return;
        }

        const data = await response.json();
        const list = Array.isArray(data?.sports) ? data.sports : [];
        const formatted = list.map((sport) => ({
          id: sport.id,
          name: sport.name
        }));

        setSports(formatted.length > 0 ? formatted : DEFAULT_SPORTS);
      } catch (err) {
        console.warn('Could not load sports for venue form:', err);
        setSports(DEFAULT_SPORTS);
      } finally {
        setLoadingSports(false);
      }
    }

    fetchSports();
  }, []);

  useEffect(() => {
    if (!sportId && sports.length > 0) {
      setSportId(sports[0].id);
    }
  }, [sportId, sports]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const venueManagerMemberId = getStoredMemberId(user);

    if (!name.trim() || !address.trim() || !phoneNumber.trim() || !googleMapsLink.trim() || !sportId) {
      setErrorMessage('Please fill in all the venue details before submitting.');
      return;
    }

    const payload = {
      venue_manager_member_id: venueManagerMemberId,
      name: name.trim(),
      address: address.trim(),
      phone_number: phoneNumber.trim(),
      google_maps_link: googleMapsLink.trim(),
      price: Number(price) || 0,
      sport_id: sportId
    };

    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/venues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Unable to create venue right now.');
      }

      setSuccessMessage('Venue added successfully.');
      setName('');
      setAddress('');
      setPhoneNumber('');
      setGoogleMapsLink('');
      setPrice('1500');
      setSportId(sports[0]?.id || '');
    } catch (err) {
      console.error('Venue creation failed:', err);
      setErrorMessage(err.message || 'Something went wrong while adding the venue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vs-venue-page">
      <div className="vs-venue-card">
        <div className="vs-venue-card-header">
          <h2 className="vs-venue-title">Add a Venue</h2>
          <p className="vs-venue-subtitle">
            Share your venue details so players can discover and book it for their next game.
          </p>
        </div>

        <form className="vs-venue-form" onSubmit={handleSubmit}>
          <div className="vs-form-group">
            <label htmlFor="venue-name">Venue name</label>
            <input
              id="venue-name"
              className="vs-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Venue name"
              required
            />
          </div>

          <div className="vs-form-group">
            <label htmlFor="venue-address">Venue address</label>
            <input
              id="venue-address"
              className="vs-input"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Venue address"
              required
            />
          </div>

          <div className="vs-form-row">
            <div className="vs-form-group">
              <label htmlFor="venue-phone">Phone number</label>
              <input
                id="venue-phone"
                className="vs-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+977-1-XXXXXXX"
                required
              />
            </div>

            <div className="vs-form-group">
              <label htmlFor="venue-price">Price</label>
              <input
                id="venue-price"
                className="vs-input"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500"
                required
              />
            </div>
          </div>

          <div className="vs-form-group">
            <label htmlFor="venue-map">Google Maps link</label>
            <input
              id="venue-map"
              className="vs-input"
              type="url"
              value={googleMapsLink}
              onChange={(e) => setGoogleMapsLink(e.target.value)}
              placeholder="https://maps.google.com/..."
              required
            />
          </div>

          <div className="vs-form-group">
            <label htmlFor="venue-sport">Sport</label>
            <select
              id="venue-sport"
              className="vs-input vs-select"
              value={sportId}
              onChange={(e) => setSportId(e.target.value)}
              disabled={loadingSports}
              required
            >
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
            <span className="vs-field-caption">Sports shown here come from the sports table in your backend.</span>
          </div>

          {errorMessage && <p className="vs-form-error">{errorMessage}</p>}
          {successMessage && <p className="vs-form-success">{successMessage}</p>}

          <div className="vs-host-actions">
            <button type="button" className="vs-host-cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="vs-host-submit-btn" disabled={isSubmitting || loadingSports}>
              {isSubmitting ? 'Adding venue...' : 'Add venue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
