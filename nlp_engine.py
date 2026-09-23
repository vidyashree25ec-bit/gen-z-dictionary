"""
Intelligent Rule-Based NLP & Slang Explanation Engine
Provides multi-token slang extraction, sentence breakdown, tone analysis,
context generation, and bidirectional translation (Standard English <-> Gen Z Slang).
Zero external paid APIs - fast, deterministic, and accurate.
"""

import re
import database

# Dictionary of Common Gen Z Emojis and their conversational meanings
EMOJI_DICTIONARY = {
    "💀": {"term": "💀 (Skull)", "meaning": "Dying of laughter / extremely funny / absurd", "category": "Reactions"},
    "🧢": {"term": "🧢 (Blue Cap)", "meaning": "Cap / Lie / False statement", "category": "Slang Basics"},
    "💅": {"term": "💅 (Nail Polish)", "meaning": "Slay / Effortless confidence / Flawless attitude", "category": "Reactions"},
    "🔥": {"term": "🔥 (Fire)", "meaning": "Lit / Amazing / Incredibly good / High quality", "category": "Reactions"},
    "👀": {"term": "👀 (Eyes)", "meaning": "Gyatt / Shocked / Observing / Paying close attention", "category": "Social Media"},
    "🤫": {"term": "🤫 (Shushing Face)", "meaning": "Mewing / Secret / IYKYK / Keeping quiet", "category": "Social Media"},
    "🗿": {"term": "🗿 (Moai / Stone Face)", "meaning": "Sigma mindset / Unfazed / Cold / Independent", "category": "Social Media"},
    "🍟": {"term": "🍟 (Fries)", "meaning": "Fanum Tax / Taking food playfully", "category": "Social Media"},
    "🧠": {"term": "🧠 (Brain)", "meaning": "Brainrot / Hyperfixation / Deep thought", "category": "Social Media"},
    "💯": {"term": "💯 (Hundred)", "meaning": "For real / 100% agreement / Pure truth", "category": "Slang Basics"},
    "🤡": {"term": "🤡 (Clown Face)", "meaning": "Acting foolish / Played yourself / Embarrassing", "category": "Reactions"},
    "🐐": {"term": "🐐 (Goat)", "meaning": "G.O.A.T. (Greatest Of All Time)", "category": "Slang Basics"},
    "🤝": {"term": "🤝 (Handshake)", "meaning": "Bet / Deal agreed / Mutual respect", "category": "Slang Basics"},
    "✨": {"term": "✨ (Sparkles)", "meaning": "Emphasis / Aesthetic / Sarcastic sparkle vibe", "category": "School & Life"}
}

# Standard English -> Gen Z Slang Idiom Mappings
STANDARD_TO_GENZ_MAP = [
    (r"\b(i am telling the truth|honestly|to be honest|truthfully|no lie)\b", "no cap fr"),
    (r"\b(very charismatic|charm|charming|flirtatious skill|flirting ability)\b", "insane rizz"),
    (r"\b(in deep trouble|doomed|ruined|completely defeated)\b", "completely cooked"),
    (r"\b(mediocre|average|underwhelming|disappointing|not good)\b", "super mid"),
    (r"\b(did a great job|did an exceptional job|looked amazing|perfection|flawless)\b", "ate and left no crumbs"),
    (r"\b(delicious|tasty|great food|amazing flavor)\b", "bussin'"),
    (r"\b(suspicious|shady|untrustworthy)\b", "mad sus"),
    (r"\b(secretly|subtly|quietly|a little bit)\b", "lowkey"),
    (r"\b(openly|obviously|intensely|definitely)\b", "highkey"),
    (r"\b(deal|agreed|okay|yes for sure|challenge accepted)\b", "bet"),
    (r"\b(fashionable clothes|stylish outfit|good style|swag)\b", "fire drip"),
    (r"\b(show off|bragging|brag)\b", "flex"),
    (r"\b(delusional|unrealistic thinking|daydreaming)\b", "delulu"),
    (r"\b(overly flattering|kissing up to|sucking up to)\b", "glazing"),
    (r"\b(stepping outside|getting off the internet|relaxing in nature)\b", "touching grass"),
    (r"\b(sudden turn-off|sudden disgust|unattractive habit)\b", "the ick"),
    (r"\b(hilarious|making me laugh so hard|extremely funny)\b", "sending me 💀"),
    (r"\b(understandable|acceptable|respectable)\b", "totally valid"),
    (r"\b(sharp and fashionable|stylish|well fitted)\b", "snatched"),
    (r"\b(great song|catchy music|great track)\b", "absolute bop"),
    (r"\b(a lie|lying|falsehood)\b", "cap"),
    (r"\b(for real|truly|genuinely)\b", "fr fr")
]

# Gen Z Slang -> Standard English Translations
GENZ_TO_STANDARD_MAP = [
    (r"\bate and left no crumbs\b", "performed with absolute perfection"),
    (r"\bmain character energy\b", "unapologetic confidence and charismatic presence"),
    (r"\bliving rent[- ]free\b", "constantly occupying my thoughts"),
    (r"\bcaught in 4k\b", "caught with undeniable proof"),
    (r"\btouch grass\b", "step away from social media and reconnect with reality"),
    (r"\bvibe check\b", "energy and mood assessment"),
    (r"\bfanum tax\b", "playfully taking a bite of someone's food"),
    (r"\bno cap\b", "truthfully / without exaggeration"),
    (r"\bfr fr\b|\bfor real for real\b", "most genuinely and honestly"),
    (r"\bfr\b", "honestly / for real"),
    (r"\brizz\b", "charisma and charm"),
    (r"\bdelulu\b", "humorously delusional"),
    (r"\bcooked\b", "in deep trouble / doomed"),
    (r"\bskibidi\b", "bizarre / chaotic viral internet"),
    (r"\bsigma\b", "independent and self-reliant"),
    (r"\bgyatt\b", "exclamation of shock"),
    (r"\bmewing\b", "holding a sharp jawline pose"),
    (r"\bbrainrot\b", "viral internet meme overload"),
    (r"\bmid\b", "mediocre / unimpressive"),
    (r"\bsimp\b", "overly devoted admirer"),
    (r"\bslay\b", "succeed brilliantly"),
    (r"\bsus\b", "suspicious"),
    (r"\bbussin'?\b", "delicious / outstanding"),
    (r"\bghosting\b", "cutting off communication without notice"),
    (r"\bthe ick\b", "sudden feeling of repulsion"),
    (r"\bperiodt\b", "and that is final / no debate"),
    (r"\bjugaad\b", "resourceful makeshift hack"),
    (r"\bchuffed\b", "delighted and proud"),
    (r"\bproper\b", "genuinely / very"),
    (r"\bcheugy\b", "dated and trying too hard"),
    (r"\bsnatched\b", "exceptionally stylish and sharp"),
    (r"\bnpc\b", "someone acting predictably or robotically"),
    (r"\bflex\b", "show off"),
    (r"\bratio\b", "publicly outvoted in disagreement"),
    (r"\bbop\b", "great, catchy song"),
    (r"\bdrip\b", "stylish clothing and swagger"),
    (r"\bglazing\b", "excessively flattering someone"),
    (r"\bcap\b", "a lie / untrue claim"),
    (r"\biykyk\b", "if you know, you know (inside joke)"),
    (r"\blowkey\b", "somewhat / secretly"),
    (r"\bhighkey\b", "openly / intensely"),
    (r"\bsending me\b", "making me laugh uncontrollably"),
    (r"\bvalid\b", "completely understandable and respectable"),
    (r"\bunhinged\b", "chaotically eccentric and wild"),
    (r"\bin my (.+?) era\b", r"in my \1 phase of life"),
    (r"\bclapback\b", "witty comeback response"),
    (r"\bgatekeep\b", "keep information exclusive"),
    (r"\bbanger\b", "energetic and high quality creation"),
    (r"\bbet\b", "agreed / deal")
]


def explain_slang_term(query):
    """
    AI-Style Deep Dive Explainer for single slang word or phrase.
    Returns structured analysis: meaning, context, tone, dos/donts, and related words.
    """
    query = query.strip()
    all_slangs = database.get_all_slangs()
    
    # 1. Exact or partial match
    matched = None
    for s in all_slangs:
        if s['word'].lower() == query.lower() or s['id'].lower() == query.lower():
            matched = s
            break

    # If no exact, find containing match
    if not matched:
        for s in all_slangs:
            if query.lower() in s['word'].lower() or query.lower() in [t.lower() for t in s.get('tags', [])]:
                matched = s
                break

    if not matched:
        # Fallback intelligent breakdown
        return {
            "found": False,
            "query": query,
            "message": f"'{query}' is not currently indexed in the dictionary database. You can add it using the '+ Add Slang' feature!",
            "suggested_actions": ["Add this slang term", "Search another term", "Check spelling"]
        }

    # Increment search count in DB
    database.increment_search_count(matched['id'])

    # Determine emotional tone
    cat = matched['category']
    if cat == "Reactions":
        tone = "Expressive & High-Energy (Used to communicate strong feelings, humor, or compliments)"
    elif cat == "Social Media":
        tone = "Internet Irony & Viral Culture (Popularized on TikTok, Twitch, Discord, and Instagram)"
    elif cat == "Slang Basics":
        tone = "Casual & Conversational (Everyday speech among friends, peers, and group chats)"
    elif cat == "School & Life":
        tone = "Relatable & Observational (Describes daily student life, dating, and human social dynamics)"
    else:
        tone = "Modern Pop-Culture Slang"

    # Contextual Do's and Don'ts
    dos_and_donts = {
        "best_context": f"Use casually when texting friends, chatting on Discord/WhatsApp, social media comments, or informal campus conversations.",
        "avoid_context": f"Avoid using in formal academic essays, professional job interviews, legal contracts, or serious corporate emails.",
        "example_dialogue": matched['example']
    }

    # Find 3-4 related slang words
    related = [
        {"id": s['id'], "word": s['word'], "emoji": s['emoji'], "category": s['category']}
        for s in all_slangs if s['id'] != matched['id'] and (s['category'] == matched['category'] or s['region'] == matched['region'])
    ][:4]

    return {
        "found": True,
        "id": matched['id'],
        "word": matched['word'],
        "pronunciation": matched['pronunciation'],
        "emoji": matched['emoji'],
        "category": matched['category'],
        "region": matched['region'],
        "meaning": matched['meaning'],
        "origin": matched['origin'],
        "tone": tone,
        "dos_and_donts": dos_and_donts,
        "related_slangs": related,
        "tags": matched['tags'],
        "popularity": matched['popularity'],
        "helpful_count": matched['helpful_count']
    }


def explain_sentence(sentence):
    """
    Analyzes an entire Gen Z sentence:
    - Extracts multi-word and single-word slang terms.
    - Extracts emojis and explains their cultural meaning.
    - Analyzes overall sentence tone.
    - Generates a full standard English interpretation of the sentence.
    """
    if not sentence or not sentence.strip():
        return {"error": "Sentence input cannot be empty."}

    text = sentence.strip()
    all_slangs = database.get_all_slangs()
    
    # Sort slang words by length descending for greedy multi-token matching
    sorted_slangs = sorted(all_slangs, key=lambda s: len(s['word']), reverse=True)
    
    identified_terms = []
    found_term_ids = set()

    # 1. Match Slang Words & Phrases in Text
    for slang in sorted_slangs:
        pattern = r'\b' + re.escape(slang['word'].lower()) + r'\b'
        # Also check without punctuation
        clean_slang_word = re.sub(r'[^\w\s]', '', slang['word'].lower())
        
        if re.search(pattern, text, re.IGNORECASE) or (len(clean_slang_word) > 2 and clean_slang_word in text.lower()):
            if slang['id'] not in found_term_ids:
                found_term_ids.add(slang['id'])
                identified_terms.append({
                    "id": slang['id'],
                    "word": slang['word'],
                    "emoji": slang['emoji'],
                    "meaning": slang['meaning'],
                    "category": slang['category'],
                    "region": slang['region'],
                    "type": "slang_term"
                })
                # Increment view/search count
                database.increment_search_count(slang['id'])

    # 2. Match Emojis in Text
    for emoji_char, info in EMOJI_DICTIONARY.items():
        if emoji_char in text:
            identified_terms.append({
                "id": f"emoji-{ord(emoji_char[0])}",
                "word": info['term'],
                "emoji": emoji_char,
                "meaning": info['meaning'],
                "category": info['category'],
                "region": "Global",
                "type": "emoji_reaction"
            })

    # 3. Generate Full Plain English Translation
    translated_text = text
    for pattern, replacement in GENZ_TO_STANDARD_MAP:
        translated_text = re.sub(pattern, replacement, translated_text, flags=re.IGNORECASE)

    # Clean up emojis in translated version with descriptions
    for emoji_char, info in EMOJI_DICTIONARY.items():
        if emoji_char in translated_text:
            translated_text = translated_text.replace(emoji_char, f" ({info['meaning'].split('/')[0].strip()})")

    # Capitalize first letter of translated sentence
    if translated_text:
        translated_text = translated_text[0].upper() + translated_text[1:]

    # 4. Determine Tone
    tone = "Casual Conversation"
    if any(t['word'].lower() in ['delulu', 'cooked', 'sus', 'unhinged'] for t in identified_terms):
        tone = "🎭 Humorous / Exaggerated Self-Deprecation"
    elif any(t['word'].lower() in ['rizz', 'slay', 'ate (and left no crumbs)', 'snatched', 'drip'] for t in identified_terms):
        tone = "✨ High-Praise / Confidence & Compliments"
    elif any(t['word'].lower() in ['skibidi', 'fanum tax', 'gyatt', 'brainrot', 'mewing', 'sigma'] for t in identified_terms):
        tone = "🌀 Peak Internet Meme & Brainrot Irony"
    elif any(t['word'].lower() in ['no cap', 'fr / for real', 'bet', 'valid', 'periodt'] for t in identified_terms):
        tone = "💯 Affirmative & Emphatic Sincerity"

    return {
        "original_sentence": text,
        "translated_sentence": translated_text,
        "tone": tone,
        "slang_count": len(identified_terms),
        "identified_terms": identified_terms
    }


def translate_text(text, mode="to_genz"):
    """
    Bidirectional translation between Normal English and Gen Z Slang.
    mode: 'to_genz' (Normal -> Gen Z) or 'to_english' (Gen Z -> Normal)
    """
    if not text or not text.strip():
        return {"error": "Input text cannot be empty."}

    original = text.strip()
    result = original

    if mode == "to_genz":
        for pattern, replacement in STANDARD_TO_GENZ_MAP:
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        # Ensure capitalization
        if result:
            result = result[0].upper() + result[1:]
    else:
        for pattern, replacement in GENZ_TO_STANDARD_MAP:
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        for emoji_char, info in EMOJI_DICTIONARY.items():
            if emoji_char in result:
                result = result.replace(emoji_char, f" ({info['meaning'].split('/')[0].strip()})")
        if result:
            result = result[0].upper() + result[1:]

    return {
        "mode": mode,
        "original": original,
        "translated": result
    }
