"""
Data Synchronization Script
Imports full 61+ slang records from data.js into database.py seed dataset,
ensuring all regional classifications (Global, USA, UK, India, Internet/Online) are preserved.
"""

import re
import json
import sqlite3
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'genz_dictionary.db')

REGION_MAPPINGS = {
    "rizz": "USA",
    "no-cap": "USA",
    "fanum-tax": "USA",
    "gyatt": "USA",
    "bet": "USA",
    "bussin": "USA",
    "drip": "USA",
    "periodt": "USA",
    "cap": "USA",
    "clapback": "USA",
    "cheugy": "USA",
    "chuffed": "UK",
    "proper": "UK",
    "banger": "UK",
    "ick": "UK",
    "jugaad": "India",
    "scene": "India",
    "delulu": "Internet/Online",
    "skibidi": "Internet/Online",
    "sigma": "Internet/Online",
    "brainrot": "Internet/Online",
    "caught-in-4k": "Internet/Online",
    "npc": "Internet/Online",
    "touch-grass": "Internet/Online",
    "glazing": "Internet/Online",
    "ratio": "Internet/Online"
}

def sync():
    with open('data.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Match all JS object blocks inside INITIAL_SLANG_DATA
    pattern = re.compile(
        r'\{\s*id:\s*"([^"]+)",\s*word:\s*"([^"]+)",\s*pronunciation:\s*"([^"]*)",\s*category:\s*"([^"]+)",\s*emoji:\s*"([^"]+)",\s*meaning:\s*"([^"]+)",\s*example:\s*"([^"]+)",\s*origin:\s*"([^"]+)",\s*tags:\s*(\[[^\]]*\]),\s*popularity:\s*(\d+)',
        re.MULTILINE
    )

    items = []
    for match in pattern.finditer(content):
        slang_id, word, pron, category, emoji, meaning, example, origin, tags_raw, pop = match.groups()
        try:
            tags = json.loads(tags_raw)
        except Exception:
            tags = [t.strip().replace('"', '') for t in tags_raw.strip('[]').split(',') if t.strip()]

        region = REGION_MAPPINGS.get(slang_id, "Global")
        items.append({
            "id": slang_id,
            "word": word,
            "pronunciation": pron,
            "category": category,
            "region": region,
            "emoji": emoji,
            "meaning": meaning,
            "example": example,
            "origin": origin,
            "tags": tags,
            "popularity": int(pop)
        })

    print(f"✅ Extracted {len(items)} slang terms from data.js")

    # Connect to SQLite and update/insert
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    from datetime import datetime
    now_iso = datetime.now().isoformat()

    inserted = 0
    updated = 0

    for it in items:
        cursor.execute("SELECT id FROM slangs WHERE id = ? OR LOWER(word) = LOWER(?)", (it['id'], it['word']))
        row = cursor.fetchone()
        tags_json = json.dumps(it['tags'])
        
        if row:
            cursor.execute("""
                UPDATE slangs SET
                    pronunciation = ?,
                    category = ?,
                    region = ?,
                    emoji = ?,
                    meaning = ?,
                    example = ?,
                    origin = ?,
                    tags = ?,
                    popularity = ?
                WHERE id = ?
            """, (it['pronunciation'], it['category'], it['region'], it['emoji'],
                  it['meaning'], it['example'], it['origin'], tags_json, it['popularity'], row['id']))
            updated += 1
        else:
            cursor.execute("""
                INSERT INTO slangs (
                    id, word, pronunciation, category, region, emoji, meaning, example,
                    origin, tags, popularity, search_count, view_count, helpful_count,
                    not_helpful_count, is_custom, date_added
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 100, 250, 45, 1, 0, ?)
            """, (it['id'], it['word'], it['pronunciation'], it['category'], it['region'],
                  it['emoji'], it['meaning'], it['example'], it['origin'], tags_json,
                  it['popularity'], now_iso))
            inserted += 1

    conn.commit()
    cursor.execute("SELECT COUNT(*) as cnt FROM slangs")
    total_db = cursor.fetchone()['cnt']
    conn.close()

    print(f"🚀 SQLite DB synchronized! Total slang records in database: {total_db} (Inserted: {inserted}, Updated: {updated})")

if __name__ == '__main__':
    sync()
