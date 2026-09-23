"""
Test Suite for Flask REST APIs and SQLite Database
"""

import sys
import os
import json
import time
import subprocess
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test():
    print("🚀 Starting Flask server subprocess for testing...")
    server_script = os.path.join(os.path.dirname(__file__), 'server.py')
    python_exe = sys.executable

    proc = subprocess.Popen([python_exe, server_script], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(2)

    try:
        # 1. Health API
        res = urllib.request.urlopen('http://127.0.0.1:5000/api/health')
        health_data = json.loads(res.read().decode('utf-8'))
        print("✅ Health Check:", health_data['status'], "| DB:", health_data['database'])

        # 2. Slangs Search API
        res = urllib.request.urlopen('http://127.0.0.1:5000/api/slangs?q=rizz')
        slangs_data = json.loads(res.read().decode('utf-8'))
        print(f"✅ Slangs Search 'rizz': Found {slangs_data['total']} match -> Word: {slangs_data['results'][0]['word']}")

        # 3. Trending API
        res = urllib.request.urlopen('http://127.0.0.1:5000/api/trending')
        trending_data = json.loads(res.read().decode('utf-8'))
        print(f"✅ Trending Stats: {len(trending_data['top_searched'])} Top Searched | Top: {trending_data['top_searched'][0]['word']}")

        # 4. Sentence Explainer API
        req = urllib.request.Request(
            'http://127.0.0.1:5000/api/ai/explain-sentence', 
            data=json.dumps({'sentence': 'Bro has insane rizz no cap 💀 and she ate fr'}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        res = urllib.request.urlopen(req)
        sentence_data = json.loads(res.read().decode('utf-8'))
        print("✅ Sentence Explainer Translation:", sentence_data['translated_sentence'])
        print(f"✅ Identified {len(sentence_data['identified_terms'])} terms/emojis in sentence")

        # 5. Translator API
        req = urllib.request.Request(
            'http://127.0.0.1:5000/api/ai/translate', 
            data=json.dumps({'text': 'I am telling the truth that movie was mediocre', 'mode': 'to_genz'}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        res = urllib.request.urlopen(req)
        trans_data = json.loads(res.read().decode('utf-8'))
        print("✅ Translation (Normal -> Gen Z):", trans_data['translated'])

        # 6. Quiz API
        res = urllib.request.urlopen('http://127.0.0.1:5000/api/quiz?difficulty=Easy')
        quiz_data = json.loads(res.read().decode('utf-8'))
        print(f"✅ Quiz API (Easy): Loaded {quiz_data['count']} questions")

        print("\n🎉 ALL 6 BACKEND REST API ENDPOINTS VERIFIED & WORKING!")
    finally:
        proc.terminate()

if __name__ == '__main__':
    test()
