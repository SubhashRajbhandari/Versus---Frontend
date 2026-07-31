import React from 'react';

function LandingPage({ onOpenLogin, onOpenSignup }) {
  return (
    <div className="landing-page">
      {/* Header Bar */}
      <header className="landing-header">
        <div className="landing-header-container">
          <div className="landing-logo">
            <span>Versus</span>
          </div>
          <div className="landing-nav-buttons">
            <button
              type="button"
              className="landing-btn-login"
              onClick={onOpenLogin}
            >
              Login
            </button>
            <button
              type="button"
              className="landing-btn-signup"
              onClick={onOpenSignup}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Find your game.
            <br />
            Meet your team.
          </h1>
          <p className="hero-subtitle">
            Elevate your recreational and competitive play. Connect with local players, book
            professional courts, and manage your sporting life through a single, elegant platform.
          </p>

          {/* Search Bar Pill */}
          <div className="hero-search-wrapper">
            <div className="hero-search-bar">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                placeholder="Search sports, venues, or locations..."
                className="hero-search-input"
              />
              <button type="button" className="hero-search-btn">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sports Section */}
      <section className="landing-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Sports</h2>
              <p className="section-subtitle">
                Discover communities and courts tailored to your favorite activities. We support over 20+ disciplines.
              </p>
            </div>
            <a href="#" className="section-link" onClick={(e) => e.preventDefault()}>
              View All Sports <span className="arrow">→</span>
            </a>
          </div>

          <div className="sports-grid-4">
            {/* Tennis Card */}
            <div className="landing-sport-card">
              <div className="sport-icon-badge badge-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="10" cy="10" rx="6" ry="7" transform="rotate(-45 10 10)" />
                  <path d="M14.5 14.5L21 21" />
                  <line x1="7" y1="7" x2="13" y2="13" />
                  <line x1="13" y1="7" x2="7" y2="13" />
                </svg>
              </div>
              <h3 className="sport-card-title">Tennis</h3>
              <p className="sport-card-meta">142 courts available</p>
            </div>

            {/* Soccer Card */}
            <div className="landing-sport-card">
              <div className="sport-icon-badge badge-green">
                <i className="fa-solid fa-futbol"></i>
              </div>
              <h3 className="sport-card-title">Soccer</h3>
              <p className="sport-card-meta">8 active leagues</p>
            </div>

            {/* Badminton Card */}
            <div className="landing-sport-card">
              <div className="sport-icon-badge badge-beige">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15l10-10 6 6-10 10z" />
                  <path d="M14 5l5 5" />
                  <path d="M4 20l3-3" />
                </svg>
              </div>
              <h3 className="sport-card-title">Badminton</h3>
              <p className="sport-card-meta">Open gym tonight</p>
            </div>

            {/* Pickleball Card */}
            <div className="landing-sport-card">
              <div className="sport-icon-badge badge-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="3" width="11" height="12" rx="4" />
                  <path d="M9.5 15v6" strokeWidth="2.5" />
                  <circle cx="18" cy="8" r="2.5" />
                </svg>
              </div>
              <h3 className="sport-card-title">Pickleball</h3>
              <p className="sport-card-meta">500+ local players</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Matches Nearby Section */}
      <section className="landing-section">
        <div className="section-container">
          <div className="section-header text-center">
            <h2 className="section-title">Upcoming Matches Nearby</h2>
            <p className="section-subtitle">
              Find games that fit your schedule and skill level. Reserve your spot with one tap.
            </p>
          </div>

          <div className="matches-grid-2">
            {/* Match 1 */}
            <div className="landing-match-card">
              <div className="match-card-top">
                <div className="match-icon-circle badge-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <ellipse cx="10" cy="10" rx="6" ry="7" transform="rotate(-45 10 10)" />
                    <path d="M14.5 14.5L21 21" />
                  </svg>
                </div>
                <div className="match-title-group">
                  <h3 className="match-title">Evening Doubles Scrimmage</h3>
                  <span className="match-tag tag-blue">Intermediate (3.0 - 3.5)</span>
                </div>
              </div>

              <div className="match-details">
                <div className="match-detail-row">
                  <i className="fa-solid fa-location-dot"></i>
                  <span>Downtown Community Center Courts</span>
                </div>
                <div className="match-detail-row">
                  <i className="fa-regular fa-calendar"></i>
                  <span>Oct 24 • 18:00</span>
                </div>
              </div>

              <div className="match-card-bottom">
                <div className="avatar-group">
                  <span className="avatar avatar-blue">JD</span>
                  <span className="avatar avatar-darkblue">AK</span>
                  <span className="avatar avatar-more">+</span>
                </div>
                <div className="match-action-group">
                  <span className="spots-text spots-green">2 Spots Left</span>
                  <button type="button" className="match-join-btn">
                    Join
                  </button>
                </div>
              </div>
            </div>

            {/* Match 2 */}
            <div className="landing-match-card">
              <div className="match-card-top">
                <div className="match-icon-circle badge-green">
                  <i className="fa-solid fa-futbol"></i>
                </div>
                <div className="match-title-group">
                  <h3 className="match-title">Indoor Turf 7v7 League</h3>
                  <span className="match-tag tag-green">Advanced</span>
                </div>
              </div>

              <div className="match-details">
                <div className="match-detail-row">
                  <i className="fa-solid fa-location-dot"></i>
                  <span>Northside Athletics Complex</span>
                </div>
                <div className="match-detail-row">
                  <i className="fa-regular fa-calendar"></i>
                  <span>Oct 25 • 20:30</span>
                </div>
              </div>

              <div className="match-card-bottom">
                <div className="avatar-group">
                  <span className="avatar avatar-blue">M</span>
                  <span className="avatar avatar-teal">S</span>
                  <span className="avatar avatar-green">T</span>
                  <span className="avatar avatar-more">+4</span>
                </div>
                <div className="match-action-group">
                  <span className="spots-text spots-red">1 Spot Left</span>
                  <button type="button" className="match-join-btn">
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="load-more-wrapper">
            <button type="button" className="load-more-btn">
              Load more matches
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <p>© 2026 Versus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
