export function getFallbackBookCover(title = 'Classic Volume') {
  const escapedTitle = (title || 'Classic Volume')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="330" viewBox="0 0 220 330">
    <defs>
      <linearGradient id="leatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#182232"/>
        <stop offset="50%" stop-color="#0e141f"/>
        <stop offset="100%" stop-color="#080b12"/>
      </linearGradient>
      <linearGradient id="foilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fae29c"/>
        <stop offset="50%" stop-color="#d4af37"/>
        <stop offset="100%" stop-color="#916d12"/>
      </linearGradient>
    </defs>
    <rect width="220" height="330" fill="url(#leatherGrad)" rx="8"/>
    <rect x="10" y="10" width="200" height="310" fill="none" stroke="url(#foilGrad)" stroke-width="1.5" rx="5" opacity="0.8"/>
    <rect x="14" y="14" width="192" height="302" fill="none" stroke="url(#foilGrad)" stroke-width="0.75" stroke-dasharray="4,3" rx="4" opacity="0.6"/>
    <rect x="0" y="0" width="16" height="330" fill="#05070a" opacity="0.65"/>
    <line x1="16" y1="0" x2="16" y2="330" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <circle cx="110" cy="78" r="22" fill="none" stroke="url(#foilGrad)" stroke-width="1.2"/>
    <text x="110" y="85" fill="url(#foilGrad)" font-size="20" text-anchor="middle" font-family="'Cinzel Decorative', serif">⚜</text>
    <foreignObject x="22" y="115" width="176" height="135">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color:#f6f3eb;font-family:'Cormorant Garamond',serif;font-weight:600;font-size:15px;text-align:center;line-height:1.3;display:flex;align-items:center;justify-content:center;height:100%;">
        ${escapedTitle}
      </div>
    </foreignObject>
    <text x="110" y="295" fill="url(#foilGrad)" font-size="9" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" letter-spacing="2.5" font-weight="600">ATHENAEUM ARCHIVE</text>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function handleCoverError(e, title) {
  e.target.onerror = null;
  e.target.src = getFallbackBookCover(title);
}
