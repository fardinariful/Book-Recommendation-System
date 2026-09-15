/**
 * Libraria — The Editorial Literary Sanctuary
 * Interactive View Modes (Gallery vs Bookshelf), Category Filtering, 
 * Autocomplete, Live Filter, Book Modal, and SVG Leather Cover Fallback
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initLiveFilter();
  initAutocomplete();
  initModalClose();
});

// Mobile Menu Toggle
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const links = document.getElementById('navLinks');
  if (btn && links) {
    btn.addEventListener('click', () => {
      links.classList.toggle('show');
    });
  }
}

// Live Search Filter for Top 50 books page
function initLiveFilter() {
  const filterInput = document.getElementById('liveFilterInput');
  const grid = document.getElementById('booksDisplayGrid');
  const notice = document.getElementById('noResultsNotice');

  if (!filterInput || !grid) return;

  filterInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const cards = grid.querySelectorAll('.hardcover-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const author = (card.getAttribute('data-author') || '').toLowerCase();
      const year = (card.getAttribute('data-year') || '').toLowerCase();

      if (!query || title.includes(query) || author.includes(query) || year.includes(query)) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (notice) {
      notice.style.display = (visibleCount === 0) ? 'block' : 'none';
    }
  });
}

// Mood / Category Filter for Top 50 Books
function filterByMood(category, btnElement) {
  // Update active chip state
  document.querySelectorAll('.mood-chip').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const grid = document.getElementById('booksDisplayGrid');
  const notice = document.getElementById('noResultsNotice');
  if (!grid) return;

  const cards = grid.querySelectorAll('.hardcover-card');
  let visibleCount = 0;

  const keywords = {
    fantasy: ['potter', 'rings', 'hobbit', 'tower', 'dragon', 'dune', 'magic', 'fellowship', 'two towers', 'return of the king', 'chronicles'],
    classics: ['1984', 'prince', 'farm', 'mockingbird', 'catcher', 'brave new', 'fahrenheit', 'gatsby', 'odyssey', 'iliad', 'steinbeck'],
    mystery: ['vinci', 'angels', 'demons', 'jurassic', 'grisham', 'patterson', 'king', 'clancy', 'silence', 'firm', 'pelican', 'chamber'],
    human: ['web', 'tuesdays', 'morrie', 'notebook', 'bridges', 'madison', 'secret life', 'bees', 'walk to remember', 'charlotte', 'alchemist']
  };

  cards.forEach(card => {
    const title = (card.getAttribute('data-title') || '').toLowerCase();
    const author = (card.getAttribute('data-author') || '').toLowerCase();

    if (category === 'all') {
      card.style.display = 'flex';
      visibleCount++;
      return;
    }

    const list = keywords[category] || [];
    const matches = list.some(word => title.includes(word) || author.includes(word));

    if (matches) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (notice) {
    notice.style.display = (visibleCount === 0) ? 'block' : 'none';
  }
}

// Switch View Mode: Gallery vs Library Shelf
function switchViewMode(mode) {
  const grid = document.getElementById('booksDisplayGrid');
  const galleryBtn = document.getElementById('galleryViewBtn');
  const shelfBtn = document.getElementById('bookshelfViewBtn');

  if (!grid) return;

  if (mode === 'bookshelf') {
    galleryBtn.classList.remove('active');
    shelfBtn.classList.add('active');

    // Group cards into shelf tiers (6 books per shelf)
    const cards = Array.from(grid.querySelectorAll('.hardcover-card'));
    grid.className = 'bookshelf-mode-grid';
    grid.innerHTML = '';

    const chunkSize = 6;
    for (let i = 0; i < cards.length; i += chunkSize) {
      const shelfTier = document.createElement('div');
      shelfTier.className = 'shelf-tier';
      cards.slice(i, i + chunkSize).forEach(c => shelfTier.appendChild(c));
      grid.appendChild(shelfTier);
    }
  } else {
    shelfBtn.classList.remove('active');
    galleryBtn.classList.add('active');

    // Restore standard 3D gallery grid
    const cards = Array.from(grid.querySelectorAll('.hardcover-card'));
    grid.className = 'books-gallery-grid';
    grid.innerHTML = '';
    cards.forEach(c => grid.appendChild(c));
  }
}

// Book search autocomplete
function initAutocomplete() {
  const input = document.getElementById('bookSearchInput');
  const dropdown = document.getElementById('bookAutocompleteList');

  if (!input || !dropdown) return;

  let debounceTimer;
  let activeIndex = -1;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = input.value.trim();

    if (query.length < 2) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        dropdown.innerHTML = '';
        activeIndex = -1;

        if (data.results && data.results.length > 0) {
          data.results.forEach(title => {
            const item = document.createElement('div');
            item.className = 'autocomplete-row';
            item.textContent = title;
            item.addEventListener('click', () => {
              input.value = title;
              dropdown.style.display = 'none';
              document.getElementById('bookRecommendForm').submit();
            });
            dropdown.appendChild(item);
          });
          dropdown.style.display = 'block';
        } else {
          dropdown.style.display = 'none';
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    }, 200);
  });

  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.autocomplete-row');
    if (!items.length || dropdown.style.display === 'none') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      updateActiveRow(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateActiveRow(items);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      items[activeIndex].click();
    }
  });

  function updateActiveRow(items) {
    items.forEach((item, idx) => {
      if (idx === activeIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

// Book Details Modal
function openBookModal(card) {
  const title = card.getAttribute('data-title') || 'Untitled';
  const author = card.getAttribute('data-author') || 'Unknown Author';
  const publisher = card.getAttribute('data-publisher') || 'Unknown Publisher';
  const year = card.getAttribute('data-year') || 'N/A';
  const isbn = card.getAttribute('data-isbn') || 'N/A';
  const rating = card.getAttribute('data-rating') || 'N/A';
  const cover = card.getAttribute('data-cover') || '';

  openBookModalFromData(title, author, publisher, year, isbn, rating, cover);
}

function openBookModalFromData(title, author, publisher, year, isbn, rating, cover) {
  const modal = document.getElementById('bookModal');
  if (!modal) return;

  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalAuthor').textContent = 'by ' + author;
  document.getElementById('modalPublisher').textContent = publisher;
  document.getElementById('modalYear').textContent = year;
  document.getElementById('modalIsbn').textContent = isbn;
  document.getElementById('modalRating').textContent = '★ ' + rating;

  const coverImg = document.getElementById('modalCover');
  coverImg.src = cover;

  const recBtn = document.getElementById('modalRecommendBtn');
  if (recBtn) {
    recBtn.href = `/recommend-book?book_name=${encodeURIComponent(title)}`;
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function initModalClose() {
  const modal = document.getElementById('bookModal');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
}

// Fallback image generator for broken cover URLs: High-End Gold Foil Leather Jacket
function handleImageError(img, title) {
  img.onerror = null;
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
    <!-- Outer Gilded Filigree Border -->
    <rect x="10" y="10" width="200" height="310" fill="none" stroke="url(#foilGrad)" stroke-width="1.5" rx="5" opacity="0.8"/>
    <rect x="14" y="14" width="192" height="302" fill="none" stroke="url(#foilGrad)" stroke-width="0.75" stroke-dasharray="4,3" rx="4" opacity="0.6"/>
    <!-- Embossed Spine Indent -->
    <rect x="0" y="0" width="16" height="330" fill="#05070a" opacity="0.65"/>
    <line x1="16" y1="0" x2="16" y2="330" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <!-- Center Seal -->
    <circle cx="110" cy="78" r="22" fill="none" stroke="url(#foilGrad)" stroke-width="1.2"/>
    <text x="110" y="85" fill="url(#foilGrad)" font-size="20" text-anchor="middle" font-family="'Cinzel Decorative', serif">⚜</text>
    <!-- Title -->
    <foreignObject x="22" y="115" width="176" height="135">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color:#f6f3eb;font-family:'Cormorant Garamond',serif;font-weight:600;font-size:15px;text-align:center;line-height:1.3;display:flex;align-items:center;justify-content:center;height:100%;letter-spacing:-0.2px;">
        ${escapedTitle}
      </div>
    </foreignObject>
    <!-- Bottom Stamp -->
    <text x="110" y="295" fill="url(#foilGrad)" font-size="9" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" letter-spacing="2.5" font-weight="600">ATHENAEUM ARCHIVE</text>
  </svg>`;

  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
