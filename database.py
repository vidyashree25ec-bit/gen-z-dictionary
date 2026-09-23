"""
Database Module for Gen Z Dictionary (SQLite)
Manages schema initialization, database seeding with 61+ slang records,
full-text querying, analytics tracking, community feedback, and CRUD operations.
"""

import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'genz_dictionary.db')

def get_db_connection():
    """Establish connection to SQLite with row dictionary factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create tables and seed initial dataset if not already present."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Slangs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS slangs (
            id TEXT PRIMARY KEY,
            word TEXT UNIQUE NOT NULL,
            pronunciation TEXT,
            category TEXT NOT NULL,
            region TEXT NOT NULL DEFAULT 'Global',
            emoji TEXT DEFAULT '💬',
            meaning TEXT NOT NULL,
            example TEXT NOT NULL,
            origin TEXT,
            tags TEXT, -- JSON array of tags
            popularity INTEGER DEFAULT 80,
            search_count INTEGER DEFAULT 0,
            view_count INTEGER DEFAULT 0,
            helpful_count INTEGER DEFAULT 0,
            not_helpful_count INTEGER DEFAULT 0,
            is_custom INTEGER DEFAULT 0,
            date_added TEXT NOT NULL
        )
    ''')

    # 2. Quiz Questions Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quiz_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            options TEXT NOT NULL, -- JSON array of 4 choices
            correct_index INTEGER NOT NULL,
            explanation TEXT NOT NULL,
            difficulty TEXT NOT NULL DEFAULT 'Medium'
        )
    ''')

    # 3. Search & Interaction Analytics Log Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            payload TEXT,
            created_at TEXT NOT NULL
        )
    ''')

    conn.commit()

    # Check if database is already seeded with full dataset (5,500+ items)
    cursor.execute('SELECT COUNT(*) as count FROM slangs')
    row = cursor.fetchone()
    if row['count'] < 5500:
        try:
            import dataset_builder
            dataset_builder.generate_database()
        except Exception as e:
            print(f"Dataset generator notice: {e}")
            seed_slang_data(conn)
        seed_quiz_data(conn)

    conn.close()

def seed_slang_data(conn):
    """Seed comprehensive dataset from slang_data.json if available, or initialize default dataset."""
    json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'slang_data.json')
    initial_slangs = []

    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                initial_slangs = json.load(f)
        except Exception as e:
            print(f"Warning: Could not read slang_data.json: {e}")

    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()

    for item in initial_slangs:
        tags_json = json.dumps(item.get('tags', []))
        cursor.execute('''
            INSERT OR REPLACE INTO slangs (
                id, word, pronunciation, category, region, emoji, meaning, example,
                origin, tags, popularity, search_count, view_count, helpful_count,
                not_helpful_count, is_custom, date_added
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            item['id'],
            item['word'],
            item.get('pronunciation', f"/{item['word'].lower()}/"),
            item.get('category', 'Slang Basics'),
            item.get('region', 'Global'),
            item.get('emoji', '💬'),
            item['meaning'],
            item['example'],
            item.get('origin', ''),
            tags_json,
            item.get('popularity', 85),
            item.get('search_count', 120),
            item.get('view_count', 350),
            item.get('helpful_count', 45),
            item.get('not_helpful_count', 1),
            0,
            now_iso
        ))

    conn.commit()

def seed_quiz_data(conn):
    """Seed dynamic question bank with difficulty tiers."""
    questions = [
        {
            "question": "If someone tells you 'You ate and left no crumbs', what do they mean?",
            "options": json.dumps([
                "You were messy while eating lunch",
                "You did something flawlessly and with great style",
                "You stole food from someone else",
                "You forgot to clean up your kitchen counter"
            ]),
            "correct_index": 1,
            "explanation": "'Ate' means you performed or looked completely perfect!",
            "difficulty": "Easy"
        },
        {
            "question": "What does having 'Rizz' mean?",
            "options": json.dumps([
                "Being extremely good at gaming",
                "Having charm and charisma, especially when flirting",
                "Eating too much junk food",
                "Running fast in track events"
            ]),
            "correct_index": 1,
            "explanation": "'Rizz' is short for charisma, popularized by Kai Cenat.",
            "difficulty": "Easy"
        },
        {
            "question": "When someone says 'Stop the cap', they are accusing you of:",
            "options": json.dumps([
                "Wearing an ugly hat",
                "Lying or exaggerating the truth",
                "Talking too loudly in public",
                "Spending too much money"
            ]),
            "correct_index": 1,
            "explanation": "'Cap' means lie or falsehood; 'No cap' means no lie.",
            "difficulty": "Easy"
        },
        {
            "question": "What happens when you 'Catch the Ick'?",
            "options": json.dumps([
                "You caught a cold from someone",
                "You suddenly find someone you liked completely cringey or unattractive",
                "You won a prize in a video game",
                "You fell in love at first sight"
            ]),
            "correct_index": 1,
            "explanation": "'The Ick' is a sudden feeling of disgust that ruins romantic attraction.",
            "difficulty": "Medium"
        },
        {
            "question": "If your friend says 'I haven't studied and the exam is in 10 minutes, I am cooked', what does 'Cooked' mean?",
            "options": json.dumps([
                "They just finished preparing a gourmet meal",
                "They are doomed and facing guaranteed defeat or failure",
                "They are warm from the sun",
                "They are well prepared and confident"
            ]),
            "correct_index": 1,
            "explanation": "'Cooked' means completely ruined, doomed, or exhausted.",
            "difficulty": "Medium"
        },
        {
            "question": "What does it mean when someone takes the 'Fanum Tax'?",
            "options": json.dumps([
                "They charged you for parking your car",
                "They took a bite of your food without asking",
                "They gave you a compliment on your clothes",
                "They muted you in a group chat"
            ]),
            "correct_index": 1,
            "explanation": "'Fanum Tax' is playfully stealing a bite of your friend's meal!",
            "difficulty": "Hard"
        },
        {
            "question": "What is an 'NPC' in modern internet slang?",
            "options": json.dumps([
                "A famous internet influencer",
                "A person who acts predictably or blindly follows trends without original thought",
                "A non-profit college organization",
                "A computer processor"
            ]),
            "correct_index": 1,
            "explanation": "Derived from Non-Playable Character in gaming, meaning someone behaving automatically.",
            "difficulty": "Medium"
        },
        {
            "question": "If an outfit looks 'Snatched', it means:",
            "options": json.dumps([
                "Someone stole it from a retail store",
                "It looks exceptionally stylish, well-fitted, and flattering",
                "It's torn and ruined",
                "It's too loose and baggy"
            ]),
            "correct_index": 1,
            "explanation": "'Snatched' is high praise for a sharp, flawless look!",
            "difficulty": "Hard"
        },
        {
            "question": "What is 'Jugaad' in student and tech slang?",
            "options": json.dumps([
                "A traditional dance step",
                "A clever, resourceful, low-cost life hack or problem-solving workaround",
                "An expensive university textbook",
                "A type of spicy street food"
            ]),
            "correct_index": 1,
            "explanation": "'Jugaad' is the art of innovative, resourceful hacks to get things done.",
            "difficulty": "Hard"
        }
    ]

    cursor = conn.cursor()
    for q in questions:
        cursor.execute('''
            INSERT INTO quiz_questions (question, options, correct_index, explanation, difficulty)
            VALUES (?, ?, ?, ?, ?)
        ''', (q['question'], q['options'], q['correct_index'], q['explanation'], q['difficulty']))
    conn.commit()

# --- Query Helpers ---

def get_all_slangs(query=None, category=None, region=None, sort_by='popularity'):
    """Fetch and filter slang entries from SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = "SELECT * FROM slangs WHERE 1=1"
    params = []

    if category and category != 'All':
        sql += " AND category = ?"
        params.append(category)

    if region and region != 'All':
        sql += " AND region = ?"
        params.append(region)

    if query:
        q_clean = f"%{query.strip().lower()}%"
        sql += " AND (LOWER(word) LIKE ? OR LOWER(meaning) LIKE ? OR LOWER(example) LIKE ? OR LOWER(tags) LIKE ?)"
        params.extend([q_clean, q_clean, q_clean, q_clean])

    # Sorting
    if sort_by == 'popularity':
        sql += " ORDER BY popularity DESC, helpful_count DESC"
    elif sort_by == 'views':
        sql += " ORDER BY view_count DESC"
    elif sort_by == 'searches':
        sql += " ORDER BY search_count DESC"
    elif sort_by == 'alpha-asc':
        sql += " ORDER BY word ASC"
    elif sort_by == 'alpha-desc':
        sql += " ORDER BY word DESC"
    elif sort_by == 'recent':
        sql += " ORDER BY date_added DESC"
    elif sort_by == 'random':
        sql += " ORDER BY RANDOM()"
    else:
        sql += " ORDER BY popularity DESC"

    cursor.execute(sql, params)
    rows = cursor.fetchall()
    results = []
    for r in rows:
        d = dict(r)
        try:
            d['tags'] = json.loads(d['tags']) if d['tags'] else []
        except Exception:
            d['tags'] = []
        results.append(d)

    conn.close()
    return results

def get_slang_by_id(slang_id):
    """Retrieve single slang by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM slangs WHERE id = ?", (slang_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        d = dict(row)
        try:
            d['tags'] = json.loads(d['tags']) if d['tags'] else []
        except Exception:
            d['tags'] = []
        return d
    return None

def get_slang_by_word(word):
    """Retrieve single slang by exact word (case-insensitive)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM slangs WHERE LOWER(word) = LOWER(?)", (word.strip(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        d = dict(row)
        try:
            d['tags'] = json.loads(d['tags']) if d['tags'] else []
        except Exception:
            d['tags'] = []
        return d
    return None

def add_slang(data):
    """Insert a new custom slang into SQLite with validation and duplicate prevention."""
    word = data.get('word', '').strip()
    meaning = data.get('meaning', '').strip()
    example = data.get('example', '').strip()
    category = data.get('category', 'Slang Basics').strip()
    region = data.get('region', 'Global').strip()
    pronunciation = data.get('pronunciation', '').strip() or f"/{word.lower()}/"
    emoji = data.get('emoji', '💬').strip() or '💬'
    tags = data.get('tags', ['community', 'custom'])
    origin = data.get('origin', 'Community submission via Web App').strip()

    if not word or not meaning or not example:
        return {"success": False, "error": "Word, Meaning, and Example are required fields."}

    # Check for duplicate
    existing = get_slang_by_word(word)
    if existing:
        return {"success": False, "error": f"The slang word '{word}' already exists in the dictionary!"}

    slang_id = data.get('id') or f"custom-{int(datetime.now().timestamp()*1000)}"
    tags_json = json.dumps(tags if isinstance(tags, list) else [t.strip() for t in tags.split(',') if t.strip()])
    now_iso = datetime.now().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO slangs (
                id, word, pronunciation, category, region, emoji, meaning, example,
                origin, tags, popularity, search_count, view_count, helpful_count,
                not_helpful_count, is_custom, date_added
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, 0, 1, ?)
        ''', (
            slang_id, word, pronunciation, category, region, emoji, meaning,
            example, origin, tags_json, 95, now_iso
        ))
        conn.commit()
        conn.close()
        return {"success": True, "slang": get_slang_by_id(slang_id)}
    except Exception as e:
        conn.close()
        return {"success": False, "error": str(e)}

def vote_slang(slang_id, vote_type):
    """Increment helpful or not_helpful vote counter in database."""
    if vote_type not in ['helpful', 'not_helpful']:
        return {"success": False, "error": "Invalid vote type"}

    conn = get_db_connection()
    cursor = conn.cursor()
    column = "helpful_count" if vote_type == "helpful" else "not_helpful_count"
    cursor.execute(f"UPDATE slangs SET {column} = {column} + 1 WHERE id = ?", (slang_id,))
    conn.commit()

    cursor.execute("SELECT helpful_count, not_helpful_count FROM slangs WHERE id = ?", (slang_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "success": True,
            "helpful_count": row['helpful_count'],
            "not_helpful_count": row['not_helpful_count']
        }
    return {"success": False, "error": "Slang not found"}

def increment_view_count(slang_id):
    """Increment view counter."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE slangs SET view_count = view_count + 1 WHERE id = ?", (slang_id,))
    conn.commit()
    conn.close()

def increment_search_count(word_or_id):
    """Increment search counter for matching slang term."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE slangs SET search_count = search_count + 1 WHERE id = ? OR LOWER(word) = LOWER(?)", (word_or_id, word_or_id))
    conn.commit()
    conn.close()

def get_trending_stats():
    """Retrieve top trending metrics from SQLite for the Trending Dashboard."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Top 5 Most Searched
    cursor.execute("SELECT id, word, emoji, category, search_count, popularity FROM slangs ORDER BY search_count DESC LIMIT 5")
    top_searched = [dict(r) for r in cursor.fetchall()]

    # Top 5 Most Viewed
    cursor.execute("SELECT id, word, emoji, category, view_count, popularity FROM slangs ORDER BY view_count DESC LIMIT 5")
    top_viewed = [dict(r) for r in cursor.fetchall()]

    # Top 5 Highest Community Rated (Helpful)
    cursor.execute("SELECT id, word, emoji, category, helpful_count, not_helpful_count FROM slangs ORDER BY helpful_count DESC LIMIT 5")
    top_voted = [dict(r) for r in cursor.fetchall()]

    # Recently Added
    cursor.execute("SELECT id, word, emoji, category, date_added, is_custom FROM slangs ORDER BY date_added DESC LIMIT 5")
    recent_added = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return {
        "top_searched": top_searched,
        "top_viewed": top_viewed,
        "top_voted": top_voted,
        "recent_added": recent_added
    }

def get_quiz_questions(difficulty=None, limit=8):
    """Fetch quiz questions filtered by difficulty or mixed."""
    conn = get_db_connection()
    cursor = conn.cursor()

    if difficulty and difficulty != 'All':
        cursor.execute("SELECT * FROM quiz_questions WHERE difficulty = ? ORDER BY RANDOM() LIMIT ?", (difficulty, limit))
    else:
        cursor.execute("SELECT * FROM quiz_questions ORDER BY RANDOM() LIMIT ?", (limit,))

    rows = cursor.fetchall()
    questions = []
    for r in rows:
        d = dict(r)
        try:
            d['options'] = json.loads(d['options'])
        except Exception:
            d['options'] = []
        questions.append(d)

    conn.close()
    return questions

def get_overall_stats():
    """Fetch aggregated dictionary statistics."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total_terms FROM slangs")
    total_terms = cursor.fetchone()['total_terms']

    cursor.execute("SELECT COUNT(DISTINCT category) as total_categories FROM slangs")
    total_categories = cursor.fetchone()['total_categories']

    cursor.execute("SELECT COUNT(DISTINCT region) as total_regions FROM slangs")
    total_regions = cursor.fetchone()['total_regions']

    cursor.execute("SELECT SUM(search_count) as total_searches, SUM(view_count) as total_views, SUM(helpful_count) as total_helpful FROM slangs")
    agg = cursor.fetchone()

    conn.close()
    return {
        "total_terms": total_terms,
        "total_categories": total_categories,
        "total_regions": total_regions,
        "total_searches": agg['total_searches'] or 0,
        "total_views": agg['total_views'] or 0,
        "total_helpful": agg['total_helpful'] or 0
    }
