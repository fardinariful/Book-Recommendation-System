import React, { useState } from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <button 
          className="nav-brand" 
          onClick={() => handleTabClick('top50')}
          aria-label="Libraria Home"
        >
          <div className="brand-monogram">
            <svg viewBox="0 0 24 24">
              <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="brand-name">LIBRARIA</span>
            <span className="brand-tagline">Athenaeum &amp; Recommendation Engine</span>
          </div>
        </button>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <ul className={`nav-links ${mobileOpen ? 'show' : ''}`}>
          <li>
            <button 
              className={`nav-tab-btn ${activeTab === 'top50' ? 'active' : ''}`}
              onClick={() => handleTabClick('top50')}
            >
              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Top 50 Curations
            </button>
          </li>
          <li>
            <button 
              className={`nav-tab-btn ${activeTab === 'recommend-book' ? 'active' : ''}`}
              onClick={() => handleTabClick('recommend-book')}
            >
              <svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
              Recommend by Book
            </button>
          </li>
          <li>
            <button 
              className={`nav-tab-btn ${activeTab === 'recommend-user' ? 'active' : ''}`}
              onClick={() => handleTabClick('recommend-user')}
            >
              <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              Recommend by User ID
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
