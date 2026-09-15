import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TopBooksView from './components/TopBooksView';
import RecommendBookView from './components/RecommendBookView';
import RecommendUserView from './components/RecommendUserView';
import BookDetailModal from './components/BookDetailModal';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('top50');
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspectingBook, setInspectingBook] = useState(null);
  const [prefilledBookQuery, setPrefilledBookQuery] = useState('');

  // Fetch top 50 popular books on load
  useEffect(() => {
    async function fetchPopular() {
      try {
        const res = await fetch('/api/popular');
        const data = await res.json();
        if (data.books) {
          setPopularBooks(data.books);
        } else {
          setError(data.error || 'Failed to load popular books');
        }
      } catch (err) {
        console.error('Failed to load books from /api/popular:', err);
        setError('Could not connect to Libraria Backend Server.');
      } finally {
        setLoading(false);
      }
    }
    fetchPopular();
  }, []);

  const handleFindSimilarFromModal = (title) => {
    setPrefilledBookQuery(title);
    setActiveTab('recommend-book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="ambient-glow-line"></div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '10rem 1rem', color: 'var(--gold-bright)' }}>
            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-regal)', marginBottom: '1rem' }}>⚜</div>
            <p style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.8rem', color: 'var(--text-cream)' }}>
              Opening the Grand Athenaeum Archives...
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '8rem 1rem', color: '#fca5a5' }}>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', marginBottom: '1rem' }}>Archive Temporarily Unavailable</h2>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'top50' && (
              <TopBooksView 
                books={popularBooks} 
                onInspectBook={setInspectingBook} 
              />
            )}

            {activeTab === 'recommend-book' && (
              <RecommendBookView 
                initialQuery={prefilledBookQuery}
                onInspectBook={setInspectingBook}
              />
            )}

            {activeTab === 'recommend-user' && (
              <RecommendUserView 
                onInspectBook={setInspectingBook}
              />
            )}
          </>
        )}
      </main>

      {inspectingBook && (
        <BookDetailModal 
          book={inspectingBook}
          onClose={() => setInspectingBook(null)}
          onFindSimilar={handleFindSimilarFromModal}
        />
      )}

      <Footer />
    </>
  );
}
