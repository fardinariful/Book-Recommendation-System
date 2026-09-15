import React, { useState, useMemo } from 'react';
import CuratorHero from './CuratorHero';
import HardcoverBookCard from './HardcoverBookCard';

export default function TopBooksView({ books, onInspectBook }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery' or 'bookshelf'

  const moodKeywords = {
    fantasy: ['potter', 'rings', 'hobbit', 'tower', 'dragon', 'dune', 'magic', 'fellowship', 'two towers', 'return of the king', 'chronicles'],
    classics: ['1984', 'prince', 'farm', 'mockingbird', 'catcher', 'brave new', 'fahrenheit', 'gatsby', 'odyssey', 'iliad', 'steinbeck'],
    mystery: ['vinci', 'angels', 'demons', 'jurassic', 'grisham', 'patterson', 'king', 'clancy', 'silence', 'firm', 'pelican', 'chamber'],
    human: ['web', 'tuesdays', 'morrie', 'notebook', 'bridges', 'madison', 'secret life', 'bees', 'walk to remember', 'charlotte', 'alchemist']
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const title = (book.Book_Title || '').toLowerCase();
      const author = (book.Book_Author || '').toLowerCase();
      const year = String(book.Year || '').toLowerCase();

      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || title.includes(q) || author.includes(q) || year.includes(q);

      if (!matchesSearch) return false;

      // Mood match
      if (selectedMood === 'all') return true;
      const keywords = moodKeywords[selectedMood] || [];
      return keywords.some((kw) => title.includes(kw) || author.includes(kw));
    });
  }, [books, searchQuery, selectedMood]);

  // Group into tiers of 6 for bookshelf mode
  const shelfTiers = useMemo(() => {
    const tiers = [];
    const chunkSize = 6;
    for (let i = 0; i < filteredBooks.length; i += chunkSize) {
      tiers.push(filteredBooks.slice(i, i + chunkSize));
    }
    return tiers;
  }, [filteredBooks]);

  const spotlight = books.length > 0 ? books[0] : null;

  return (
    <>
      <CuratorHero spotlightBook={spotlight} onInspectBook={onInspectBook} />

      <section className="controls-panel">
        <div className="controls-row">
          <div>
            <span className="collection-tagline">Permanent Exhibition</span>
            <h2 className="collection-title">The Top 50 Bestselling Masterpieces</h2>
          </div>

          <div className="controls-interactive-group">
            {/* Live Search */}
            <div className="search-lux-wrap">
              <svg className="search-lux-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                className="search-lux-input" 
                placeholder="Search title, author, year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Switcher */}
            <div className="view-mode-switcher">
              <button 
                type="button" 
                className={`view-btn ${viewMode === 'gallery' ? 'active' : ''}`}
                onClick={() => setViewMode('gallery')}
              >
                <svg viewBox="0 0 24 24"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>
                Gallery View
              </button>
              <button 
                type="button" 
                className={`view-btn ${viewMode === 'bookshelf' ? 'active' : ''}`}
                onClick={() => setViewMode('bookshelf')}
              >
                <svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
                Library Shelf
              </button>
            </div>
          </div>
        </div>

        {/* Mood Filter Chips */}
        <div className="mood-chips-bar">
          <button 
            type="button" 
            className={`mood-chip ${selectedMood === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedMood('all')}
          >
            All Masterpieces ({books.length})
          </button>
          <button 
            type="button" 
            className={`mood-chip ${selectedMood === 'fantasy' ? 'active' : ''}`}
            onClick={() => setSelectedMood('fantasy')}
          >
            Epic Fantasy &amp; Lore
          </button>
          <button 
            type="button" 
            className={`mood-chip ${selectedMood === 'classics' ? 'active' : ''}`}
            onClick={() => setSelectedMood('classics')}
          >
            Philosophy &amp; Society
          </button>
          <button 
            type="button" 
            className={`mood-chip ${selectedMood === 'mystery' ? 'active' : ''}`}
            onClick={() => setSelectedMood('mystery')}
          >
            Mystery &amp; Suspense
          </button>
          <button 
            type="button" 
            className={`mood-chip ${selectedMood === 'human' ? 'active' : ''}`}
            onClick={() => setSelectedMood('human')}
          >
            Memoir &amp; Human Spirit
          </button>
        </div>
      </section>

      {/* Books Container */}
      <section className="books-container">
        {filteredBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', color: 'var(--gold-bright)' }}>
              No literary works matched your query.
            </p>
            <p style={{ fontSize: '0.95rem', marginTop: '0.6rem', color: 'var(--text-champagne)' }}>
              Try adjusting your search terms or select another collection filter.
            </p>
          </div>
        ) : viewMode === 'gallery' ? (
          <div className="books-gallery-grid">
            {filteredBooks.map((book, idx) => (
              <HardcoverBookCard 
                key={book.ISBN || idx} 
                book={book} 
                rank={idx + 1} 
                onInspect={onInspectBook} 
              />
            ))}
          </div>
        ) : (
          <div className="bookshelf-mode-grid">
            {shelfTiers.map((tier, tierIdx) => (
              <div key={tierIdx} className="shelf-tier">
                {tier.map((book, bIdx) => (
                  <HardcoverBookCard 
                    key={book.ISBN || bIdx} 
                    book={book} 
                    rank={tierIdx * 6 + bIdx + 1} 
                    onInspect={onInspectBook} 
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
