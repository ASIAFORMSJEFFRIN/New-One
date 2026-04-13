/* ============================================================
   data.js — Menu data layer
   Loads from localStorage (admin edits) or falls back to menu.json
   Exports the data API used by app.js and admin.js
   ============================================================ */

const STORAGE_KEY = 'ar_menu_data';

/**
 * Load menu data.
 * Priority: localStorage → menu.json
 */
export async function loadMenuData() {
  // 1. Check localStorage for admin-edited data
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored data, falling back to menu.json');
    }
  }

  // 2. Fetch from /data/menu.json
  try {
    const res = await fetch('data/menu.json');
    if (!res.ok) throw new Error('Could not load menu.json');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Error loading menu.json:', e);
    return getDefaultData();
  }
}

/**
 * Save menu data to localStorage.
 * @param {Object} data - Full menu data object
 */
export function saveMenuData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Export current data as a downloadable menu.json file.
 */
export function exportMenuJson(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'menu.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import menu data from a JSON file the user selects.
 * @param {File} file
 * @returns {Promise<Object>}
 */
export function importMenuJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        saveMenuData(data);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}

/**
 * Generate a unique dish ID.
 */
export function generateId() {
  return 'dish-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Default fallback data if no localStorage and no menu.json.
 */
function getDefaultData() {
  return {
    hotel: {
      name: 'LUMIÈRE',
      logo: 'assets/logo.png',
      description: 'Where culinary artistry meets the future of dining. Scan. Discover. Experience.',
      address: '123 Gourmet Avenue, Mumbai',
      phone: '+91 98765 43210',
      email: 'hello@lumiere.in'
    },
    categories: ['Starters', 'Main Course', 'Desserts', 'Drinks'],
    dishes: [
      {
        id: 'dish-001',
        name: 'Paneer Tikka',
        price: 320,
        description: 'Smoky charcoal-grilled cottage cheese cubes marinated in yogurt, saffron, and house spices. Served with mint chutney and pickled onions.',
        type: 'veg',
        category: 'Starters',
        modelGlb: '',
        modelUsdz: '',
        thumbnail: '',
        featured: true
      },
      {
        id: 'dish-002',
        name: 'Butter Chicken',
        price: 480,
        description: 'Slow-simmered free-range chicken in a velvety tomato-cashew gravy with aged butter and fenugreek. A timeless classic elevated.',
        type: 'non-veg',
        category: 'Main Course',
        modelGlb: '',
        modelUsdz: '',
        thumbnail: '',
        featured: true
      },
      {
        id: 'dish-003',
        name: 'Dal Makhani',
        price: 290,
        description: 'Black lentils slow-cooked overnight on a charcoal flame, finished with cream and a whisper of smoked butter. Served with house-baked naan.',
        type: 'veg',
        category: 'Main Course',
        modelGlb: '',
        modelUsdz: '',
        thumbnail: '',
        featured: false
      },
      {
        id: 'dish-004',
        name: 'Gulab Jamun',
        price: 140,
        description: 'Soft milk-solid dumplings soaked in cardamom-rose syrup, served warm with vanilla kulfi.',
        type: 'veg',
        category: 'Desserts',
        modelGlb: '',
        modelUsdz: '',
        thumbnail: '',
        featured: false
      },
      {
        id: 'dish-005',
        name: 'Mango Lassi',
        price: 160,
        description: 'Chilled Alphonso mango blended with strained yogurt, saffron, and a hint of cardamom. Topped with pistachio dust.',
        type: 'veg',
        category: 'Drinks',
        modelGlb: '',
        modelUsdz: '',
        thumbnail: '',
        featured: false
      },
      {
        id: 'dish-006',
        name: 'Seekh Kebab',
        price: 380,
        description: 'Minced lamb and herb rolls grilled on iron skewers over live coals. Served with charred peppers and saffron aioli.',
        type: 'non-veg',
        category: 'Starters',
        modelGlb: '',
        modelUsdz: '',
        thumbnail: '',
        featured: false
      }
    ]
  };
}
