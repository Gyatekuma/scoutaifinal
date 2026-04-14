/* ═══════════════════════════════════
   ScoutAI — UI Module
   ═══════════════════════════════════ */

const UI = (() => {

  let _currentTab = 'top10';

  function getCurrentTab() { return _currentTab; }

  function initDate() {
    const el = document.getElementById('today-date');
    if (!el) return;
    el.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  function initTabs() {
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab, btn));
    });
  }

  function switchTab(tab, btnEl) {
    _currentTab = tab;
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    const target = btnEl || document.querySelector(`.tab[data-tab="${tab}"]`);
    if (target) target.classList.add('active');
    renderPanel(tab);
  }

  function renderPanel(tab) {
    document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
    hideEmptyState();
    hideError();
    const panel = document.getElementById(`panel-${tab}`);
    if (!panel) return;
    panel.style.display = '';
    switch (tab) {
      case 'top10':   panel.innerHTML = Predictions.renderTop10();   break;
      case 'leagues': panel.innerHTML = Predictions.renderLeagues(); break;
      case 'goals':   panel.innerHTML = Predictions.renderGoals();   break;
      case 'wins':    panel.innerHTML = Predictions.renderWins();    break;
      case 'edge':    panel.innerHTML = Edge.renderTab();            break;
      case 'acca':    panel.innerHTML = Acca.renderTab();            break;
    }
  }

  function updateStats() {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-matches', Predictions.count());
    set('stat-top',     Predictions.topConfidence() + '%');
    set('stat-leagues', Predictions.leagues().length);
    set('stat-edge', '—');
  }

  function setScanLoading(loading, text) {
    const btn     = document.getElementById('scanBtn');
    const spinner = document.getElementById('scanSpinner');
    const label   = document.getElementById('scanBtnText');
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle('loading', loading);
    if (spinner) spinner.style.display = loading ? 'inline' : 'none';
    if (label)   label.textContent = text || (loading ? 'Scanning...' : 'Scan Today');
  }

  function showEmptyState() { const el = document.getElementById('emptyState');  if (el) el.style.display = ''; }
  function hideEmptyState() { const el = document.getElementById('emptyState');  if (el) el.style.display = 'none'; }

  function showError(msg) {
    const el  = document.getElementById('errorState');
    const txt = document.getElementById('errorMsg');
    if (el)  el.style.display = '';
    if (txt) txt.textContent  = msg;
    hideEmptyState();
    document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  }
  function hideError() { const el = document.getElementById('errorState'); if (el) el.style.display = 'none'; }

  function openModal(id)  {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; document.body.style.overflow = ''; }
  }

  /* ── API Key Modal ──────────────────────────── */
  function showKeyModal(onSave) {
    const existing = API.getKey();
    const overlay  = document.getElementById('keyModal');
    const input    = document.getElementById('keyInput');
    if (input)   input.value = existing;
    if (overlay) overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // store callback
    window._keyModalCallback = onSave || null;
  }

  function saveKey() {
    const input = document.getElementById('keyInput');
    if (!input) return;
    const val = input.value.trim();
    if (!val || val.length < 10) {
      toast('Please paste a valid API key.');
      return;
    }
    API.setKey(val);
    closeModal('keyModal');
    toast('API key saved ✓');
    if (typeof window._keyModalCallback === 'function') {
      window._keyModalCallback();
      window._keyModalCallback = null;
    }
  }

  /* ── Toast ──────────────────────────────────── */
  let _toastTimeout;
  function toast(msg, duration = 2800) {
    let el = document.getElementById('scoutai-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'scoutai-toast';
      el.style.cssText = [
        'position:fixed', 'bottom:90px', 'left:50%', 'transform:translateX(-50%)',
        'background:var(--bg-elevated)', 'color:var(--text-primary)',
        'border:1px solid var(--border-strong)', 'border-radius:var(--radius-pill)',
        'padding:9px 20px', 'font-size:13px', 'font-family:var(--font-body)',
        'z-index:600', 'white-space:nowrap', 'box-shadow:var(--shadow-md)',
      ].join(';');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(_toastTimeout);
    _toastTimeout = setTimeout(() => { el.style.display = 'none'; }, duration);
  }

  function initEdgeBanner() {
    const btn = document.getElementById('edgeBannerBtn');
    if (btn) btn.addEventListener('click', () => Edge.showReport());
  }

  function initKeyBtn() {
    const btn = document.getElementById('settingsBtn');
    if (btn) btn.addEventListener('click', () => showKeyModal());
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      document.body.style.overflow = '';
    }
  });

  function init() {
    initDate();
    initTabs();
    initEdgeBanner();
    initKeyBtn();
    showEmptyState();
  }

  return {
    getCurrentTab,
    init, switchTab, renderPanel, updateStats,
    setScanLoading, showEmptyState, hideEmptyState,
    showError, hideError, openModal, closeModal,
    showKeyModal, saveKey, toast,
  };

})();
