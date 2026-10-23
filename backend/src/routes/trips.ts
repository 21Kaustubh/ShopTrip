import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const tripsRouter = Router();

// Protect all shopping trip endpoints with authentication
tripsRouter.use(authenticateToken);

/*
 * GET /api/trips
 * List all shopping trips belonging to authenticated user with calculated portfolio savings.
 */
tripsRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const trips = await prisma.shoppingTrip.findMany({
      where: { userId },
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          include: {
            selectedOffer: true,
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedTrips = trips.map((trip) => {
      let tripSavings = 0;
      for (const item of trip.items) {
        // Calculate projected savings: max(0, shelfPrice - comparableOfferPrice) * quantity
        // Only if comparable and shelf price is higher than offer price
        const isComparable = !item.selectedOffer?.deliveryTime?.toLowerCase().includes('not comparable');
        if (
          item.shelfPrice !== null &&
          item.selectedOffer &&
          isComparable &&
          item.shelfPrice > item.selectedOffer.price
        ) {
          tripSavings += (item.shelfPrice - item.selectedOffer.price) * item.quantity;
        }
      }

      return {
        id: trip.id,
        name: trip.name,
        status: trip.status,
        itemCount: trip._count.items,
        totalSavings: tripSavings,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
      };
    });

    const completedTrips = enrichedTrips.filter((t) => t.status === 'COMPLETED');
    const portfolioSavings = completedTrips.reduce((sum, t) => sum + t.totalSavings, 0);

    res.json({
      trips: enrichedTrips,
      portfolioSavings,
      completedTripCount: completedTrips.length,
    });
  } catch (error) {
    console.error('List trips error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to list shopping trips.' });
  }
});

/*
 * POST /api/trips/complete
 * Record a completed shopping trip with its items and verified savings.
 */
tripsRouter.post('/complete', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, items, totalSavings } = req.body;

    const trip = await prisma.shoppingTrip.create({
      data: {
        userId,
        name: name ? String(name).trim() : `Shopping Trip - ${new Date().toLocaleDateString('en-IN')}`,
        status: 'COMPLETED',
      },
    });

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        let productId = item.productId;
        if (!productId && item.barcode) {
          const found = await prisma.product.findUnique({
            where: { barcode: String(item.barcode).trim() },
          });
          if (found) {
            productId = found.id;
          }
        }

        if (productId) {
          await prisma.tripItem.create({
            data: {
              tripId: trip.id,
              productId,
              quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
              shelfPrice: typeof item.shelfPrice === 'number' ? item.shelfPrice : null,
              selectedOfferId: item.selectedOfferId || null,
            },
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      trip,
      message: 'Shopping trip completed and recorded successfully.',
    });
  } catch (error) {
    console.error('Complete trip error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to record completed shopping trip.' });
  }
});

/*
 * POST /api/trips
 * Create a new shopping trip for authenticated user.
 */
tripsRouter.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name } = req.body;

    const trip = await prisma.shoppingTrip.create({
      data: {
        userId,
        name: name ? String(name).trim() : 'Shopping Trip',
        status: 'ACTIVE',
      },
    });

    res.status(201).json({ trip });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to create shopping trip.' });
  }
});

/*
 * GET /api/trips/:id
 * Retrieve a single trip with items, product details, and selected offers.
 * Strictly verifies ownership by userId.
 */
tripsRouter.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const trip = await prisma.shoppingTrip.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            selectedOffer: {
              include: {
                retailer: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!trip) {
      res.status(404).json({
        error: 'NotFoundError',
        message: 'Shopping trip not found or you do not have permission to access it.',
      });
      return;
    }

    res.json({ trip });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve shopping trip.' });
  }
});

/*
 * PUT /api/trips/:id
 * Update trip name or status.
 */
tripsRouter.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, status } = req.body;

    // Verify ownership first
    const existing = await prisma.shoppingTrip.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'NotFoundError', message: 'Shopping trip not found.' });
      return;
    }

    const updated = await prisma.shoppingTrip.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(status !== undefined && { status: String(status).trim() }),
      },
    });

    res.json({ trip: updated });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to update shopping trip.' });
  }
});

/*
 * DELETE /api/trips/:id
 * Remove a shopping trip and its items.
 */
tripsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.shoppingTrip.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'NotFoundError', message: 'Shopping trip not found.' });
      return;
    }

    await prisma.shoppingTrip.delete({
      where: { id },
    });

    res.json({ message: 'Shopping trip deleted successfully.' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to delete shopping trip.' });
  }
});

/*
 * POST /api/trips/:id/items
 * Add an item to a shopping trip.
 */
tripsRouter.post('/:id/items', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: tripId } = req.params;
    const { productId, quantity, shelfPrice, selectedOfferId } = req.body;

    if (!productId) {
      res.status(400).json({ error: 'ValidationError', message: 'productId is required.' });
      return;
    }

    // Verify trip ownership
    const trip = await prisma.shoppingTrip.findFirst({
      where: { id: tripId, userId },
    });

    if (!trip) {
      res.status(404).json({ error: 'NotFoundError', message: 'Shopping trip not found.' });
      return;
    }

    const item = await prisma.tripItem.create({
      data: {
        tripId,
        productId,
        quantity: typeof quantity === 'number' && quantity > 0 ? quantity : 1,
        shelfPrice: typeof shelfPrice === 'number' ? shelfPrice : null,
        selectedOfferId: selectedOfferId || null,
      },
      include: {
        product: true,
        selectedOffer: {
          include: { retailer: true },
        },
      },
    });

    res.status(201).json({ item });
  } catch (error) {
    console.error('Add trip item error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to add item to trip.' });
  }
});

/*
 * PUT /api/trips/:id/items/:itemId
 * Update quantity or shelfPrice of an item in a shopping trip.
 */
tripsRouter.put('/:id/items/:itemId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: tripId, itemId } = req.params;
    const { quantity, shelfPrice, selectedOfferId } = req.body;

    // Verify trip ownership
    const trip = await prisma.shoppingTrip.findFirst({
      where: { id: tripId, userId },
    });

    if (!trip) {
      res.status(404).json({ error: 'NotFoundError', message: 'Shopping trip not found.' });
      return;
    }

    const updated = await prisma.tripItem.update({
      where: { id: itemId },
      data: {
        ...(typeof quantity === 'number' && { quantity: Math.max(1, quantity) }),
        ...(shelfPrice !== undefined && { shelfPrice: typeof shelfPrice === 'number' ? shelfPrice : null }),
        ...(selectedOfferId !== undefined && { selectedOfferId: selectedOfferId || null }),
      },
    });

    res.json({ item: updated });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to update trip item.' });
  }
});

/*
 * DELETE /api/trips/:id/items/:itemId
 * Remove an item from a shopping trip.
 */
tripsRouter.delete('/:id/items/:itemId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id: tripId, itemId } = req.params;

    const trip = await prisma.shoppingTrip.findFirst({
      where: { id: tripId, userId },
    });

    if (!trip) {
      res.status(404).json({ error: 'NotFoundError', message: 'Shopping trip not found.' });
      return;
    }

    await prisma.tripItem.delete({
      where: { id: itemId },
    });

    res.json({ message: 'Item removed from shopping trip.' });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ error: 'ServerError', message: 'Failed to remove trip item.' });
  }
});
