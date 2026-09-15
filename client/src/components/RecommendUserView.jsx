import React, { useState } from 'react';
import HardcoverBookCard from './HardcoverBookCard';

export default function RecommendUserView({ onInspectBook }) {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  const handleSearch = async (uidToSearch) => {
    const target = uidToSearch !== undefined ? uidToSearch : userId;
    if (!target) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/recommend-user?user_id=${encodeURIComponent(target)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to synthesize reader profile.');
        setResultData(null);
      } else {
        setResultData(data);
        setUserId(String(data.user_id));
      }
    } catch (err) {
      setError('Connection error while contacting the recommendation server.');
      setResultData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(userId);
  };

  const selectUserPill = (id) => {
    setUserId(String(id));
    handleSearch(id);
  };

  return (
    <div style={{ width: '100%' }}>
      <section className="oracle-workbench">
        <div style={{ marginBottom: '2rem' }}>
          <span className="collection-tagline">Personalized Reading Twins Modeling</span>
          <h1 className="collection-title">User-Based Collaborative Persona</h1>
        </div>

        {/* Search Card */}
        <div className="oracle-card">
          <form className="oracle-form" onSubmit={handleSubmit}>
            <label className="oracle-label" htmlFor="reactUserId">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#f5cf68">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Enter Reader / Bibliophile Identification Number:
            </label>

            <div className="oracle-input-bar">
              <input 
                type="number" 
                id="reactUserId"
                className="oracle-input" 
                placeholder="Enter an active Reader ID (e.g., 254, 14, 16, 277427...)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />

              <button type="submit" className="btn-gilded" disabled={loading}>
                <span>{loading ? 'Synthesizing...' : 'Synthesize Taste Profile'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/>
                </svg>
              </button>
            </div>

            {/* Quick Active Bibliophile Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginTop: '0.5rem' }}>
              <span className="pills-label">Active Bibliophiles:</span>
              <button type="button" className="gilded-pill" onClick={() => selectUserPill(254)}>Patron #254</button>
              <button type="button" className="gilded-pill" onClick={() => selectUserPill(14)}>Patron #14</button>
              <button type="button" className="gilded-pill" onClick={() => selectUserPill(16)}>Patron #16</button>
              <button type="button" className="gilded-pill" onClick={() => selectUserPill(277427)}>Patron #277427</button>
              <button type="button" className="gilded-pill" onClick={() => selectUserPill(278418)}>Patron #278418</button>
              <button type="button" className="gilded-pill" onClick={() => selectUserPill(6251)}>Patron #6251</button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="books-container">
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '1.8rem', borderRadius: '16px', color: '#fca5a5', marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Patron Not Located</h3>
            <p>{error}</p>
          </div>
        )}

        {resultData && (
          <>
            {/* Dossier Banner */}
            <div className="reference-banner">
              <div className="brand-monogram" style={{ width: '70px', height: '70px', fontSize: '2rem', flexShrink: 0 }}>
                ⚜
              </div>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--gold-bright)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', marginBottom: '0.4rem' }}>
                  Bibliophile Taste Profile Analyzed
                </div>
                <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '2.2rem', color: 'var(--text-pure)', marginBottom: '0.4rem' }}>
                  Reader Dossier #{resultData.user_id}
                </h2>
                <p style={{ color: 'var(--text-champagne)', fontSize: '1.05rem' }}>
                  Vector mapped against {resultData.neighbor_count} closest reading twins across the Book-Crossing universe.
                </p>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--gold-bright)">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', color: 'var(--text-pure)' }}>
                Customized Literary Predictions for Reader #{resultData.user_id}:
              </h2>
            </div>

            <div className="books-gallery-grid">
              {resultData.recommendations.map((item, idx) => (
                <HardcoverBookCard 
                  key={idx} 
                  book={item} 
                  onInspect={onInspectBook} 
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
