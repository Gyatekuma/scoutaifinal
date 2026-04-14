/* ════════════════════════════════════════════════
   ScoutAI — THE EDGE
   Narrative Intelligence Engine

   Exclusive to ScoutAI. Every other platform
   analyses statistics. The Edge reads STORIES:
     · Managerial dismissals & honeymoon effects
     · Revenge fixtures & derby psychology
     · Relegation/title battle motivation gaps
     · Key player returns from injury
     · European fatigue cycles
   ════════════════════════════════════════════════ */

const Edge = (() => {

  let isLoaded  = false;
  let isLoading = false;

  function applyToMatches(predictions, edgeResults) {
    edgeResults.forEach(e => {
      if (predictions[e.index]) predictions[e.index]._edge = e;
    });
  }

  function countHighEdge(predictions) {
    return predictions.filter(m =>
      m._edge && ['high', 'elite'].includes(m._edge.edge_level)
    ).length;
  }

  async function load(predictions, dateStr) {
    if (isLoading) return;
    isLoading = true;
    try {
      const results = await API.fetchEdge(predictions, dateStr);
      applyToMatches(predictions, results);
      isLoaded = true;

      const highCount = countHighEdge(predictions);
      const statEdge  = document.getElementById('stat-edge');
      if (statEdge) statEdge.textContent = highCount;

      const banner = document.getElementById('edgeBanner');
      if (banner) banner.style.display = '';

      if (UI.getCurrentTab() === 'edge') UI.renderPanel('edge');

      /* Refresh current tab cards to show edge badges */
      const curr = UI.getCurrentTab();
      if (['top10','leagues','goals','wins'].includes(curr)) UI.renderPanel(curr);

    } catch (err) {
      console.warn('Edge analysis failed:', err.message);
    } finally {
      isLoading = false;
    }
  }

  function levelLabel(level) {
    return { none: 'No Edge', low: 'Low Edge', medium: 'Edge', high: 'High Edge', elite: 'Elite Edge' }[level] || level;
  }

  function renderTab() {
    const predictions = Predictions.getAll();
    if (!isLoaded && !isLoading) {
      return `
        <div class="edge-intro">
          <div class="edge-intro-title">⚡ The Edge</div>
          <p>Narrative Intelligence is not yet loaded. Press Scan Today first — The Edge will automatically analyse each match for hidden value factors after predictions load.</p>
        </div>`;
    }
    if (isLoading) {
      return `
        <div class="edge-intro">
          <div class="edge-intro-title">⚡ The Edge</div>
          <p>Narrative Intelligence is scanning fixtures for story factors...</p>
        </div>
        <div class="loading-row">
          <div class="loading-dot"></div>
          Analysing narrative factors for ${predictions.length} matches...
        </div>`;
    }

    const edgeMatches = predictions
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m._edge && m._edge.edge_level !== 'none')
      .sort((a, b) => (b.m._edge?.edge_score || 0) - (a.m._edge?.edge_score || 0));

    if (!edgeMatches.length) {
      return `
        <div class="edge-intro">
          <div class="edge-intro-title">⚡ The Edge</div>
          <p>Today's matches show low narrative loading. Statistical predictions are the dominant signal — no strong story factors detected.</p>
        </div>`;
    }

    const topPick = edgeMatches[0];

    return `
      <div class="edge-intro">
        <div class="edge-intro-title">⚡ The Edge — Narrative Intelligence</div>
        <p>ScoutAI's exclusive Edge Engine analyses the <em>human stories</em> behind today's fixtures — managerial changes, revenge fixtures, derby psychology, and motivation gaps that pure stats miss. ${edgeMatches.length} matches have notable narrative loading today.</p>
      </div>

      <div class="section-header">
        <div class="section-title">Edge Pick of the Day</div>
      </div>
      ${buildEdgeCard(topPick.m, topPick.i, true)}

      <div class="section-header" style="margin-top:var(--space-xl)">
        <div class="section-title">All Edge Matches</div>
        <span class="section-count">${edgeMatches.length} flagged</span>
      </div>
      ${edgeMatches.map(({ m, i }) => buildEdgeCard(m, i)).join('')}

      <div style="margin-top:var(--space-xl)">
        <div class="section-header"><div class="section-title">How The Edge Works</div></div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-lg)">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-md)">
            ${[
              ['📊 Momentum','Current form trajectory — hot streaks vs cold spells'],
              ['🎯 Stakes','Title races, relegation battles, knockout football'],
              ['📖 Story','Derbies, revenge fixtures, milestones, homecomings'],
              ['📰 News','Manager sackings, injury returns, key suspensions'],
            ].map(([t,d]) => `
              <div style="background:var(--bg-surface);border-radius:var(--radius-md);padding:12px">
                <div style="font-weight:600;font-size:13px;margin-bottom:4px">${t}</div>
                <div style="font-size:12px;color:var(--text-secondary);line-height:1.5">${d}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function buildEdgeCard(match, idx, featured = false) {
    const edge    = match._edge;
    if (!edge) return '';
    const factors = edge.factors || [];
    return `
      <div class="edge-card" onclick="Edge.showMatchEdge(${idx})">
        <div class="edge-card-header">
          <div>
            <span class="league-tag">${match.league}</span>
            <div class="edge-card-teams">${match.home} vs ${match.away}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">
              ${match.prediction} · ${match.confidence}% confidence
            </div>
          </div>
          <div class="edge-score-circle">
            <div class="edge-score-val">${edge.edge_score}</div>
            <div class="edge-score-lbl">Edge</div>
          </div>
        </div>
        <div class="edge-factors">
          ${factors.map(f => `<span class="edge-factor-pill ${f.type}">${f.label}</span>`).join('')}
        </div>
        ${edge.verdict ? `<div class="edge-verdict">"${edge.verdict}"</div>` : ''}
      </div>`;
  }

  function showMatchEdge(idx) {
    const match = Predictions.getAll()[idx];
    if (!match || !match._edge) return;
    const edge    = match._edge;
    const factors = edge.factors || [];
    const body    = document.getElementById('edgeModalBody');
    if (!body) return;
    body.innerHTML = `
      <div class="edge-report-match">
        <div class="edge-report-header">
          <div>
            <span class="league-tag">${match.league}</span>
            <div class="edge-report-teams">${match.home} vs ${match.away}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:3px">${match.prediction} · ${match.confidence}% · ${match.time || ''}</div>
          </div>
          <div class="edge-score-circle">
            <div class="edge-score-val">${edge.edge_score}</div>
            <div class="edge-score-lbl">${levelLabel(edge.edge_level)}</div>
          </div>
        </div>
        <div class="edge-report-factors">
          ${factors.map(f => `
            <div class="edge-report-factor" style="color:${f.type==='positive'?'var(--primary)':f.type==='negative'?'var(--danger)':'var(--text-secondary)'}">
              ${f.label}
            </div>`).join('')}
        </div>
        ${edge.verdict ? `<div class="edge-report-verdict">"${edge.verdict}"</div>` : ''}
      </div>
      <div style="margin-top:var(--space-md);font-size:12px;color:var(--text-muted);line-height:1.6">
        The Edge Score reflects how much narrative factors could influence this result beyond what statistics alone would predict.
      </div>`;
    UI.openModal('edgeModal');
  }

  function showReport() {
    const predictions = Predictions.getAll();
    const edgeMatches = predictions
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m._edge && m._edge.edge_level !== 'none')
      .sort((a, b) => (b.m._edge?.edge_score || 0) - (a.m._edge?.edge_score || 0));

    const body = document.getElementById('edgeModalBody');
    if (!body) return;

    body.innerHTML = edgeMatches.length
      ? edgeMatches.map(({ m }) => `
          <div class="edge-report-match" style="margin-bottom:12px">
            <div class="edge-report-header">
              <div>
                <span class="league-tag">${m.league}</span>
                <div class="edge-report-teams">${m.home} vs ${m.away}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${m.prediction} · ${m.confidence}%</div>
              </div>
              <div class="edge-score-circle">
                <div class="edge-score-val">${m._edge.edge_score}</div>
                <div class="edge-score-lbl">${levelLabel(m._edge.edge_level)}</div>
              </div>
            </div>
            <div class="edge-report-factors">
              ${(m._edge.factors || []).map(f => `
                <div class="edge-report-factor" style="color:${f.type==='positive'?'var(--primary)':f.type==='negative'?'var(--danger)':'var(--text-secondary)'}">
                  ${f.label}
                </div>`).join('')}
            </div>
            ${m._edge.verdict ? `<div class="edge-report-verdict">"${m._edge.verdict}"</div>` : ''}
          </div>`).join('')
      : '<p style="color:var(--text-muted);font-size:14px">No edge matches detected today.</p>';

    UI.openModal('edgeModal');
  }

  function reset() { isLoaded = false; isLoading = false; }

  return { load, renderTab, showMatchEdge, showReport, reset };
})();
