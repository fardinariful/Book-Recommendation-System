import React from 'react';
import { handleCoverError } from '../utils/imageFallback';

export default function CuratorHero({ spotlightBook, onInspectBook }) {
  return (
    <section className="hero-spotlight">
      <div className="spotlight-frame">
        <div className="hero-editorial-left">
          <div className="hero-pill-tag">
            ✦ The Curator's Archive • Edition 2026 ✦
          </div>
          <h1 className="hero-headline">
            Where Timeless Stories <em>Resonate Across Generations</em>
          </h1>
          <p className="hero-dek">
            Enter an algorithmic sanctuary curated from over 1.1 million reader assessments. Uncover fifty towering literary triumphs distinguished by narrative power and critical reverence.
          </p>

          <div className="hero-stats-row">
            <div className="hero-stat-block">
              <span className="stat-metric">270,000+</span>
              <span className="stat-desc">Rare &amp; Classic Volumes</span>
            </div>
            <div className="hero-stat-block">
              <span className="stat-metric">1,149,000+</span>
              <span className="stat-desc">Reader Assessments</span>
            </div>
            <div className="hero-stat-block">
              <span className="stat-metric">278,000+</span>
              <span className="stat-desc">Global Bibliophiles</span>
            </div>
          </div>
        </div>

        {spotlightBook && (
          <div className="hero-spotlight-book">
            <div 
              className="spotlight-book-card" 
              onClick={() => onInspectBook(spotlightBook)}
              title="Click to view details"
            >
              <div className="bookmark-ribbon"></div>
              <div className="spotlight-cover-wrap">
                <img 
                  src={spotlightBook.Image_URL_L || spotlightBook.Image_URL_M} 
                  alt={spotlightBook.Book_Title} 
                  className="spotlight-cover-img"
                  onError={(e) => handleCoverError(e, spotlightBook.Book_Title)}
                />
              </div>
              <div className="spotlight-curator-label">
                ★ #1 Highest Rated Masterpiece
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
