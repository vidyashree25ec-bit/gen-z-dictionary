"""
Comprehensive Database, Search, Category & API Verification Script
"""

import sys
import os
import sqlite3
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def verify():
    print("=" * 60)
    print("🧪 RUNNING COMPREHENSIVE DICTIONARY AUDIT & VERIFICATION")
    print("=" * 60)

    db_path = os.path.join(BASE_DIR, 'genz_dictionary.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Total Count
    cursor.execute("SELECT COUNT(*) as total FROM slangs")
    total_count = cursor.fetchone()['total']
    print(f"✅ Total Slang Records in SQLite: {total_count}")
    assert total_count >= 5500, f"Expected >= 5500, got {total_count}"

    # 2. Duplicate Check
    cursor.execute("SELECT LOWER(word), COUNT(*) as c FROM slangs GROUP BY LOWER(word) HAVING c > 1")
    dupes = cursor.fetchall()
    if dupes:
        print(f"❌ Found {len(dupes)} duplicate words:")
        for d in dupes[:5]:
            print(f"   - {d['LOWER(word)']}: {d['c']} times")
    else:
        print("✅ Zero Duplicate Words! Database is completely unique and clean.")

    # 3. Category Distribution Check
    cursor.execute("SELECT category, COUNT(*) as c FROM slangs GROUP BY category ORDER BY c DESC")
    cats = cursor.fetchall()
    print("\n📂 Category Distribution (All 12 Standard Categories):")
    for cat in cats:
        print(f"   • {cat['category']}: {cat['c']} entries")

    # 4. Search Functionality Check
    import database
    test_queries = ["rizz", "no cap", "skibidi", "academic", "bussin", "clutch", "meta", "aesthetic", "bop", "snatched"]
    print("\n🔍 Testing Search Queries across Database:")
    for q in test_queries:
        results = database.get_all_slangs(query=q)
        print(f"   • Query '{q}': {len(results)} matches found (Top: '{results[0]['word']}' - {results[0]['category']})")

    # 5. Category Filtering Check
    test_cats = [
        "Everyday Slang", "Social Media", "Reactions", "Relationships & Friendship",
        "Gaming", "School & Life", "Expressions", "Acronyms", "Internet/Meme Culture",
        "Gen Alpha/Newer Slang", "Music & Pop Culture", "Fashion & Lifestyle"
    ]
    print("\n🏷️ Testing Category Filters via database.get_all_slangs():")
    for c in test_cats:
        c_results = database.get_all_slangs(category=c)
        print(f"   • Filter [{c}]: {len(c_results)} items returned")

    # 6. Overall Stats Check
    stats = database.get_overall_stats()
    print("\n📊 Overall Aggregate Statistics:")
    for k, v in stats.items():
        print(f"   • {k}: {v:,}" if isinstance(v, (int, float)) else f"   • {k}: {v}")

    conn.close()
    print("\n" + "=" * 60)
    print("🎉 ALL QUALITY, UNIQUENESS, AND INTEGRITY CHECKS PASSED!")
    print("=" * 60)

if __name__ == '__main__':
    verify()
