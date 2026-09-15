import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-editorial">
      <div className="footer-inner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{ fontFamily: 'var(--font-regal)', fontSize: '1.3rem', color: 'var(--gold-bright)', fontWeight: 700 }}>⚜ LIBRARIA ⚜</span>
            <span style={{ color: 'var(--border-card)' }}>|</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>The React Literary Sanctuary</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Powered by React, High-Dimensional Cosine Similarity &amp; Collaborative Matrix Factorization.
          </p>
        </div>

        <div className="footer-quote-editorial">
          "I have always imagined that Paradise will be a kind of a library."
          <div style={{ fontSize: '0.8rem', color: 'var(--gold-bright)', fontStyle: 'normal', letterSpacing: '1px', marginTop: '0.35rem' }}>
            — Jorge Luis Borges
          </div>
        </div>
      </div>
    </footer>
  );
}
