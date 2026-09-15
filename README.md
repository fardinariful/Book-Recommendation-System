# 📚 Libraria - Intelligent Book Recommendation System

> A luxury, dark-academia inspired full-stack web application powered by Machine Learning and Collaborative Filtering algorithms. Curated from over **270,000 books**, **1.1+ million user ratings**, and **278,000 readers** from the Book-Crossing dataset.

---

## 🌟 Key Features

1. **Top 50 Popular & Highest-Rated Books**:
   - Curated showcase of the top 50 highest-rated masterpieces (with a threshold of explicit ratings to ensure genuine quality).
   - Real-time client-side live filter by title or author name without page reload.
   - 3D embossed book spine presentation with gold rank badges (#1 to #50), star ratings, and review counts.

2. **Item-Based Collaborative Filtering (Recommend by Book)**:
   - Search across 1,700+ popular books with instant live autocomplete.
   - Quick one-click suggestion pills for classics (*1984*, *Harry Potter*, *The Da Vinci Code*, *The Hobbit*, *The Catcher in the Rye*, etc.).
   - Computes cosine similarity across reader preference vectors in real-time, returning the top 6 most similar literary works with match percentages.

3. **User-Based Collaborative Filtering (Personalized Recommendation)**:
   - Personalized reader recommendations using K-Nearest Neighbors (KNN) user similarity.
   - Identifies "reading twins" with similar tastes and recommends unread books with predicted rating scores out of 10.
   - Supports quick testing with active reader IDs (e.g., `#254`, `#14`, `#16`, `#277427`).

4. **Book Details Modal**:
   - Click on any book card to inspect publisher, publication year, ISBN, and high-resolution cover artwork.
   - One-click "Find Similar Books" trigger directly from the modal.

5. **Curated Dark Academia / Vintage Library Aesthetics**:
   - Rich mahogany, antique leather, and warm amber gold tones.
   - Ornate typography combining Google Fonts (*Playfair Display* and *Cinzel*) with crisp modern text (*Plus Jakarta Sans*).
   - 100% responsive for smartphones, tablets, and desktop displays.
   - Dynamic SVG fallback book jackets for missing/broken third-party image URLs.

---

## 🚀 Getting Started

### 1. Requirements
- Python 3.9+
- Flask, pandas, numpy

```bash
pip install flask pandas numpy
```

### 2. Preprocess Data & Generate Cache (First Time Only)
Run the precomputation script to generate fast matrix caches:
```bash
python preprocess.py
```
*(This builds precomputed matrices in `data_cache/` so the Flask server boots in under 1 second with instant response times.)*

### 3. Launch the Web Application
```bash
python app.py
```
Open your browser and navigate to:
👉 **[http://127.0.0.1:5001](http://127.0.0.1:5001)**

---

## 🔬 Jupyter Notebook Fixes
The original `Book Recommendation System.ipynb` has been fully corrected:
- Replaced hardcoded Google Drive Colab paths (`/content/drive/...`) with dynamic local path detection.
- Fixed the alignment and row-ordering bug in `get_top_recommendations` so predicted ratings match the correct books.
- Added predicted rating display in `display_recommendations`.
