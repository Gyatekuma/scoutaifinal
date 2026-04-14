/* ═══════════════════════════════════
   ScoutAI — Predictions Module
   Data processing + rendering
   ═══════════════════════════════════ */

const Predictions = (() => {

  let data = [];

  /* ── Getters ──────────────────────────────── */
  function getAll()    { return data; }
  function setAll(arr) { data = arr; }
  function count()     { return data.length; }

  /* ── Colour helpers ───────────────────────── */
  function pctClass(n) {
    if (n >= Config.HIGH_CONFIDENCE) return 'green';
    if (n >= Config.MED_CONFIDENCE)  return 'amber';
    return 'red';
  }
  function barClass(n) {
    if (n >= Config.HIGH_CONFIDENCE) return '';
    if (n >= Config.MED_CONFIDENCE)  return 'amber';
    return 'danger';
  }

  /* ── Unique leagues ───────────────────────── */
  function leagues() {
    return [...new Set(data.map(m => m.league))];
  }

  /* ── Top confidence ───────────────────────── */
  function topConfidence() {
    return data.length ? Math.max(...data.map(m => m.confidence)) : 0;
  }

  /* ── Sorted by confidence ─────────────────── */
  function sorted() {
    return [...data].sort((a, b) => b.confidence - a.confidence);
  }

  /* ── Build a single prediction bar row ─────── */
  function buildPredRow(label, pct) {
    const c = pctClass(pct);
    const b = barClass(pct);
    return `
      <div class="pred-row">
        <span class="pred-label">${label}</span>
        <div class="pred-bar-wrap">
          <div class="pred-bar ${b}" style="width:${pct}%"></div>
        </div>
        <span class="pred-pct ${c}">${pct}%</span>
      </div>`;
  }

  /* ── Edge badge HTML ──────────────────────── */
  function edgeBadgeHTML(match, idx) {
    const edge = match._edge;
    if (!edge || edge.edge_level === 'none') return '';
    const labels = { low: '▸ Low Edge', medium: '⚡ Edge', high: '⚡ High Edge', elite: '🔥 Elite Edge' };
    const label  = labels[edge.edge_level] || '';
    return `<span class="edge-badge ${edge.edge_level}" onclick="event.stopPropagation(); Edge.showMatchEdge(${idx})">${label}</span>`;
  }

  /* ── Build a match card ─────────────────────── */
  function buildMatchCard(match, idx, showAccaCheck = true) {
    const accaChecked = Acca.has(idx) ? 'selected' : '';
    const edgeClass   = match._edge
      ? (match._edge.edge_level === 'elite' ? 'edge-elite'
       : match._edge.edge_level === 'high'  ? 'edge-high' : '')
      : '';

    return `
      <div class="match-card ${accaChecked} ${edgeClass}" id="card-${idx}" onclick="Acca.toggle(${idx})">
        <div class="match-card-header">
          <div>
            <span class="league-tag">${match.league}</span>
            <div class="match-teams">${match.home} vs ${match.away}</div>
          </div>
          <div class="match-meta">
            ${edgeBadgeHTML(match, idx)}
            <span class="match-time">${match.time || ''}</span>
            ${showAccaCheck ? '<div class="acca-check"></div>' : ''}
          </div>
        </div>
        ${buildPredRow(match.prediction, match.confidence)}
        ${match.goals_prediction && match.goals_confidence
          ? buildPredRow(match.goals_prediction, match.goals_confidence)
          : ''}
      </div>`;
  }

  /* ── Render Top 10 ──────────────────────────── */
  function renderTop10() {
    const top = sorted().slice(0, Config.TOP_N_PICKS);
    return `
      <div class="section-header">
        <div class="section-title">Top ${top.length} Picks Today</div>
        <span class="section-count">by confidence</span>
      </div>
      ${top.map((m, i) => {
        const idx      = data.indexOf(m);
        const isTop3   = i < 3 ? 'top3' : '';
        const selected = Acca.has(idx) ? 'selected' : '';
        const edge     = edgeBadgeHTML(m, idx);
        return `
          <div class="top10-card ${selected}" id="top-card-${idx}" onclick="Acca.toggle(${idx})">
            <div class="rank-num ${isTop3}">${i + 1}</div>
            <div class="top10-body">
              <div class="top10-teams">${m.home} vs ${m.away}</div>
              <div class="top10-detail">${m.league} · ${m.prediction} ${edge ? '· ' + edge : ''}</div>
            </div>
            <div class="top10-pct">${m.confidence}%</div>
          </div>`;
      }).join('')}
      <p style="font-size:12px;color:var(--text-muted);margin-top:12px;text-align:center">
        Tap any match to add it to your Smart Acca
      </p>`;
  }

  /* ── Render By League ───────────────────────── */
  function renderLeagues() {
    const byLeague = {};
    data.forEach((m, i) => {
      if (!byLeague[m.league]) byLeague[m.league] = [];
      byLeague[m.league].push({ match: m, idx: i });
    });

    return Object.entries(byLeague).map(([league, entries]) => `
      <div class="league-section">
        <div class="league-header">
          <div class="league-name">${league}</div>
        </div>
        ${entries.map(({ match, idx }) => buildMatchCard(match, idx)).join('')}
      </div>`
    ).join('');
  }

  /* ── Render Goals ───────────────────────────── */
  function renderGoals() {
    const matches = data
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.goals_prediction && m.goals_confidence);

    if (!matches.length) {
      return '<p style="color:var(--text-muted);font-size:14px;text-align:center;padding:2rem">No goals predictions in today\'s data</p>';
    }

    matches.sort((a, b) => b.m.goals_confidence - a.m.goals_confidence);

    return `
      <div class="section-header">
        <div class="section-title">Goals Markets</div>
        <span class="section-count">${matches.length} matches</span>
      </div>
      ${matches.map(({ m, i }) => buildMatchCard(m, i)).join('')}`;
  }

  /* ── Render Straight Wins ───────────────────── */
  function renderWins() {
    const wins = data
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.prediction === 'Home Win' || m.prediction === 'Away Win')
      .sort((a, b) => b.m.confidence - a.m.confidence);

    if (!wins.length) {
      return '<p style="color:var(--text-muted);font-size:14px;text-align:center;padding:2rem">No straight win predictions found today</p>';
    }

    return `
      <div class="section-header">
        <div class="section-title">Straight Wins</div>
        <span class="section-count">${wins.length} picks</span>
      </div>
      ${wins.map(({ m, i }) => buildMatchCard(m, i)).join('')}`;
  }

  return {
    getAll, setAll, count, leagues, topConfidence, sorted,
    renderTop10, renderLeagues, renderGoals, renderWins,
    buildMatchCard, pctClass,
  };

})();
