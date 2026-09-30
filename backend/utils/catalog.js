const fs = require('fs');
const path = require('path');

const CATEGORY_MAP = [
  { id: 'cat-cameras', name: 'Cameras', slug: 'cameras' },
  { id: 'cat-storage', name: 'Storage & HDDs', slug: 'storage' },
  { id: 'cat-storage-hdds', name: 'Storage & HDDs', slug: 'storage-hdds' },
  { id: 'cat-cables-connectors', name: 'Cables & Wire', slug: 'cables-connectors' },
  { id: 'cat-cables-wire', name: 'Cables & Wire', slug: 'cables-wire' },
  { id: 'cat-networking', name: 'Networking', slug: 'networking' },
  { id: 'cat-mounting-enclosures', name: 'Racks & Enclosures', slug: 'mounting-enclosures' },
  { id: 'cat-racks-enclosures', name: 'Racks & Enclosures', slug: 'racks-enclosures' },
  { id: 'cat-dvr', name: 'DVR', slug: 'dvr' },
  { id: 'cat-nvr', name: 'NVR', slug: 'nvr' },
  { id: 'cat-power-supplies', name: 'Power Supplies', slug: 'power-supplies' },
  { id: 'cat-accessories', name: 'Accessories', slug: 'accessories' },
  { id: 'cat-displays', name: 'Displays', slug: 'displays' },
  { id: 'cat-services', name: 'Services', slug: 'services' },
  { id: 'cat-bundles', name: 'Bundles', slug: 'bundles' },
];

let cachedProducts = null;

function loadFallbackProducts() {
  if (cachedProducts) return cachedProducts;
  try {
    const productsFilePath = path.join(__dirname, '..', '..', 'src', 'data', 'products.js');
    if (fs.existsSync(productsFilePath)) {
      const content = fs.readFileSync(productsFilePath, 'utf8');
      const match = content.match(/const products = (\[[\s\S]*?\]);/);
      if (match) {
        cachedProducts = JSON.parse(match[1]);
        return cachedProducts;
      }
    }
  } catch (err) {
    console.error('Failed to load fallback catalog from products.js:', err.message);
  }
  cachedProducts = [];
  return cachedProducts;
}

const slugify = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function isCategoryMatch(productCat, targetSlug) {
  if (!targetSlug) return true;
  const pSlug = slugify(productCat);
  if (pSlug === targetSlug) return true;
  if ((targetSlug === 'storage' || targetSlug === 'storage-hdds') && (pSlug === 'storage' || pSlug === 'storage-hdds')) return true;
  if ((targetSlug === 'cables-connectors' || targetSlug === 'cables-wire') && (pSlug === 'cables-connectors' || pSlug === 'cables-wire')) return true;
  if ((targetSlug === 'mounting-enclosures' || targetSlug === 'racks-enclosures') && (pSlug === 'mounting-enclosures' || pSlug === 'racks-enclosures')) return true;
  return false;
}

function getFallbackCategories() {
  return CATEGORY_MAP;
}

function getFallbackProducts({ category, search, limit = 50, offset = 0, admin = false, hiddenIds = [] } = {}) {
  const all = loadFallbackProducts();
  const catSlug = category ? slugify(category) : null;
  const q = search ? search.trim().toLowerCase() : null;

  let filtered = all.filter((p) => {
    if (!admin && hiddenIds && (hiddenIds.includes(p.id) || hiddenIds.includes(String(p.id)))) {
      return false;
    }
    if (catSlug && !isCategoryMatch(p.category, catSlug)) {
      return false;
    }
    if (q) {
      const text = `${p.name || ''} ${p.brand || ''} ${p.category || ''}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit)).map((p) => ({
    id: String(p.id),
    legacyId: p.id,
    name: p.name,
    brand: p.brand || 'Generic',
    category: p.category || 'Accessories',
    categoryId: CATEGORY_MAP.find((c) => slugify(c.name) === slugify(p.category))?.id || 'cat-accessories',
    price: typeof p.price === 'number' ? p.price : 0,
    stock: p.stock || 'In Stock',
    stockStatus: p.stock || 'In Stock',
    stock_qty: p.stock_qty || 10,
    stockQty: p.stock_qty || 10,
    barcode: p.barcode || null,
    gst: p.gst || '18%',
    indoor_outdoor: p.indoor_outdoor || null,
    indoorOutdoor: p.indoor_outdoor || null,
    resolution: p.resolution || null,
    type: p.type || null,
    specs: p.specs || {},
    images: Array.isArray(p.images) ? p.images : [],
    best_for: Array.isArray(p.best_for) ? p.best_for : [],
    bestFor: Array.isArray(p.best_for) ? p.best_for : [],
    reviews: [],
    avg_rating: 4.5,
    review_count: 0,
    is_visible: !hiddenIds.includes(p.id) && !hiddenIds.includes(String(p.id)),
  }));

  return { products: paginated, total };
}

function getFallbackProductById(id, hiddenIds = []) {
  const all = loadFallbackProducts();
  const found = all.find((p) => String(p.id) === String(id));
  if (!found) return null;
  return {
    id: String(found.id),
    legacyId: found.id,
    name: found.name,
    brand: found.brand || 'Generic',
    category: found.category || 'Accessories',
    categoryId: CATEGORY_MAP.find((c) => slugify(c.name) === slugify(found.category))?.id || 'cat-accessories',
    price: typeof found.price === 'number' ? found.price : 0,
    stock: found.stock || 'In Stock',
    stockStatus: found.stock || 'In Stock',
    stock_qty: found.stock_qty || 10,
    stockQty: found.stock_qty || 10,
    barcode: found.barcode || null,
    gst: found.gst || '18%',
    indoor_outdoor: found.indoor_outdoor || null,
    indoorOutdoor: found.indoor_outdoor || null,
    resolution: found.resolution || null,
    type: found.type || null,
    specs: found.specs || {},
    images: Array.isArray(found.images) ? found.images : [],
    best_for: Array.isArray(found.best_for) ? found.best_for : [],
    bestFor: Array.isArray(found.best_for) ? found.best_for : [],
    reviews: [],
    avg_rating: 4.5,
    review_count: 0,
    is_visible: !hiddenIds.includes(found.id) && !hiddenIds.includes(String(found.id)),
  };
}

module.exports = {
  CATEGORY_MAP,
  getFallbackCategories,
  getFallbackProducts,
  getFallbackProductById,
};
