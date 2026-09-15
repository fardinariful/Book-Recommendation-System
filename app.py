import os
import pickle
import numpy as np
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Load preprocessed cache
CACHE_DIR = os.path.join(os.path.dirname(__file__), 'data_cache')

def load_cache():
    try:
        with open(os.path.join(CACHE_DIR, 'popular_df.pkl'), 'rb') as f:
            popular_df = pickle.load(f)
        with open(os.path.join(CACHE_DIR, 'pt.pkl'), 'rb') as f:
            pt = pickle.load(f)
        with open(os.path.join(CACHE_DIR, 'similarity_scores.pkl'), 'rb') as f:
            similarity_scores = pickle.load(f)
        with open(os.path.join(CACHE_DIR, 'books_meta.pkl'), 'rb') as f:
            books_meta = pickle.load(f)
        with open(os.path.join(CACHE_DIR, 'book_list.pkl'), 'rb') as f:
            book_list = pickle.load(f)
        with open(os.path.join(CACHE_DIR, 'user_item.pkl'), 'rb') as f:
            user_item = pickle.load(f)
        with open(os.path.join(CACHE_DIR, 'isbn_dict.pkl'), 'rb') as f:
            isbn_dict = pickle.load(f)
        return popular_df, pt, similarity_scores, books_meta, book_list, user_item, isbn_dict
    except Exception as e:
        print(f"Cache loading warning: {e}. If cache files are missing, run preprocess.py first.")
        return None, None, None, {}, [], None, {}

popular_df, pt, similarity_scores, books_meta, book_list, user_item, isbn_dict = load_cache()

@app.route('/')
def index():
    if popular_df is None:
        return "Please run `python preprocess.py` to generate the database cache first.", 500
    
    # Convert popular books dataframe to list of dicts
    books = popular_df.to_dict(orient='records')
    return render_template('index.html', books=books)

@app.route('/recommend-book', methods=['GET', 'POST'])
def recommend_book_view():
    if pt is None or similarity_scores is None:
        return "Model cache not loaded. Please run preprocess.py.", 500

    query_title = request.values.get('book_name', '').strip()
    
    if not query_title:
        return render_template('recommend_book.html', selected_book=None)

    # Search for matching title (exact or case-insensitive or substring)
    matched_title = None
    if query_title in pt.index:
        matched_title = query_title
    else:
        # Case insensitive exact match
        for title in pt.index:
            if title.lower() == query_title.lower():
                matched_title = title
                break
        # Substring match fallback
        if not matched_title:
            for title in pt.index:
                if query_title.lower() in title.lower():
                    matched_title = title
                    break

    if not matched_title:
        return render_template(
            'recommend_book.html', 
            selected_book=query_title, 
            error_message=f"We couldn't find '{query_title}' in our collaborative collection. Try picking a title from the suggestions or autocomplete list!"
        )

    # Compute recommendations using precomputed similarity matrix
    idx = np.where(pt.index == matched_title)[0][0]
    similar_indices = sorted(list(enumerate(similarity_scores[idx])), key=lambda x: x[1], reverse=True)[1:7]

    recommendations = []
    for i, score in similar_indices:
        rec_title = pt.index[i]
        meta = books_meta.get(rec_title, {
            'title': rec_title, 'author': 'Unknown', 'year': '', 'publisher': '', 'image_url': '', 'isbn': ''
        })
        recommendations.append({
            'title': meta['title'],
            'author': meta['author'],
            'publisher': meta['publisher'],
            'year': meta['year'],
            'isbn': meta['isbn'],
            'image_url': meta['image_url'],
            'image_url_l': meta.get('image_url_l', meta['image_url']),
            'score': round(float(score), 3),
            'similarity_pct': min(100, int(round(float(score) * 100))),
            'distance': round(float(1 - score), 3)
        })

    query_meta = books_meta.get(matched_title, {
        'title': matched_title, 'author': 'Unknown', 'year': '', 'publisher': '', 'image_url': '', 'isbn': ''
    })

    return render_template(
        'recommend_book.html',
        selected_book=matched_title,
        query_book_meta=query_meta,
        recommendations=recommendations
    )

@app.route('/recommend-user', methods=['GET', 'POST'])
def recommend_user_view():
    if user_item is None:
        return "User matrix cache not loaded. Please run preprocess.py.", 500

    user_id_input = request.values.get('user_id', '').strip()
    if not user_id_input:
        return render_template('recommend_user.html', selected_user=None)

    try:
        target_uid = int(user_id_input)
    except ValueError:
        return render_template(
            'recommend_user.html',
            selected_user=user_id_input,
            error_message="Please enter a valid numeric Reader ID."
        )

    if target_uid not in user_item.index:
        sample_users = list(user_item.index[:8])
        return render_template(
            'recommend_user.html',
            selected_user=target_uid,
            error_message=f"Reader ID #{target_uid} does not have sufficient history in our filtered collaborative matrix. Try exploring one of these active reader IDs: {', '.join(map(str, sample_users))}."
        )

    # Collaborative Filtering for User ID
    u_idx = user_item.index.get_loc(target_uid)
    u_matrix = user_item.values

    # Target user vector
    target_vec = u_matrix[u_idx:u_idx+1]
    
    # Compute cosine similarity with all users
    norms = np.linalg.norm(u_matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1e-10
    target_norm = np.linalg.norm(target_vec)
    if target_norm == 0:
        target_norm = 1e-10

    sim_scores = (np.dot(u_matrix, target_vec.T) / (norms * target_norm)).flatten()
    
    # Top 5 similar users (excluding self)
    k_neighbors = 5
    sorted_neighbor_indices = np.argsort(sim_scores)[::-1]
    similar_user_indices = [idx for idx in sorted_neighbor_indices if idx != u_idx][:k_neighbors]

    # Calculate mean rating of similar users for books
    neighbor_ratings = user_item.iloc[similar_user_indices]
    mean_ratings = neighbor_ratings.mean(axis=0)

    # Filter out books the target user has already rated (>0)
    target_rated_isbns = set(user_item.columns[user_item.iloc[u_idx] > 0])
    unrated_means = mean_ratings[~mean_ratings.index.isin(target_rated_isbns)]

    # If all were rated or unrated is small, fall back to highest rated among neighbors
    candidates = unrated_means if len(unrated_means) >= 6 else mean_ratings
    top_recommended_isbns = candidates.sort_values(ascending=False).head(8)

    recommendations = []
    for isbn, pred_val in top_recommended_isbns.items():
        info = isbn_dict.get(isbn, {
            'title': f'Book (ISBN: {isbn})',
            'author': 'Unknown',
            'publisher': 'Unknown',
            'image_url': '',
            'isbn': isbn
        })
        recommendations.append({
            'isbn': isbn,
            'title': info['title'],
            'author': info['author'],
            'publisher': info['publisher'],
            'image_url': info['image_url'],
            'predicted_rating': round(float(pred_val), 2)
        })

    return render_template(
        'recommend_user.html',
        selected_user=target_uid,
        neighbor_count=k_neighbors,
        recommendations=recommendations
    )

@app.route('/api/search')
def api_search():
    query = request.args.get('q', '').strip().lower()
    if not query or not book_list:
        return jsonify({'results': []})
    
    # Prefix match prioritized over substring match
    prefix_matches = [b for b in book_list if b.lower().startswith(query)]
    contains_matches = [b for b in book_list if query in b.lower() and not b.lower().startswith(query)]
    
    combined = (prefix_matches + contains_matches)[:10]
    return jsonify({'results': combined})

@app.route('/api/recommend-book')
def api_recommend_book():
    title = request.args.get('book_name', '').strip()
    if not title or pt is None:
        return jsonify({'error': 'Invalid request or model not ready'}), 400

    if title not in pt.index:
        return jsonify({'error': f"Book '{title}' not found"}), 404

    idx = np.where(pt.index == title)[0][0]
    similar_indices = sorted(list(enumerate(similarity_scores[idx])), key=lambda x: x[1], reverse=True)[1:7]

    results = []
    for i, score in similar_indices:
        t = pt.index[i]
        meta = books_meta.get(t, {'title': t, 'author': 'Unknown', 'image_url': ''})
        results.append({
            'title': meta['title'],
            'author': meta['author'],
            'image_url': meta['image_url'],
            'score': round(float(score), 3)
        })

    return jsonify({'query': title, 'recommendations': results})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting Libraria Web Server at http://127.0.0.1:{port} ...")
    app.run(host='127.0.0.1', port=port, debug=False)
