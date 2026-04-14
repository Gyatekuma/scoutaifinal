/* ═══════════════════════════════════
   ScoutAI — Config
   Powered by Google Gemini (Free)
   ═══════════════════════════════════ */

const Config = {
  /* Google Gemini API — FREE tier */
  API_URL:    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  MODEL:      'gemini-2.0-flash',

  /* Prediction settings */
  TOP_N_PICKS:      10,
  MIN_CONFIDENCE:   45,
  HIGH_CONFIDENCE:  70,
  MED_CONFIDENCE:   55,

  /* The Edge settings */
  EDGE_HIGH_THRESHOLD:  70,
  EDGE_MED_THRESHOLD:   50,
  EDGE_LOW_THRESHOLD:   30,

  /* Acca */
  MIN_ACCA_PICKS: 2,
  MAX_ACCA_PICKS: 6,

  /* Storage */
  STORAGE_KEY: 'scoutai_gemini_key',
};
