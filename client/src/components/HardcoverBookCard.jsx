import React from 'react';
import { handleCoverError } from '../utils/imageFallback';

export default function HardcoverBookCard({ book, rank, onInspect }) {
  const title = book.Book_Title || book.title || 'Untitled';
  const author = book.Book_Author || book.author || 'Unknown Author';
  const rating = book.avg_rating || book.predicted_rating || book.score;
  const votes = book.num_ratings ? `${book.num_ratings} evaluations` : (book.publisher || '');
  const coverUrl = book.Image_URL_M || book.image_url || '';

  return (
    <article 
      className="hardcover-card"
      onClick={() => onInspect(book)}
      title="Click to view details"
    >
      {rank !== undefined && (
        <div className="gold-rank-stamp">#{rank}</div>
      )}

      {book.similarity_pct && (
        <div className="gold-rank-stamp" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
          {book.similarity_pct}% Match
        </div>
      )}

      <div className="book-jacket">
        <img 
          src={coverUrl} 
          alt={title} 
          className="book-jacket-img"
          loading="lazy"
          onError={(e) => handleCoverError(e, title)}
        />
      </div>

      <div className="card-content">
        <h3 className="card-title" title={title}>{title}</h3>
        <p className="card-author">by {author}</p>

        <div className="card-footer">
          {rating ? (
            <div className="rating-gauge">
              <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span>{rating} {rating <= 10 ? '/ 10' : ''}</span>
            </div>
          ) : (
            <span style={{ color: 'var(--gold-bright)', fontSize: '0.8rem' }}>Recommended</span>
          )}
          <span className="review-tally">{votes}</span>
        </div>
      </div>
    </article>
  );
}
