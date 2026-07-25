(function () {
  const STORAGE_KEY = 'demonology-tracker-v2';
  const ALL_GHOST_IDS = GHOSTS.map((g) => g.id);
  const CATEGORY_ORDER = ['Movement', 'Hunting Frequency', 'Other Signs'];

  let collected = new Set();
  let suspects = new Set();
  loadState();

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      collected = new Set(Array.isArray(raw.collected) ? raw.collected : []);
      suspects = new Set(Array.isArray(raw.suspects) ? raw.suspects : []);
    } catch (e) {
      collected = new Set();
      suspects = new Set();
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ collected: [...collected], suspects: [...suspects] })
    );
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

    // A suspected ghost that's since been eliminated by evidence no longer makes sense as a suspect.
    let suspectsChanged = false;
    suspects.forEach((id) => {
      if (!candidates.has(id)) {
        suspects.delete(id);
        suspectsChanged = true;
      }
    });
    if (suspectsChanged) saveState();

    const list = document.getElementById('ghostList');
    list.innerHTML = '';

    GHOSTS.forEach((ghost) => {
      const isEliminated = !candidates.has(ghost.id);
      const isSuspected = suspects.has(ghost.id);

      const li = document.createElement('li');
      li.className =
        'ghost-item' + (isEliminated ? ' eliminated' : '') + (isSuspected ? ' suspected' : '');
      li.textContent = ghost.name;

      if (!isEliminated) {
        li.addEventListener('click', () => {
          if (suspects.has(ghost.id)) suspects.delete(ghost.id);
          else suspects.add(ghost.id);
          saveState();
          renderGhosts();
          renderEvidence();
        });
      }

      list.appendChild(li);
    });

    const countEl = document.getElementById('ghostCount');
    countEl.textContent = `${candidates.size} of ${GHOSTS.length} possible`;

    const emptyEl = document.getElementById('ghostEmpty');
    emptyEl.hidden = candidates.size !== 0;
  }

  function renderEvidence() {
    const candidates = getCandidates();
    const container = document.getElementById('evidenceList');
    container.innerHTML = '';

    const suspectNote = document.getElementById('suspectNote');
    if (suspects.size > 0) {
      const names = GHOSTS.filter((g) => suspects.has(g.id))
        .map((g) => g.name)
        .join(', ');
      document.getElementById('suspectNames').textContent = names;
      suspectNote.hidden = false;
    } else {
      suspectNote.hidden = true;
    }

    // When suspects are marked, only evidence naming at least one of them is relevant.
    const visibleEvidence =
      suspects.size > 0
        ? EVIDENCE.filter((ev) => ev.ghosts.some((id) => suspects.has(id)))
        : EVIDENCE;

    CATEGORY_ORDER.forEach((category) => {
      const items = visibleEvidence.filter((ev) => ev.category === category);
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
    if (!confirm('Start a new round? This clears all collected evidence and suspects.')) return;
    collected = new Set();
    suspects = new Set();
    saveState();
    renderGhosts();
    renderEvidence();
  }

  function clearSuspects() {
    suspects = new Set();
    saveState();
    renderGhosts();
    renderEvidence();
  }

  function init() {
    renderGhosts();
    renderEvidence();
    document.getElementById('resetBtn').addEventListener('click', resetRound);
    document.getElementById('clearSuspects').addEventListener('click', clearSuspects);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
