import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const coffeeRetailers = [
  { name: 'BigBasket', websiteUrl: 'https://www.bigbasket.com', searchUrl: 'https://www.bigbasket.com/ps/?q=' },
  { name: 'Zepto', websiteUrl: 'https://www.zeptonow.com', searchUrl: 'https://www.zeptonow.com/search?query=' },
  { name: 'Swiggy Instamart', websiteUrl: 'https://www.swiggy.com/instamart', searchUrl: 'https://www.swiggy.com/instamart/search?query=' },
  { name: 'Blinkit', websiteUrl: 'https://blinkit.com', searchUrl: 'https://blinkit.com/s/?q=' },
  { name: 'Flipkart', websiteUrl: 'https://www.flipkart.com', searchUrl: 'https://www.flipkart.com/search?q=' },
];

async function main() {
  const category = await prisma.category.upsert({
    where: { name: 'Beverages' },
    update: {},
    create: { name: 'Beverages', description: 'Coffee, tea, and beverage preparations' },
  });

  for (const retailer of coffeeRetailers) {
    await prisma.retailer.upsert({
      where: { name: retailer.name },
      update: { ...retailer, isActive: true },
      create: { ...retailer, isActive: true },
    });
  }

  await prisma.product.upsert({
    where: { barcode: '89009949' },
    update: {
      productName: 'NESCAFÉ Classic Instant Coffee',
      brand: 'NESCAFÉ',
      sizeInfo: '45 g',
      categoryId: category.id,
      verificationStatus: 'USER_VERIFIED',
    },
    create: {
      barcode: '89009949',
      productName: 'NESCAFÉ Classic Instant Coffee',
      brand: 'NESCAFÉ',
      sizeInfo: '45 g',
      categoryId: category.id,
      verificationStatus: 'USER_VERIFIED',
    },
  });

  // Retailer pages are intentionally link-only. Public product listings may show a different
  // pack size or an out-of-date location-specific price, so this script never invents an offer.
  console.log('Seeded Nescafe 45 g and retailer search destinations without price claims.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
