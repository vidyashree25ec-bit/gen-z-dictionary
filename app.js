/**
 * Gen Z Dictionary - Full-Stack Application Client Engine
 * Implements search, category and region filters, text-to-speech pronunciation,
 * voice search, AI sentence explanation, bidirectional translator, trending dashboard,
 * community voting, interactive quiz with difficulty tiers, bookmarking, and profile management.
 */

// Application State
const state = {
  allSlangs: [],
  filteredSlangs: [],
  favorites: new Set(),
  recentlyViewed: [],
  votedSlangs: {}, // { slangId: 'helpful' | 'not_helpful' }
  currentCategory: 'All',
  currentRegion: 'All',
  searchQuery: '',
  sortBy: 'popularity',
  displayLimit: 60,
  currentTab: 'dictionary', // 'dictionary', 'sentence-explainer', 'translator', 'quiz', 'trending', 'favorites', 'profile', 'notifications', 'settings'
  spotlightSlang: null,
  theme: 'light',
  isBackendOnline: false,
  translator: {
    mode: 'to_genz', // 'to_genz' or 'to_english'
    sourceText: '',
    translatedText: ''
  },
  quiz: {
    currentQuestion: 0,
    score: 0,
    answered: false,
    questions: [],
    difficulty: 'All'
  },
  profile: {
    name: 'Slang Explorer',
    handle: '@lingo_scholar',
    avatar: '😎',
    bio: 'Decoding internet culture, slang, and memes daily. No cap.',
    joined: 'August 2026',
    level: 'Level 3 • Vibe Master',
    quizBestScore: '8/8 (100%)'
  },
  profileTab: 'bookmarks', // 'bookmarks' or 'contributions'
  notifications: [],
  settings: {
    theme: 'dark',
    speechRate: 0.9,
    speechPitch: 1.0,
    speechVoice: '',
    toastAlerts: true,
    dailyWordNotif: true
  },
  selectedSlangForDetails: null
};

// Storage Keys
const STORAGE_KEYS = {
  FAVORITES: 'genz_slang_favorites_v1',
  CUSTOM_SLANGS: 'genz_custom_slangs_v1',
  THEME: 'genz_theme_v1',
  RECENTLY_VIEWED: 'genz_recently_viewed_v1',
  VOTED_SLANGS: 'genz_voted_slangs_v1',
  PROFILE: 'genz_profile_v1',
  NOTIFICATIONS: 'genz_notifications_v1',
  SETTINGS: 'genz_settings_v1'
};

// DOM Elements Cache
const elements = {};

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', async () => {
  cacheElements();
  loadStoredData();
  initTheme();
  initEventListeners();
  renderCategoryChips();
  renderRegionChips();
  initVoiceSearch();
  initTranslator();
  initSentenceExplainer();
  initQuizDifficulty();
  
  // Try fetching from Flask backend API
  await initBackendSync();

  initSpotlight();
  applyFiltersAndRender();
  renderRecentlyViewed();
  updateFavoritesCount();
  updateStatistics();
  updateNotificationBadges();
});

/**
 * Cache frequently used DOM elements
 */
function cacheElements() {
  // Search & Navigation
  elements.searchInput = document.getElementById('search-input');
  elements.voiceSearchBtn = document.getElementById('voice-search-btn');
  elements.clearSearchBtn = document.getElementById('clear-search-btn');
  elements.categoryChips = document.getElementById('category-chips');
  elements.regionChips = document.getElementById('region-chips');
  elements.sortSelect = document.getElementById('sort-select');
  elements.slangGrid = document.getElementById('slang-grid');
  elements.statsCounter = document.getElementById('stats-counter');
  elements.themeToggleBtn = document.getElementById('theme-toggle-btn');
  elements.themeIcon = document.getElementById('theme-icon');
  elements.themeText = document.getElementById('theme-text');
  
  // Spotlight / Word of the Day
  elements.spotlightSection = document.querySelector('.spotlight-section');
  elements.spotlightCard = document.getElementById('spotlight-card');
  elements.spotlightWord = document.getElementById('spotlight-word');
  elements.spotlightPronunciation = document.getElementById('spotlight-pronunciation');
  elements.spotlightMeaning = document.getElementById('spotlight-meaning');
  elements.spotlightExample = document.getElementById('spotlight-example');
  elements.spotlightBadge = document.getElementById('spotlight-badge');
  elements.spotlightCategory = document.getElementById('spotlight-category');
  elements.spotlightAudioBtn = document.getElementById('spotlight-audio-btn');
  elements.spotlightCopyBtn = document.getElementById('spotlight-copy-btn');
  elements.spotlightShuffleBtn = document.getElementById('spotlight-shuffle-btn');

  // Statistics Dashboard
  elements.statsDashboardSection = document.querySelector('.stats-dashboard-section');
  elements.statTotalTerms = document.getElementById('stat-total-terms');
  elements.statTotalCategories = document.getElementById('stat-total-categories');
  elements.statTotalBookmarks = document.getElementById('stat-total-bookmarks');
  elements.statRecentCount = document.getElementById('stat-recent-count');

  // Recently Viewed Section
  elements.recentlyViewedSection = document.getElementById('recently-viewed-section');
  elements.recentlyViewedList = document.getElementById('recently-viewed-list');
  elements.recentCounterBadge = document.getElementById('recent-counter-badge');
  elements.clearRecentBtn = document.getElementById('clear-recent-btn');

  // Tabs & Views
  elements.viewTabs = document.querySelectorAll('.view-tab');
  elements.filterControls = document.getElementById('filter-controls');
  elements.heroSection = document.querySelector('.hero');
  elements.dictionaryView = document.getElementById('dictionary-view');
  elements.sentenceExplainerView = document.getElementById('sentence-explainer-view');
  elements.translatorView = document.getElementById('translator-view');
  elements.trendingView = document.getElementById('trending-view');
  elements.quizView = document.getElementById('quiz-view');
  elements.profileView = document.getElementById('profile-view');
  elements.notificationsView = document.getElementById('notifications-view');
  elements.settingsView = document.getElementById('settings-view');
  elements.favTabCount = document.getElementById('fav-tab-count');
  elements.notifTabCount = document.getElementById('notif-tab-count');
  elements.activeCategoryIndicator = document.getElementById('active-category-indicator');

  // Sentence Explainer Elements
  elements.sentenceInput = document.getElementById('sentence-input');
  elements.analyzeSentenceBtn = document.getElementById('analyze-sentence-btn');
  elements.sentenceSampleBtn = document.getElementById('sentence-sample-btn');
  elements.sentenceClearBtn = document.getElementById('sentence-clear-btn');
  elements.sentenceResultContainer = document.getElementById('sentence-result-container');
  elements.sentenceToneBadge = document.getElementById('sentence-tone-badge');
  elements.sentenceEnglishTranslation = document.getElementById('sentence-english-translation');
  elements.detectedCount = document.getElementById('detected-count');
  elements.detectedTermsGrid = document.getElementById('detected-terms-grid');

  // Translator Elements
  elements.transSourcePill = document.getElementById('trans-source-pill');
  elements.transTargetPill = document.getElementById('trans-target-pill');
  elements.swapTransModeBtn = document.getElementById('swap-trans-mode-btn');
  elements.transSourceLabel = document.getElementById('trans-source-label');
  elements.transSourceInput = document.getElementById('trans-source-input');
  elements.transTargetLabel = document.getElementById('trans-target-label');
  elements.transTargetOutput = document.getElementById('trans-target-output');
  elements.transStatusBadge = document.getElementById('trans-status-badge');
  elements.translateActionBtn = document.getElementById('translate-action-btn');
  elements.clearTransBtn = document.getElementById('clear-trans-btn');
  elements.copyTransBtn = document.getElementById('copy-trans-btn');
  elements.speakTransBtn = document.getElementById('speak-trans-btn');

  // Trending Dashboard Elements
  elements.boardSearchedList = document.getElementById('board-searched-list');
  elements.boardViewedList = document.getElementById('board-viewed-list');
  elements.boardVotedList = document.getElementById('board-voted-list');
  elements.boardRecentList = document.getElementById('board-recent-list');

  // Profile View Elements
  elements.profileAvatar = document.getElementById('profile-avatar');
  elements.quickAvatarBtn = document.getElementById('quick-avatar-btn');
  elements.profileName = document.getElementById('profile-name');
  elements.profileRankBadge = document.getElementById('profile-rank-badge');
  elements.profileHandle = document.getElementById('profile-handle');
  elements.profileBio = document.getElementById('profile-bio');
  elements.profileJoined = document.getElementById('profile-joined');
  elements.openEditProfileBtn = document.getElementById('open-edit-profile-btn');
  elements.pstatBookmarks = document.getElementById('pstat-bookmarks');
  elements.pstatContributions = document.getElementById('pstat-contributions');
  elements.pstatQuizScore = document.getElementById('pstat-quiz-score');
  elements.pstatRecent = document.getElementById('pstat-recent');
  elements.ptabBookmarksBtn = document.getElementById('ptab-bookmarks-btn');
  elements.ptabContribBtn = document.getElementById('ptab-contrib-btn');
  elements.profileFavCount = document.getElementById('profile-fav-count');
  elements.profileContribCount = document.getElementById('profile-contrib-count');
  elements.profileCardsContainer = document.getElementById('profile-cards-container');

  // Edit Profile Modal
  elements.editProfileModal = document.getElementById('edit-profile-modal');
  elements.closeProfileModalBtn = document.getElementById('close-profile-modal-btn');
  elements.cancelProfileBtn = document.getElementById('cancel-profile-btn');
  elements.editProfileForm = document.getElementById('edit-profile-form');
  elements.editProfileNameInput = document.getElementById('edit-profile-name-input');
  elements.editProfileHandleInput = document.getElementById('edit-profile-handle-input');
  elements.editProfileAvatarInput = document.getElementById('edit-profile-avatar-input');
  elements.editProfileBioInput = document.getElementById('edit-profile-bio-input');

  // Notifications View Elements
  elements.notificationsList = document.getElementById('notifications-list');
  elements.markAllReadBtn = document.getElementById('mark-all-read-btn');
  elements.clearAllNotifsBtn = document.getElementById('clear-all-notifs-btn');

  // Settings View Elements
  elements.settingsThemeSelect = document.getElementById('settings-theme-select');
  elements.settingsSpeechRate = document.getElementById('settings-speech-rate');
  elements.rateValDisplay = document.getElementById('rate-val-display');
  elements.settingsSpeechPitch = document.getElementById('settings-speech-pitch');
  elements.pitchValDisplay = document.getElementById('pitch-val-display');
  elements.settingsVoiceSelect = document.getElementById('settings-voice-select');
  elements.testVoiceBtn = document.getElementById('test-voice-btn');
  elements.settingsToastToggle = document.getElementById('settings-toast-toggle');
  elements.settingsDailyNotifToggle = document.getElementById('settings-daily-notif-toggle');
  elements.exportDataBtn = document.getElementById('export-data-btn');
  elements.importDataInput = document.getElementById('import-data-input');
  elements.resetDataBtn = document.getElementById('reset-data-btn');

  // Slang Details Modal Elements
  elements.slangDetailsModal = document.getElementById('slang-details-modal');
  elements.closeDetailsModalBtn = document.getElementById('close-details-modal-btn');
  elements.detailCloseBottomBtn = document.getElementById('detail-close-bottom-btn');
  elements.detailCategoryBadge = document.getElementById('detail-category-badge');
  elements.detailRegionBadge = document.getElementById('detail-region-badge');
  elements.detailPopularityBadge = document.getElementById('detail-popularity-badge');
  elements.detailEmoji = document.getElementById('detail-emoji');
  elements.detailWord = document.getElementById('detail-word');
  elements.detailPronunciation = document.getElementById('detail-pronunciation');
  elements.detailSpeechBtn = document.getElementById('detail-speech-btn');
  elements.detailMeaning = document.getElementById('detail-meaning');
  elements.detailExample = document.getElementById('detail-example');
  elements.detailOrigin = document.getElementById('detail-origin');
  elements.detailOriginContainer = document.getElementById('detail-origin-container');
  elements.detailTagsList = document.getElementById('detail-tags-list');
  elements.detailAuthor = document.getElementById('detail-author');
  elements.detailFavBtn = document.getElementById('detail-fav-btn');
  elements.detailFavLabel = document.getElementById('detail-fav-label');
  elements.detailCopyBtn = document.getElementById('detail-copy-btn');
  elements.detailShareBtn = document.getElementById('detail-share-btn');
  elements.detailVoteHelpfulBtn = document.getElementById('detail-vote-helpful-btn');
  elements.detailVoteUnhelpfulBtn = document.getElementById('detail-vote-unhelpful-btn');
  elements.detailHelpfulCount = document.getElementById('detail-helpful-count');
  elements.detailUnhelpfulCount = document.getElementById('detail-unhelpful-count');

  // Modal (Add Slang)
  elements.addSlangModal = document.getElementById('add-slang-modal');
  elements.openAddModalBtn = document.getElementById('open-add-modal-btn');
  elements.closeAddModalBtn = document.getElementById('close-add-modal-btn');
  elements.cancelAddBtn = document.getElementById('cancel-add-btn');
  elements.addSlangForm = document.getElementById('add-slang-form');
  elements.modalCategorySelect = document.getElementById('modal-category-select');
  elements.modalRegionSelect = document.getElementById('modal-region-select');

  // Quiz Elements
  elements.quizProgressBar = document.getElementById('quiz-progress-bar');
  elements.quizQuestionNumber = document.getElementById('quiz-question-number');
  elements.quizScoreBadge = document.getElementById('quiz-score-badge');
  elements.quizQuestionText = document.getElementById('quiz-question-text');
  elements.quizOptionsList = document.getElementById('quiz-options-list');
  elements.quizExplanationBox = document.getElementById('quiz-explanation-box');
  elements.quizNextBtn = document.getElementById('quiz-next-btn');
  elements.quizActiveScreen = document.getElementById('quiz-active-screen');
  elements.quizResultView = document.getElementById('quiz-result-view');
  elements.quizResultScore = document.getElementById('quiz-result-score');
  elements.quizResultRank = document.getElementById('quiz-result-rank');
  elements.quizResultFeedback = document.getElementById('quiz-result-feedback');
  elements.quizRestartBtn = document.getElementById('quiz-restart-btn');
  elements.diffPills = document.querySelectorAll('.diff-pill');

  // Toast Container
  elements.toastContainer = document.getElementById('toast-container');
}

/**
 * Category & Region Icon Mappings
 */
const CATEGORY_ICONS = {
  "All": "✨",
  "Everyday Slang": "⚡",
  "Slang Basics": "⚡",
  "Social Media": "📱",
  "Reactions": "💥",
  "Relationships & Friendship": "🤝",
  "Friendship": "🤝",
  "Gaming": "🎮",
  "School & Life": "🎓",
  "Expressions": "🗣️",
  "Acronyms": "🔤",
  "Internet/Meme Culture": "🌐",
  "Memes & Internet": "🌐",
  "Gen Alpha/Newer Slang": "🚀",
  "Gen Alpha / Newer Internet Slang": "🚀",
  "Music & Pop Culture": "🎵",
  "Fashion & Lifestyle": "👗"
};

const REGION_ICONS = {
  "All": "🌍",
  "Global": "🌐",
  "USA": "🇺🇸",
  "UK": "🇬🇧",
  "India": "🇮🇳",
  "Internet/Online": "💻"
};

/**
 * Load stored data from LocalStorage
 */
function loadStoredData() {
  try {
    const storedFavs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (storedFavs) {
      state.favorites = new Set(JSON.parse(storedFavs));
    }
  } catch (e) {
    console.error('Failed to parse favorites from storage', e);
  }

  try {
    const storedRecent = localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED);
    if (storedRecent) {
      state.recentlyViewed = JSON.parse(storedRecent);
    }
  } catch (e) {
    console.error('Failed to parse recently viewed from storage', e);
  }

  try {
    const storedVotes = localStorage.getItem(STORAGE_KEYS.VOTED_SLANGS);
    if (storedVotes) {
      state.votedSlangs = JSON.parse(storedVotes);
    }
  } catch (e) {
    console.error('Failed to parse voted slangs', e);
  }

  let customSlangs = [];
  try {
    const storedCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_SLANGS);
    if (storedCustom) {
      customSlangs = JSON.parse(storedCustom);
    }
  } catch (e) {
    console.error('Failed to parse custom slangs', e);
  }

  try {
    const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (storedProfile) {
      state.profile = { ...state.profile, ...JSON.parse(storedProfile) };
    }
  } catch (e) {
    console.error('Failed to parse profile', e);
  }

  try {
    const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (storedNotifs) {
      state.notifications = JSON.parse(storedNotifs);
    } else {
      state.notifications = [
        {
          id: 'notif-welcome',
          type: 'system',
          icon: '✨',
          title: 'Welcome to Gen Z Dictionary!',
          message: 'Explore 61+ slang terms, voice search, sentence explainer, translator, and community voting.',
          time: 'Just now',
          read: false
        },
        {
          id: 'notif-daily',
          type: 'daily',
          icon: '💡',
          title: 'Word of the Day is Ready',
          message: 'Today’s spotlight term is live on the homepage. Check its meaning, lore, and pronunciation!',
          time: 'Today',
          read: false
        }
      ];
    }
  } catch (e) {
    console.error('Failed to parse notifications', e);
  }

  try {
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (storedSettings) {
      state.settings = { ...state.settings, ...JSON.parse(storedSettings) };
    }
  } catch (e) {
    console.error('Failed to parse settings', e);
  }

  // Initial client dataset fallback
  state.allSlangs = typeof INITIAL_SLANG_DATA !== 'undefined' ? [...customSlangs, ...INITIAL_SLANG_DATA] : [...customSlangs];
  state.quiz.questions = typeof QUIZ_QUESTIONS !== 'undefined' ? [...QUIZ_QUESTIONS] : [];
}

/**
 * Backend Sync: Checks Flask REST API & SQLite Database
 */
async function initBackendSync() {
  try {
    const res = await fetch('/api/slangs');
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        state.allSlangs = data.results;
        state.isBackendOnline = true;
        console.log(' Connected to Flask Backend & SQLite Database! Total slangs:', state.allSlangs.length);
      }
    }
  } catch (err) {
    console.log(' Running in standalone client-side mode (Flask backend offline or static view).');
    state.isBackendOnline = false;
  }
}

/**
 * Initialize Light / Dark Theme
 */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme) {
    state.theme = savedTheme;
  } else {
    state.theme = 'light';
  }
  applyTheme(state.theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (elements.themeIcon && elements.themeText) {
    if (theme === 'light') {
      elements.themeIcon.textContent = '🌙';
      elements.themeText.textContent = 'Dark';
      elements.themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      elements.themeIcon.textContent = '☀️';
      elements.themeText.textContent = 'Light';
      elements.themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    }
  }
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(state.theme);
  showToast(`Switched to ${state.theme === 'dark' ? 'Dark' : 'Light'} Mode! 🎨`);
}

/**
 * Render Category Filter Buttons
 */
function renderCategoryChips() {
  if (!elements.categoryChips) return;
  const categoriesList = typeof CATEGORIES !== 'undefined' ? CATEGORIES : ["All", "Slang Basics", "Social Media", "Reactions", "School & Life"];
  elements.categoryChips.innerHTML = '';
  
  categoriesList.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `chip-btn ${cat === state.currentCategory ? 'active' : ''}`;
    const icon = CATEGORY_ICONS[cat] || '🏷️';
    btn.innerHTML = `<span>${icon}</span> <span>${cat === 'All' ? 'All Slang' : cat}</span>`;
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-category', cat);
    btn.addEventListener('click', () => {
      state.currentCategory = cat;
      document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateActiveCategoryIndicator();
      applyFiltersAndRender();
    });
    elements.categoryChips.appendChild(btn);
  });
}

/**
 * Render Region Filter Buttons
 */
function renderRegionChips() {
  if (!elements.regionChips) return;
  const regionsList = typeof REGIONS !== 'undefined' ? REGIONS : ["All", "Global", "USA", "UK", "India", "Internet/Online"];
  elements.regionChips.innerHTML = '';

  regionsList.forEach(reg => {
    const btn = document.createElement('button');
    btn.className = `region-chip ${reg === state.currentRegion ? 'active' : ''}`;
    const icon = REGION_ICONS[reg] || '🌍';
    btn.innerHTML = `<span>${icon}</span> <span>${reg === 'All' ? 'All Regions' : reg}</span>`;
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-region', reg);
    btn.addEventListener('click', () => {
      state.currentRegion = reg;
      document.querySelectorAll('.region-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFiltersAndRender();
      showToast(`Filtered by Region: ${reg === 'All' ? 'All Regions' : reg} 🌍`);
    });
    elements.regionChips.appendChild(btn);
  });
}

function updateActiveCategoryIndicator() {
  if (elements.activeCategoryIndicator) {
    const catName = state.currentCategory === 'All' ? 'All Slang' : state.currentCategory;
    const regName = state.currentRegion === 'All' ? '' : ` (${state.currentRegion})`;
    elements.activeCategoryIndicator.textContent = `📂 Showing: ${catName}${regName}`;
  }
}

/**
 * Voice Search Integration (SpeechRecognition)
 */
function initVoiceSearch() {
  if (!elements.voiceSearchBtn) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    elements.voiceSearchBtn.addEventListener('click', () => {
      showToast('Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.');
    });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    elements.voiceSearchBtn.classList.add('recording');
    showToast('🎙️ Listening... Speak a slang term now!');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (elements.searchInput) {
      elements.searchInput.value = transcript;
    }
    state.searchQuery = transcript.toLowerCase().trim();
    if (elements.clearSearchBtn) elements.clearSearchBtn.style.display = 'block';
    applyFiltersAndRender();
    showToast(`🎙️ Searched for: "${transcript}"`);
  };

  recognition.onerror = (event) => {
    elements.voiceSearchBtn.classList.remove('recording');
    showToast(`Voice recognition notice: ${event.error}`);
  };

  recognition.onend = () => {
    elements.voiceSearchBtn.classList.remove('recording');
  };

  elements.voiceSearchBtn.addEventListener('click', () => {
    try {
      recognition.start();
    } catch (e) {
      recognition.stop();
    }
  });
}

/**
 * Levenshtein Distance for Smart Search Suggestions
 */
function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function findSmartSuggestion(query) {
  const cleanQ = query.toLowerCase().trim();
  if (!cleanQ || cleanQ.length < 2) return null;
  
  let bestMatch = null;
  let minDistance = 999;

  state.allSlangs.forEach(item => {
    const dist = getLevenshteinDistance(cleanQ, item.word.toLowerCase());
    if (dist < minDistance && dist <= 3) {
      minDistance = dist;
      bestMatch = item;
    }
  });

  return bestMatch;
}

/**
 * Filter and Sort Slang Cards
 */
function applyFiltersAndRender() {
  let filtered = [...state.allSlangs];

  // Tab Filtering (Dictionary vs Bookmarks)
  if (state.currentTab === 'favorites') {
    filtered = filtered.filter(item => state.favorites.has(item.id));
  }

  // Category Filtering
  if (state.currentCategory !== 'All') {
    filtered = filtered.filter(item => item.category === state.currentCategory);
  }

  // Region Filtering
  if (state.currentRegion !== 'All') {
    filtered = filtered.filter(item => (item.region || 'Global') === state.currentRegion);
  }

  // Search Query Filtering
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(item => {
      const inWord = (item.word || '').toLowerCase().includes(q);
      const inMeaning = (item.meaning || '').toLowerCase().includes(q);
      const inExample = (item.example || '').toLowerCase().includes(q);
      const inTags = (item.tags || []).some(t => (t || '').toLowerCase().includes(q));
      const inRegion = (item.region || '').toLowerCase().includes(q);
      return inWord || inMeaning || inExample || inTags || inRegion;
    });
  }

  // Sorting
  switch (state.sortBy) {
    case 'alpha-asc':
      filtered.sort((a, b) => a.word.localeCompare(b.word));
      break;
    case 'alpha-desc':
      filtered.sort((a, b) => b.word.localeCompare(a.word));
      break;
    case 'random':
      filtered.sort(() => Math.random() - 0.5);
      break;
    case 'popularity':
    default:
      filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      break;
  }

  state.filteredSlangs = filtered;
  renderSlangCards();
  updateStatsBar();
}

/**
 * Render Slang Cards into Grid
 */
function renderSlangCards() {
  if (!elements.slangGrid) return;
  elements.slangGrid.innerHTML = '';

  if (state.filteredSlangs.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';

    if (state.searchQuery) {
      const suggestion = findSmartSuggestion(state.searchQuery);
      let suggestionHtml = '';
      if (suggestion) {
        suggestionHtml = `
          <div class="did-you-mean-card">
            <span class="suggestion-text">Did you mean: <strong class="suggestion-word-link" onclick="applySearchQuery('${escapeHTML(suggestion.word)}')">${escapeHTML(suggestion.word)}</strong>?</span>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${escapeHTML(suggestion.meaning)}</p>
          </div>
        `;
      }

      empty.innerHTML = `
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">No slang found matching "${escapeHTML(state.searchQuery)}"</h3>
        ${suggestionHtml}
        <p class="empty-desc">
          Can't find what you're looking for? Contribute this slang term to the dictionary so others can learn it!
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <button class="nav-btn primary" onclick="openAddSlangModalWithWord('${escapeHTML(state.searchQuery)}')">+ Add "${escapeHTML(state.searchQuery)}"</button>
          <button class="nav-btn" id="empty-clear-btn">Clear Search Filter</button>
        </div>
      `;
      elements.slangGrid.appendChild(empty);

      const clearBtn = empty.querySelector('#empty-clear-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          elements.searchInput.value = '';
          state.searchQuery = '';
          if (elements.clearSearchBtn) elements.clearSearchBtn.style.display = 'none';
          state.displayLimit = 60;
          applyFiltersAndRender();
        });
      }
      return;
    }

    empty.innerHTML = `
      <div class="empty-icon">🧐</div>
      <h3 class="empty-title">No slang found in this view</h3>
      <p class="empty-desc">
        ${state.currentTab === 'favorites' 
          ? "You haven't bookmarked any slang yet! Click the star icon on any card to save your favorites." 
          : "Try selecting a different category or region filter above."}
      </p>
      ${state.currentTab !== 'favorites' 
        ? `<button class="nav-btn primary" onclick="openAddSlangModal()">+ Add Slang Term</button>` 
        : `<button class="nav-btn primary" onclick="switchTab('dictionary')">Browse All Slang</button>`}
    `;
    elements.slangGrid.appendChild(empty);
    return;
  }

  const itemsToRender = state.filteredSlangs.slice(0, state.displayLimit);

  itemsToRender.forEach(item => {
    const isFav = state.favorites.has(item.id);
    const userVote = state.votedSlangs[item.id];
    const badgeClass = getBadgeClass(item.category, item.isCustom);

    const card = document.createElement('div');
    card.className = 'slang-card';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-emoji-word" style="cursor: pointer;" title="Click to view full details">
            <span class="card-emoji">${item.emoji || '💬'}</span>
            <h3 class="card-word">${highlightMatch(escapeHTML(item.word), state.searchQuery)}</h3>
            <button class="speaker-btn" title="Pronounce '${escapeHTML(item.word)}' aloud" aria-label="Pronounce ${escapeHTML(item.word)} aloud" data-speak-btn="${escapeHTML(item.word)}">
              🔊
            </button>
          </div>
          <div class="card-pronunciation">
            <span>${escapeHTML(item.pronunciation || '')}</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
          <span class="card-region-pill">${REGION_ICONS[item.region] || '🌍'} ${escapeHTML(item.region || 'Global')}</span>
          <span class="card-category-badge ${badgeClass}">${escapeHTML(item.category)}</span>
        </div>
      </div>

      <div class="card-body" style="cursor: pointer;" title="Click to view full details">
        <p class="card-meaning">${highlightMatch(escapeHTML(item.meaning), state.searchQuery)}</p>
        <div class="card-example">“${highlightMatch(escapeHTML(item.example), state.searchQuery)}”</div>
        ${item.origin ? `<div class="card-origin"><strong>Context:</strong> ${escapeHTML(item.origin)}</div>` : ''}
      </div>

      <!-- Community Feedback Bar -->
      <div class="card-feedback-actions">
        <button class="card-vote-btn ${userVote === 'helpful' ? 'voted-helpful' : ''}" data-vote="helpful" data-id="${item.id}" title="Helpful Definition">
          👍 Helpful (${item.helpful_count || 0})
        </button>
        <button class="card-vote-btn ${userVote === 'not_helpful' ? 'voted-unhelpful' : ''}" data-vote="not_helpful" data-id="${item.id}" title="Not Helpful Definition">
          👎 Not Helpful (${item.not_helpful_count || 0})
        </button>
      </div>

      <div class="card-footer">
        <div class="card-tags">
          ${(item.tags || []).slice(0, 3).map(tag => `<span class="card-tag">#${escapeHTML(tag)}</span>`).join('')}
        </div>
        <div class="card-actions">
          <button class="action-btn" title="View full details" data-details-id="${item.id}" aria-label="View details">
            🔍 Details
          </button>
          <button class="action-btn" title="Pronounce '${escapeHTML(item.word)}' aloud" data-speak-action="${item.id}" aria-label="Pronounce aloud">
            🔊
          </button>
          <button class="action-btn" title="Copy slang and meaning" data-copy-id="${item.id}" aria-label="Copy meaning">
            📋
          </button>
          <button class="action-btn" title="Share slang" data-share-id="${item.id}" aria-label="Share slang">
            📤
          </button>
          <button class="action-btn icon-only ${isFav ? 'active' : ''}" title="${isFav ? 'Remove from bookmarks' : 'Add to bookmarks'}" data-fav-id="${item.id}" aria-label="Toggle bookmark">
            ★
          </button>
        </div>
      </div>
    `;

    // Card interactions
    card.querySelector('.card-emoji-word').addEventListener('click', (e) => {
      if (e.target.closest('.speaker-btn')) return;
      openSlangDetailsModal(item.id);
    });
    card.querySelector('.card-body').addEventListener('click', () => {
      openSlangDetailsModal(item.id);
    });

    const detailsBtn = card.querySelector('[data-details-id]');
    detailsBtn.addEventListener('click', () => openSlangDetailsModal(item.id));

    // Audio pronounce buttons
    const headerSpeakBtn = card.querySelector('[data-speak-btn]');
    const actionSpeakBtn = card.querySelector('[data-speak-action]');
    headerSpeakBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakWord(item.word, headerSpeakBtn);
      addToRecentlyViewed(item);
    });
    actionSpeakBtn.addEventListener('click', () => {
      speakWord(item.word, actionSpeakBtn);
      addToRecentlyViewed(item);
    });

    // Copy & Share
    card.querySelector('[data-copy-id]').addEventListener('click', () => copySlangText(item));
    card.querySelector('[data-share-id]').addEventListener('click', () => shareSlang(item));

    // Bookmark Toggle
    const favBtn = card.querySelector('[data-fav-id]');
    favBtn.addEventListener('click', () => toggleFavorite(item.id, favBtn));

    // Feedback voting buttons
    card.querySelectorAll('.card-vote-btn').forEach(vBtn => {
      vBtn.addEventListener('click', () => {
        const voteType = vBtn.dataset.vote;
        voteSlang(item.id, voteType);
      });
    });

    elements.slangGrid.appendChild(card);
  });

  // Load More Button if there are remaining items
  if (state.filteredSlangs.length > state.displayLimit) {
    const remaining = state.filteredSlangs.length - state.displayLimit;
    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.style.gridColumn = '1 / -1';
    loadMoreContainer.style.display = 'flex';
    loadMoreContainer.style.justifyContent = 'center';
    loadMoreContainer.style.padding = '1.5rem 0';
    loadMoreContainer.innerHTML = `
      <button class="nav-btn primary" id="load-more-btn" style="padding: 0.75rem 2rem; font-size: 0.95rem; cursor: pointer; border-radius: var(--radius-full); box-shadow: var(--shadow-md);">
        ⬇️ Load More Slang (${Math.min(60, remaining)} of ${remaining} remaining)
      </button>
    `;
    loadMoreContainer.querySelector('#load-more-btn').addEventListener('click', () => {
      state.displayLimit += 60;
      renderSlangCards();
      updateStatsBar();
    });
    elements.slangGrid.appendChild(loadMoreContainer);
  }
}

/**
 * Community Feedback Voting with SQLite and localStorage duplicate prevention
 */
async function voteSlang(slangId, voteType) {
  if (state.votedSlangs[slangId]) {
    showToast(`You already voted on this slang! (Voted: ${state.votedSlangs[slangId] === 'helpful' ? '👍 Helpful' : '👎 Not Helpful'})`);
    return;
  }

  // Record vote in state & localStorage
  state.votedSlangs[slangId] = voteType;
  localStorage.setItem(STORAGE_KEYS.VOTED_SLANGS, JSON.stringify(state.votedSlangs));

  // Find and increment local state counts
  const target = state.allSlangs.find(s => s.id === slangId);
  if (target) {
    if (voteType === 'helpful') target.helpful_count = (target.helpful_count || 0) + 1;
    else target.not_helpful_count = (target.not_helpful_count || 0) + 1;
  }

  // If backend is online, call Flask endpoint
  if (state.isBackendOnline) {
    try {
      await fetch(`/api/slangs/${slangId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: voteType })
      });
    } catch (e) {
      console.log('Voting recorded in local storage.');
    }
  }

  applyFiltersAndRender();
  if (state.selectedSlangForDetails && state.selectedSlangForDetails.id === slangId) {
    updateDetailsModalFeedback(target);
  }
  showToast(`Thanks for your feedback! Voted: ${voteType === 'helpful' ? '👍 Helpful' : '👎 Not Helpful'}`);
}

function updateDetailsModalFeedback(item) {
  if (elements.detailHelpfulCount) elements.detailHelpfulCount.textContent = item.helpful_count || 0;
  if (elements.detailUnhelpfulCount) elements.detailUnhelpfulCount.textContent = item.not_helpful_count || 0;
  
  const userVote = state.votedSlangs[item.id];
  if (elements.detailVoteHelpfulBtn) {
    elements.detailVoteHelpfulBtn.classList.toggle('voted', userVote === 'helpful');
  }
  if (elements.detailVoteUnhelpfulBtn) {
    elements.detailVoteUnhelpfulBtn.classList.toggle('voted', userVote === 'not_helpful');
  }
}

/**
 * AI-Style Sentence Explainer Feature
 */
function initSentenceExplainer() {
  if (!elements.analyzeSentenceBtn) return;

  elements.analyzeSentenceBtn.addEventListener('click', () => {
    const text = elements.sentenceInput.value.trim();
    if (!text) {
      showToast('Please enter or paste a sentence to explain!');
      return;
    }
    analyzeSentence(text);
  });

  if (elements.sentenceSampleBtn) {
    const sampleSentences = [
      "Bro has insane rizz, no cap 💀 and she ate with that outfit fr fr",
      "I haven't studied at all and the exam is in 10 minutes, I am completely cooked 🍳",
      "Thinking he will text back after 3 days is peak delulu behavior 🤪",
      "She put on her sunglasses and radiated pure main character energy ✨",
      "My phone broke so I used two binder clips as a jugaad 🛠️"
    ];
    elements.sentenceSampleBtn.addEventListener('click', () => {
      const sample = sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
      elements.sentenceInput.value = sample;
      analyzeSentence(sample);
    });
  }

  if (elements.sentenceClearBtn) {
    elements.sentenceClearBtn.addEventListener('click', () => {
      elements.sentenceInput.value = '';
      elements.sentenceResultContainer.style.display = 'none';
    });
  }
}

async function analyzeSentence(sentence) {
  showToast('🧩 Analyzing sentence structure and slang lore...');
  let result = null;

  if (state.isBackendOnline) {
    try {
      const res = await fetch('/api/ai/explain-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence })
      });
      if (res.ok) result = await res.json();
    } catch (e) {
      console.log('Falling back to client-side sentence breakdown.');
    }
  }

  // Client-side fallback if backend unreachable
  if (!result) {
    result = analyzeSentenceLocally(sentence);
  }

  renderSentenceExplanation(result);
}

function analyzeSentenceLocally(sentence) {
  const identified = [];
  const textLower = sentence.toLowerCase();

  state.allSlangs.forEach(slang => {
    if (textLower.includes(slang.word.toLowerCase())) {
      identified.push({
        id: slang.id,
        word: slang.word,
        emoji: slang.emoji || '💬',
        meaning: slang.meaning,
        category: slang.category,
        region: slang.region || 'Global'
      });
    }
  });

  return {
    original_sentence: sentence,
    translated_sentence: "Clean interpretation: " + sentence.replace(/no cap/gi, 'honestly').replace(/rizz/gi, 'charisma').replace(/cooked/gi, 'in deep trouble').replace(/delulu/gi, 'delusional').replace(/ate/gi, 'did an exceptional job'),
    tone: "✨ Expressive & Casual Pop-Culture Slang",
    slang_count: identified.length,
    identified_terms: identified
  };
}

function renderSentenceExplanation(data) {
  if (!elements.sentenceResultContainer) return;
  elements.sentenceResultContainer.style.display = 'flex';
  
  if (elements.sentenceToneBadge) {
    elements.sentenceToneBadge.textContent = data.tone || '🎭 Casual & Pop-Culture';
  }
  if (elements.sentenceEnglishTranslation) {
    elements.sentenceEnglishTranslation.textContent = data.translated_sentence || data.original_sentence;
  }
  if (elements.detectedCount) {
    elements.detectedCount.textContent = (data.identified_terms || []).length;
  }

  if (elements.detectedTermsGrid) {
    elements.detectedTermsGrid.innerHTML = '';
    if (!data.identified_terms || data.identified_terms.length === 0) {
      elements.detectedTermsGrid.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">No specific indexed slang words identified. Try adding common terms like rizz, cap, delulu, or cooked.</p>';
      return;
    }

    data.identified_terms.forEach(term => {
      const card = document.createElement('div');
      card.className = 'detected-term-card';
      card.innerHTML = `
        <div class="detected-term-head">
          <span class="detected-term-word">${term.emoji || '💬'} ${escapeHTML(term.word)}</span>
          <span class="card-category-badge badge-basics" style="font-size:0.7rem;">${escapeHTML(term.category || 'Slang')}</span>
        </div>
        <p class="detected-term-meaning">${escapeHTML(term.meaning)}</p>
        <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 0.5rem;">
          <button class="nav-btn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="speakWord('${escapeHTML(term.word)}')">🔊 Pronounce</button>
        </div>
      `;
      elements.detectedTermsGrid.appendChild(card);
    });
  }
}

/**
 * Slang Translator Feature
 */
function initTranslator() {
  if (!elements.translateActionBtn) return;

  elements.translateActionBtn.addEventListener('click', () => {
    const text = elements.transSourceInput.value.trim();
    if (!text) {
      showToast('Please enter some text to translate!');
      return;
    }
    translateText(text, state.translator.mode);
  });

  if (elements.swapTransModeBtn) {
    elements.swapTransModeBtn.addEventListener('click', () => {
      state.translator.mode = state.translator.mode === 'to_genz' ? 'to_english' : 'to_genz';
      updateTranslatorLabels();
      const currentInput = elements.transSourceInput.value;
      const currentOutput = elements.transTargetOutput.innerText;
      if (currentOutput && !currentOutput.includes('Translation will appear')) {
        elements.transSourceInput.value = currentOutput;
        translateText(currentOutput, state.translator.mode);
      }
      showToast(`Mode switched: ${state.translator.mode === 'to_genz' ? 'Standard English ➔ Gen Z' : 'Gen Z ➔ Standard English'} 🔄`);
    });
  }

  if (elements.clearTransBtn) {
    elements.clearTransBtn.addEventListener('click', () => {
      elements.transSourceInput.value = '';
      elements.transTargetOutput.innerHTML = '<span class="trans-placeholder">Translation will appear here instantly...</span>';
    });
  }

  if (elements.copyTransBtn) {
    elements.copyTransBtn.addEventListener('click', () => {
      const text = elements.transTargetOutput.innerText;
      if (!text || text.includes('Translation will appear')) return;
      navigator.clipboard.writeText(text);
      showToast('📋 Translated text copied to clipboard!');
    });
  }

  if (elements.speakTransBtn) {
    elements.speakTransBtn.addEventListener('click', () => {
      const text = elements.transTargetOutput.innerText;
      if (!text || text.includes('Translation will appear')) return;
      speakWord(text);
    });
  }

  // Quick preset chips
  document.querySelectorAll('.trans-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const mode = chip.dataset.mode || 'to_genz';
      const text = chip.dataset.text || '';
      state.translator.mode = mode;
      updateTranslatorLabels();
      elements.transSourceInput.value = text;
      translateText(text, mode);
    });
  });
}

function updateTranslatorLabels() {
  const isToGenZ = state.translator.mode === 'to_genz';
  if (elements.transSourcePill) {
    elements.transSourcePill.textContent = isToGenZ ? 'Standard English' : 'Gen Z Slang';
  }
  if (elements.transTargetPill) {
    elements.transTargetPill.textContent = isToGenZ ? 'Gen Z Slang' : 'Standard English';
  }
  if (elements.transSourceLabel) {
    elements.transSourceLabel.textContent = isToGenZ ? 'Standard English Input:' : 'Gen Z Slang Input:';
  }
  if (elements.transTargetLabel) {
    elements.transTargetLabel.textContent = isToGenZ ? 'Gen Z Slang Translation:' : 'Plain English Translation:';
  }
}

async function translateText(text, mode) {
  if (elements.transStatusBadge) elements.transStatusBadge.textContent = 'Translating...';

  if (state.isBackendOnline) {
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode })
      });
      if (res.ok) {
        const data = await res.json();
        elements.transTargetOutput.textContent = data.translated;
        if (elements.transStatusBadge) elements.transStatusBadge.textContent = 'Ready';
        return;
      }
    } catch (e) {
      console.log('Using client fallback for translation.');
    }
  }

  // Client-side fallback translation
  let out = text;
  if (mode === 'to_genz') {
    out = out.replace(/honestly|to be honest/gi, 'no cap fr')
             .replace(/charismatic|charming/gi, 'insane rizz')
             .replace(/in deep trouble|doomed/gi, 'completely cooked')
             .replace(/mediocre|disappointing/gi, 'super mid')
             .replace(/did a great job|perfection/gi, 'ate and left no crumbs');
  } else {
    out = out.replace(/no cap/gi, 'truthfully')
             .replace(/rizz/gi, 'charm and charisma')
             .replace(/cooked/gi, 'in deep trouble')
             .replace(/mid/gi, 'mediocre')
             .replace(/delulu/gi, 'delusional');
  }
  elements.transTargetOutput.textContent = out;
  if (elements.transStatusBadge) elements.transStatusBadge.textContent = 'Ready';
}

/**
 * Trending Slang Dashboard View
 */
async function renderTrendingDashboard() {
  let trendingData = null;
  if (state.isBackendOnline) {
    try {
      const res = await fetch('/api/trending');
      if (res.ok) trendingData = await res.json();
    } catch (e) {
      console.log('Using local state for trending board.');
    }
  }

  if (!trendingData) {
    // Local state fallback
    const sortedSearched = [...state.allSlangs].sort((a,b) => (b.search_count || 0) - (a.search_count || 0)).slice(0, 5);
    const sortedViewed = [...state.allSlangs].sort((a,b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);
    const sortedVoted = [...state.allSlangs].sort((a,b) => (b.helpful_count || 0) - (a.helpful_count || 0)).slice(0, 5);
    const recent = [...state.allSlangs].slice(0, 5);
    trendingData = {
      top_searched: sortedSearched,
      top_viewed: sortedViewed,
      top_voted: sortedVoted,
      recent_added: recent
    };
  }

  renderLeaderboard(elements.boardSearchedList, trendingData.top_searched, 'searches', 'search_count');
  renderLeaderboard(elements.boardViewedList, trendingData.top_viewed, 'views', 'view_count');
  renderLeaderboard(elements.boardVotedList, trendingData.top_voted, 'votes', 'helpful_count');
  renderLeaderboard(elements.boardRecentList, trendingData.recent_added, 'new', 'popularity');
}

function renderLeaderboard(container, list, unit, countProp) {
  if (!container) return;
  container.innerHTML = '';
  if (!list || list.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No activity data yet.</p>';
    return;
  }

  list.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'board-item';
    el.innerHTML = `
      <div class="board-item-left">
        <span class="board-rank-badge">#${index + 1}</span>
        <span style="font-size: 1.1rem;">${item.emoji || '💬'}</span>
        <span class="board-item-word">${escapeHTML(item.word)}</span>
      </div>
      <span class="board-count-pill">${item[countProp] || (index+1)*120} ${unit}</span>
    `;
    el.addEventListener('click', () => openSlangDetailsModal(item.id));
    container.appendChild(el);
  });
}

/**
 * Quiz Difficulty Selector
 */
function initQuizDifficulty() {
  if (!elements.diffPills) return;
  elements.diffPills.forEach(pill => {
    pill.addEventListener('click', () => {
      elements.diffPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.quiz.difficulty = pill.dataset.difficulty || 'All';
      startQuiz();
      showToast(`Quiz difficulty set to: ${state.quiz.difficulty} 🎯`);
    });
  });
}

/**
 * Start & Manage Quiz
 */
async function startQuiz() {
  state.quiz.currentQuestion = 0;
  state.quiz.score = 0;
  state.quiz.answered = false;

  if (state.isBackendOnline) {
    try {
      const res = await fetch(`/api/quiz?difficulty=${state.quiz.difficulty}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.questions && data.questions.length > 0) {
          state.quiz.questions = data.questions;
        }
      }
    } catch (e) {
      console.log('Quiz loaded from local questions.');
    }
  }

  if (!state.quiz.questions || state.quiz.questions.length === 0) {
    state.quiz.questions = typeof QUIZ_QUESTIONS !== 'undefined' ? [...QUIZ_QUESTIONS] : [];
  }

  if (elements.quizResultView) elements.quizResultView.style.display = 'none';
  if (elements.quizActiveScreen) elements.quizActiveScreen.style.display = 'block';
  loadQuestion();
}

function loadQuestion() {
  state.quiz.answered = false;
  const q = state.quiz.questions[state.quiz.currentQuestion];
  if (!q) return;

  const total = state.quiz.questions.length;
  const curr = state.quiz.currentQuestion + 1;

  if (elements.quizQuestionNumber) elements.quizQuestionNumber.textContent = `Question ${curr} of ${total}`;
  if (elements.quizScoreBadge) elements.quizScoreBadge.textContent = `Score: ${state.quiz.score}`;
  if (elements.quizProgressBar) elements.quizProgressBar.style.width = `${((curr - 1) / total) * 100}%`;
  if (elements.quizQuestionText) elements.quizQuestionText.textContent = q.question;
  if (elements.quizExplanationBox) elements.quizExplanationBox.style.display = 'none';
  if (elements.quizNextBtn) elements.quizNextBtn.style.display = 'none';

  if (elements.quizOptionsList) {
    elements.quizOptionsList.innerHTML = '';
    const options = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []);
    
    options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleQuizAnswer(idx, q.correct_index !== undefined ? q.correct_index : q.correctIndex, q.explanation));
      elements.quizOptionsList.appendChild(btn);
    });
  }
}

function handleQuizAnswer(selectedIdx, correctIdx, explanation) {
  if (state.quiz.answered) return;
  state.quiz.answered = true;

  const buttons = elements.quizOptionsList.querySelectorAll('.quiz-option-btn');
  const isCorrect = selectedIdx === correctIdx;

  if (isCorrect) {
    state.quiz.score++;
    buttons[selectedIdx].classList.add('correct');
  } else {
    buttons[selectedIdx].classList.add('wrong');
    if (buttons[correctIdx]) buttons[correctIdx].classList.add('correct');
  }

  if (elements.quizScoreBadge) elements.quizScoreBadge.textContent = `Score: ${state.quiz.score}`;
  if (elements.quizExplanationBox) {
    elements.quizExplanationBox.style.display = 'block';
    elements.quizExplanationBox.innerHTML = `<strong>${isCorrect ? '✅ Spot on!' : '❌ Not quite!'}</strong> ${escapeHTML(explanation || '')}`;
  }

  if (elements.quizNextBtn) {
    elements.quizNextBtn.style.display = 'inline-block';
    elements.quizNextBtn.textContent = (state.quiz.currentQuestion + 1 >= state.quiz.questions.length) ? 'View Final Results 🏆' : 'Next Question ➡️';
  }
}

function nextQuestion() {
  state.quiz.currentQuestion++;
  if (state.quiz.currentQuestion >= state.quiz.questions.length) {
    showQuizResults();
  } else {
    loadQuestion();
  }
}

function showQuizResults() {
  if (elements.quizActiveScreen) elements.quizActiveScreen.style.display = 'none';
  if (elements.quizResultView) elements.quizResultView.style.display = 'block';
  if (elements.quizProgressBar) elements.quizProgressBar.style.width = '100%';

  const total = state.quiz.questions.length;
  const score = state.quiz.score;
  const pct = Math.round((score / total) * 100);

  if (elements.quizResultScore) elements.quizResultScore.textContent = `You scored ${score} out of ${total} (${pct}%)`;

  let rank = "🏆 Certified Sigma";
  let desc = "You're a fluent slang dictionary master! No cap!";
  if (pct < 50) {
    rank = "👴 Boomer Energy";
    desc = "You might need to spend more time studying our dictionary cards!";
  } else if (pct < 80) {
    rank = "📱 Casual Scroller";
    desc = "You know your basics, but still have room to level up!";
  }

  if (elements.quizResultRank) elements.quizResultRank.textContent = rank;
  if (elements.quizResultFeedback) elements.quizResultFeedback.textContent = desc;

  // Save best score to profile
  state.profile.quizBestScore = `${score}/${total} (${pct}%)`;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
}

/**
 * Tab Navigation (Dictionary, Sentence Explainer, Translator, Quiz, Trending, Bookmarks, Profile, Notifications, Settings)
 */
function switchTab(tabName) {
  state.currentTab = tabName;
  elements.viewTabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Hide all dynamic view sections
  if (elements.dictionaryView) elements.dictionaryView.style.display = 'none';
  if (elements.sentenceExplainerView) elements.sentenceExplainerView.style.display = 'none';
  if (elements.translatorView) elements.translatorView.style.display = 'none';
  if (elements.trendingView) elements.trendingView.style.display = 'none';
  if (elements.quizView) elements.quizView.style.display = 'none';
  if (elements.profileView) elements.profileView.style.display = 'none';
  if (elements.notificationsView) elements.notificationsView.style.display = 'none';
  if (elements.settingsView) elements.settingsView.style.display = 'none';

  // Toggle hero / spotlight / filter bars
  const isFeedTab = tabName === 'dictionary' || tabName === 'favorites';
  if (elements.heroSection) elements.heroSection.style.display = isFeedTab ? 'block' : 'none';
  if (elements.spotlightSection) elements.spotlightSection.style.display = tabName === 'dictionary' ? 'block' : 'none';
  if (elements.statsDashboardSection) elements.statsDashboardSection.style.display = isFeedTab ? 'block' : 'none';
  if (elements.recentlyViewedSection) elements.recentlyViewedSection.style.display = tabName === 'dictionary' ? 'block' : 'none';
  if (elements.filterControls) elements.filterControls.style.display = isFeedTab ? 'flex' : 'none';

  if (tabName === 'sentence-explainer') {
    elements.sentenceExplainerView.style.display = 'block';
  } else if (tabName === 'translator') {
    elements.translatorView.style.display = 'block';
  } else if (tabName === 'trending') {
    elements.trendingView.style.display = 'block';
    renderTrendingDashboard();
  } else if (tabName === 'quiz') {
    elements.quizView.style.display = 'block';
    startQuiz();
  } else if (tabName === 'profile') {
    elements.profileView.style.display = 'block';
    renderProfileView();
  } else if (tabName === 'notifications') {
    elements.notificationsView.style.display = 'block';
    renderNotificationsView();
  } else if (tabName === 'settings') {
    elements.settingsView.style.display = 'block';
    renderSettingsView();
  } else {
    elements.dictionaryView.style.display = 'block';
    applyFiltersAndRender();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Slang Details Modal
 */
function openSlangDetailsModal(slangId) {
  const slang = state.allSlangs.find(s => s.id === slangId);
  if (!slang) return;

  state.selectedSlangForDetails = slang;
  addToRecentlyViewed(slang);

  // If backend online, trigger view count increment
  if (state.isBackendOnline) {
    fetch(`/api/slangs/${slangId}`).catch(() => {});
  }

  if (elements.detailCategoryBadge) {
    elements.detailCategoryBadge.textContent = slang.category;
    elements.detailCategoryBadge.className = `card-category-badge ${getBadgeClass(slang.category, slang.isCustom)}`;
  }
  if (elements.detailRegionBadge) {
    elements.detailRegionBadge.textContent = `${REGION_ICONS[slang.region] || '🌍'} ${slang.region || 'Global'}`;
  }
  if (elements.detailPopularityBadge) {
    elements.detailPopularityBadge.textContent = `🔥 ${slang.popularity || 90}% Popularity`;
  }
  if (elements.detailEmoji) elements.detailEmoji.textContent = slang.emoji || '💬';
  if (elements.detailWord) elements.detailWord.textContent = slang.word;
  if (elements.detailPronunciation) elements.detailPronunciation.textContent = slang.pronunciation || `/${slang.word.toLowerCase()}/`;
  if (elements.detailMeaning) elements.detailMeaning.textContent = slang.meaning;
  if (elements.detailExample) elements.detailExample.textContent = `“${slang.example}”`;

  if (elements.detailOriginContainer && elements.detailOrigin) {
    if (slang.origin) {
      elements.detailOriginContainer.style.display = 'block';
      elements.detailOrigin.textContent = slang.origin;
    } else {
      elements.detailOriginContainer.style.display = 'none';
    }
  }

  if (elements.detailTagsList) {
    elements.detailTagsList.innerHTML = (slang.tags || []).map(t => `<span class="detail-tag-chip">#${escapeHTML(t)}</span>`).join('');
  }

  updateDetailsModalFeedback(slang);
  updateDetailsModalFavState();
  elements.slangDetailsModal.classList.add('active');
}

function updateDetailsModalFavState() {
  if (!state.selectedSlangForDetails) return;
  const isFav = state.favorites.has(state.selectedSlangForDetails.id);
  if (elements.detailFavBtn) {
    elements.detailFavBtn.classList.toggle('active', isFav);
    elements.detailFavLabel.textContent = isFav ? 'Bookmarked' : 'Bookmark';
  }
}

function closeSlangDetailsModal() {
  elements.slangDetailsModal.classList.remove('active');
  state.selectedSlangForDetails = null;
}

/**
 * Word of the Day (Spotlight)
 */
function initSpotlight() {
  if (state.allSlangs.length === 0) return;
  const today = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = today.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % state.allSlangs.length;
  state.spotlightSlang = state.allSlangs[index];
  renderSpotlight();
}

function renderSpotlight() {
  const slang = state.spotlightSlang;
  if (!slang) return;
  if (elements.spotlightWord) elements.spotlightWord.textContent = slang.word;
  if (elements.spotlightPronunciation) elements.spotlightPronunciation.textContent = slang.pronunciation || '';
  if (elements.spotlightMeaning) elements.spotlightMeaning.textContent = slang.meaning;
  if (elements.spotlightExample) elements.spotlightExample.textContent = `“${slang.example}”`;
  if (elements.spotlightCategory) {
    elements.spotlightCategory.textContent = slang.category;
    elements.spotlightCategory.className = `card-category-badge ${getBadgeClass(slang.category, slang.isCustom)}`;
  }
}

function randomizeSpotlight() {
  const randIndex = Math.floor(Math.random() * state.allSlangs.length);
  state.spotlightSlang = state.allSlangs[randIndex];
  renderSpotlight();
  showToast(`Randomized spotlight: "${state.spotlightSlang.word}" 🎲`);
}

/**
 * Text-to-Speech Engine
 */
function speakWord(word, buttonEl) {
  if (!('speechSynthesis' in window)) {
    showToast('Text-to-speech is not supported by your browser.');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = state.settings.speechRate || 0.9;
  utterance.pitch = state.settings.speechPitch || 1.0;
  
  if (state.settings.speechVoice) {
    const voices = window.speechSynthesis.getVoices();
    const chosen = voices.find(v => v.name === state.settings.speechVoice);
    if (chosen) utterance.voice = chosen;
  }

  if (buttonEl) buttonEl.classList.add('speaking');
  utterance.onend = () => { if (buttonEl) buttonEl.classList.remove('speaking'); };
  utterance.onerror = () => { if (buttonEl) buttonEl.classList.remove('speaking'); };

  window.speechSynthesis.speak(utterance);
}

/**
 * Recently Viewed History
 */
function addToRecentlyViewed(slang) {
  state.recentlyViewed = state.recentlyViewed.filter(id => id !== slang.id);
  state.recentlyViewed.unshift(slang.id);
  if (state.recentlyViewed.length > 5) state.recentlyViewed = state.recentlyViewed.slice(0, 5);
  localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(state.recentlyViewed));
  renderRecentlyViewed();
  updateStatistics();
}

function renderRecentlyViewed() {
  if (!elements.recentlyViewedList) return;
  elements.recentlyViewedList.innerHTML = '';
  if (state.recentlyViewed.length === 0) {
    elements.recentlyViewedList.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem; font-style:italic;">No words viewed yet. Click any slang card to view details!</span>';
    if (elements.recentCounterBadge) elements.recentCounterBadge.textContent = '0 words';
    return;
  }

  if (elements.recentCounterBadge) {
    elements.recentCounterBadge.textContent = `${state.recentlyViewed.length} word${state.recentlyViewed.length === 1 ? '' : 's'}`;
  }

  state.recentlyViewed.forEach(id => {
    const item = state.allSlangs.find(s => s.id === id);
    if (!item) return;
    const chip = document.createElement('div');
    chip.className = 'recent-chip';
    chip.innerHTML = `<span>${item.emoji || '💬'}</span> <span>${escapeHTML(item.word)}</span>`;
    chip.addEventListener('click', () => openSlangDetailsModal(item.id));
    elements.recentlyViewedList.appendChild(chip);
  });
}

function clearRecentlyViewed() {
  state.recentlyViewed = [];
  localStorage.removeItem(STORAGE_KEYS.RECENTLY_VIEWED);
  renderRecentlyViewed();
  updateStatistics();
  showToast('Recently viewed history cleared! 🧹');
}

/**
 * Bookmarks & Favorites
 */
function toggleFavorite(id, buttonEl) {
  const slang = state.allSlangs.find(s => s.id === id);
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    if (buttonEl) buttonEl.classList.remove('active');
    showToast(`Removed "${slang ? slang.word : 'Slang'}" from bookmarks.`);
  } else {
    state.favorites.add(id);
    if (buttonEl) buttonEl.classList.add('active');
    showToast(`Saved "${slang ? slang.word : 'Slang'}" to bookmarks! ⭐`);
  }
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([...state.favorites]));
  updateFavoritesCount();
  updateStatistics();
  if (state.currentTab === 'favorites') applyFiltersAndRender();
  updateDetailsModalFavState();
}

function updateFavoritesCount() {
  const count = state.favorites.size;
  if (elements.favTabCount) elements.favTabCount.textContent = count;
  if (elements.profileFavCount) elements.profileFavCount.textContent = count;
}

/**
 * Add New Slang Modal & Form Handling
 */
function openAddSlangModal() {
  elements.addSlangModal.classList.add('active');
  populateModalCategories();
}

function openAddSlangModalWithWord(word) {
  openAddSlangModal();
  const wordInput = document.getElementById('modal-word');
  if (wordInput) wordInput.value = word;
}

function closeAddSlangModal() {
  elements.addSlangModal.classList.remove('active');
  elements.addSlangForm.reset();
}

function populateModalCategories() {
  if (!elements.modalCategorySelect) return;
  const categoriesList = typeof CATEGORIES !== 'undefined' ? CATEGORIES : ["All", "Slang Basics", "Social Media", "Reactions", "School & Life"];
  elements.modalCategorySelect.innerHTML = '';
  categoriesList.filter(c => c !== 'All').forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    elements.modalCategorySelect.appendChild(opt);
  });
}

async function handleAddSlangSubmit(e) {
  e.preventDefault();
  const word = document.getElementById('modal-word').value.trim();
  const pronunciation = document.getElementById('modal-pronunciation').value.trim();
  const category = elements.modalCategorySelect.value;
  const region = elements.modalRegionSelect ? elements.modalRegionSelect.value : 'Global';
  const emoji = document.getElementById('modal-emoji').value.trim() || '💬';
  const meaning = document.getElementById('modal-meaning').value.trim();
  const example = document.getElementById('modal-example').value.trim();
  const tagsStr = document.getElementById('modal-tags').value.trim();
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : ['community', 'custom'];

  if (!word || !meaning || !example) {
    showToast('Please fill out all required fields!');
    return;
  }

  // Duplicate Check
  const exists = state.allSlangs.some(s => s.word.toLowerCase() === word.toLowerCase());
  if (exists) {
    showToast(`The slang word "${word}" already exists in the dictionary!`);
    return;
  }

  const newSlang = {
    id: `custom-${Date.now()}`,
    word,
    pronunciation: pronunciation || `/${word.toLowerCase()}/`,
    category,
    region,
    emoji,
    meaning,
    example,
    origin: 'Community submission via Web App',
    tags,
    popularity: 95,
    isCustom: true,
    helpful_count: 1,
    not_helpful_count: 0
  };

  // If backend is online, save to SQLite
  if (state.isBackendOnline) {
    try {
      const res = await fetch('/api/slangs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlang)
      });
      if (!res.ok) {
        const errData = await res.json();
        showToast(errData.error || 'Failed to save to database.');
        return;
      }
    } catch (err) {
      console.log('Saved to local storage fallback.');
    }
  }

  // Save to LocalStorage custom slangs
  let custom = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_SLANGS);
    if (stored) custom = JSON.parse(stored);
  } catch(e) {}
  custom.unshift(newSlang);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_SLANGS, JSON.stringify(custom));

  state.allSlangs.unshift(newSlang);
  closeAddSlangModal();
  applyFiltersAndRender();
  updateStatistics();
  showToast(`✨ Slang "${word}" added successfully to the dictionary!`);
}

/**
 * User Profile View & Modal
 */
function renderProfileView() {
  const { profile } = state;
  if (elements.profileAvatar) elements.profileAvatar.textContent = profile.avatar || '😎';
  if (elements.profileName) elements.profileName.textContent = profile.name || 'Slang Explorer';
  if (elements.profileHandle) elements.profileHandle.textContent = profile.handle || '@lingo_scholar';
  if (elements.profileBio) elements.profileBio.textContent = profile.bio || 'Decoding internet culture, slang, and memes daily.';
  if (elements.profileRankBadge) elements.profileRankBadge.textContent = profile.level || 'Level 3 • Vibe Master';
  if (elements.profileJoined) elements.profileJoined.textContent = `🗓️ Joined: ${profile.joined || 'August 2026'}`;
  if (elements.pstatQuizScore) elements.pstatQuizScore.textContent = profile.quizBestScore || '0/8';

  updateStatistics();
  renderProfileCards();
}

function renderProfileCards() {
  if (!elements.profileCardsContainer) return;
  elements.profileCardsContainer.innerHTML = '';

  let listToRender = [];
  if (state.profileTab === 'bookmarks') {
    listToRender = state.allSlangs.filter(s => state.favorites.has(s.id));
  } else {
    listToRender = state.allSlangs.filter(s => s.isCustom);
  }

  if (listToRender.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-icon">${state.profileTab === 'bookmarks' ? '⭐' : '➕'}</div>
      <h3 class="empty-title">${state.profileTab === 'bookmarks' ? 'No Bookmarked Slangs' : 'No Contributed Slang Yet'}</h3>
      <p class="empty-desc">${state.profileTab === 'bookmarks' ? 'Click the star icon on any slang card in the dictionary to save your favorite terms here!' : 'Have you heard a cool new slang term? Contribute it to the dictionary and see it here!'}</p>
      <button class="nav-btn primary" onclick="${state.profileTab === 'bookmarks' ? "switchTab('dictionary')" : "openAddSlangModal()"}">${state.profileTab === 'bookmarks' ? 'Browse All Slang' : '+ Add a Slang Word'}</button>
    `;
    elements.profileCardsContainer.appendChild(empty);
    return;
  }

  listToRender.forEach(item => {
    const card = document.createElement('div');
    card.className = 'slang-card';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-emoji-word" style="cursor: pointer;">
            <span class="card-emoji">${item.emoji || '💬'}</span>
            <h3 class="card-word">${escapeHTML(item.word)}</h3>
          </div>
          <div class="card-pronunciation"><span>${escapeHTML(item.pronunciation || '')}</span></div>
        </div>
        <span class="card-category-badge ${getBadgeClass(item.category, item.isCustom)}">${escapeHTML(item.category)}</span>
      </div>
      <div class="card-body">
        <p class="card-meaning">${escapeHTML(item.meaning)}</p>
        <div class="card-example">“${escapeHTML(item.example)}”</div>
      </div>
      <div class="card-footer">
        <button class="nav-btn primary" onclick="openSlangDetailsModal('${item.id}')">View Details 🔍</button>
        <button class="action-btn" onclick="speakWord('${escapeHTML(item.word)}')">🔊 Listen</button>
      </div>
    `;
    elements.profileCardsContainer.appendChild(card);
  });
}

function openEditProfileModal() {
  if (elements.editProfileNameInput) elements.editProfileNameInput.value = state.profile.name;
  if (elements.editProfileHandleInput) elements.editProfileHandleInput.value = state.profile.handle;
  if (elements.editProfileAvatarInput) elements.editProfileAvatarInput.value = state.profile.avatar;
  if (elements.editProfileBioInput) elements.editProfileBioInput.value = state.profile.bio;
  elements.editProfileModal.classList.add('active');
}

function closeEditProfileModal() {
  elements.editProfileModal.classList.remove('active');
}

function handleEditProfileSubmit(e) {
  e.preventDefault();
  state.profile.name = elements.editProfileNameInput.value.trim() || 'Slang Explorer';
  state.profile.handle = elements.editProfileHandleInput.value.trim() || '@lingo_scholar';
  state.profile.avatar = elements.editProfileAvatarInput.value.trim() || '😎';
  state.profile.bio = elements.editProfileBioInput.value.trim() || 'Decoding internet culture, slang, and memes daily.';
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
  closeEditProfileModal();
  renderProfileView();
  showToast('👤 Profile updated successfully!');
}

/**
 * Notifications View
 */
function renderNotificationsView() {
  if (!elements.notificationsList) return;
  elements.notificationsList.innerHTML = '';

  if (state.notifications.length === 0) {
    elements.notificationsList.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 2rem;">No notifications at this time.</p>';
    return;
  }

  state.notifications.forEach(notif => {
    const item = document.createElement('div');
    item.className = `notification-item ${notif.read ? '' : 'unread'}`;
    item.innerHTML = `
      <div class="notif-icon-wrap">${notif.icon || '🔔'}</div>
      <div class="notif-content">
        <h4 class="notif-title">${escapeHTML(notif.title)}</h4>
        <p class="notif-desc">${escapeHTML(notif.message)}</p>
        <span class="notif-time">${escapeHTML(notif.time || 'Today')}</span>
      </div>
    `;
    elements.notificationsList.appendChild(item);
  });
}

function updateNotificationBadges() {
  const unreadCount = state.notifications.filter(n => !n.read).length;
  if (elements.notifTabCount) elements.notifTabCount.textContent = unreadCount;
}

function markAllNotificationsRead() {
  state.notifications.forEach(n => n.read = true);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(state.notifications));
  renderNotificationsView();
  updateNotificationBadges();
  showToast('All notifications marked as read! ✓');
}

function clearAllNotifications() {
  state.notifications = [];
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(state.notifications));
  renderNotificationsView();
  updateNotificationBadges();
  showToast('Notification inbox cleared! 🗑️');
}

/**
 * Settings View
 */
function renderSettingsView() {
  if (elements.settingsThemeSelect) elements.settingsThemeSelect.value = state.theme;
  if (elements.settingsSpeechRate) elements.settingsSpeechRate.value = state.settings.speechRate;
  if (elements.rateValDisplay) elements.rateValDisplay.textContent = `${state.settings.speechRate}x`;
  if (elements.settingsSpeechPitch) elements.settingsSpeechPitch.value = state.settings.speechPitch;
  if (elements.pitchValDisplay) elements.pitchValDisplay.textContent = `${state.settings.speechPitch}x`;
  populateVoiceSelect();
}

function populateVoiceSelect() {
  if (!elements.settingsVoiceSelect || !('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  elements.settingsVoiceSelect.innerHTML = '<option value="">Default Browser Voice</option>';
  voices.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    if (v.name === state.settings.speechVoice) opt.selected = true;
    elements.settingsVoiceSelect.appendChild(opt);
  });
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = populateVoiceSelect;
}

/**
 * Event Listeners Initialization
 */
function initEventListeners() {
  // Search Input
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      if (elements.clearSearchBtn) {
        elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
      }
      applyFiltersAndRender();
    });
  }

  if (elements.clearSearchBtn) {
    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      elements.clearSearchBtn.style.display = 'none';
      applyFiltersAndRender();
      elements.searchInput.focus();
    });
  }

  // Keyboard shortcut: '/' focuses search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== elements.searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      if (elements.searchInput) elements.searchInput.focus();
    }
  });

  // Sorting dropdown
  if (elements.sortSelect) {
    elements.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Theme Toggle Button
  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Quick Trending Tags
  document.querySelectorAll('.trend-tag').forEach(tagBtn => {
    tagBtn.addEventListener('click', () => {
      const tag = tagBtn.dataset.tag;
      if (elements.searchInput) {
        elements.searchInput.value = tag;
        state.searchQuery = tag.toLowerCase();
        if (elements.clearSearchBtn) elements.clearSearchBtn.style.display = 'block';
        applyFiltersAndRender();
        showToast(`Filtered by tag: #${tag}`);
      }
    });
  });

  // Spotlight actions
  if (elements.spotlightAudioBtn) {
    elements.spotlightAudioBtn.addEventListener('click', () => {
      if (state.spotlightSlang) speakWord(state.spotlightSlang.word, elements.spotlightAudioBtn);
    });
  }
  if (elements.spotlightCopyBtn) {
    elements.spotlightCopyBtn.addEventListener('click', () => {
      if (state.spotlightSlang) copySlangText(state.spotlightSlang);
    });
  }
  if (elements.spotlightShuffleBtn) {
    elements.spotlightShuffleBtn.addEventListener('click', randomizeSpotlight);
  }

  // Recently Viewed Clear
  if (elements.clearRecentBtn) {
    elements.clearRecentBtn.addEventListener('click', clearRecentlyViewed);
  }

  // View Tab Switching
  elements.viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Quiz Next & Restart
  if (elements.quizNextBtn) elements.quizNextBtn.addEventListener('click', nextQuestion);
  if (elements.quizRestartBtn) elements.quizRestartBtn.addEventListener('click', startQuiz);

  // Add Slang Modal triggers
  if (elements.openAddModalBtn) elements.openAddModalBtn.addEventListener('click', openAddSlangModal);
  if (elements.closeAddModalBtn) elements.closeAddModalBtn.addEventListener('click', closeAddSlangModal);
  if (elements.cancelAddBtn) elements.cancelAddBtn.addEventListener('click', closeAddSlangModal);
  if (elements.addSlangForm) elements.addSlangForm.addEventListener('submit', handleAddSlangSubmit);

  // Slang Details Modal triggers
  if (elements.closeDetailsModalBtn) elements.closeDetailsModalBtn.addEventListener('click', closeSlangDetailsModal);
  if (elements.detailCloseBottomBtn) elements.detailCloseBottomBtn.addEventListener('click', closeSlangDetailsModal);
  if (elements.detailSpeechBtn) {
    elements.detailSpeechBtn.addEventListener('click', () => {
      if (state.selectedSlangForDetails) speakWord(state.selectedSlangForDetails.word, elements.detailSpeechBtn);
    });
  }
  if (elements.detailFavBtn) {
    elements.detailFavBtn.addEventListener('click', () => {
      if (state.selectedSlangForDetails) toggleFavorite(state.selectedSlangForDetails.id, elements.detailFavBtn);
    });
  }
  if (elements.detailCopyBtn) {
    elements.detailCopyBtn.addEventListener('click', () => {
      if (state.selectedSlangForDetails) copySlangText(state.selectedSlangForDetails);
    });
  }
  if (elements.detailShareBtn) {
    elements.detailShareBtn.addEventListener('click', () => {
      if (state.selectedSlangForDetails) shareSlang(state.selectedSlangForDetails);
    });
  }
  if (elements.detailVoteHelpfulBtn) {
    elements.detailVoteHelpfulBtn.addEventListener('click', () => {
      if (state.selectedSlangForDetails) voteSlang(state.selectedSlangForDetails.id, 'helpful');
    });
  }
  if (elements.detailVoteUnhelpfulBtn) {
    elements.detailVoteUnhelpfulBtn.addEventListener('click', () => {
      if (state.selectedSlangForDetails) voteSlang(state.selectedSlangForDetails.id, 'not_helpful');
    });
  }

  // Profile View Sub-tabs
  if (elements.ptabBookmarksBtn) {
    elements.ptabBookmarksBtn.addEventListener('click', () => {
      state.profileTab = 'bookmarks';
      elements.ptabBookmarksBtn.classList.add('active');
      if (elements.ptabContribBtn) elements.ptabContribBtn.classList.remove('active');
      renderProfileCards();
    });
  }
  if (elements.ptabContribBtn) {
    elements.ptabContribBtn.addEventListener('click', () => {
      state.profileTab = 'contributions';
      elements.ptabContribBtn.classList.add('active');
      if (elements.ptabBookmarksBtn) elements.ptabBookmarksBtn.classList.remove('active');
      renderProfileCards();
    });
  }

  // Edit Profile triggers
  if (elements.openEditProfileBtn) elements.openEditProfileBtn.addEventListener('click', openEditProfileModal);
  if (elements.quickAvatarBtn) elements.quickAvatarBtn.addEventListener('click', openEditProfileModal);
  if (elements.closeProfileModalBtn) elements.closeProfileModalBtn.addEventListener('click', closeEditProfileModal);
  if (elements.cancelProfileBtn) elements.cancelProfileBtn.addEventListener('click', closeEditProfileModal);
  if (elements.editProfileForm) elements.editProfileForm.addEventListener('submit', handleEditProfileSubmit);

  // Notification actions
  if (elements.markAllReadBtn) elements.markAllReadBtn.addEventListener('click', markAllNotificationsRead);
  if (elements.clearAllNotifsBtn) elements.clearAllNotifsBtn.addEventListener('click', clearAllNotifications);

  // Settings Handlers
  if (elements.settingsSpeechRate) {
    elements.settingsSpeechRate.addEventListener('input', (e) => {
      state.settings.speechRate = parseFloat(e.target.value);
      if (elements.rateValDisplay) elements.rateValDisplay.textContent = `${state.settings.speechRate}x`;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    });
  }
  if (elements.settingsSpeechPitch) {
    elements.settingsSpeechPitch.addEventListener('input', (e) => {
      state.settings.speechPitch = parseFloat(e.target.value);
      if (elements.pitchValDisplay) elements.pitchValDisplay.textContent = `${state.settings.speechPitch}x`;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    });
  }
  if (elements.settingsVoiceSelect) {
    elements.settingsVoiceSelect.addEventListener('change', (e) => {
      state.settings.speechVoice = e.target.value;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    });
  }
  if (elements.testVoiceBtn) {
    elements.testVoiceBtn.addEventListener('click', () => {
      speakWord("Testing pronunciation speed and pitch! No cap, it sounds fire.");
    });
  }
}

/**
 * Utility Helpers
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function getBadgeClass(category, isCustom) {
  if (isCustom) return 'badge-custom';
  switch (category) {
    case 'Everyday Slang':
    case 'Slang Basics': return 'badge-everyday';
    case 'Social Media': return 'badge-social';
    case 'Reactions': return 'badge-reactions';
    case 'Relationships & Friendship':
    case 'Friendship': return 'badge-relationships';
    case 'Gaming': return 'badge-gaming';
    case 'School & Life': return 'badge-school';
    case 'Expressions': return 'badge-expressions';
    case 'Acronyms': return 'badge-acronyms';
    case 'Internet/Meme Culture':
    case 'Memes & Internet': return 'badge-memes';
    case 'Gen Alpha/Newer Slang':
    case 'Gen Alpha / Newer Internet Slang': return 'badge-genalpha';
    case 'Music & Pop Culture': return 'badge-music';
    case 'Fashion & Lifestyle': return 'badge-fashion';
    default: return 'badge-everyday';
  }
}

function copySlangText(slang) {
  const text = `${slang.emoji || '💬'} ${slang.word} (${slang.pronunciation || ''})\nCategory: ${slang.category}\nMeaning: ${slang.meaning}\nExample: "${slang.example}"\n— via Gen Z Dictionary`;
  navigator.clipboard.writeText(text);
  showToast(`📋 Copied "${slang.word}" definition to clipboard!`);
}

function shareSlang(slang) {
  if (navigator.share) {
    navigator.share({
      title: `${slang.word} - Gen Z Dictionary`,
      text: `Learn what "${slang.word}" means: ${slang.meaning}`,
      url: window.location.href
    }).catch(() => {});
  } else {
    copySlangText(slang);
  }
}

function showToast(message) {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function applySearchQuery(word) {
  if (elements.searchInput) {
    elements.searchInput.value = word;
    state.searchQuery = word.toLowerCase().trim();
    if (elements.clearSearchBtn) elements.clearSearchBtn.style.display = 'block';
    applyFiltersAndRender();
  }
}

function updateStatistics() {
  const total = state.allSlangs.length;
  const categoriesCount = (typeof CATEGORIES !== 'undefined' ? CATEGORIES : []).filter(c => c !== 'All').length || 4;
  const bookmarksCount = state.favorites.size;
  const recentCount = state.recentlyViewed.length;

  if (elements.statTotalTerms) elements.statTotalTerms.textContent = total;
  if (elements.statTotalCategories) elements.statTotalCategories.textContent = categoriesCount;
  if (elements.statTotalBookmarks) elements.statTotalBookmarks.textContent = bookmarksCount;
  if (elements.statRecentCount) elements.statRecentCount.textContent = recentCount;

  if (elements.pstatBookmarks) elements.pstatBookmarks.textContent = bookmarksCount;
  if (elements.pstatContributions) {
    const customCount = state.allSlangs.filter(s => s.isCustom).length;
    elements.pstatContributions.textContent = customCount;
    if (elements.profileContribCount) elements.profileContribCount.textContent = customCount;
  }
  if (elements.pstatRecent) elements.pstatRecent.textContent = recentCount;
}

function updateStatsBar() {
  const total = state.allSlangs.length;
  const filteredCount = state.filteredSlangs.length;
  const showing = Math.min(state.displayLimit || 60, filteredCount);
  if (elements.statsCounter) {
    if (state.searchQuery) {
      elements.statsCounter.textContent = `🔍 Found ${filteredCount} slang term${filteredCount === 1 ? '' : 's'} matching "${state.searchQuery}" (Showing ${showing} of ${filteredCount})`;
    } else if (state.currentCategory !== 'All') {
      elements.statsCounter.textContent = `Showing ${showing} of ${filteredCount} slang terms in "${state.currentCategory}" (Total in Dictionary: ${total})`;
    } else if (state.currentTab === 'favorites') {
      elements.statsCounter.textContent = `Showing ${filteredCount} bookmarked slang term${filteredCount === 1 ? '' : 's'}`;
    } else {
      elements.statsCounter.textContent = `Displaying ${showing} of ${total} slang terms across all 12 categories`;
    }
  }
}

// Global Window Bindings for inline HTML event triggers
window.switchTab = switchTab;
window.openAddSlangModal = openAddSlangModal;
window.openAddSlangModalWithWord = openAddSlangModalWithWord;
window.openSlangDetailsModal = openSlangDetailsModal;
window.closeSlangDetailsModal = closeSlangDetailsModal;
window.speakWord = speakWord;
window.toggleFavorite = toggleFavorite;
window.copySlangText = copySlangText;
window.shareSlang = shareSlang;
window.applySearchQuery = applySearchQuery;
window.voteSlang = voteSlang;
