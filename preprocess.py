import os
import pickle
import pandas as pd
import numpy as np

def build_models():
    print("Step 1: Loading CSV files...")
    books = pd.read_csv('BX_Books.csv', sep=';', encoding='latin-1', on_bad_lines='skip', low_memory=False)
    ratings = pd.read_csv('BX-Book-Ratings.csv', sep=';', encoding='latin-1', low_memory=False)

    # Standardize column names
    books.rename(columns={
        'Book-Title': 'Book_Title',
        'Book-Author': 'Book_Author',
        'Year-Of-Publication': 'Year',
        'Publisher': 'Publisher',
        'Image-URL-S': 'Image_URL_S',
        'Image-URL-M': 'Image_URL_M',
        'Image-URL-L': 'Image_URL_L'
    }, inplace=True)
    
    ratings.rename(columns={
        'User-ID': 'User_ID',
        'Book-Rating': 'Book_Rating'
    }, inplace=True)

    # Replace http with https for image URLs to prevent mixed content blocking
    for col in ['Image_URL_S', 'Image_URL_M', 'Image_URL_L']:
        books[col] = books[col].astype(str).str.replace('http://', 'https://', regex=False)

    os.makedirs('data_cache', exist_ok=True)

    print("Step 2: Building Top 50 Popular Books DataFrame...")
    merged = ratings.merge(books, on='ISBN')

    # Calculate number of ratings per title
    num_rating_df = merged.groupby('Book_Title').count()['Book_Rating'].reset_index()
    num_rating_df.rename(columns={'Book_Rating': 'num_ratings'}, inplace=True)

    # Calculate average rating per title (considering explicit ratings > 0 for quality)
    explicit_ratings = merged[merged['Book_Rating'] > 0]
    avg_rating_df = explicit_ratings.groupby('Book_Title')['Book_Rating'].mean().reset_index()
    avg_rating_df.rename(columns={'Book_Rating': 'avg_rating'}, inplace=True)

    # Combine popularity metrics
    popular_df = num_rating_df.merge(avg_rating_df, on='Book_Title')
    # Filter books with at least 80 ratings for solid confidence and variety
    popular_df = popular_df[popular_df['num_ratings'] >= 80].sort_values('avg_rating', ascending=False).head(50)

    # Merge with book details (author, image, publisher, year) and drop duplicates
    popular_df = popular_df.merge(books, on='Book_Title').drop_duplicates('Book_Title')[
        ['Book_Title', 'Book_Author', 'Image_URL_M', 'Image_URL_L', 'num_ratings', 'avg_rating', 'Publisher', 'Year', 'ISBN']
    ]
    popular_df['avg_rating'] = popular_df['avg_rating'].round(2)

    with open('data_cache/popular_df.pkl', 'wb') as f:
        pickle.dump(popular_df, f)
    print(f"  -> Saved {len(popular_df)} top popular books.")

    print("Step 3: Building Collaborative Filtering Matrix (Book-to-Book)...")
    # Active users (users with > 120 ratings)
    user_counts = merged.groupby('User_ID').count()['Book_Rating']
    active_users = user_counts[user_counts > 120].index
    filtered_ratings = merged[merged['User_ID'].isin(active_users)]

    # Frequently rated books (books rated >= 35 times by these active users)
    book_counts = filtered_ratings.groupby('Book_Title').count()['Book_Rating']
    popular_titles = book_counts[book_counts >= 35].index
    final_ratings = filtered_ratings[filtered_ratings['Book_Title'].isin(popular_titles)]

    # Pivot table: Books x Users
    pt = final_ratings.pivot_table(index='Book_Title', columns='User_ID', values='Book_Rating')
    pt.fillna(0, inplace=True)

    print(f"  -> Pivot table shape: {pt.shape} (Books x Users)")

    # Cosine similarity using NumPy
    mat = pt.values
    norms = np.linalg.norm(mat, axis=1, keepdims=True)
    norms[norms == 0] = 1e-10
    normalized_mat = mat / norms
    similarity_scores = np.dot(normalized_mat, normalized_mat.T)

    with open('data_cache/pt.pkl', 'wb') as f:
        pickle.dump(pt, f)

    with open('data_cache/similarity_scores.pkl', 'wb') as f:
        pickle.dump(similarity_scores, f)

    # Book metadata lookup dict for fast display
    print("Step 4: Building Books Metadata Lookup...")
    # Drop duplicates by Book_Title to get clean single metadata
    clean_books = books.drop_duplicates('Book_Title').set_index('Book_Title')
    books_meta = {}
    for title in pt.index:
        if title in clean_books.index:
            row = clean_books.loc[title]
            books_meta[title] = {
                'title': title,
                'author': str(row['Book_Author']),
                'year': str(row['Year']),
                'publisher': str(row['Publisher']),
                'image_url': str(row['Image_URL_M']),
                'image_url_l': str(row['Image_URL_L']),
                'isbn': str(row['ISBN'])
            }
        else:
            books_meta[title] = {
                'title': title,
                'author': 'Unknown',
                'year': '',
                'publisher': '',
                'image_url': '',
                'image_url_l': '',
                'isbn': ''
            }

    with open('data_cache/books_meta.pkl', 'wb') as f:
        pickle.dump(books_meta, f)

    # Book titles list for search & autocomplete
    book_list = sorted(list(pt.index))
    with open('data_cache/book_list.pkl', 'wb') as f:
        pickle.dump(book_list, f)

    print("Step 5: Building User-Based Collaborative Model cache...")
    # Filter users with at least 50 ratings and popular books with >= 50 ratings
    combine_rating = ratings.groupby('ISBN')['Book_Rating'].count()
    popular_isbns = combine_rating[combine_rating >= 80].index
    user_ratings = ratings[ratings['ISBN'].isin(popular_isbns)]
    
    # Active users
    u_counts = user_ratings.groupby('User_ID')['Book_Rating'].count()
    valid_users = u_counts[u_counts >= 15].index
    user_filtered = user_ratings[user_ratings['User_ID'].isin(valid_users)]
    
    # User-Item pivot for user-based recommendation
    user_item = user_filtered.pivot_table(index='User_ID', columns='ISBN', values='Book_Rating').fillna(0)
    
    with open('data_cache/user_item.pkl', 'wb') as f:
        pickle.dump(user_item, f)
        
    # ISBN to book details mapping
    isbn_meta = books.drop_duplicates('ISBN').set_index('ISBN')
    isbn_dict = {}
    for isbn in user_item.columns:
        if isbn in isbn_meta.index:
            r = isbn_meta.loc[isbn]
            isbn_dict[isbn] = {
                'title': str(r['Book_Title']),
                'author': str(r['Book_Author']),
                'publisher': str(r['Publisher']),
                'image_url': str(r['Image_URL_M']),
                'isbn': isbn
            }
    with open('data_cache/isbn_dict.pkl', 'wb') as f:
        pickle.dump(isbn_dict, f)

    print("All preprocessing completed successfully! Cache created in data_cache/")

if __name__ == '__main__':
    build_models()
