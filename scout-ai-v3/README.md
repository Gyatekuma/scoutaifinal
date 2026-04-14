# ⚽ ScoutAI — Football Prediction Intelligence

AI-powered football predictions with **Narrative Edge Intelligence**.
Completely free — powered by Google Gemini 2.0 Flash with live Google Search.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Daily Scan** | Searches Forebet, SoccerPunter, PredictZ & more in real-time |
| **Confidence Ratings** | Every prediction rated 0–100% |
| **By League** | EPL, La Liga, Serie A, Bundesliga, UCL and more |
| **Goals Markets** | Over/Under 2.5, BTTS predictions |
| **Straight Wins** | Filtered home and away win picks |
| **Top 10** | Highest-confidence picks ranked |
| **⚡ The Edge** | Exclusive Narrative Intelligence Engine |
| **Smart Acca Builder** | Pick 2–6 matches, get a combined probability slip |

---

## 💸 Cost

**Completely free.** No credit card. No monthly fee. Ever.

| What | Cost |
|---|---|
| Netlify Hosting | Free |
| Netlify Functions | Free |
| Google Gemini 2.0 Flash API | Free (1,500 scans/day) |
| Google Search Grounding | Free |

---

## ⚡ The Edge — What Makes ScoutAI Unique

Every other prediction platform uses statistics. **The Edge reads stories.**

After predictions load, The Edge Engine searches for narrative context — things stats miss:
- **Momentum** — Teams on hot streaks vs cold spells
- **Stakes** — Title races, relegation battles, knockout football
- **Story** — Derbies, revenge fixtures, manager milestones, star player returns
- **News** — Managerial sackings, key suspensions, injury returns

Each match gets an **Edge Score (0–100)** and a qualitative verdict.

---

## 🚀 Setup (2 minutes)

### Step 1 — Get your free Google API key

1. Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Sign in with Google
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

No payment needed. Free tier = 1,500 requests/day, 15/minute.

### Step 2 — Deploy to Netlify

1. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**
2. Drag the `scout-ai-v3` folder onto the page
3. Done — live in seconds

### Step 3 — Enter your key

1. Open your deployed site
2. Click the **⚙️ settings icon** in the header
3. Paste your key and click **Save & Start Scanning**

The key is stored in your browser only — never on any server.

---

## 📁 Project Structure

```
scout-ai-v3/
│
├── index.html              ← Main HTML
│
├── css/
│   ├── variables.css       ← Colours, fonts, spacing
│   ├── base.css            ← Reset & utilities
│   └── components.css      ← All UI components
│
├── js/
│   ├── config.js           ← API endpoint, model, thresholds
│   ├── api.js              ← Google Gemini API calls
│   ├── predictions.js      ← Data processing + rendering
│   ├── edge.js             ← ⚡ The Edge Narrative Engine
│   ├── acca.js             ← Smart Accumulator Builder
│   ├── ui.js               ← Tabs, modals, DOM helpers
│   └── app.js              ← Scan flow orchestration
│
└── README.md
```

### Change something?

| File | Edit this for... |
|---|---|
| `css/variables.css` | Colours, fonts, brand |
| `js/config.js` | Confidence thresholds, model |
| `js/api.js` | Prompts, search behaviour |
| `js/predictions.js` | Card layout, sorting |
| `js/edge.js` | Edge scoring, UI |
| `js/acca.js` | Acca logic and limits |

---

## 🌐 Deploying Updates

After any change, just drag the updated folder into Netlify Drop again and it redeploys in seconds.

---

## ⚠️ Disclaimer

ScoutAI predictions are for **entertainment only**. Not financial advice. Gamble responsibly. [begambleaware.org](https://www.begambleaware.org)
