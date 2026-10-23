import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { fetchProductByBarcode, searchOffCatalogue } from '../services/openFoodFacts.js';
import {
  buildRetailerComparison,
  REGISTERED_RETAILER_ADAPTERS,
} from '../services/retailerAdapters.js';

export const productsRouter = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Resolve or create a Category by name and return its id.
 * Uses findFirst so we can do a case-insensitive match without a migration.
 */
async function resolveCategoryId(name: string): Promise<string | null> {
  if (!name || name === 'General') return null;
  try {
    let cat = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (!cat) {
      cat = await prisma.category.create({ data: { name } });
    }
    return cat.id;
  } catch {
    return null;
  }
}

/**
 * Persist an Open Food Facts product into Neon using an upsert keyed on
 * barcode. Existing non-empty fields are never overwritten with empty values.
 */
async function persistOffProduct(
  off: import('../services/openFoodFacts.js').OFFProduct
): Promise<import('@prisma/client').Product | null> {
  try {
    const categoryId = await resolveCategoryId(off.category);

    const existing = await prisma.product.findUnique({ where: { barcode: off.barcode } });

    if (existing) {
      // Only patch fields that are currently empty / null
      const patch: Record<string, unknown> = {};
      if (!existing.productName) patch.productName = off.productName;
      if (!existing.brand && off.brand) patch.brand = off.brand;
      if (!existing.sizeInfo && off.sizeInfo) patch.sizeInfo = off.sizeInfo;
      if (!existing.categoryId && categoryId) patch.categoryId = categoryId;
      if (!existing.imageUrl && off.imageUrl) patch.imageUrl = off.imageUrl;

      if (Object.keys(patch).length === 0) return existing;
      return prisma.product.update({ where: { barcode: off.barcode }, data: patch });
    }

    // New product — upsert is safe here since we already checked uniqueness
    return prisma.product.create({
      data: {
        barcode: off.barcode,
        productName: off.productName,
        brand: off.brand || 'Unknown',
        sizeInfo: off.sizeInfo || null,
        categoryId: categoryId || null,
        imageUrl: off.imageUrl || null,
        verificationStatus: 'OFF_SOURCED',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[products] Failed to persist OFF product:', msg);
    return null;
  }
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/*
 * GET /api/products/barcode/:barcode
 *
 * 1. Check Neon first — return immediately if found with existing offers.
 * 2. On a true miss, query Open Food Facts.
 * 3. If OFF returns a valid product, persist it (upsert keyed on barcode)
 *    and return the newly stored record.
 * 4. If OFF also has no match, return honest 404.
 */
productsRouter.get('/barcode/:barcode', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBarcode = req.params.barcode;
    const barcode = rawBarcode ? rawBarcode.trim() : '';

    if (!barcode) {
      res.status(400).json({ error: 'ValidationError', message: 'A barcode parameter is required.' });
      return;
    }

    // ── 1. Local Neon lookup ──────────────────────────────────────────────
    const localProduct = await prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        offers: {
          where: { retailer: { isActive: true } },
          include: { retailer: { select: { id: true, name: true, websiteUrl: true, searchUrl: true } } },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (localProduct) {
      const comparison = buildRetailerComparison(
        {
          barcode: localProduct.barcode,
          productName: localProduct.productName,
          brand: localProduct.brand,
          sizeInfo: localProduct.sizeInfo,
          category: localProduct.category?.name || 'General',
        },
        localProduct.offers
      );

      res.json({
        found: true,
        source: 'local',
        product: {
          id: localProduct.id,
          barcode: localProduct.barcode,
          productName: localProduct.productName,
          brand: localProduct.brand,
          sizeInfo: localProduct.sizeInfo,
          category: localProduct.category?.name || 'General',
          imageUrl: localProduct.imageUrl,
          verificationStatus: localProduct.verificationStatus,
          createdAt: localProduct.createdAt,
          updatedAt: localProduct.updatedAt,
        },
        offers: localProduct.offers.map((offer) => ({
          id: offer.id,
          retailer: offer.retailer.name,
          price: offer.price,
          currency: offer.currency,
          deliveryTime: offer.deliveryTime,
          availability: offer.availability,
          source: offer.source,
          lastChecked: offer.lastChecked,
        })),
        comparison,
      });
      return;
    }

    // ── 2. Open Food Facts fallback ───────────────────────────────────────
    console.log(`[products] Barcode ${barcode} not in local DB — querying Open Food Facts`);
    const offProduct = await fetchProductByBarcode(barcode);

    if (!offProduct) {
      res.status(404).json({
        found: false,
        barcode,
        message: 'No product matches this barcode in the local database or Open Food Facts.',
      });
      return;
    }

    // ── 3. Persist and return ─────────────────────────────────────────────
    const saved = await persistOffProduct(offProduct);
    const productToReturn = saved ?? offProduct; // fall back to OFF data if DB write failed
    // Catalogue import persists product metadata into local catalogue; retailer comparison remains based on verified offers or outbound search
    const comparison = buildRetailerComparison(
      {
        barcode: offProduct.barcode,
        productName: offProduct.productName,
        brand: offProduct.brand,
        sizeInfo: offProduct.sizeInfo,
        category: offProduct.category,
      },
      []
    );

    res.json({
      found: true,
      source: 'open_food_facts',
      attribution: offProduct.attribution,
      product: {
        id: (saved as { id?: string } | null)?.id ?? null,
        barcode: offProduct.barcode,
        productName: offProduct.productName,
        brand: offProduct.brand || 'Unknown',
        sizeInfo: offProduct.sizeInfo,
        category: offProduct.category,
        imageUrl: offProduct.imageUrl,
        verificationStatus: 'OFF_SOURCED',
        createdAt: (productToReturn as { createdAt?: Date } | null)?.createdAt ?? new Date(),
        updatedAt: (productToReturn as { updatedAt?: Date } | null)?.updatedAt ?? new Date(),
      },
      offers: [], // No retailer offers from OFF — only verified local offers shown
      comparison,
    });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to look up barcode.' });
  }
});

/*
 * GET /api/products/search?q=...
 * Fast local database search. Returns empty array when catalogue is empty.
 */
productsRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!query) {
      res.json({ results: [] });
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { productName: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        category: true,
        offers: { include: { retailer: true }, orderBy: { price: 'asc' } },
      },
      take: 50,
    });

    res.json({
      results: products.map((product) => ({
        id: product.id,
        barcode: product.barcode,
        productName: product.productName,
        brand: product.brand,
        sizeInfo: product.sizeInfo,
        category: product.category?.name || 'General',
        imageUrl: product.imageUrl,
        verificationStatus: product.verificationStatus,
        lowestPrice: product.offers.length > 0 ? product.offers[0].price : null,
        offersCount: product.offers.length,
      })),
    });
  } catch (error) {
    console.error('Product search error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to execute product search.' });
  }
});

/*
 * GET /api/products/catalogue/search?q=...&includeInternational=...
 *
 * User-initiated external catalogue search via Open Food Facts with India-first ranking.
 * Only called when the user deliberately taps "Search wider catalogue".
 * Results are NOT bulk-written to the DB here; the client calls
 * GET /barcode/:barcode to verify and persist a chosen product upon selection.
 */
productsRouter.get('/catalogue/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const includeInternational = req.query.includeInternational === 'true';

    if (!query || query.length < 2) {
      res.status(400).json({ error: 'ValidationError', message: 'Search query must be at least 2 characters.' });
      return;
    }

    console.log(`[products] External catalogue search: "${query}" (includeInternational: ${includeInternational})`);
    const searchResponse = await searchOffCatalogue(query, {
      limit: 15,
      includeInternational,
    });

    res.json({
      results: searchResponse.results.map((p) => ({
        barcode: p.barcode,
        productName: p.productName,
        brand: p.brand || '',
        sizeInfo: p.sizeInfo || null,
        category: p.category,
        imageUrl: p.imageUrl,
        verificationStatus: 'OFF_SOURCED',
        marketAvailability: p.marketAvailability,
        marketBadge: p.marketBadge,
        marketReason: p.marketReason,
        countries: p.countries,
      })),
      totalMatches: searchResponse.totalMatches,
      indiaCount: searchResponse.indiaCount,
      internationalCount: searchResponse.internationalCount,
      hasInternationalAvailable: searchResponse.hasInternationalAvailable,
      includeInternational,
      attribution: searchResponse.attribution,
      source: 'open_food_facts',
    });
  } catch (error) {
    console.error('Catalogue search error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Catalogue search failed.' });
  }
});

/*
 * GET /api/products/:id/offers
 * Retrieves current active retailer offers for a product.
 */
productsRouter.get('/:id/offers', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const offers = await prisma.retailerOffer.findMany({
      where: { productId: id, retailer: { isActive: true } },
      include: { retailer: true },
      orderBy: { price: 'asc' },
    });

    res.json({
      productId: id,
      offers: offers.map((offer) => ({
        id: offer.id,
        retailer: offer.retailer.name,
        price: offer.price,
        currency: offer.currency,
        deliveryTime: offer.deliveryTime,
        availability: offer.availability,
        source: offer.source,
        lastChecked: offer.lastChecked,
      })),
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve retailer offers.' });
  }
});

/*
 * GET /api/products/retailers
 * Returns the configurable registry of registered Indian retailers and their capabilities.
 */
productsRouter.get('/retailers', (_req: Request, res: Response): void => {
  const retailers = REGISTERED_RETAILER_ADAPTERS.map((adapter) => ({
    id: adapter.id,
    name: adapter.name,
    displayName: adapter.displayName,
    platformType: adapter.platformType,
    homeUrl: adapter.homeUrl,
    isLiveApiConfigured: adapter.isLiveApiConfigured(),
    partnerStatusNote: adapter.getPartnerStatusNote(),
    actionLabel: adapter.getOutboundActionLabel(),
  }));

  res.json({
    retailers,
    count: retailers.length,
    liveActiveCount: retailers.filter((r) => r.isLiveApiConfigured).length,
  });
});

/*
 * GET /api/products/:barcode/comparison
 * Returns transparent multi-retailer comparison with verified offers and outbound search links.
 */
productsRouter.get('/:barcode/comparison', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBarcode = req.params.barcode;
    const barcode = rawBarcode ? rawBarcode.trim() : '';

    if (!barcode) {
      res.status(400).json({ error: 'ValidationError', message: 'A barcode is required.' });
      return;
    }

    // 1. Check local DB
    const localProduct = await prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        offers: {
          where: { retailer: { isActive: true } },
          include: { retailer: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (localProduct) {
      const comparison = buildRetailerComparison(
        {
          barcode: localProduct.barcode,
          productName: localProduct.productName,
          brand: localProduct.brand,
          sizeInfo: localProduct.sizeInfo,
          category: localProduct.category?.name || 'General',
        },
        localProduct.offers
      );
      res.json(comparison);
      return;
    }

    // 2. Fall back to Open Food Facts
    const offProduct = await fetchProductByBarcode(barcode);
    if (!offProduct) {
      res.status(404).json({ error: 'NotFound', message: 'Product not found.' });
      return;
    }

    const comparison = buildRetailerComparison(
      {
        barcode: offProduct.barcode,
        productName: offProduct.productName,
        brand: offProduct.brand,
        sizeInfo: offProduct.sizeInfo,
        category: offProduct.category,
      },
      []
    );

    res.json(comparison);
  } catch (error) {
    console.error('Product comparison error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to build product comparison.' });
  }
});
