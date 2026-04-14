/* ═══════════════════════════════════════════
   ScoutAI — App Entry Point
   ═══════════════════════════════════════════ */

const App = (() => {

  let isScanning = false;

  function dateStr() {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  async function scan() {
    /* If no API key, show the key modal first */
    if (!API.hasKey()) {
      UI.showKeyModal(() => scan());
      return;
    }

    if (isScanning) return;
    isScanning = true;

    Edge.reset();
    Acca.reset();
    Predictions.setAll([]);

    UI.setScanLoading(true, 'Scanning...');
    UI.hideEmptyState();
    UI.hideError();
    document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
    document.getElementById('edgeBanner').style.display = 'none';

    /* Show loading state */
    const panel = document.getElementById('panel-top10');
    if (panel) {
      panel.style.display = '';
      panel.innerHTML = `
        <div class="loading-row">
          <div class="loading-dot"></div>
          Scanning prediction platforms across the web...
        </div>
        <div class="loading-row" style="opacity:.6">
          <div class="loading-dot" style="animation-delay:.4s"></div>
          Analysing today's fixtures across top leagues...
        </div>`;
    }

    /* Switch to top10 tab */
    const top10Tab = document.querySelector('.tab[data-tab="top10"]');
    if (top10Tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      top10Tab.classList.add('active');
    }

    try {
      const predictions = await API.fetchPredictions(dateStr());
      Predictions.setAll(predictions);
      UI.updateStats();
      UI.renderPanel('top10');
      UI.setScanLoading(false);

      /* Edge runs async in background */
      Edge.load(predictions, dateStr());

    } catch (err) {
      if (err.message === 'NO_KEY') {
        UI.showKeyModal(() => scan());
        UI.setScanLoading(false);
        UI.showEmptyState();
        document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      } else {
        UI.showError('Scan failed: ' + err.message);
        UI.setScanLoading(false);
      }
    } finally {
      isScanning = false;
    }
  }

  function init() {
    UI.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { scan };
})();
