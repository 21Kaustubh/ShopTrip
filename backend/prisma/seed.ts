import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial reference retailers and sample categories...');

  // Create initial retailers
  const retailers = [
    { name: 'Blinkit', websiteUrl: 'https://blinkit.com', searchUrl: 'https://blinkit.com/s/?q=' },
    { name: 'Zepto', websiteUrl: 'https://www.zeptonow.com', searchUrl: 'https://www.zeptonow.com/search?query=' },
    { name: 'Amazon', websiteUrl: 'https://www.amazon.in', searchUrl: 'https://www.amazon.in/s?k=' },
    { name: 'BigBasket', websiteUrl: 'https://www.bigbasket.com', searchUrl: 'https://www.bigbasket.com/ps/?q=' },
    { name: 'Flipkart', websiteUrl: 'https://www.flipkart.com', searchUrl: 'https://www.flipkart.com/search?q=' },
    { name: 'Instamart', websiteUrl: 'https://www.swiggy.com/instamart', searchUrl: 'https://www.swiggy.com/instamart/search?query=' },
  ];

  for (const r of retailers) {
    await prisma.retailer.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  // Create default categories
  const categories = [
    { name: 'Coffee & Tea', description: 'Packaged coffee, tea bags and leaves' },
    { name: 'Instant Foods', description: 'Noodles, instant soups and ready-to-eat meals' },
    { name: 'Snacks & Biscuits', description: 'Chips, crackers, cookies and savouries' },
    { name: 'Staples', description: 'Flour, rice, pulses and grains' },
    { name: 'Cooking Essentials', description: 'Edible oils, salt, sugar and spices' },
    { name: 'Dairy & Breakfast', description: 'Butter, cereal, oats and milk products' },
    { name: 'Personal Care', description: 'Soaps, handwash, toothpaste and oral care' },
    { name: 'Household Cleaning', description: 'Detergents, dishwashing gels and surface cleaners' },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
