import json

def update_notebook():
    nb_path = 'Book Recommendation System.ipynb'
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    for cell in nb['cells']:
        if cell.get('cell_type') != 'code':
            continue
        src = ''.join(cell.get('source', []))

        # Cell 1: Colab drive mount
        if 'drive.mount' in src:
            cell['source'] = [
                "# Environment setup: Supports both Local execution and Google Colab\n",
                "try:\n",
                "    from google.colab import drive\n",
                "    drive.mount('/content/drive')\n",
                "except Exception:\n",
                "    print('Running in local environment (Colab drive mount skipped).')\n"
            ]

        # Cell 3: Loading CSV files
        elif 'books=pd.read_csv' in src:
            cell['source'] = [
                "import os\n",
                "# Use local CSV if present, otherwise fallback to Colab path\n",
                "books_file = 'BX_Books.csv' if os.path.exists('BX_Books.csv') else '/content/drive/MyDrive/Colab Notebooks/BX_Books.csv'\n",
                "rating_file = 'BX-Book-Ratings.csv' if os.path.exists('BX-Book-Ratings.csv') else '/content/drive/MyDrive/Colab Notebooks/BX-Book-Ratings.csv'\n",
                "users_file = 'BX-Users.csv' if os.path.exists('BX-Users.csv') else '/content/drive/MyDrive/Colab Notebooks/BX-Users.csv'\n",
                "\n",
                "books = pd.read_csv(books_file, sep=';', encoding='latin-1', on_bad_lines='skip', low_memory=False)\n",
                "rating = pd.read_csv(rating_file, sep=';', encoding='latin-1', low_memory=False)\n",
                "users = pd.read_csv(users_file, sep=';', encoding='latin-1', low_memory=False)\n"
            ]

        # Cell 37: get_top_recommendations
        elif 'def get_top_recommendations' in src:
            cell['source'] = [
                "def get_top_recommendations(User_ID, k=3):\n",
                "    user_index = user_item.index.get_loc(User_ID)\n",
                "    distances, indices = knn.kneighbors(matrix[user_index], n_neighbors=k+1)\n",
                "    similar_users = indices.flatten()[1:]\n",
                "    # Mean ratings across similar users as predicted score\n",
                "    recommended_books_series = user_item.iloc[similar_users].mean().sort_values(ascending=False).head(10)\n",
                "    \n",
                "    # Properly align book details with sorted recommendation order\n",
                "    rec_df = pd.DataFrame({'ISBN': recommended_books_series.index, 'predicted_rating': recommended_books_series.values})\n",
                "    details = books.drop_duplicates('ISBN')[['ISBN', 'Book_Title', 'Publisher', 'Image_URL_S']]\n",
                "    recommendations = rec_df.merge(details, on='ISBN', how='left')\n",
                "    \n",
                "    return recommendations\n"
            ]

        # Cell 38: display_recommendations
        elif 'def display_recommendations' in src:
            cell['source'] = [
                "def display_recommendations(recommendations):\n",
                "    for index, row in recommendations.iterrows():\n",
                "        print(f\"Title: {row['Book_Title']}\")\n",
                "        print(f\"Publisher: {row['Publisher']}\")\n",
                "        print(f\"Predicted Rating: {row['predicted_rating']:.2f}\")\n",
                "        print(\"---\")\n"
            ]

    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1)
    print("Notebook successfully updated with bug fixes and local compatibility!")

if __name__ == '__main__':
    update_notebook()
