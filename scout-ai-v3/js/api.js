/* ═══════════════════════════════════════════════════
   ScoutAI — API Module
   Powered by Google Gemini 2.0 Flash (FREE)

   Uses Google Search grounding — Gemini searches
   the real web (Forebet, SoccerPunter, PredictZ,
   BBC Sport, etc.) and synthesises predictions.

   Free tier limits:
     · 15 requests per minute
     · 1,500 requests per day
     · No credit card required
   ═══════════════════════════════════════════════════ */

const API = (() => {

  /* ── Key management ─────────────────────────── */
  function getKey()   { return localStorage.getItem(Config.STORAGE_KEY) || ''; }
  function setKey(k)  { localStorage.setItem(Config.STORAGE_KEY, k.trim()); }
  function hasKey()   { return !!getKey(); }
  function clearKey() { localStorage.removeItem(Config.STORAGE_KEY); }

  /* ── Core Gemini call with Google Search ────── */
  async function call(prompt) {
    const key = getKey();
    if (!key) throw new Error('NO_KEY');

    const url  = `${Config.API_URL}?key=${encodeURIComponent(key)}`;
    const body = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      tools: [{
        google_search: {}          /* Real-time Google Search grounding */
      }],
      generationConfig: {
        temperature:     0.2,      /* Low temp = consistent, factual output */
        maxOutputTokens: 2048,
      }
    };

    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `HTTP ${res.status}`;
      if (res.status === 400 && msg.includes('API_KEY')) throw new Error('Invalid API key — please check your key in Settings.');
      if (res.status === 403) throw new Error('Invalid API key — please check your key in Settings.');
      if (res.status === 429) throw new Error('Rate limit hit — please wait a moment and try again.');
      throw new Error(msg);
    }

    const data = await res.json();

    /* Extract text from Gemini response */
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text  = parts.filter(p => p.text).map(p => p.text).join('');

    if (!text) throw new Error('Empty response from Gemini. Please try again.');
    return text;
  }

  /* ── Extract JSON array from text ──────────── */
  function extractJSON(text) {
    /* Strip markdown code fences if present */
    const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    /* Find the JSON array */
    const start = clean.indexOf('[');
    const end   = clean.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error('Could not parse predictions. Please try again.');
    try {
      return JSON.parse(clean.slice(start, end + 1));
    } catch {
      throw new Error('Invalid JSON from AI. Please try again.');
    }
  }

  /* ── Fetch today's predictions ──────────────── */
  async function fetchPredictions(dateStr) {
    const prompt = `Today is ${dateStr}.

Use Google Search to find today's football match predictions from multiple sources including Forebet, SoccerPunter, PredictZ, Betensured, FootyStats, and sports news sites.

Search for: "football predictions today ${dateStr}" and "sure predictions today"

Compile predictions for real matches happening TODAY across Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, MLS, and other major leagues.

Return ONLY a raw JSON array — absolutely no markdown fences, no explanations, no preamble. Start your response with [ and end with ].

Required structure for each match:
[
  {
    "home": "Exact team name",
    "away": "Exact team name",
    "league": "League name",
    "time": "HH:MM",
    "prediction": "Home Win",
    "confidence": 78,
    "goals_prediction": "Over 2.5 Goals",
    "goals_confidence": 72
  }
]

Strict rules:
- confidence: integer 45-95 based on consensus across sources
- prediction: MUST be exactly one of: "Home Win", "Away Win", "Draw", "Both Teams to Score", "Home Win or Draw", "Away Win or Draw"
- goals_prediction: one of "Over 2.5 Goals", "Under 2.5 Goals", "Over 1.5 Goals", "BTTS Yes", "BTTS No" — or null
- goals_confidence: integer or null
- time: 24hr format string or ""
- Only include REAL matches happening today — verify with search
- Return minimum 15 matches
- Start response with [ immediately`;

    return extractJSON(await call(prompt));
  }

  /* ── Fetch Edge — Narrative Intelligence ────── */
  async function fetchEdge(predictions, dateStr) {
    const matchList = predictions
      .map((m, i) => `${i + 1}. ${m.home} vs ${m.away} (${m.league})`)
      .join('\n');

    const prompt = `Today is ${dateStr}.

Use Google Search to find narrative context for each of these football matches happening today:

${matchList}

For each match search for: team news, injuries, suspensions, recent form, managerial changes, if it's a derby or rivalry match, what's at stake (title race, relegation, European spots), and any compelling storylines.

Analyse each for:
- Momentum: current form streak of each team
- Stakes: what does each team need from this game?
- Story: is this a derby, revenge match, relegation battle, title decider?
- News: manager sacked recently, key player returning from injury, important suspension?
- Motivation gap: is one team far more motivated than the other?

Return ONLY a raw JSON array — no markdown, no explanation. Start with [ and end with ].

[
  {
    "index": 0,
    "edge_score": 72,
    "edge_level": "high",
    "factors": [
      { "label": "Local derby with intense rivalry", "type": "positive" },
      { "label": "Home side's top scorer suspended", "type": "negative" }
    ],
    "verdict": "One clear, insightful sentence about what the narrative means for this match."
  }
]

Rules:
- index: 0-based, matching position in the list above
- edge_score: integer 0-100 (0=pure stats, 100=narrative-dominated)
- edge_level: "none"(0-29), "low"(30-49), "medium"(50-69), "high"(70-84), "elite"(85-100)
- factors: 1-4 items. type must be "positive", "negative", or "neutral"
- verdict: one sentence maximum
- One entry per match — all ${predictions.length} matches
- Start response with [ immediately`;

    return extractJSON(await call(prompt));
  }

  return { getKey, setKey, hasKey, clearKey, fetchPredictions, fetchEdge };

})();
