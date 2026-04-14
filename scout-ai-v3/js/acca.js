/* ════════════════════════════════════════════════
   ScoutAI — Smart Accumulator Builder

   Lets users pick 2–6 matches and calculates
   the combined probability + shows the acca slip.
   ════════════════════════════════════════════════ */

const Acca = (() => {

  let picks = new Set();  /* Set of match indices */

  /* ── Toggle a pick ──────────────────────────── */
  function toggle(idx) {
    if (picks.has(idx)) {
      picks.delete(idx);
    } else {
      if (picks.size >= Config.MAX_ACCA_PICKS) {
        UI.toast(`Max ${Config.MAX_ACCA_PICKS} picks in an acca`);
        return;
      }
      picks.add(idx);
    }
    _syncUI(idx);
    _updateTray();
  }

  /* ── Check if index is picked ───────────────── */
  function has(idx) { return picks.has(idx); }

  /* ── Clear all picks ────────────────────────── */
  function clearAll() {
    const prev = [...picks];
    picks.clear();
    prev.forEach(idx => _syncUI(idx));
    _updateTray();
  }

  /* ── Combined probability ───────────────────── */
  function combinedPct() {
    const predictions = Predictions.getAll();
    if (!picks.size) return 0;
    let prob = 1;
    picks.forEach(idx => {
      prob *= (predictions[idx]?.confidence || 50) / 100;
    });
    return Math.round(prob * 100);
  }

  /* ── Update all card UI for an index ─────────── */
  function _syncUI(idx) {
    const isSelected = picks.has(idx);
    /* Match cards */
    document.querySelectorAll(`#card-${idx}, #top-card-${idx}`).forEach(el => {
      el.classList.toggle('selected', isSelected);
    });
    /* Acca tab picks list */
    const accaPanel = document.getElementById('panel-acca');
    if (accaPanel && accaPanel.style.display !== 'none') {
      UI.renderPanel('acca');
    }
    /* Count badge on tab */
    const badge = document.getElementById('accaCount');
    if (badge) {
      badge.textContent = picks.size;
      badge.style.display = picks.size ? 'inline-flex' : 'none';
    }
  }

  /* ── Update floating tray ───────────────────── */
  function _updateTray() {
    const tray = document.getElementById('accaTray');
    if (!tray) return;

    if (!picks.size) {
      tray.style.display = 'none';
      return;
    }

    tray.style.display = '';

    const predictions = Predictions.getAll();
    const chips = document.getElementById('accaTrayPicks');
    if (chips) {
      chips.innerHTML = [...picks].map(idx => {
        const m = predictions[idx];
        return m
          ? `<span class="acca-pick-chip">${m.home} vs ${m.away}</span>`
          : '';
      }).join('');
    }

    const combined = document.getElementById('accaCombined');
    if (combined) combined.textContent = `${combinedPct()}%`;
  }

  /* ── Build the full acca (show modal) ────────── */
  function build() {
    if (picks.size < Config.MIN_ACCA_PICKS) {
      UI.toast(`Add at least ${Config.MIN_ACCA_PICKS} picks to build an acca`);
      return;
    }

    const predictions = Predictions.getAll();
    const picksArr    = [...picks].map(idx => predictions[idx]).filter(Boolean);
    const combined    = combinedPct();

    const body = document.getElementById('accaModalBody');
    if (!body) return;

    body.innerHTML = `
      <div class="acca-result-header">
        <div class="acca-result-title">${picks.size}-Fold Accumulator</div>
        <div class="acca-result-sub">Combined probability: ${combined}%</div>
      </div>

      <div style="margin-top:var(--space-md)">
        ${picksArr.map(m => `
          <div class="acca-result-pick">
            <div>
              <div class="acca-pick-left">${m.home} vs ${m.away}</div>
              <div class="acca-pick-pred">${m.league} · ${m.time || ''}</div>
            </div>
            <div class="acca-pick-conf">${m.confidence}%</div>
          </div>`).join('')}
      </div>

      <div class="acca-summary-row">
        <span class="acca-summary-label">Selections</span>
        <span class="acca-summary-val">${picks.size}</span>
      </div>
      <div class="acca-summary-row" style="margin-top:6px">
        <span class="acca-summary-label">Combined probability</span>
        <span class="acca-summary-val">${combined}%</span>
      </div>
      <div class="acca-summary-row" style="margin-top:6px">
        <span class="acca-summary-label">Risk level</span>
        <span class="acca-summary-val" style="color:${combined > 50 ? 'var(--primary)' : combined > 30 ? 'var(--accent)' : 'var(--danger)'}">
          ${combined > 50 ? 'Moderate' : combined > 30 ? 'Medium-High' : 'High Risk'}
        </span>
      </div>

      ${picksArr.some(m => m._edge && ['high','elite'].includes(m._edge.edge_level)) ? `
        <div style="margin-top:var(--space-md);padding:12px;background:rgba(239,159,39,0.1);border:1px solid rgba(239,159,39,0.25);border-radius:var(--radius-md)">
          <div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:4px">⚡ Edge Detected</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.5">
            One or more of your picks has significant narrative factors flagged by The Edge Engine. 
            Review each match's Edge Report before placing.
          </div>
        </div>` : ''}

      <p style="font-size:11px;color:var(--text-muted);margin-top:var(--space-lg);line-height:1.6;text-align:center">
        ScoutAI predictions are for entertainment only. Please gamble responsibly.
      </p>`;

    UI.openModal('accaModal');
  }

  /* ── Render acca tab content ─────────────────── */
  function renderTab() {
    const predictions = Predictions.getAll();

    const instructions = `
      <div class="acca-instructions">
        <h3>Build Your Smart Accumulator</h3>
        <p>Tap any match card on the Top 10, By League, or other tabs to add it to your acca. 
        Choose ${Config.MIN_ACCA_PICKS}–${Config.MAX_ACCA_PICKS} picks and ScoutAI will calculate 
        the combined probability and flag any Edge matches.</p>
      </div>`;

    if (!picks.size) {
      return `${instructions}
        <p style="text-align:center;font-size:14px;color:var(--text-muted);padding:var(--space-lg)">
          No picks selected yet
        </p>`;
    }

    const picksArr = [...picks].map(idx => ({ m: predictions[idx], idx })).filter(({ m }) => m);

    return `${instructions}
      <div class="section-header">
        <div class="section-title">Your Picks (${picks.size}/${Config.MAX_ACCA_PICKS})</div>
        <span class="section-count">Combined: ${combinedPct()}%</span>
      </div>
      <div class="acca-picks-list">
        ${picksArr.map(({ m, idx }) =>
          Predictions.buildMatchCard(m, idx, true)
        ).join('')}
      </div>
      <button class="btn-build-acca w-full" style="width:100%;padding:14px;font-size:15px;border-radius:var(--radius-lg)" onclick="Acca.build()">
        Generate My Acca Slip ↗
      </button>`;
  }

  function reset() {
    picks.clear();
    _updateTray();
    const badge = document.getElementById('accaCount');
    if (badge) badge.style.display = 'none';
  }

  return { toggle, has, clearAll, combinedPct, build, renderTab, reset };

})();
