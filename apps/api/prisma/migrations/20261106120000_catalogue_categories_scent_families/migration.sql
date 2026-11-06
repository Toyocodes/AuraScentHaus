-- CreateEnum
CREATE TYPE "SizeUnit" AS ENUM ('ML', 'G', 'PIECE');

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropIndex
DROP INDEX "product_variants_productId_sizeMl_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "defaultSizeUnit" "SizeUnit" NOT NULL DEFAULT 'ML',
ADD COLUMN     "hasFragrancePyramid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usesGender" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "sizeUnit" "SizeUnit" NOT NULL DEFAULT 'ML';

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "sizeUnit" "SizeUnit" NOT NULL DEFAULT 'ML';

-- CreateTable
CREATE TABLE "scent_families" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scent_families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToScentFamily" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductToScentFamily_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "scent_families_slug_key" ON "scent_families"("slug");

-- CreateIndex
CREATE INDEX "scent_families_isActive_position_idx" ON "scent_families"("isActive", "position");

-- CreateIndex
CREATE INDEX "_ProductToScentFamily_B_index" ON "_ProductToScentFamily"("B");

-- CreateIndex
CREATE INDEX "categories_parentId_position_idx" ON "categories"("parentId", "position");

-- CreateIndex
CREATE INDEX "categories_isActive_idx" ON "categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_productId_sizeMl_sizeUnit_key" ON "product_variants"("productId", "sizeMl", "sizeUnit");

-- CreateIndex
CREATE INDEX "products_priceFrom_idx" ON "products"("priceFrom");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToScentFamily" ADD CONSTRAINT "_ProductToScentFamily_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToScentFamily" ADD CONSTRAINT "_ProductToScentFamily_B_fkey" FOREIGN KEY ("B") REFERENCES "scent_families"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ─────────────────────────────────────────────────────────────────────────────
-- DATA: the new catalogue. Existing products, sizes, images and notes are kept.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. The 12 scent families.
INSERT INTO "scent_families" ("id", "name", "slug", "position", "updatedAt")
SELECT gen_random_uuid()::text, v.name, v.slug, v.position, CURRENT_TIMESTAMP
FROM (VALUES
  ('Floral', 'floral', 1),
  ('Oud', 'oud', 2),
  ('Woody', 'woody', 3),
  ('Gourmand', 'gourmand', 4),
  ('Fresh', 'fresh', 5),
  ('Citrus', 'citrus', 6),
  ('Fruity', 'fruity', 7),
  ('Musk', 'musk', 8),
  ('Amber', 'amber', 9),
  ('Spicy', 'spicy', 10),
  ('Aromatic', 'aromatic', 11),
  ('Aquatic', 'aquatic', 12)
) AS v(name, slug, position);

-- Keep the descriptions admins may have written on the old categories.
UPDATE "scent_families" s
SET "description" = c."description", "imageUrl" = c."imageUrl"
FROM "categories" c
WHERE c."slug" = s."slug" AND c."slug" IN ('floral', 'woody', 'oud', 'fresh');

-- 2. The 5 main categories.
INSERT INTO "categories" ("id", "name", "slug", "position", "usesGender", "defaultSizeUnit", "updatedAt")
SELECT gen_random_uuid()::text, v.name, v.slug, v.position, v.uses_gender, v.unit::"SizeUnit", CURRENT_TIMESTAMP
FROM (VALUES
  ('Personal Fragrance', 'personal-fragrance', 1, true, 'ML'),
  ('Home Fragrance', 'home-fragrance', 2, false, 'ML'),
  ('Body Care', 'body-care', 3, false, 'ML'),
  ('Gift Sets & Bundles', 'gift-sets-bundles', 4, false, 'PIECE'),
  ('Accessories', 'accessories', 5, false, 'PIECE')
) AS v(name, slug, position, uses_gender, unit);

-- 3. The 25 subcategories. Only Perfumes and Perfume Oils have the fragrance pyramid.
INSERT INTO "categories" ("id", "name", "slug", "position", "parentId", "hasFragrancePyramid", "usesGender", "defaultSizeUnit", "updatedAt")
SELECT gen_random_uuid()::text, v.name, v.slug, v.position, p."id", v.pyramid, v.uses_gender, v.unit::"SizeUnit", CURRENT_TIMESTAMP
FROM (VALUES
  ('personal-fragrance', 'Perfumes', 'perfumes', 1, true, true, 'ML'),
  ('personal-fragrance', 'Body Mists', 'body-mists', 2, false, true, 'ML'),
  ('personal-fragrance', 'Body Sprays', 'body-sprays', 3, false, true, 'ML'),
  ('personal-fragrance', 'Perfume Oils', 'perfume-oils', 4, true, true, 'ML'),
  ('personal-fragrance', 'Discovery Sets & Miniatures', 'discovery-sets-miniatures', 5, false, true, 'PIECE'),

  ('home-fragrance', 'Scented Candles', 'scented-candles', 1, false, false, 'G'),
  ('home-fragrance', 'Reed Diffusers', 'reed-diffusers', 2, false, false, 'ML'),
  ('home-fragrance', 'Room Sprays', 'room-sprays', 3, false, false, 'ML'),
  ('home-fragrance', 'Linen & Fabric Sprays', 'linen-fabric-sprays', 4, false, false, 'ML'),
  ('home-fragrance', 'Aroma Diffusers', 'aroma-diffusers', 5, false, false, 'PIECE'),
  ('home-fragrance', 'Essential Oils', 'essential-oils', 6, false, false, 'ML'),
  ('home-fragrance', 'Car Fragrances', 'car-fragrances', 7, false, false, 'PIECE'),
  ('home-fragrance', 'Incense & Bakhoor', 'incense-bakhoor', 8, false, false, 'G'),

  ('body-care', 'Body Lotions', 'body-lotions', 1, false, false, 'ML'),
  ('body-care', 'Body Creams', 'body-creams', 2, false, false, 'ML'),
  ('body-care', 'Body Butters', 'body-butters', 3, false, false, 'G'),
  ('body-care', 'Shower Gels', 'shower-gels', 4, false, false, 'ML'),
  ('body-care', 'Hand Creams', 'hand-creams', 5, false, false, 'ML'),

  ('gift-sets-bundles', 'Gift Sets', 'gift-sets', 1, false, false, 'PIECE'),
  ('gift-sets-bundles', 'Perfume Bundles', 'perfume-bundles', 2, false, false, 'PIECE'),
  ('gift-sets-bundles', 'Home Fragrance Sets', 'home-fragrance-sets', 3, false, false, 'PIECE'),
  ('gift-sets-bundles', 'His & Hers Sets', 'his-hers-sets', 4, false, false, 'PIECE'),

  ('accessories', 'Perfume Atomizers', 'perfume-atomizers', 1, false, false, 'PIECE'),
  ('accessories', 'Candle Accessories', 'candle-accessories', 2, false, false, 'PIECE'),
  ('accessories', 'Diffuser Accessories', 'diffuser-accessories', 3, false, false, 'PIECE')
) AS v(parent_slug, name, slug, position, pyramid, uses_gender, unit)
JOIN "categories" p ON p."slug" = v.parent_slug;

-- 4. Each product's old category becomes its scent family ("A" = product, "B" = scent family).
INSERT INTO "_ProductToScentFamily" ("A", "B")
SELECT p."id", s."id"
FROM "products" p
JOIN "categories" c ON c."id" = p."categoryId"
JOIN "scent_families" s ON s."slug" = c."slug"
WHERE c."slug" IN ('floral', 'woody', 'oud', 'fresh');

-- 5. Those products are all perfumes.
UPDATE "products"
SET "categoryId" = (SELECT "id" FROM "categories" WHERE "slug" = 'perfumes')
WHERE "categoryId" IN (SELECT "id" FROM "categories" WHERE "slug" IN ('floral', 'woody', 'oud', 'fresh'));

-- 6. Remove the old categories, but only if nothing still uses them.
DELETE FROM "categories" c
WHERE c."slug" IN ('floral', 'woody', 'oud', 'fresh')
  AND NOT EXISTS (SELECT 1 FROM "products" p WHERE p."categoryId" = c."id");
