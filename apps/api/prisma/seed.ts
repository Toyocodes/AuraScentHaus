/**
 * Dev seed: a few sample products and your SUPER_ADMIN account.
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

  // Categories and scent families are created by the migrations, so they exist already.
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
      category: "perfumes",
      scents: ["floral"],
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
      category: "perfumes",
      scents: ["woody"],
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
      category: "perfumes",
      scents: ["oud"],
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
      category: "perfumes",
      scents: ["fresh"],
      variants: [{ sizeMl: 100, sku: "CB-100", price: naira(35_000), stock: 40 }],
    },
    {
      name: "Amber Hearth Candle",
      slug: "amber-hearth-candle",
      brand: "AuraScentHaus",
      gender: "UNISEX" as const,
      description: "A slow-burning soy candle of warm amber and smoked vanilla.",
      topNotes: [],
      heartNotes: [],
      baseNotes: [],
      isFeatured: false,
      category: "scented-candles",
      scents: [] as string[],
      variants: [
        { sizeMl: 200, sizeUnit: "G" as const, sku: "AHC-200", price: naira(28_000), stock: 20 },
        { sizeMl: 300, sizeUnit: "G" as const, sku: "AHC-300", price: naira(38_000), stock: 10 },
      ],
    },
    {
      name: "Petal Veil Body Mist",
      slug: "petal-veil-body-mist",
      brand: "AuraScentHaus",
      gender: "WOMEN" as const,
      description: "A light veil of peony and pear for everyday wear.",
      topNotes: [],
      heartNotes: [],
      baseNotes: [],
      isFeatured: false,
      category: "body-mists",
      scents: ["floral"],
      variants: [{ sizeMl: 150, sku: "PV-150", price: naira(18_000), stock: 30 }],
    },
  ];

  for (const { category, scents, variants, ...p } of products) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        ...p,
        categoryId: await cat(category),
        priceFrom: Math.min(...variants.map((v) => v.price)),
        variants: { create: variants },
        scentFamilies: { connect: scents.map((slug) => ({ slug })) },
      },
    });
  }

  console.log(`🌸 Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
