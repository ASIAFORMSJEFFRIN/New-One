/* ============================================================
   admin.js — Admin panel logic
   All data saved to localStorage; exportable as menu.json
   ============================================================ */

import { loadMenuData, saveMenuData, exportMenuJson, importMenuJson, generateId } from './data.js';
import { showToast, escapeHtml } from './ui.js';

let data = null;          // Full menu data object
let editingDishId = null; // null = add mode, string = edit mode

/* ---- Boot ---- */
async function init() {
  data = await loadMenuData();
  renderHotelForm();
  renderCategories();
  renderDishTable();
  bindEvents();
}

/* ---- HOTEL INFO ---- */
function renderHotelForm() {
  const h = data.hotel || {};
  setVal('hotel-name',    h.name || '');
  setVal('hotel-logo',    h.logo || '');
  setVal('hotel-desc',    h.description || '');
  setVal('hotel-address', h.address || '');
  setVal('hotel-phone',   h.phone || '');
  setVal('hotel-email',   h.email || '');
}

function saveHotelInfo() {
  data.hotel = {
    name:        getVal('hotel-name'),
    logo:        getVal('hotel-logo'),
    description: getVal('hotel-desc'),
    address:     getVal('hotel-address'),
    phone:       getVal('hotel-phone'),
    email:       getVal('hotel-email')
  };
  saveMenuData(data);
  showToast('Hotel info saved!', 'success');
}

/* ---- CATEGORIES ---- */
function renderCategories() {
  const list = document.getElementById('cat-list');
  if (!list) return;
  list.innerHTML = '';

  (data.categories || []).forEach((cat, idx) => {
    const tag = document.createElement('div');
    tag.className = 'cat-tag';
    tag.innerHTML = `
      <span>${escapeHtml(cat)}</span>
      <button title="Remove" data-idx="${idx}">×</button>
    `;
    tag.querySelector('button').addEventListener('click', () => removeCategory(idx));
    list.appendChild(tag);
  });

  // Keep dish form select in sync
  populateCategorySelect();
}

function addCategory() {
  const input = document.getElementById('cat-input');
  const name  = input.value.trim();
  if (!name) { showToast('Enter a category name', 'error'); return; }
  if ((data.categories || []).includes(name)) {
    showToast('Category already exists', 'error'); return;
  }
  data.categories = [...(data.categories || []), name];
  saveMenuData(data);
  input.value = '';
  renderCategories();
  showToast(`"${name}" added`, 'success');
}

function removeCategory(idx) {
  const cat = data.categories[idx];
  if (confirm(`Remove category "${cat}"?\nDishes in this category won't be deleted.`)) {
    data.categories.splice(idx, 1);
    saveMenuData(data);
    renderCategories();
    showToast(`"${cat}" removed`, 'info');
  }
}

function populateCategorySelect() {
  const sel = document.getElementById('d-category');
  if (!sel) return;
  sel.innerHTML = (data.categories || []).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

/* ---- DISH FORM ---- */
function openDishForm(dish = null) {
  const card  = document.getElementById('dish-form-card');
  const title = document.getElementById('dish-form-title');
  if (!card) return;

  card.classList.remove('hidden');
  populateCategorySelect();

  if (dish) {
    // Edit mode
    editingDishId = dish.id;
    title.textContent = 'Edit Dish';
    setVal('d-id',       dish.id);
    setVal('d-name',     dish.name || '');
    setVal('d-price',    dish.price || '');
    setVal('d-desc',     dish.description || '');
    setVal('d-thumb',    dish.thumbnail || '');
    setVal('d-glb',      dish.modelGlb || '');
    setVal('d-usdz',     dish.modelUsdz || '');
    setSelectVal('d-category', dish.category || (data.categories?.[0] || ''));
    setSelectVal('d-type',     dish.type || 'veg');
    setSelectVal('d-featured', dish.featured ? 'true' : 'false');
  } else {
    // Add mode
    editingDishId = null;
    title.textContent = 'Add Dish';
    clearDishForm();
  }

  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeDishForm() {
  document.getElementById('dish-form-card')?.classList.add('hidden');
  clearDishForm();
  editingDishId = null;
}

function clearDishForm() {
  ['d-id','d-name','d-price','d-desc','d-thumb','d-glb','d-usdz'].forEach(id => setVal(id, ''));
  setSelectVal('d-type', 'veg');
  setSelectVal('d-featured', 'false');
}

function saveDish() {
  const name  = getVal('d-name').trim();
  const price = parseFloat(getVal('d-price'));

  if (!name) { showToast('Dish name is required', 'error'); return; }
  if (isNaN(price) || price < 0) { showToast('Enter a valid price', 'error'); return; }

  const dish = {
    id:          editingDishId || generateId(),
    name,
    price,
    description: getVal('d-desc').trim(),
    category:    getVal('d-category') || (data.categories?.[0] || 'Uncategorized'),
    type:        getVal('d-type') || 'veg',
    thumbnail:   getVal('d-thumb').trim(),
    modelGlb:    getVal('d-glb').trim(),
    modelUsdz:   getVal('d-usdz').trim(),
    featured:    getVal('d-featured') === 'true'
  };

  if (editingDishId) {
    const idx = data.dishes.findIndex(d => d.id === editingDishId);
    if (idx >= 0) data.dishes[idx] = dish;
    showToast(`"${name}" updated`, 'success');
  } else {
    data.dishes.push(dish);
    showToast(`"${name}" added`, 'success');
  }

  saveMenuData(data);
  closeDishForm();
  renderDishTable();
}

function deleteDish(id) {
  const dish = data.dishes.find(d => d.id === id);
  if (!dish) return;
  if (!confirm(`Delete "${dish.name}"?`)) return;
  data.dishes = data.dishes.filter(d => d.id !== id);
  saveMenuData(data);
  renderDishTable();
  showToast(`"${dish.name}" deleted`, 'info');
}

/* ---- DISH TABLE ---- */
function renderDishTable() {
  const tbody = document.getElementById('dish-tbody');
  if (!tbody) return;

  if (!data.dishes?.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:2rem">No dishes yet. Add one above!</td></tr>`;
    return;
  }

  tbody.innerHTML = data.dishes.map(dish => {
    const modelCell = dish.modelGlb
      ? `<span class="model-path">${escapeHtml(dish.modelGlb)}</span>`
      : `<span class="no-model">No model</span>`;
    const typeBadge = dish.type === 'veg'
      ? `<span class="veg-dot veg" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--veg-color);margin-right:4px"></span>Veg`
      : `<span class="veg-dot nonveg" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--nonveg-color);margin-right:4px"></span>Non-Veg`;
    return `
      <tr>
        <td class="dish-name-cell">${escapeHtml(dish.name)}</td>
        <td>${escapeHtml(dish.category)}</td>
        <td>₹${dish.price}</td>
        <td>${typeBadge}</td>
        <td>${modelCell}</td>
        <td class="td-actions">
          <button class="admin-btn ghost small" data-edit="${dish.id}">Edit</button>
          <button class="admin-btn danger small" data-del="${dish.id}">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  // Bind row actions
  tbody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dish = data.dishes.find(d => d.id === btn.dataset.edit);
      if (dish) openDishForm(dish);
    });
  });
  tbody.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => deleteDish(btn.dataset.del));
  });
}

/* ---- Event Bindings ---- */
function bindEvents() {
  document.getElementById('save-hotel-btn')?.addEventListener('click', saveHotelInfo);
  document.getElementById('add-cat-btn')?.addEventListener('click', addCategory);
  document.getElementById('cat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addCategory();
  });
  document.getElementById('open-add-dish-btn')?.addEventListener('click', () => openDishForm());
  document.getElementById('save-dish-btn')?.addEventListener('click', saveDish);
  document.getElementById('cancel-dish-btn')?.addEventListener('click', closeDishForm);

  // Export
  document.getElementById('export-btn')?.addEventListener('click', () => {
    exportMenuJson(data);
    showToast('menu.json exported!', 'success');
  });

  // Import
  document.getElementById('import-file')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      data = await importMenuJson(file);
      renderHotelForm();
      renderCategories();
      renderDishTable();
      showToast('menu.json imported!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    e.target.value = '';
  });

  // Sidebar links smooth scroll
  document.querySelectorAll('.slink').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.section;
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.querySelectorAll('.slink').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ---- Helpers ---- */
function getVal(id)        { return document.getElementById(id)?.value || ''; }
function setVal(id, val)   { const el = document.getElementById(id); if (el) el.value = val; }
function setSelectVal(id, val) {
  const sel = document.getElementById(id);
  if (!sel) return;
  [...sel.options].forEach(o => { o.selected = o.value === val; });
}

/* ---- Start ---- */
document.addEventListener('DOMContentLoaded', init);
