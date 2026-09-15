from app import app

def test_routes():
    client = app.test_client()
    
    print("Testing GET / ...")
    res = client.get('/')
    assert res.status_code == 200
    assert b'LIBRARIA' in res.data
    assert b'Top 50' in res.data
    print("  -> / status 200 OK")

    print("Testing GET /recommend-book ...")
    res = client.get('/recommend-book')
    assert res.status_code == 200
    print("  -> /recommend-book status 200 OK")

    print("Testing POST /recommend-book with '1984' ...")
    res = client.post('/recommend-book', data={'book_name': '1984'})
    assert res.status_code == 200
    assert b'Animal Farm' in res.data or b'Brave New World' in res.data or b'Score' in res.data
    print("  -> /recommend-book recommendations returned successfully!")

    print("Testing GET /recommend-user ...")
    res = client.get('/recommend-user')
    assert res.status_code == 200
    print("  -> /recommend-user status 200 OK")

    print("Testing POST /recommend-user with active user 254 ...")
    res = client.post('/recommend-user', data={'user_id': '254'})
    assert res.status_code == 200
    assert b'Top Personalized Recommendations' in res.data
    print("  -> /recommend-user recommendations returned successfully!")

    print("Testing GET /api/search?q=harry ...")
    res = client.get('/api/search?q=harry')
    assert res.status_code == 200
    data = res.get_json()
    assert 'results' in data
    print(f"  -> /api/search returned {len(data['results'])} matches")

    print("\nALL FLASK APP TESTS PASSED SUCCESSFULLY! 100% READY!")

if __name__ == '__main__':
    test_routes()
