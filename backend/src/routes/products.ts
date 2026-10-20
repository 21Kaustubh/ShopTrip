import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const productsRouter = Router();

/*
 * GET /api/products/barcode/:barcode
 * Looks up product and associated active retailer offers by unique barcode.
 */
productsRouter.get('/barcode/:barcode', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBarcode = req.params.barcode;
    const barcode = rawBarcode ? rawBarcode.trim() : '';

    if (!barcode) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'A barcode parameter is required.',
      });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        offers: {
          where: {
            retailer: {
              isActive: true,
            },
          },
          include: {
            retailer: {
              select: {
                id: true,
                name: true,
                websiteUrl: true,
                searchUrl: true,
              },
            },
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({
        found: false,
        barcode,
        message: 'No product matches this barcode in the database.',
      });
      return;
    }

    res.json({
      found: true,
      product: {
        id: product.id,
        barcode: product.barcode,
        productName: product.productName,
        brand: product.brand,
        sizeInfo: product.sizeInfo,
        category: product.category?.name || 'General',
        imageUrl: product.imageUrl,
        verificationStatus: product.verificationStatus,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
      offers: product.offers.map((offer) => ({
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
    console.error('Barcode lookup error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to look up barcode from database.',
    });
  }
});

/*
 * GET /api/products/search?q=...
 * Searches products by name, brand, category, or barcode.
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
        offers: {
          include: {
            retailer: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
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
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to execute product search.',
    });
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
      where: {
        productId: id,
        retailer: { isActive: true },
      },
      include: {
        retailer: true,
      },
      orderBy: {
        price: 'asc',
      },
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
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve retailer offers.',
    });
  }
});
