/* ================================================
   FÊTE DES MÈRES — APP LOGIC
   ================================================ */

(() => {
  'use strict';

  // ---- Data (persisted in localStorage) ----
  const STORAGE_KEY = 'fdm_dishes';

  const categoryMeta = {
    entree:  { label: 'Entrées',  emoji: '🥗', resultEmoji: '🥗' },
    plat:    { label: 'Plats',    emoji: '🍽️', resultEmoji: '🍽️' },
    dessert: { label: 'Desserts', emoji: '🍰', resultEmoji: '🍰' },
  };

  let data = loadData();
  let currentCategory = null;

  // ---- DOM refs ----
  const $homeScreen     = document.getElementById('screen-home');
  const $catScreen      = document.getElementById('screen-category');
  const $catTitle       = document.getElementById('cat-title');
  const $catEmoji       = document.getElementById('cat-emoji');
  const $inputDish      = document.getElementById('input-dish');
  const $btnAdd         = document.getElementById('btn-add');
  const $btnRandom      = document.getElementById('btn-random');
  const $btnBack        = document.getElementById('btn-back');
  const $dishList       = document.getElementById('dish-list');
  const $emptyState     = document.getElementById('empty-state');

  // Single result modal
  const $modalOverlay   = document.getElementById('modal-overlay');
  const $modalEmoji     = document.getElementById('modal-emoji');
  const $modalLabel     = document.getElementById('modal-label');
  const $modalResult    = document.getElementById('modal-result');
  const $modalConfetti  = document.getElementById('modal-confetti');
  const $btnModalClose  = document.getElementById('btn-modal-close');

  // Full menu modal
  const $menuOverlay    = document.getElementById('menu-modal-overlay');
  const $menuEntree     = document.getElementById('menu-entree');
  const $menuPlat       = document.getElementById('menu-plat');
  const $menuDessert    = document.getElementById('menu-dessert');
  const $menuConfetti   = document.getElementById('menu-modal-confetti');
  const $btnMenuClose   = document.getElementById('btn-menu-close');

  const $btnGenerateMenu = document.getElementById('btn-generate-menu');

  // ---- Persistence ----
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* noop */ }
    return { entree: [], plat: [], dessert: [] };
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ---- Floating Hearts ----
  function spawnHearts() {
    const container = document.getElementById('hearts-container');
    const hearts = ['💗', '💖', '💕', '🩷', '🌸', '🩵', '✨', '💐'];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'floating-heart';
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.left = Math.random() * 100 + '%';
      el.style.setProperty('--dur', (6 + Math.random() * 8) + 's');
      el.style.setProperty('--delay', (Math.random() * 12) + 's');
      el.style.setProperty('--size', (1 + Math.random() * 1.4) + 'rem');
      el.style.setProperty('--rot', (Math.random() > .5 ? '' : '-') + (20 + Math.random() * 40) + 'deg');
      container.appendChild(el);

      // Recycle heart after animation
      el.addEventListener('animationend', () => {
        el.style.left = Math.random() * 100 + '%';
        el.style.setProperty('--delay', '0s');
        el.style.setProperty('--dur', (6 + Math.random() * 8) + 's');
        el.style.animation = 'none';
        // Trigger reflow
        void el.offsetWidth;
        el.style.animation = '';
      });
    }
  }

  // ---- Confetti in modals ----
  function spawnConfetti(container) {
    container.innerHTML = '';
    const colors = ['#f06292', '#ec407a', '#f48fb1', '#ffab91', '#ffd54f', '#ce93d8', '#80deea', '#a5d6a7'];
    for (let i = 0; i < 30; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.top = Math.random() * 30 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = (Math.random() * .5) + 's';
      piece.style.setProperty('--confetti-rot', (Math.random() * 720 - 360) + 'deg');
      piece.style.width = (5 + Math.random() * 6) + 'px';
      piece.style.height = (5 + Math.random() * 6) + 'px';
      piece.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
      container.appendChild(piece);
    }
  }

  // ---- Update counts on home ----
  function updateCounts() {
    for (const key of Object.keys(categoryMeta)) {
      const el = document.getElementById('count-' + key);
      const n = data[key].length;
      el.textContent = n === 0 ? '0 idée' : n === 1 ? '1 idée' : n + ' idées';
    }
  }

  // ---- Render dish list ----
  function renderDishList() {
    if (!currentCategory) return;
    const dishes = data[currentCategory];
    $dishList.innerHTML = '';

    dishes.forEach((name, idx) => {
      const li = document.createElement('li');
      li.className = 'dish-item';
      li.style.animationDelay = (idx * .04) + 's';
      li.innerHTML = `
        <span class="dish-item-heart">♥</span>
        <span class="dish-item-name">${escapeHTML(name)}</span>
        <button class="dish-item-delete" data-index="${idx}" aria-label="Supprimer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;
      $dishList.appendChild(li);
    });

    $emptyState.classList.toggle('hidden', dishes.length > 0);
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Navigate to category ----
  function openCategory(cat) {
    currentCategory = cat;
    const meta = categoryMeta[cat];
    $catTitle.textContent = meta.label;
    $catEmoji.textContent = meta.emoji;

    renderDishList();

    $homeScreen.classList.remove('active');
    $homeScreen.classList.add('slide-left');
    $catScreen.classList.add('active');

    setTimeout(() => $inputDish.focus(), 400);
  }

  function goHome() {
    currentCategory = null;
    $catScreen.classList.remove('active');
    $homeScreen.classList.remove('slide-left');
    $homeScreen.classList.add('active');
    updateCounts();
  }

  // ---- Add dish ----
  function addDish() {
    const name = $inputDish.value.trim();
    if (!name) {
      $inputDish.classList.add('shake');
      setTimeout(() => $inputDish.classList.remove('shake'), 400);
      return;
    }
    if (!currentCategory) return;

    data[currentCategory].push(name);
    saveData();
    $inputDish.value = '';
    renderDishList();
    updateCounts();

    // Scroll to bottom
    const lastItem = $dishList.lastElementChild;
    if (lastItem) lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---- Delete dish ----
  function deleteDish(idx) {
    if (!currentCategory) return;
    data[currentCategory].splice(idx, 1);
    saveData();
    renderDishList();
    updateCounts();
  }

  // ---- Random pick ----
  function randomPick() {
    if (!currentCategory) return;
    const dishes = data[currentCategory];
    if (dishes.length === 0) {
      $btnRandom.classList.add('shake');
      setTimeout(() => $btnRandom.classList.remove('shake'), 400);
      return;
    }

    // Dice animation
    $btnRandom.classList.add('spinning');
    setTimeout(() => $btnRandom.classList.remove('spinning'), 600);

    const chosen = dishes[Math.floor(Math.random() * dishes.length)];
    const meta = categoryMeta[currentCategory];

    setTimeout(() => {
      $modalEmoji.textContent = meta.resultEmoji;
      $modalLabel.textContent = meta.label + ' — Le choix parfait :';
      $modalResult.textContent = chosen;
      showModal($modalOverlay, $modalConfetti);
    }, 500);
  }

  // ---- Full menu random ----
  function generateFullMenu() {
    const pick = (arr) => arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

    const entree = pick(data.entree);
    const plat = pick(data.plat);
    const dessert = pick(data.dessert);

    if (!entree && !plat && !dessert) {
      // Nothing to pick — shake button
      $btnGenerateMenu.classList.add('shake');
      setTimeout(() => $btnGenerateMenu.classList.remove('shake'), 400);
      return;
    }

    $menuEntree.textContent = entree || '— (aucune idée)';
    $menuPlat.textContent = plat || '— (aucune idée)';
    $menuDessert.textContent = dessert || '— (aucune idée)';

    showModal($menuOverlay, $menuConfetti);
  }

  // ---- Modal helpers ----
  function showModal(overlay, confettiContainer) {
    overlay.classList.add('visible');
    spawnConfetti(confettiContainer);
  }

  function hideModal(overlay) {
    overlay.classList.remove('visible');
  }

  // ---- Event listeners ----
  // Category cards
  document.querySelectorAll('.card[data-category]').forEach(btn => {
    btn.addEventListener('click', () => openCategory(btn.dataset.category));
  });

  $btnBack.addEventListener('click', goHome);

  $btnAdd.addEventListener('click', addDish);
  $inputDish.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addDish();
  });

  $dishList.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.dish-item-delete');
    if (deleteBtn) {
      const idx = parseInt(deleteBtn.dataset.index, 10);
      deleteDish(idx);
    }
  });

  $btnRandom.addEventListener('click', randomPick);
  $btnGenerateMenu.addEventListener('click', generateFullMenu);

  $btnModalClose.addEventListener('click', () => hideModal($modalOverlay));
  $modalOverlay.addEventListener('click', (e) => {
    if (e.target === $modalOverlay) hideModal($modalOverlay);
  });

  $btnMenuClose.addEventListener('click', () => hideModal($menuOverlay));
  $menuOverlay.addEventListener('click', (e) => {
    if (e.target === $menuOverlay) hideModal($menuOverlay);
  });

  // ---- Init ----
  updateCounts();
  spawnHearts();

})();
