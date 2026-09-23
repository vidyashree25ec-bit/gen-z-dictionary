"""
Flask Backend Server for Gen Z Slang Dictionary
Serves static frontend assets, JSON REST API endpoints,
SQLite database integration, AI NLP explanation & translation services.
"""

from flask import Flask, request, jsonify, send_from_directory
import os
import sys
import database
import nlp_engine

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


# Initialize Flask with root folder as static & template directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR, template_folder=BASE_DIR)

# Initialize and seed SQLite database
database.init_db()

@app.after_request
def add_cors_headers(response):
    """Enable CORS headers for local development and API access."""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

# --- Frontend Serving Routes ---

@app.route('/')
def serve_index():
    """Serve homepage."""
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve CSS, JS, images, and other assets."""
    if os.path.exists(os.path.join(BASE_DIR, filename)):
        return send_from_directory(BASE_DIR, filename)
    return send_from_directory(BASE_DIR, 'index.html')

# --- REST API Endpoints ---

@app.route('/api/health', methods=['GET'])
def health_check():
    """Server health status."""
    return jsonify({
        "status": "healthy",
        "service": "Gen Z Dictionary Flask API",
        "database": "SQLite Connected"
    })

@app.route('/api/slangs', methods=['GET'])
def get_slangs():
    """
    Fetch slang words with filtering & sorting.
    Query params:
      - q: search query keyword
      - category: filter category
      - region: filter region (Global, USA, UK, India, Internet/Online)
      - sort: popularity, views, searches, alpha-asc, alpha-desc, recent, random
    """
    query = request.args.get('q', '')
    category = request.args.get('category', 'All')
    region = request.args.get('region', 'All')
    sort_by = request.args.get('sort', 'popularity')

    slangs = database.get_all_slangs(query=query, category=category, region=region, sort_by=sort_by)
    return jsonify({
        "total": len(slangs),
        "results": slangs
    })

@app.route('/api/slangs/<slang_id>', methods=['GET'])
def get_slang_detail(slang_id):
    """Retrieve details for a single slang and increment view counter."""
    slang = database.get_slang_by_id(slang_id)
    if not slang:
        return jsonify({"error": "Slang word not found"}), 404
    
    database.increment_view_count(slang_id)
    return jsonify(slang)

@app.route('/api/slangs', methods=['POST'])
def create_slang():
    """Add a new custom slang into SQLite database with validation."""
    data = request.get_json() or {}
    result = database.add_slang(data)
    if not result.get('success'):
        return jsonify(result), 400
    return jsonify(result), 201

@app.route('/api/slangs/<slang_id>/vote', methods=['POST'])
def vote_slang_endpoint(slang_id):
    """
    Community voting: helpful or not_helpful.
    Body JSON: {"type": "helpful" | "not_helpful"}
    """
    data = request.get_json() or {}
    vote_type = data.get('type', 'helpful')
    result = database.vote_slang(slang_id, vote_type)
    if not result.get('success'):
        return jsonify(result), 400
    return jsonify(result)

@app.route('/api/trending', methods=['GET'])
def get_trending():
    """Fetch Trending Dashboard metrics and leaderboards."""
    trending_data = database.get_trending_stats()
    return jsonify(trending_data)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Fetch overall aggregate statistics."""
    stats = database.get_overall_stats()
    return jsonify(stats)

# --- AI & NLP Endpoints ---

@app.route('/api/ai/explain', methods=['POST'])
def ai_explain_slang():
    """
    AI-Style Slang Explainer Deep Dive.
    Body JSON: {"query": "word or phrase"}
    """
    data = request.get_json() or {}
    query = data.get('query', '')
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    
    explanation = nlp_engine.explain_slang_term(query)
    return jsonify(explanation)

@app.route('/api/ai/explain-sentence', methods=['POST'])
def ai_explain_sentence():
    """
    Sentence Explainer & Translation.
    Body JSON: {"sentence": "Bro has insane rizz no cap 💀"}
    """
    data = request.get_json() or {}
    sentence = data.get('sentence', '')
    if not sentence:
        return jsonify({"error": "Sentence cannot be empty"}), 400
    
    result = nlp_engine.explain_sentence(sentence)
    return jsonify(result)

@app.route('/api/ai/translate', methods=['POST'])
def ai_translate():
    """
    Bidirectional Slang Translator.
    Body JSON: {
      "text": "...",
      "mode": "to_genz" | "to_english"
    }
    """
    data = request.get_json() or {}
    text = data.get('text', '')
    mode = data.get('mode', 'to_genz')
    if not text:
        return jsonify({"error": "Text cannot be empty"}), 400
    
    result = nlp_engine.translate_text(text, mode)
    return jsonify(result)

@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    """
    Fetch quiz questions with optional difficulty filtering.
    Query params:
      - difficulty: All, Easy, Medium, Hard
    """
    difficulty = request.args.get('difficulty', 'All')
    limit = int(request.args.get('limit', 8))
    questions = database.get_quiz_questions(difficulty=difficulty, limit=limit)
    return jsonify({
        "difficulty": difficulty,
        "count": len(questions),
        "questions": questions
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🔥 Gen Z Dictionary Flask Backend starting on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
