/**
 * Dev seed: categories, a few perfumes, and your SUPER_ADMIN account.
 * Run with: npm run db:seed
 *
 * Log in as the super admin by entering SEED_SUPER_ADMIN_EMAIL on /login.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }),
});

const naira = (n: number) => n * 100; // → kobo

async function main() {
  const adminEmail = process.env.SEED_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "SUPER_ADMIN" },
      create: { email: adminEmail, name: "Store Owner", role: "SUPER_ADMIN" },
    });
    console.log(`👑 Super admin: ${adminEmail}`);
  } else {
    console.warn("SEED_SUPER_ADMIN_EMAIL not set, so no admin user was created.");
  }

  const categories = [
    { name: "Floral", slug: "floral", description: "Rose, jasmine, peony and bouquet blends." },
    { name: "Woody", slug: "woody", description: "Sandalwood, cedar and vetiver." },
    { name: "Oud", slug: "oud", description: "Rich, smoky agarwood scents." },
    { name: "Fresh", slug: "fresh", description: "Citrus, aquatic and green notes." },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  const cat = async (slug: string) => (await prisma.category.findUniqueOrThrow({ where: { slug } })).id;

  const products = [
    {
      name: "Velvet Rose Noir",
      slug: "velvet-rose-noir",
      brand: "AuraScentHaus",
      gender: "WOMEN" as const,
      description: "A dark, velvety rose wrapped in warm amber and a whisper of oud.",
      topNotes: ["Pink Pepper", "Bergamot"],
      heartNotes: ["Turkish Rose", "Jasmine"],
      baseNotes: ["Amber", "Oud", "Musk"],
      isFeatured: true,
      category: "floral",
      variants: [
        { sizeMl: 50, sku: "VRN-50", price: naira(45_000), stock: 25 },
        { sizeMl: 100, sku: "VRN-100", price: naira(78_000), stock: 12 },
      ],
    },
    {
      name: "Cedar Smoke",
      slug: "cedar-smoke",
      brand: "AuraScentHaus",
      gender: "MEN" as const,
      description: "Smoked cedar, leather and vetiver. Bold and long-lasting.",
      topNotes: ["Cardamom", "Black Pepper"],
      heartNotes: ["Cedarwood", "Leather"],
      baseNotes: ["Vetiver", "Tonka Bean"],
      isFeatured: true,
      category: "woody",
      variants: [
        { sizeMl: 50, sku: "CS-50", price: naira(42_000), stock: 30 },
        { sizeMl: 100, sku: "CS-100", price: naira(72_000), stock: 3 },
      ],
    },
    {
      name: "Royal Oud",
      slug: "royal-oud",
      brand: "AuraScentHaus",
      gender: "UNISEX" as const,
      description: "Precious agarwood with saffron and rose. An evening signature.",
      topNotes: ["Saffron"],
      heartNotes: ["Oud", "Rose"],
      baseNotes: ["Sandalwood", "Patchouli"],
      isFeatured: false,
      category: "oud",
      variants: [
        { sizeMl: 30, sku: "RO-30", price: naira(38_000), stock: 15 },
        { sizeMl: 75, sku: "RO-75", price: naira(85_000), compareAtPrice: naira(95_000), stock: 8 },
      ],
    },
    {
      name: "Citrus Bloom",
      slug: "citrus-bloom",
      brand: "AuraScentHaus",
      gender: "UNISEX" as const,
      description: "Sparkling citrus over neroli and white musk. Bright and easy to wear.",
      topNotes: ["Lemon", "Mandarin", "Grapefruit"],
      heartNotes: ["Neroli", "Orange Blossom"],
      baseNotes: ["White Musk"],
      isFeatured: false,
      category: "fresh",
      variants: [{ sizeMl: 100, sku: "CB-100", price: naira(35_000), stock: 40 }],
    },
  ];

  for (const { category, variants, ...p } of products) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        ...p,
        categoryId: await cat(category),
        priceFrom: Math.min(...variants.map((v) => v.price)),
        variants: { create: variants },
      },
    });
  }

  console.log(`🌸 Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
