(function () {
  const STORAGE_KEY = 'demonology-tracker-v1';
  const ALL_GHOST_IDS = GHOSTS.map((g) => g.id);
  const CATEGORY_ORDER = ['Movement', 'Hunting Frequency', 'Other Signs'];

  let collected = loadState();

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return new Set(Array.isArray(raw) ? raw : []);
    } catch (e) {
      return new Set();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...collected]));
  }

  // Ghosts that would produce a given piece of evidence.
  function producingGhosts(evidence) {
    if (evidence.type === 'positive') return evidence.ghosts;
    return ALL_GHOST_IDS.filter((id) => !evidence.ghosts.includes(id));
  }

  // Candidate ghosts consistent with all currently collected evidence.
  function getCandidates() {
    let candidates = new Set(ALL_GHOST_IDS);
    EVIDENCE.forEach((ev) => {
      if (!collected.has(ev.id)) return;
      const producing = new Set(producingGhosts(ev));
      candidates = new Set([...candidates].filter((id) => producing.has(id)));
    });
    return candidates;
  }

  function renderGhosts() {
    const candidates = getCandidates();
    const list = document.getElementById('ghostList');
    list.innerHTML = '';

    GHOSTS.forEach((ghost) => {
      const li = document.createElement('li');
      li.className = 'ghost-item' + (candidates.has(ghost.id) ? '' : ' eliminated');
      li.textContent = ghost.name;
      list.appendChild(li);
    });

    const countEl = document.getElementById('ghostCount');
    countEl.textContent = `${candidates.size} of ${GHOSTS.length} suspects remain`;

    const emptyEl = document.getElementById('ghostEmpty');
    emptyEl.hidden = candidates.size !== 0;
  }

  function renderEvidence() {
    const candidates = getCandidates();
    const container = document.getElementById('evidenceList');
    container.innerHTML = '';

    CATEGORY_ORDER.forEach((category) => {
      const items = EVIDENCE.filter((ev) => ev.category === category);
      if (items.length === 0) return;

      const group = document.createElement('div');
      group.className = 'evidence-group';

      const heading = document.createElement('h3');
      heading.textContent = category;
      group.appendChild(heading);

      const itemsWrap = document.createElement('div');
      itemsWrap.className = 'evidence-items';

      items.forEach((ev) => {
        const isCollected = collected.has(ev.id);
        const isPossible = producingGhosts(ev).some((id) => candidates.has(id));

        const label = document.createElement('label');
        label.className =
          'evidence-item' +
          (isCollected ? ' checked' : '') +
          (!isPossible && !isCollected ? ' impossible' : '');

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = isCollected;
        input.addEventListener('change', () => {
          if (input.checked) collected.add(ev.id);
          else collected.delete(ev.id);
          saveState();
          renderGhosts();
          renderEvidence();
        });

        const span = document.createElement('span');
        span.className = 'evidence-text';
        span.textContent = ev.text;

        label.appendChild(input);
        label.appendChild(span);
        itemsWrap.appendChild(label);
      });

      group.appendChild(itemsWrap);
      container.appendChild(group);
    });
  }

  function resetRound() {
    if (!confirm('Start a new round? This clears all collected evidence.')) return;
    collected = new Set();
    saveState();
    renderGhosts();
    renderEvidence();
  }

  function init() {
    renderGhosts();
    renderEvidence();
    document.getElementById('resetBtn').addEventListener('click', resetRound);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
