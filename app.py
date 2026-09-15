import os
import pickle
import numpy as np
from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__)

# Enable CORS for all routes (React client integration)
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

# Load preprocessed cache
CACHE_DIR = os.path.join(os.path.dirname(__file__), 'data_cache')
CLIENT_DIST = os.path.join(os.path.dirname(__file__), 'client', 'dist')

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

# ==========================================
# REST API ENDPOINTS (FOR REACT APPLICATION)
# ==========================================

@app.route('/api/popular')
def api_popular():
    if popular_df is None:
        return jsonify({'error': 'Cache not loaded. Please run preprocess.py.'}), 500
    books = popular_df.to_dict(orient='records')
    return jsonify({'books': books})

@app.route('/api/search')
def api_search():
    query = request.args.get('q', '').strip().lower()
    if not query or not book_list:
        return jsonify({'results': []})
    
    prefix_matches = [b for b in book_list if b.lower().startswith(query)]
    contains_matches = [b for b in book_list if query in b.lower() and not b.lower().startswith(query)]
    
    combined = (prefix_matches + contains_matches)[:12]
    return jsonify({'results': combined})

@app.route('/api/recommend-book', methods=['GET', 'POST'])
def api_recommend_book():
    if pt is None or similarity_scores is None:
        return jsonify({'error': 'Model cache not ready. Please run preprocess.py.'}), 500

    if request.is_json:
        data = request.get_json()
        query_title = data.get('book_name', '').strip()
    else:
        query_title = request.values.get('book_name', '').strip()

    if not query_title:
        return jsonify({'error': 'Please provide a valid book title.'}), 400

    # Match book title (exact, case-insensitive, or substring)
    matched_title = None
    if query_title in pt.index:
        matched_title = query_title
    else:
        for title in pt.index:
            if title.lower() == query_title.lower():
                matched_title = title
                break
        if not matched_title:
            for title in pt.index:
                if query_title.lower() in title.lower():
                    matched_title = title
                    break

    if not matched_title:
        return jsonify({
            'error': f"We couldn't locate '{query_title}' in the collaborative archive. Try searching another title.",
            'matched': False
        }), 404

    # Calculate recommendations
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

    return jsonify({
        'query_title': matched_title,
        'query_book_meta': query_meta,
        'recommendations': recommendations
    })

@app.route('/api/recommend-user', methods=['GET', 'POST'])
def api_recommend_user():
    if user_item is None:
        return jsonify({'error': 'User matrix cache not ready.'}), 500

    if request.is_json:
        data = request.get_json()
        user_id_input = str(data.get('user_id', '')).strip()
    else:
        user_id_input = str(request.values.get('user_id', '')).strip()

    if not user_id_input:
        return jsonify({'error': 'Please provide a reader ID.'}), 400

    try:
        target_uid = int(user_id_input)
    except ValueError:
        return jsonify({'error': 'Reader ID must be a numeric integer.'}), 400

    if target_uid not in user_item.index:
        sample_users = list(user_item.index[:8])
        return jsonify({
            'error': f'Reader ID #{target_uid} was not located in our filtered matrix.',
            'sample_users': sample_users
        }), 404

    # Collaborative Filtering for User ID
    u_idx = user_item.index.get_loc(target_uid)
    u_matrix = user_item.values
    target_vec = u_matrix[u_idx:u_idx+1]
    
    norms = np.linalg.norm(u_matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1e-10
    target_norm = np.linalg.norm(target_vec)
    if target_norm == 0:
        target_norm = 1e-10

    sim_scores = (np.dot(u_matrix, target_vec.T) / (norms * target_norm)).flatten()
    k_neighbors = 5
    sorted_neighbor_indices = np.argsort(sim_scores)[::-1]
    similar_user_indices = [idx for idx in sorted_neighbor_indices if idx != u_idx][:k_neighbors]

    neighbor_ratings = user_item.iloc[similar_user_indices]
    mean_ratings = neighbor_ratings.mean(axis=0)

    target_rated_isbns = set(user_item.columns[user_item.iloc[u_idx] > 0])
    unrated_means = mean_ratings[~mean_ratings.index.isin(target_rated_isbns)]

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

    return jsonify({
        'user_id': target_uid,
        'neighbor_count': k_neighbors,
        'recommendations': recommendations
    })

# ==========================================
# STATIC / FALLBACK ROUTES
# ==========================================

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_app(path):
    # If React production build exists in client/dist, serve it!
    if os.path.exists(os.path.join(CLIENT_DIST, path)) and path != "":
        return send_from_directory(CLIENT_DIST, path)
    if os.path.exists(os.path.join(CLIENT_DIST, 'index.html')):
        return send_from_directory(CLIENT_DIST, 'index.html')
    
    # Fallback to Jinja templates if client/dist is not yet built
    if popular_df is not None:
        books = popular_df.to_dict(orient='records')
        return render_template('index.html', books=books)
    return "Libraria Backend API is running."

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting Libraria Web Server at http://127.0.0.1:{port} ...")
    app.run(host='127.0.0.1', port=port, debug=False)
