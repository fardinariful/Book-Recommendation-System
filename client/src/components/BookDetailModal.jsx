import React, { useEffect } from 'react';
import { handleCoverError } from '../utils/imageFallback';

export default function BookDetailModal({ book, onClose, onFindSimilar }) {
  useEffect(() => {
    if (!book) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [book, onClose]);

  if (!book) return null;

  const title = book.Book_Title || book.title || 'Untitled';
  const author = book.Book_Author || book.author || 'Unknown Author';
  const publisher = book.Publisher || book.publisher || 'Unknown Publisher';
  const year = book.Year || book.year || 'N/A';
  const isbn = book.ISBN || book.isbn || 'N/A';
  const rating = book.avg_rating || book.predicted_rating || book.score || 'Recommended';
  const coverUrl = book.Image_URL_L || book.Image_URL_M || book.image_url || '';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
        
        <div className="modal-cover-wrap">
          <img 
            src={coverUrl} 
            alt={title} 
            className="modal-cover-img"
            onError={(e) => handleCoverError(e, title)}
          />
        </div>

        <div className="modal-details">
          <h3 className="modal-title">{title}</h3>
          <p className="modal-author">by {author}</p>

          <div className="modal-meta-grid">
            <div className="meta-field">
              <span className="meta-label">Publisher</span>
              <span className="meta-value">{publisher}</span>
            </div>
            <div className="meta-field">
              <span className="meta-label">Year of Publication</span>
              <span className="meta-value">{year}</span>
            </div>
            <div className="meta-field">
              <span className="meta-label">ISBN Catalog</span>
              <span className="meta-value">{isbn}</span>
            </div>
            <div className="meta-field">
              <span className="meta-label">Reader Evaluation</span>
              <span className="meta-value">★ {rating}</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn-gilded" 
              style={{ padding: '0.8rem 1.6rem', fontSize: '0.9rem' }}
              onClick={() => {
                onClose();
                onFindSimilar(title);
              }}
            >
              Explore Similar Masterpieces
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
