/* ============================================================
   app.js — Main menu page logic
   ============================================================ */

import { loadMenuData } from './data.js';
import { buildDishCard, buildModalContent, initReveal, initNavScroll, showToast } from './ui.js';

/* ---- State ---- */
let menuData = null;
let currentCategory = 'All';
let currentType = 'all';
let searchQuery = '';

/* ---- Boot ---- */
async function init() {
  initNavScroll();
  initReveal();

  menuData = await loadMenuData();
  applyHotelInfo();
  buildCategoryFilters();
  renderDishes();
  bindEvents();

  // Trigger initial reveal
  setTimeout(() => initReveal(), 100);
}

/* ---- Apply hotel info to DOM ---- */
function applyHotelInfo() {
  const h = menuData.hotel || {};

  setTextById('hero-name',    h.name || 'LUMIÈRE');
  setTextById('nav-brand',    h.name || 'LUMIÈRE');
  setTextById('footer-name',  h.name || 'LUMIÈRE');
  setTextById('hero-desc',    h.description || '');
  setTextById('footer-desc',  h.description || '');
  setTextById('footer-address', h.address || '');
  setTextById('footer-phone', h.phone || '');
  setTextById('footer-email', h.email || '');

  // Logo
  const logoEl = document.getElementById('nav-logo-img');
  if (logoEl && h.logo) {
    logoEl.src = h.logo;
    logoEl.style.display = 'block';
  }
}

/* ---- Build category filter buttons ---- */
function buildCategoryFilters() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  const cats = ['All', ...(menuData.categories || [])];
  container.innerHTML = '';

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === currentCategory ? ' active' : '');
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      currentCategory = cat;
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDishes();
    });
    container.appendChild(btn);
  });
}

/* ---- Render filtered dishes ---- */
function renderDishes() {
  const grid = document.getElementById('dish-grid');
  const empty = document.getElementById('empty-state');
  if (!grid) return;

  const dishes = (menuData.dishes || []).filter(dish => {
    const catOk  = currentCategory === 'All' || dish.category === currentCategory;
    const typeOk = currentType === 'all' || dish.type === currentType;
    const query  = searchQuery.trim().toLowerCase();
    const nameOk = !query || dish.name.toLowerCase().includes(query) ||
                   (dish.description || '').toLowerCase().includes(query);
    return catOk && typeOk && nameOk;
  });

  grid.innerHTML = '';

  if (!dishes.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  dishes.forEach(dish => {
    const card = buildDishCard(dish, openModal);
    grid.appendChild(card);
  });
}

/* ---- Modal ---- */
function openModal(dish) {
  const overlay = document.getElementById('modal-overlay');
  const body    = document.getElementById('modal-body');
  if (!overlay || !body) return;

  body.innerHTML = buildModalContent(dish);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';

  // Stop model-viewer when closing
  setTimeout(() => {
    const mv = document.getElementById('mv-modal');
    if (mv) mv.pause?.();
  }, 350);
}

/* ---- Event bindings ---- */
function bindEvents() {
  // Close modal
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Veg filter
  document.querySelectorAll('.veg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.veg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      renderDishes();
    });
  });

  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value;
        renderDishes();
      }, 250);
    });
  }
}

/* ---- Helpers ---- */
function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ---- Start ---- */
document.addEventListener('DOMContentLoaded', init);
