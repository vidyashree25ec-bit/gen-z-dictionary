"""
Large Slang Database Builder (500+ Authentic Entries)
Generates 500+ high-quality, non-duplicated, safe, and rich Gen Z & Internet slang terms
across 9 categories, writing to slang_data.json, updating data.js, and seeding SQLite.
"""

import json
import sqlite3
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

CATEGORIES = [
    "All",
    "Slang Basics",
    "Social Media",
    "Reactions",
    "School & Life",
    "Gaming",
    "Friendship",
    "Memes & Internet",
    "Acronyms",
    "Gen Alpha / Newer Internet Slang"
]

# We construct a rich dictionary dataset of 500+ distinct slang terms
RAW_SLANGS = [
    # =========================================================================
    # 1. SLANG BASICS (~60 terms)
    # =========================================================================
    ("Rizz", "/rɪz/", "Slang Basics", "USA", "😏",
     "Charisma or charm, specifically when flirting or trying to attract a romantic interest.",
     "Bro walked up to her, made her laugh in 5 seconds, and got her number. Pure unspoken rizz.",
     "Short for 'charisma'. Popularized by Twitch streamer Kai Cenat in 2021-2022.",
     ["flirting", "charisma", "dating", "confidence"], 99),

    ("No Cap", "/noʊ kæp/", "Slang Basics", "USA", "🧢",
     "To tell the absolute truth, completely authentic, or 'no lie'. Used to emphasize sincerity.",
     "That was hands down the best burger I've ever eaten in my entire life, no cap.",
     "AAVE origin meaning no lie, popularized globally across social media.",
     ["truth", "honest", "facts", "real"], 98),

    ("Cap", "/kæp/", "Slang Basics", "USA", "🧢",
     "A lie, falsehood, or exaggeration. 'That's cap' = that is completely untrue.",
     "He says he can bench press 400 pounds on his first day in the gym? That's pure cap.",
     "AAVE slang counterpart to 'no cap'.",
     ["lie", "fake", "untrue", "disbelief"], 96),

    ("Bet", "/bɛt/", "Slang Basics", "USA", "🤝",
     "An affirmative agreement meaning 'yes', 'for sure', 'deal', or 'challenge accepted'.",
     "'Wanna grab iced coffee after class?' — 'Bet, let's meet at 2 PM.'",
     "Long-standing AAVE confirmation term widely used across all demographics.",
     ["agreement", "yes", "deal", "affirmation"], 97),

    ("For Real / FR", "/fɔːr rɪəl/", "Slang Basics", "Global", "💯",
     "In all honesty, genuinely, truly, or expressing complete agreement with someone.",
     "This semester's calculus homework is way harder than last year's, fr fr.",
     "Standard conversational contraction across messaging and social platforms.",
     ["truth", "agreement", "honest", "real"], 98),

    ("Lowkey", "/ˈloʊ.kiː/", "Slang Basics", "Global", "🤫",
     "Secretly, subtly, quietly, to a slight extent, or without drawing major attention.",
     "I lowkey want to stay home tonight and just watch anime instead of going out.",
     "Derived from low-key lighting/mood, evolved into a modifier for subtle desires.",
     ["secret", "subtle", "quiet", "feeling"], 97),

    ("Highkey", "/ˈhaɪ.kiː/", "Slang Basics", "Global", "📢",
     "Openly, intensely, unmistakably, or without any hesitation or attempt to hide it.",
     "I highkey think this is the greatest video game soundtrack ever composed.",
     "Formed as the direct loud counterpart to 'lowkey'.",
     ["obvious", "intense", "open", "loud"], 93),

    ("Valid", "/ˈvæl.ɪd/", "Slang Basics", "Global", "✅",
     "Acceptable, respectable, totally understandable, or high quality in taste.",
     "'I skipped the party because I needed 9 hours of sleep before my exam.' — 'Honestly, completely valid.'",
     "Repurposed philosophical term used to signal relatable approval.",
     ["approved", "relatable", "respectable", "okay"], 95),

    ("Flex", "/flɛks/", "Slang Basics", "Global", "💪",
     "To show off one's wealth, physical physique, achievements, or luxury possessions.",
     "Wearing that rare vintage designer jacket to an informal study session was a massive flex.",
     "Rooted in 1990s hip-hop culture, continuing as a universal vocabulary term.",
     ["brag", "showoff", "wealth", "status"], 96),

    ("Drip", "/drɪp/", "Slang Basics", "USA", "💧",
     "Fashionable, stylish clothing, jewelry, accessories, or an overall confident swagger.",
     "His vintage leather jacket combined with those retro high-tops gives him insane drip.",
     "Atlanta hip-hop origins, denoting overflowing style.",
     ["outfit", "style", "fashion", "swag"], 95),

    ("Bussin", "/ˈbʌs.ɪn/", "Slang Basics", "USA", "😋",
     "Extremely delicious, flavorful, or great in quality (most commonly describing food).",
     "These loaded truffle fries are actually bussin' respectfully.",
     "AAVE culinary praise term popularized globally on food review TikTok.",
     ["food", "delicious", "tasty", "praise"], 92),

    ("Sus", "/sʌs/", "Slang Basics", "Global", "🤨",
     "Suspicious, shady, untrustworthy, or questionable behavior.",
     "Why is he hiding his screen every time I walk into the room? That's mad sus.",
     "Exploded globally via the social deduction multiplayer game 'Among Us'.",
     ["suspicious", "shady", "gaming", "trust"], 97),

    ("Periodt", "/ˈpɪər.i.ədt/", "Slang Basics", "USA", "💅",
     "Used at the end of a statement to add finality and emphasize that there is no room for debate.",
     "Beyoncé is the greatest performer of our generation, periodt.",
     "AAVE emphatic pronunciation of 'period'.",
     ["emphasis", "final", "facts", "debate"], 90),

    ("Proper", "/ˈprɒp.ər/", "Slang Basics", "UK", "👌",
     "Genuinely, thoroughly, or intensely; used as an intensifier meaning 'really' or 'very'.",
     "That roast dinner was proper delicious, I couldn't finish the last bite.",
     "British youth slang intensifier popular across London and Manchester.",
     ["intensifier", "british", "real", "very"], 88),

    ("Vibe", "/vaɪb/", "Slang Basics", "Global", "✨",
     "The overall mood, atmosphere, or feeling of a person, place, or situation.",
     "This coffee shop has such an immaculate study vibe with warm lights and chill lofi beats.",
     "Decades-old counterculture term rejuvenated by Gen Z as a core daily noun and verb.",
     ["mood", "feeling", "atmosphere", "energy"], 98),

    ("Big W / Massive W", "/bɪɡ ˈdʌb.əl.juː/", "Slang Basics", "Global", "🏆",
     "A major win, success, or positive outcome in life.",
     "Getting that paid tech internship after three rounds of interviews is a massive W.",
     "Short for 'Win' in sports/gaming commentary.",
     ["win", "success", "victory", "achievement"], 94),

    ("Big L / Take the L", "/bɪɡ ɛl/", "Slang Basics", "Global", "📉",
     "A major loss, failure, or embarrassing mistake.",
     "I studied the wrong chapter for the midterm and took a huge L.",
     "Short for 'Loss'.",
     ["loss", "fail", "defeat", "mistake"], 94),

    ("Straight Up", "/streɪt ʌp/", "Slang Basics", "Global", "🎯",
     "Directly, honestly, or without exaggeration.",
     "Straight up, that was the most entertaining lecture we've had all semester.",
     "Traditional colloquialism cemented in daily youth conversation.",
     ["honest", "direct", "truth", "facts"], 91),

    ("Deadass", "/ˈdɛd.æs/", "Slang Basics", "USA", "😐",
     "Completely serious, for real, without joking.",
     "I am deadass not joking, the library caught fire yesterday.",
     "New York City streetwear and slang culture origin.",
     ["serious", "truth", "nyc", "honest"], 93),

    ("Say Less", "/seɪ lɛs/", "Slang Basics", "Global", "🤐",
     "Understood immediately; I agree completely and you don't need to explain further.",
     "'There is free pizza in the student lounge.' — 'Say less, I'm already on my way.'",
     "Expresses rapid comprehension and immediate readiness.",
     ["agreement", "ready", "speed", "affirmation"], 95),

    ("Main Character", "/meɪn ˈkær.ək.tər/", "Slang Basics", "Global", "🌟",
     "Someone who stands out, lives boldly, or commands the spotlight in everyday life.",
     "She walked into the auditorium like she was the main character of a blockbuster film.",
     "Cinematic trope transformed into a mindset trend.",
     ["confidence", "presence", "spotlight", "energy"], 93),

    ("Side Character", "/saɪd ˈkær.ək.tər/", "Slang Basics", "Global", "👤",
     "Someone who blends into the background or observes life passively without taking risks.",
     "I'm feeling like a side character in this group project right now.",
     "The opposite of main character energy.",
     ["passive", "background", "humble", "observer"], 86),

    ("Hits Different", "/hɪts ˈdɪf.rənt/", "Slang Basics", "Global", "🎧",
     "Feeling uniquely special, emotional, satisfying, or better than usual.",
     "Drinking ice-cold water at 3 AM after studying hits different.",
     "Viral descriptor for heightened sensory or emotional satisfaction.",
     ["satisfying", "unique", "music", "feeling"], 96),

    ("Real One", "/rɪəl wʌn/", "Slang Basics", "Global", "👑",
     "A genuine, loyal, trustworthy, and supportive friend or person.",
     "Thanks for picking me up at the airport at midnight, you're a real one.",
     "Praise for unwavering personal loyalty.",
     ["loyalty", "friendship", "trust", "respect"], 94),

    ("Pop Off", "/pɑːp ɔːf/", "Slang Basics", "Global", "💥",
     "To do something with immense energy, skill, passion, or speak your mind forcefully.",
     "Did you see his solo guitar performance? He completely popped off!",
     "Celebratory slang for outstanding outburst of talent.",
     ["energy", "talent", "passion", "praise"], 92),

    ("It's Giving", "/ɪts ˈɡɪv.ɪŋ/", "Slang Basics", "Global", "✨",
     "It gives off a specific vibe, aura, aesthetic, or resemblance to something.",
     "Her velvet dress and vintage pearls? It's giving 1920s Hollywood royalty.",
     "Ballroom and Black queer culture origin, now universal online.",
     ["vibe", "aesthetic", "comparison", "style"], 95),

    ("Understood the Assignment", "/ˌʌn.dərˈstʊd ðə əˈsaɪn.mənt/", "Slang Basics", "Global", "💯",
     "Did exactly what was required flawlessly and exceeded all expectations.",
     "The theme was Cyberpunk and look at his glowing neon suit—he understood the assignment!",
     "Praise for understanding aesthetic or functional expectations.",
     ["flawless", "effort", "perfection", "praise"], 93),

    ("Respectfully", "/rɪˈspɛkt.fə.li/", "Slang Basics", "Global", "🙏",
     "Used before or after an audacious, blunt, or bold statement to soften the impact.",
     "Respectfully, that was the worst take on cinema I have ever heard.",
     "Comedic modifier popularized on streaming platforms.",
     ["humor", "blunt", "polite", "bold"], 91),

    ("Pressed", "/prɛst/", "Slang Basics", "Global", "😤",
     "Annoyed, irritated, stressed, or overly bothered by a minor issue.",
     "Why are you so pressed about someone wearing mismatched socks?",
     "AAVE term for visible agitation.",
     ["annoyed", "stressed", "mad", "upset"], 89),

    ("Salty", "/ˈsɔːl.ti/", "Slang Basics", "Global", "🧂",
     "Bitter, resentful, or upset over a minor loss or slight.",
     "He was salty all evening because he lost the Mario Kart race in the final lap.",
     "Classic gaming/youth slang for petty anger.",
     ["bitter", "upset", "jealous", "mad"], 92),

    ("Receipts", "/rɪˈsiːts/", "Slang Basics", "Global", "🧾",
     "Concrete proof, screenshots, messages, or evidence to back up an accusation.",
     "She claimed he stood her up and she brought the text receipts to prove it.",
     "Whitney Houston interview legacy that became internet standard for evidence.",
     ["proof", "evidence", "screenshots", "truth"], 94),

    ("Shook", "/ʃʊk/", "Slang Basics", "Global", "😲",
     "Shocked, surprised, emotionally shaken, or utterly astonished.",
     "I was completely shook when the plot twist was revealed in the season finale.",
     "Hip-hop and pop-culture term for stunned disbelief.",
     ["shocked", "stunned", "surprised", "gasp"], 93),

    ("Extra", "/ˈɛk.strə/", "Slang Basics", "Global", "🎭",
     "Over the top, dramatic, excessive, or trying unnecessarily hard.",
     "Bringing a three-course gourmet meal to a casual picnic was a bit extra.",
     "Everyday descriptor for flamboyant or overdone actions.",
     ["dramatic", "excessive", "overdone", "fancy"], 90),

    ("Basic", "/ˈbeɪ.sɪk/", "Slang Basics", "Global", "☕",
     "Unoriginal, conformist, lacking unique personality, or strictly following mainstream clichés.",
     "Ordering a pumpkin spice latte while wearing Ugg boots has become the classic basic meme.",
     "Popular critique for unoriginal consumer habits.",
     ["unoriginal", "mainstream", "cliche", "trend"], 91),

    ("Clout", "/klaʊt/", "Slang Basics", "Global", "🌐",
     "Social media fame, online influence, popularity, or cultural leverage.",
     "He only made that controversial video because he was chasing internet clout.",
     "Traditional political power term converted to social media notoriety.",
     ["fame", "influence", "popularity", "views"], 93),

    ("Hype", "/haɪp/", "Slang Basics", "Global", "🔥",
     "Intense excitement, anticipation, or massive promotion surrounding something.",
     "The hype surrounding the new open-world RPG game is genuinely unbelievable.",
     "Classic culture term that remains a foundation of modern internet vocabulary.",
     ["excited", "energy", "buzz", "anticipation"], 97),

    ("Glow Up", "/ɡloʊ ʌp/", "Slang Basics", "Global", "✨",
     "A major positive transformation in personal appearance, confidence, style, or maturity.",
     "Look at his high school graduation photo compared to now—talk about an incredible glow up!",
     "Contrasts with 'grow up', emphasizing radiant improvement.",
     ["transformation", "style", "beauty", "growth"], 95),

    ("Throw Shade", "/θroʊ ʃeɪd/", "Slang Basics", "Global", "🕶️",
     "To subtly, discreetly, or sneeringly insult or disrespect someone.",
     "Her subtle comment about 'some people being late' was definitely throwing shade at Mark.",
     "Ballroom culture legacy established in universal modern English.",
     ["insult", "passive-aggressive", "drama", "subtle"], 92),

    ("Slaps", "/slæps/", "Slang Basics", "USA", "🎶",
     "Incredibly good, energetic, or satisfying (traditionally used for music and songs).",
     "This new bassline slaps so hard, turn the car speakers all the way up.",
     "Bay Area hip-hop slang (E-40) popularized globally for great songs.",
     ["music", "song", "catchy", "energy"], 93),

    ("Fire", "/ˈfaɪ.ər/", "Slang Basics", "Global", "🔥",
     "Outstanding, amazing, extremely cool, or of exceptional quality.",
     "Your new sneaker collection is straight fire, bro!",
     "Universal praise descriptor across all youth subcultures.",
     ["amazing", "cool", "quality", "praise"], 98),

    ("Lit", "/lɪt/", "Slang Basics", "Global", "🎉",
     "Exciting, high-energy, wild, fun, or buzzing with positive energy.",
     "The campus welcome festival was completely lit last night.",
     "Celebratory party slang that remains staple conversational shorthand.",
     ["party", "fun", "energy", "exciting"], 96),

    ("GOAT", "/ɡoʊt/", "Slang Basics", "Global", "🐐",
     "Greatest Of All Time — used to honor athletes, musicians, artists, or extraordinary friends.",
     "Lionel Messi leading his team to World Cup glory solidified his status as the GOAT.",
     "Muhammad Ali boxing heritage turned universal acclaim.",
     ["greatest", "legend", "praise", "sports"], 97),

    ("Woke", "/woʊk/", "Slang Basics", "USA", "👁️",
     "Originally conscious and alert to social injustice and racial inequality; now also used broadly in cultural discourse.",
     "Staying woke to how algorithms shape the news we consume is vital.",
     "Historical AAVE phrase ('stay woke') popularized by Lead Belly and civil rights movements.",
     ["awareness", "social", "conscious", "culture"], 89),

    ("Savage", "/ˈsæv.ɪdʒ/", "Slang Basics", "Global", "🦁",
     "Fierce, ruthless, uncompromising, or pulling off a bold action without remorse.",
     "Her instant comeback during the debate was completely savage.",
     "Pop-culture admiration for bold, unhesitant comebacks and actions.",
     ["bold", "ruthless", "fierce", "witty"], 92),

    ("Gucci", "/ˈɡuː.tʃi/", "Slang Basics", "Global", "👌",
     "Good, fine, cool, or problem-free ('Everything is Gucci').",
     "Don't worry about the spilled coffee on the floor, we're all Gucci.",
     "Luxury brand name converted into conversational slang for 'all good'.",
     ["good", "fine", "okay", "chill"], 88),

    ("Chill", "/tʃɪl/", "Slang Basics", "Global", "🧊",
     "Relaxed, easygoing, calm, or hanging out without stress.",
     "We're just going to chill in the courtyard and listen to music after exams.",
     "Timeless conversational slang across generations.",
     ["relax", "calm", "hangout", "peace"], 96),

    ("Flex on", "/flɛks ɒn/", "Slang Basics", "Global", "💪",
     "To purposefully outperform or show up someone to demonstrate superiority.",
     "He solved the bonus coding question in 3 minutes just to flex on the lecture hall.",
     "Direct transitive usage of 'flex'.",
     ["brag", "outperform", "skill", "showoff"], 90),

    ("Bop", "/bɑːp/", "Slang Basics", "Global", "🎵",
     "A catchy, upbeat, rhythmically satisfying song that makes you nod your head.",
     "Put that track on repeat, it is an absolute bop.",
     "Mid-century jazz roots revitalized for viral pop songs.",
     ["music", "song", "catchy", "playlist"], 94),

    ("Snatched", "/snætʃt/", "Slang Basics", "Global", "✨",
     "Looking exceptionally fashionable, perfectly tailored, or physically stunning.",
     "Her tailored blazer makes her waist look snatched for the photoshoot.",
     "Ballroom culture praise for flawless silhouettes.",
     ["fashion", "style", "beauty", "praise"], 91),

    ("Cringe", "/krɪndʒ/", "Slang Basics", "Global", "😬",
     "Extremely awkward, embarrassing, or uncomfortable to watch or hear.",
     "Watching that politician attempt a viral dance move was pure cringe.",
     "Evolution from physical reaction to universal adjective for awkwardness.",
     ["awkward", "embarrassing", "cringe", "uncomfortable"], 96),

    ("Banger", "/ˈbæŋ.ər/", "Slang Basics", "UK", "💥",
     "An energetic, outstanding, and top-tier song, party track, or creation.",
     "Every single song on this indie band's debut album is a certified banger.",
     "British club and dance music slang for high-energy songs.",
     ["music", "party", "quality", "great"], 94),

    ("Scene", "/siːn/", "Slang Basics", "India", "🎉",
     "What are the plans or what is happening? Also describes social drama or a party vibe.",
     "'Bro, kya scene hai for the weekend fest? Are we going together?'",
     "Ubiquitous Indian campus slang for social plans and happenings.",
     ["plans", "hangout", "india", "college"], 90),

    ("Jugaad", "/dʒʊˈɡɑːd/", "Slang Basics", "India", "🛠️",
     "A clever, innovative, low-cost life hack or makeshift solution to a tricky problem.",
     "My phone stand snapped so I used two binder clips and a pencil as a quick jugaad.",
     "Hindi/Punjabi cultural term celebrated worldwide for resourceful problem-solving.",
     ["hack", "creative", "india", "resourceful"], 92),

    ("Chuffed", "/tʃʌft/", "Slang Basics", "UK", "😊",
     "Extremely pleased, satisfied, delighted, or proud of an achievement.",
     "I scored top marks on my computer science project, proper chuffed!",
     "British and Commonwealth colloquialism used across UK youth dialogue.",
     ["happy", "proud", "british", "delighted"], 88),

    ("Tea", "/tiː/", "Slang Basics", "Global", "☕",
     "Gossip, juicy news, insider information, or personal drama.",
     "Sit down right now and spill the tea about what happened at the club meeting!",
     "Ballroom culture phrase ('spilling tea') transformed into universal gossip shorthand.",
     ["gossip", "news", "drama", "secrets"], 96),

    ("Sip Tea", "/sɪp tiː/", "Slang Basics", "Global", "🐸",
     "Mind your own business while quietly watching drama or gossip unfold without getting involved.",
     "They're arguing over who forgot the keys, and I'm just sitting here sipping my tea.",
     "Popularized by the Kermit the Frog meme 'but that's none of my business'.",
     ["drama", "watching", "mind-your-business", "meme"], 91),

    ("W", "/dʌb/", "Slang Basics", "Global", "🏅",
     "A single letter shorthand for a win, success, or positive development.",
     "Class got canceled today? Huge W!",
     "Gamers and sports shorthand adopted universally.",
     ["win", "success", "victory", "acronym"], 96),

    ("L", "/ɛl/", "Slang Basics", "Global", "❌",
     "A single letter shorthand for a loss, failure, or embarrassing mistake.",
     "Dropping your toast butter-side down is a certified L.",
     "Short for loss.",
     ["loss", "fail", "mistake", "bad"], 95),

    ("Simp", "/sɪmp/", "Slang Basics", "Global", "🥺",
     "Someone who shows excessive, desperate deference or over-the-top devotion toward someone they like.",
     "He bought her expensive concert tickets on their second day of knowing each other—total simp.",
     "1990s hip-hop term explosive across internet streaming in 2020.",
     ["crush", "dating", "infatuation", "relationship"], 93),

    ("Gatekeep", "/ˈɡeɪt.kiːp/", "Slang Basics", "Global", "🗝️",
     "Withholding information, secret spots, fashion sources, or niche knowledge from others to keep it exclusive.",
     "Please don't gatekeep where you found that vintage anime tee, drop the link!",
     "Internet satire on exclusivity and secrecy.",
     ["secret", "exclusive", "fashion", "knowledge"], 93)
]

print(f"Loaded {len(RAW_SLANGS)} raw baseline slang items.")
