"""
Gen Z Slang Dictionary - Flask Web Application
===============================================
Full-stack college project using Python Flask backend,
SQLite database, and a modern interactive frontend.

Structure:
  app.py          - Main Flask application (this file)
  database.py     - SQLite database module (CRUD, queries)
  nlp_engine.py   - Rule-based NLP for sentence explanation & translation
  templates/      - Jinja2 HTML templates (index.html)
  static/css/     - Stylesheet (styles.css)
  static/js/      - JavaScript (app.js, data.js)
  static/data/    - JSON data (slang_data.json)
  genz_dictionary.db - SQLite database (575+ slang entries)

Run:
  python app.py
  OR
  flask run

Visit: http://127.0.0.1:5000
"""

import sys
import os

# Fix Unicode output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from flask import Flask, render_template, request, jsonify
import database
import nlp_engine

# -------------------------------------------------------
# App Initialization
# -------------------------------------------------------
app = Flask(__name__)
app.config['SECRET_KEY'] = 'genz-dictionary-secret-key-2026'

# Initialize and seed the SQLite database on startup
database.init_db()

# -------------------------------------------------------
# CORS Headers (allow local development)
# -------------------------------------------------------
@app.after_request
def add_cors_headers(response):
    """Allow CORS for all routes (useful during local development)."""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

# -------------------------------------------------------
# Frontend Routes
# -------------------------------------------------------
@app.route('/')
def index():
    """Serve the main Gen Z Dictionary homepage via Jinja2 template."""
    return render_template('index.html')

# -------------------------------------------------------
# REST API - Health & Status
# -------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    """Server health check endpoint."""
    stats = database.get_overall_stats()
    return jsonify({
        "status": "healthy",
        "service": "Gen Z Dictionary Flask API",
        "database": "SQLite - Connected",
        "total_slangs": stats.get("total_terms", 0),
        "total_categories": stats.get("total_categories", 0)
    })

# -------------------------------------------------------
# REST API - Slang Dictionary CRUD
# -------------------------------------------------------
@app.route('/api/slangs', methods=['GET'])
def get_slangs():
    """
    Fetch slang entries with optional filtering and sorting.

    Query Parameters:
      q        - Search keyword (word, meaning, tags, example)
      category - Filter by category (e.g. 'Slang Basics', 'Social Media')
      region   - Filter by region (e.g. 'Global', 'USA', 'UK', 'India')
      sort     - Sort order: popularity | recent | alpha-asc | alpha-desc | random

    Returns JSON: { total: int, results: [...] }
    """
    query    = request.args.get('q', '')
    category = request.args.get('category', 'All')
    region   = request.args.get('region', 'All')
    sort_by  = request.args.get('sort', 'popularity')

    slangs = database.get_all_slangs(
        query=query,
        category=category,
        region=region,
        sort_by=sort_by
    )
    return jsonify({
        "total": len(slangs),
        "results": slangs
    })


@app.route('/api/slangs/suggestions', methods=['GET'])
def get_suggestions():
    """
    Return autocomplete suggestions for the search bar.
    Query param: q - partial search term
    Returns top 8 matching word names.
    """
    query = request.args.get('q', '').strip()
    if len(query) < 2:
        return jsonify({"suggestions": []})

    slangs = database.get_all_slangs(query=query, sort_by='popularity')
    suggestions = [
        {
            "id": s["id"],
            "word": s["word"],
            "emoji": s.get("emoji", "💬"),
            "category": s.get("category", "")
        }
        for s in slangs[:8]
    ]
    return jsonify({"suggestions": suggestions})


@app.route('/api/slangs/<slang_id>', methods=['GET'])
def get_slang_detail(slang_id):
    """
    Get full details of a single slang word by its ID.
    Also increments the view counter in the database.
    """
    slang = database.get_slang_by_id(slang_id)
    if not slang:
        return jsonify({"error": "Slang not found"}), 404
    database.increment_view_count(slang_id)
    return jsonify(slang)


@app.route('/api/slangs', methods=['POST'])
def add_slang():
    """
    Add a new custom slang word to the SQLite database.

    Request Body (JSON):
      word, meaning, example  - required
      pronunciation, category, region, emoji, tags, origin  - optional

    Returns: { success: bool, slang: {...} } or error
    """
    data = request.get_json(silent=True) or {}
    result = database.add_slang(data)
    if not result.get('success'):
        return jsonify(result), 400
    return jsonify(result), 201


@app.route('/api/slangs/<slang_id>/vote', methods=['POST'])
def vote_slang(slang_id):
    """
    Submit a community helpfulness vote for a slang entry.
    Request Body: { "type": "helpful" | "not_helpful" }
    """
    data = request.get_json(silent=True) or {}
    vote_type = data.get('type', 'helpful')
    result = database.vote_slang(slang_id, vote_type)
    if not result.get('success'):
        return jsonify(result), 400
    return jsonify(result)

# -------------------------------------------------------
# REST API - Statistics & Trending
# -------------------------------------------------------
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Return aggregate dictionary statistics."""
    return jsonify(database.get_overall_stats())


@app.route('/api/trending', methods=['GET'])
def get_trending():
    """Return trending slang leaderboards: most searched, viewed, voted, newest."""
    return jsonify(database.get_trending_stats())

# -------------------------------------------------------
# REST API - Quiz
# -------------------------------------------------------
@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    """
    Fetch quiz questions with optional difficulty filtering.

    Query Parameters:
      difficulty - All | Easy | Medium | Hard  (default: All)
      limit      - Number of questions to return (default: 8)
    """
    difficulty = request.args.get('difficulty', 'All')
    limit      = int(request.args.get('limit', 8))
    questions  = database.get_quiz_questions(difficulty=difficulty, limit=limit)
    return jsonify({
        "difficulty": difficulty,
        "count": len(questions),
        "questions": questions
    })

# -------------------------------------------------------
# REST API - AI / NLP Features
# -------------------------------------------------------
@app.route('/api/ai/explain', methods=['POST'])
def ai_explain():
    """
    Deep-dive explanation of a slang term using the NLP engine.
    Body: { "query": "brainrot" }
    """
    data = request.get_json(silent=True) or {}
    query = data.get('query', '').strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    return jsonify(nlp_engine.explain_slang_term(query))


@app.route('/api/ai/explain-sentence', methods=['POST'])
def ai_explain_sentence():
    """
    Explain and translate a full Gen Z sentence into plain English.
    Body: { "sentence": "Bro has insane rizz no cap" }
    """
    data = request.get_json(silent=True) or {}
    sentence = data.get('sentence', '').strip()
    if not sentence:
        return jsonify({"error": "Sentence cannot be empty"}), 400
    return jsonify(nlp_engine.explain_sentence(sentence))


@app.route('/api/ai/translate', methods=['POST'])
def ai_translate():
    """
    Bidirectional slang translator.
    Body: { "text": "...", "mode": "to_genz" | "to_english" }
    """
    data = request.get_json(silent=True) or {}
    text = data.get('text', '').strip()
    mode = data.get('mode', 'to_genz')
    if not text:
        return jsonify({"error": "Text cannot be empty"}), 400
    return jsonify(nlp_engine.translate_text(text, mode))

# -------------------------------------------------------
# Entry Point
# -------------------------------------------------------
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("=" * 55)
    print("  Gen Z Dictionary - Flask Backend Ready!")
    print("=" * 55)
    print(f"  Open in browser: http://127.0.0.1:{port}")
    print(f"  SQLite database: genz_dictionary.db")
    print(f"  Templates:       templates/index.html")
    print(f"  Static assets:   static/css/ and static/js/")
    print("  Press Ctrl+C to stop the server.")
    print("=" * 55)
    app.run(host='0.0.0.0', port=port, debug=True)
