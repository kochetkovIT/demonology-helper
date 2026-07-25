(function () {
  const STORAGE_KEY = 'demonology-tracker-v3';
  const ALL_GHOST_IDS = GHOSTS.map((g) => g.id);
  const CATEGORY_ORDER = ['Movement', 'Hunting', 'Not Hunting'];

  // statuses: evidenceId -> 'true' | 'false'. Absent = unconfirmed.
  let statuses = new Map();
  let suspects = new Set();
  loadState();

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      statuses = new Map(Array.isArray(raw.statuses) ? raw.statuses : []);
      suspects = new Set(Array.isArray(raw.suspects) ? raw.suspects : []);
    } catch (e) {
      statuses = new Map();
      suspects = new Set();
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ statuses: [...statuses], suspects: [...suspects] })
    );
  }

  // Ghosts that would produce a given piece of evidence being observed TRUE.
  function producingGhosts(evidence) {
    if (evidence.type === 'positive') return evidence.ghosts;
    return ALL_GHOST_IDS.filter((id) => !evidence.ghosts.includes(id));
  }

  // Candidate ghosts consistent with every confirmed (true or false) piece of evidence.
  function getCandidates() {
    let candidates = new Set(ALL_GHOST_IDS);
    EVIDENCE.forEach((ev) => {
      const status = statuses.get(ev.id);
      if (status !== 'true' && status !== 'false') return;
      const producing = new Set(producingGhosts(ev));
      const matching =
        status === 'true' ? producing : ALL_GHOST_IDS.filter((id) => !producing.has(id));
      const matchingSet = new Set(matching);
      candidates = new Set([...candidates].filter((id) => matchingSet.has(id)));
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

  function setStatus(evidenceId, newStatus) {
    const current = statuses.get(evidenceId);
    if (current === newStatus) statuses.delete(evidenceId);
    else statuses.set(evidenceId, newStatus);
    saveState();
    renderGhosts();
    renderEvidence();
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
        const status = statuses.get(ev.id); // undefined | 'true' | 'false'
        const isPossible = producingGhosts(ev).some((id) => candidates.has(id));

        const row = document.createElement('div');
        row.className =
          'evidence-item' +
          (status === 'true' ? ' confirmed-true' : '') +
          (status === 'false' ? ' confirmed-false' : '') +
          (!status && !isPossible ? ' impossible' : '');

        const controls = document.createElement('div');
        controls.className = 'status-controls';

        const trueBtn = document.createElement('button');
        trueBtn.type = 'button';
        trueBtn.className = 'status-btn status-btn-true';
        trueBtn.textContent = '✓';
        trueBtn.setAttribute('aria-label', 'Mark confirmed true');
        trueBtn.setAttribute('aria-pressed', String(status === 'true'));
        trueBtn.addEventListener('click', () => setStatus(ev.id, 'true'));

        const falseBtn = document.createElement('button');
        falseBtn.type = 'button';
        falseBtn.className = 'status-btn status-btn-false';
        falseBtn.textContent = '✗';
        falseBtn.setAttribute('aria-label', 'Mark confirmed false');
        falseBtn.setAttribute('aria-pressed', String(status === 'false'));
        falseBtn.addEventListener('click', () => setStatus(ev.id, 'false'));

        controls.appendChild(trueBtn);
        controls.appendChild(falseBtn);

        const span = document.createElement('span');
        span.className = 'evidence-text';
        span.textContent = ev.text;

        row.appendChild(controls);
        row.appendChild(span);
        itemsWrap.appendChild(row);
      });

      group.appendChild(itemsWrap);
      container.appendChild(group);
    });
  }

  function resetRound() {
    if (!confirm('Start a new round? This clears all evidence and suspects.')) return;
    statuses = new Map();
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
