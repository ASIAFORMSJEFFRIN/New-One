/* ============================================================
   ui.js — Reusable UI components
   ============================================================ */

/* ---------- Toast Notifications ---------- */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ---------- Build Dish Card ---------- */
export function buildDishCard(dish, onOpen) {
  const card = document.createElement('div');
  card.className = 'dish-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `View ${dish.name}`);

  const typeClass = dish.type === 'veg' ? 'veg' : 'non-veg';

  // Thumb section
  let thumbHtml = '';
  if (dish.thumbnail) {
    thumbHtml = `<img class="dish-thumb" src="${dish.thumbnail}" alt="${dish.name}" loading="lazy" />`;
  } else {
    const emojis = {
      'Starters': '🍢', 'Main Course': '🍛', 'Desserts': '🍮',
      'Drinks': '🥭', 'default': '🍽️'
    };
    const emoji = emojis[dish.category] || emojis.default;
    thumbHtml = `<div class="dish-thumb-placeholder">${emoji}</div>`;
  }

  const has3d = dish.modelGlb || dish.modelUsdz;

  card.innerHTML = `
    <div class="dish-thumb-wrap">
      ${thumbHtml}
      <div class="dish-type-badge ${typeClass}"></div>
    </div>
    <div class="dish-info">
      <div class="dish-cat-tag">${escapeHtml(dish.category)}</div>
      <h3 class="dish-name">${escapeHtml(dish.name)}</h3>
      <p class="dish-short-desc">${escapeHtml(dish.description || '')}</p>
      <div class="dish-footer">
        <span class="dish-price">
          <span class="currency">₹</span>${dish.price}
        </span>
        ${has3d ? `
          <button class="dish-ar-btn" data-id="${dish.id}">
            <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1L10.5 3.5V8.5L6 11L1.5 8.5V3.5L6 1Z" stroke="currentColor" stroke-width="1.2"/>
            </svg>
            3D / AR
          </button>` : ''}
      </div>
    </div>
  `;

  // Click / keyboard open
  const open = () => onOpen(dish);
  card.addEventListener('click', open);
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(); });

  return card;
}

/* ---------- Build Modal Content ---------- */
export function buildModalContent(dish) {
  const has3d = !!(dish.modelGlb || dish.modelUsdz);
  const typeLabel = dish.type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';
  const typeClass = dish.type === 'veg' ? 'veg' : 'non-veg';

  let viewerHtml = '';
  if (has3d) {
    const glbAttr  = dish.modelGlb  ? `src="${dish.modelGlb}"` : '';
    const usdzAttr = dish.modelUsdz ? `ios-src="${dish.modelUsdz}"` : '';
    const posterAttr = dish.thumbnail ? `poster="${dish.thumbnail}"` : '';
    viewerHtml = `
      <div class="modal-model-viewer">
        <model-viewer
          ${glbAttr}
          ${usdzAttr}
          ${posterAttr}
          alt="${escapeHtml(dish.name)} 3D Model"
          camera-controls
          auto-rotate
          ar
          ar-modes="webxr scene-viewer quick-look"
          shadow-intensity="1"
          environment-image="neutral"
          exposure="1"
          style="width:100%;height:100%"
          id="mv-modal"
        ></model-viewer>
      </div>
    `;
  } else {
    // Fallback image or emoji
    const emojis = {
      'Starters': '🍢', 'Main Course': '🍛', 'Desserts': '🍮',
      'Drinks': '🥭', 'default': '🍽️'
    };
    const emoji = emojis[dish.category] || emojis.default;
    if (dish.thumbnail) {
      viewerHtml = `
        <div class="modal-model-no3d">
          <img src="${dish.thumbnail}" alt="${escapeHtml(dish.name)}" 
               style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius)" />
        </div>
      `;
    } else {
      viewerHtml = `<div class="modal-model-no3d" style="font-size:5rem">${emoji}</div>`;
    }
  }

  // AR button — uses model-viewer's built-in AR activation if supported
  const arButton = has3d ? `
    <button class="ar-launch-btn" id="ar-launch-btn" onclick="document.getElementById('mv-modal')?.activateAR()">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="8" cy="8" r="2" fill="currentColor"/>
      </svg>
      View in AR
    </button>
  ` : `<p class="ar-not-supported">No 3D model available for this dish yet.</p>`;

  return `
    ${viewerHtml}
    <div class="modal-dish-cat">${escapeHtml(dish.category)}</div>
    <div class="modal-dish-type">
      <span class="veg-dot ${typeClass}"></span>
      ${typeLabel}
    </div>
    <h2 class="modal-dish-name">${escapeHtml(dish.name)}</h2>
    <p class="modal-dish-desc">${escapeHtml(dish.description || 'No description available.')}</p>
    <div class="modal-dish-footer">
      <span class="modal-price"><span style="font-size:1rem;color:var(--text2)">₹</span>${dish.price}</span>
      ${arButton}
    </div>
  `;
}

/* ---------- Scroll Reveal ---------- */
export function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(t => observer.observe(t));
}

/* ---------- Nav Scroll Behaviour ---------- */
export function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ---------- Helpers ---------- */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
