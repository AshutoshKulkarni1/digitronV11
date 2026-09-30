const express = require('express');
const {
  prisma,
  persistLoad,
  persistSave,
  defaultSettings,
  mergeSettings,
  getSiteSettings,
  isPlaceholderMongoUri
} = require('../config/state');
const {
  isMongoId,
  numericId,
  findProductByIdentifier,
  mapProduct,
  logRouteError
} = require('../utils/helpers');
const {
  getFallbackCategories,
  getFallbackProducts,
  getFallbackProductById
} = require('../utils/catalog');

const logger = require('../utils/logger');

const router = express.Router();

router.get('/settings', async (req, res) => {
  try {
    const settings = mergeSettings(await persistLoad('site_settings', defaultSettings));
    res.json(settings);
  } catch {
    res.json(getSiteSettings());
  }
});

router.get('/categories', async (req, res) => {
  if (isPlaceholderMongoUri(process.env.MONGODB_URI)) {
    return res.json(getFallbackCategories());
  }
  try {
    const categories = await prisma.category.findMany();
    if (categories && categories.length > 0) {
      return res.json(categories);
    }
    return res.json(getFallbackCategories());
  } catch (error) {
    logRouteError('Error fetching categories (serving fallback)', error);
    res.json(getFallbackCategories());
  }
});

router.get('/products', async (req, res) => {
  const hiddenIds = await persistLoad('hidden_products', []);
  if (isPlaceholderMongoUri(process.env.MONGODB_URI)) {
    const fallback = getFallbackProducts({
      category: req.query.category,
      search: req.query.search,
      limit: req.query.limit,
      offset: req.query.offset,
      admin: req.query.admin === 'true',
      hiddenIds
    });
    return res.json(fallback);
  }
  try {
    const { category, search, limit = 50, offset = 0, admin, includeReviews } = req.query;
    const visits = await persistLoad('product_visits', {});

    const where = {};
    const andFilters = [];
    
    if (!admin && hiddenIds.length > 0) {
      const hiddenMongoIds = hiddenIds.filter(isMongoId);
      const hiddenLegacyIds = hiddenIds.map(numericId).filter(id => id !== null);
      if (hiddenMongoIds.length) andFilters.push({ id: { notIn: hiddenMongoIds } });
      if (hiddenLegacyIds.length) andFilters.push({ legacyId: { notIn: hiddenLegacyIds } });
    }

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (andFilters.length) where.AND = andFilters;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          reviews: includeReviews === 'true' ? { where: { isApproved: true } } : false
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { id: 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    if (products && products.length > 0) {
      // Track searches
      if (search && products.length > 0) {
        products.forEach(p => {
          visits[p.id] = (visits[p.id] || 0) + 1;
        });
        persistSave('product_visits', visits);
      }
      return res.json({ products: products.map(p => mapProduct(p, hiddenIds)), total });
    }

    // Fallback if DB is empty or unseeded
    const fallback = getFallbackProducts({
      category: req.query.category,
      search: req.query.search,
      limit: req.query.limit,
      offset: req.query.offset,
      admin: req.query.admin === 'true',
      hiddenIds
    });
    return res.json(fallback);
  } catch (error) {
    logRouteError('Error fetching products (serving fallback catalog)', error);
    const fallback = getFallbackProducts({
      category: req.query.category,
      search: req.query.search,
      limit: req.query.limit,
      offset: req.query.offset,
      admin: req.query.admin === 'true',
      hiddenIds
    });
    res.json(fallback);
  }
});

router.get('/products/popular', async (req, res) => {
  const hiddenIds = await persistLoad('hidden_products', []);
  if (isPlaceholderMongoUri(process.env.MONGODB_URI)) {
    const fallback = getFallbackProducts({ limit: 10, hiddenIds });
    return res.json(fallback.products);
  }
  try {
    const visits = await persistLoad('product_visits', {});
    const sortedKeys = Object.entries(visits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
    const mongoIds = sortedKeys.filter(isMongoId);
    const legacyIds = sortedKeys.map(numericId).filter(id => id !== null);

    let products = [];
    if (sortedKeys.length > 0) {
      products = await prisma.product.findMany({
        where: {
          OR: [
            ...(mongoIds.length ? [{ id: { in: mongoIds } }] : []),
            ...(legacyIds.length ? [{ legacyId: { in: legacyIds } }] : [])
          ]
        },
        include: { category: true, reviews: { where: { isApproved: true } } }
      });
      products.sort((a, b) => {
        const aKey = visits[a.id] ? a.id : String(a.legacyId);
        const bKey = visits[b.id] ? b.id : String(b.legacyId);
        return sortedKeys.indexOf(aKey) - sortedKeys.indexOf(bKey);
      });
    } else {
      products = await prisma.product.findMany({
        take: 5,
        include: { category: true, reviews: { where: { isApproved: true } } }
      });
    }
    
    if (products && products.length > 0) {
      return res.json(products.map(p => ({
        ...mapProduct(p, hiddenIds),
        visits: visits[p.id] || visits[p.legacyId] || 0
      })));
    }

    const fallback = getFallbackProducts({ limit: 10, hiddenIds });
    return res.json(fallback.products);
  } catch (error) {
    logger.warn('Popular products error (serving fallback catalog):', error?.message || error);
    const fallback = getFallbackProducts({ limit: 10, hiddenIds });
    res.json(fallback.products);
  }
});

router.get('/products/:id', async (req, res) => {
  const hiddenIds = await persistLoad('hidden_products', []);
  if (isPlaceholderMongoUri(process.env.MONGODB_URI)) {
    const fallbackProduct = getFallbackProductById(req.params.id, hiddenIds);
    if (fallbackProduct) {
      return res.json(fallbackProduct);
    }
    return res.status(404).json({ error: 'Not found' });
  }
  try {
    const product = await findProductByIdentifier(req.params.id, { category: true, reviews: { where: { isApproved: true } } });
    if (product) {
      // Track visit
      const visits = await persistLoad('product_visits', {});
      visits[product.id] = (visits[product.id] || 0) + 1;
      persistSave('product_visits', visits);
      return res.json(mapProduct(product, hiddenIds));
    }
  } catch (error) {
    logRouteError('Error fetching product from DB, checking fallback', error);
  }

  const fallbackProduct = getFallbackProductById(req.params.id, hiddenIds);
  if (fallbackProduct) {
    return res.json(fallbackProduct);
  }
  return res.status(404).json({ error: 'Not found' });
});

module.exports = router;
