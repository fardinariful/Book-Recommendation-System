import React, { useState, useEffect, useRef } from 'react';
import HardcoverBookCard from './HardcoverBookCard';
import { handleCoverError } from '../utils/imageFallback';

export default function RecommendBookView({ initialQuery, onInspectBook }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  // Trigger search if initialQuery exists
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Autocomplete live fetch
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setAutocompleteResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setAutocompleteResults(data.results);
          setShowDropdown(true);
        } else {
          setShowDropdown(false);
        }
      } catch (err) {
        console.error('Autocomplete fetch error:', err);
      }
    }, 200);
  };

  const handleSearch = async (titleToSearch) => {
    const target = titleToSearch || query;
    if (!target.trim()) return;

    setLoading(true);
    setError(null);
    setShowDropdown(false);

    try {
      const res = await fetch(`/api/recommend-book?book_name=${encodeURIComponent(target.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to retrieve recommendations.');
        setResultData(null);
      } else {
        setResultData(data);
        setQuery(data.query_title);
      }
    } catch (err) {
      setError('Connection error occurred while consulting the Oracle.');
      setResultData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const selectPill = (title) => {
    setQuery(title);
    handleSearch(title);
  };

  return (
    <div style={{ width: '100%' }}>
      <section className="oracle-workbench">
        <div style={{ marginBottom: '2rem' }}>
          <span className="collection-tagline">High-Dimensional Similarity Engine</span>
          <h1 className="collection-title">Item-Based Collaborative Oracle</h1>
        </div>

        {/* Search Pedestal Card */}
        <div className="oracle-card">
          <form className="oracle-form" onSubmit={handleSubmit}>
            <label className="oracle-label" htmlFor="reactBookSearch">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#f5cf68">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              Select or Enter Your Reference Masterpiece:
            </label>

            <div className="oracle-input-bar">
              <input 
                type="text" 
                id="reactBookSearch"
                className="oracle-input" 
                placeholder="Search by title (e.g., 1984, The Da Vinci Code, Harry Potter...)"
                value={query}
                onChange={handleInputChange}
                autoComplete="off"
                required
              />

              <button type="submit" className="btn-gilded" disabled={loading}>
                <span>{loading ? 'Consulting...' : 'Consult the Oracle'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/>
                </svg>
              </button>

              {/* Autocomplete Dropdown */}
              {showDropdown && autocompleteResults.length > 0 && (
                <div className="autocomplete-lux" style={{ display: 'block' }} ref={dropdownRef}>
                  {autocompleteResults.map((title, idx) => (
                    <div 
                      key={idx} 
                      className="autocomplete-row"
                      onClick={() => {
                        setQuery(title);
                        setShowDropdown(false);
                        handleSearch(title);
                      }}
                    >
                      {title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Inspiration Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginTop: '0.5rem' }}>
              <span className="pills-label">Notable Classics:</span>
              <button type="button" className="gilded-pill" onClick={() => selectPill('1984')}>1984</button>
              <button type="button" className="gilded-pill" onClick={() => selectPill('The Da Vinci Code')}>The Da Vinci Code</button>
              <button type="button" className="gilded-pill" onClick={() => selectPill('The Hobbit : The Enchanting Prelude to The Lord of the Rings')}>The Hobbit</button>
              <button type="button" className="gilded-pill" onClick={() => selectPill('The Catcher in the Rye')}>The Catcher in the Rye</button>
              <button type="button" className="gilded-pill" onClick={() => selectPill('To Kill a Mockingbird')}>To Kill a Mockingbird</button>
              <button type="button" className="gilded-pill" onClick={() => selectPill('Angels & Demons')}>Angels &amp; Demons</button>
              <button type="button" className="gilded-pill" onClick={() => selectPill('Harry Potter and the Chamber of Secrets (Book 2)')}>Harry Potter</button>
              <button type="button" className="gilded-pill" onClick={() => selectPill('The Fellowship of the Ring (The Lord of the Rings, Part 1)')}>The Fellowship</button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="books-container">
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '1.8rem', borderRadius: '16px', color: '#fca5a5', marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Volume Not Located</h3>
            <p>{error}</p>
          </div>
        )}

        {resultData && resultData.query_book_meta && (
          <>
            {/* Reference Showcase Banner */}
            <div className="reference-banner">
              <img 
                src={resultData.query_book_meta.image_url_l || resultData.query_book_meta.image_url} 
                alt={resultData.query_book_meta.title} 
                className="reference-cover"
                onError={(e) => handleCoverError(e, resultData.query_book_meta.title)}
              />
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--gold-bright)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', marginBottom: '0.4rem' }}>
                  Chosen Literary Compass
                </div>
                <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '2.2rem', color: 'var(--text-pure)', marginBottom: '0.4rem', lineHeight: '1.2' }}>
                  {resultData.query_book_meta.title}
                </h2>
                <p style={{ color: 'var(--text-champagne)', fontSize: '1.05rem' }}>
                  by <em>{resultData.query_book_meta.author}</em> • Published by {resultData.query_book_meta.publisher} ({resultData.query_book_meta.year})
                </p>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--gold-bright)">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', color: 'var(--text-pure)' }}>
                Readers Who Revered This Work Also Cherished:
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
