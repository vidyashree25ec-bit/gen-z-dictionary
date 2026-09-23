# 🔥 Gen Z Slang Dictionary & Lingo Explorer (Full-Stack Edition)

> A modern, interactive, full-stack web application designed to decode, explore, and translate Gen Z slang words, memes, and internet culture. Built as a comprehensive college project powered by **Python Flask**, **SQLite**, **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## 🏗️ Technology Stack

- **Backend**: Python 3.10+ with Flask (`server.py`, `nlp_engine.py`, `database.py`)
- **Database**: SQLite 3 (`genz_dictionary.db`)
- **Frontend**: HTML5 Semantic Markup, Modern CSS3 (Glassmorphism & CSS Grid), Vanilla JavaScript (ES6+)
- **APIs & Web Capabilities**:
  - Web Speech API (`SpeechSynthesis` for audio pronunciation)
  - Web Speech Recognition API (`SpeechRecognition` for voice search)
  - Web Share API (`navigator.share`) & Clipboard API
  - Zero external paid APIs (rule-based deterministic NLP engine)

---

## 🌟 Key Features & Capabilities

### 1. 🧩 AI-Style Sentence Explainer
- Enter or paste any complex Gen Z sentence (e.g. *"Bro has insane rizz, no cap 💀 and she ate with that outfit fr"*).
- Multi-token tokenizer extracts all slang terms (`rizz`, `no cap`, `ate`) and cultural emojis (`💀`, `💅`, `🔥`, `🧢`).
- Provides tone classification (*Playful, High-Praise, Sarcastic, Brainrot Irony*) and full Plain-English sentence translation.

### 2. 🔄 Bidirectional Slang Translator
- **Mode 1**: Standard English ➔ Gen Z Slang (e.g. *"I am telling the truth, that movie was mediocre"* ➔ *"No cap, that movie was super mid fr"*).
- **Mode 2**: Gen Z Slang ➔ Standard English.
- Quick direction swap button (⇄), preset sample pills, instant copy, and audio speech pronunciation.

### 3. 📈 Trending Slang Dashboard & Analytics
- Live analytics synced with SQLite database.
- 4 dynamic leaderboards:
  - 🔥 **Top 5 Most Searched Slang**
  - 👀 **Top 5 Most Viewed Slang**
  - 👍 **Highest Community Rated Slang**
  - 🆕 **Recently Added Slang**

### 4. 🎙️ Voice Search (Speech-to-Text)
- Microphone button next to the search bar using browser `SpeechRecognition`.
- Speak any slang term aloud to automatically populate the search bar and filter cards in real time with active visual pulsing animation.

### 5. 🌍 Slang Origin & Region Filter
- Filter slang terms by geographical origin and internet subculture:
  - 🌐 **Global**
  - 🇺🇸 **USA**
  - 🇬🇧 **UK**
  - 🇮🇳 **India** (e.g. *Jugaad, Kya Scene Hai*)
  - 💻 **Internet / Online** (e.g. *Skibidi, Delulu, Brainrot, Sigma*)

### 6. 👍 Community Feedback Voting
- Dedicated Helpful (👍) and Not Helpful (👎) voting buttons on every card and detail modal.
- Increments database counters and uses `localStorage` to prevent duplicate votes per browser session.

### 7. 🧠 Interactive Brainrot IQ Quiz with Difficulty Tiers
- Dynamic question generator with difficulty filters: **All**, **Easy 🟢**, **Medium 🟡**, and **Hard 🔴**.
- Progress bar, instant right/wrong feedback, detailed explanations, and shareable rank titles (*Certified Sigma, Slang Master, Boomer Energy*).

### 8. 💡 Smart Unknown Word Suggestions
- If a user searches for an unindexed or misspelled word, the app computes Levenshtein distance to suggest: *"Did you mean: **[Word]**?"*.
- 1-click button to pre-fill the "+ Add Slang" submission modal.

### 9. 🛡️ Data Validation & Anti-Duplication
- Comprehensive client-side and server-side validation preventing duplicate slang entries, blank submissions, or missing required fields.

### 10. 👤 User Profile & Customization
- Profile view displaying avatar emoji, handle, bio, dynamic rank, bookmarks count, contributions, and quiz records with an "✏️ Edit Profile" modal.

### 11. 🌗 Dark / Light Mode & Audio Speech Customizer
- Instant theme switching with persistent `localStorage` saving.
- Speed (0.6x - 1.4x) and pitch sliders, browser voice selector dropdown, and audio preview button.

---

## 📁 Project Structure

```
gen-z-dictionary/
├── server.py              # Flask server entry point & REST API endpoints
├── database.py            # SQLite database schema, seeding, CRUD & analytics
├── nlp_engine.py          # Sentence parser, token extractor, tone analyzer & translator
├── requirements.txt       # Python dependencies (Flask>=3.0.0)
├── run.py                 # Quick 1-click launcher script
├── sync_data.py           # Database synchronization utility
├── test_api.py            # Automated test suite for backend REST APIs
├── genz_dictionary.db     # SQLite database file (auto-generated)
├── index.html             # Single-page application markup & modals
├── styles.css             # Glassmorphism styling, animations & responsive CSS
├── app.js                 # Frontend application engine & API synchronization
├── data.js                # Curated dataset fallback & categories/regions list
└── README.md              # Project documentation & presentation guide
```

---

## 🚀 How to Run the Project Step-by-Step

### Prerequisites
- Python 3.10+ installed on your computer.

### Step 1: Clone or Navigate to the Project Folder
```bash
cd C:\Users\HP\.gemini\antigravity\scratch\gen-z-dictionary
```

### Step 2: Set up Virtual Environment & Install Dependencies
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### Step 3: Start the Flask Server
```bash
python server.py
```
*Alternatively, you can run:*
```bash
python run.py
```

### Step 4: Open in Web Browser
Open your browser and visit:
👉 **`http://127.0.0.1:5000`**

---

## 🧪 Running the Backend Test Suite

To verify that all REST API endpoints and SQLite database operations are functioning properly:
```bash
python test_api.py
```
Expected output:
```
🚀 Starting Flask server subprocess for testing...
✅ Health Check: healthy | DB: SQLite Connected
✅ Slangs Search 'rizz': Found 1 match -> Word: Rizz
✅ Trending Stats: 5 Top Searched | Top: FR / For Real
✅ Sentence Explainer Translation: Bro has insane charisma and charm...
✅ Identified 4 terms/emojis in sentence
✅ Translation (Normal -> Gen Z): No cap fr that movie was super mid
✅ Quiz API (Easy): Loaded 3 questions

🎉 ALL 6 BACKEND REST API ENDPOINTS VERIFIED & WORKING!
```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server and database health check |
| `GET` | `/api/slangs` | Query, filter by category/region, and sort slangs |
| `GET` | `/api/slangs/<id>` | Fetch single slang and increment view count |
| `POST` | `/api/slangs` | Add a new custom slang with duplicate validation |
| `POST` | `/api/slangs/<id>/vote` | Upvote/downvote slang (`helpful` / `not_helpful`) |
| `GET` | `/api/trending` | Fetch top searched, viewed, and voted leaderboards |
| `POST` | `/api/ai/explain-sentence` | Analyze sentence, extract slangs/emojis, and translate |
| `POST` | `/api/ai/translate` | Bidirectional translation (`to_genz` / `to_english`) |
| `GET` | `/api/quiz` | Fetch dynamic quiz questions by difficulty |
| `GET` | `/api/stats` | Aggregate dictionary metrics and counts |

---

## 🎓 College Presentation Demo Highlights

1. **Full-Stack Architecture**: Demonstrate how the Flask server interacts with SQLite to maintain search counts, views, community votes, and custom contributions in real time.
2. **AI-Style Explainer**: Paste `"Bro has insane rizz no cap 💀 and she ate fr"` into the Sentence Explainer to show multi-token slang extraction, emoji detection, and tone analysis.
3. **Translator**: Switch between Standard English and Gen Z slang using the quick swap feature.
4. **Voice Search**: Click the microphone icon to speak a word (*"delulu"*, *"skibidi"*, *"rizz"*) and watch the search filter instantly.
5. **Community Interaction**: Vote helpful/not helpful on slang cards and show that votes update immediately in the database and Trending Dashboard.
