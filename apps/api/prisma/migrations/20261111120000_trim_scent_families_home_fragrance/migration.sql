-- Trim the catalogue. Data only; no table or column changes.
--   Scent families: keep Floral, Oud, Woody and Fresh. Fresh now covers citrus and aquatic notes,
--   and Floral covers what Fruity did.
--   Home Fragrance: keep Scented Candles, Reed Diffusers and Room Sprays.

-- 1. Remove the dropped scent families from products, then delete them.
--    ("A" = product, "B" = scent family.) Products keep their other families.
DELETE FROM "_ProductToScentFamily"
WHERE "B" IN (
  SELECT "id" FROM "scent_families"
  WHERE "slug" IN ('citrus', 'aquatic', 'gourmand', 'musk', 'amber', 'spicy', 'aromatic', 'fruity')
);

DELETE FROM "scent_families"
WHERE "slug" IN ('citrus', 'aquatic', 'gourmand', 'musk', 'amber', 'spicy', 'aromatic', 'fruity');

-- 2. Close the gaps in the order of the families that remain.
UPDATE "scent_families"
SET "position" = CASE "slug" WHEN 'floral' THEN 1 WHEN 'oud' THEN 2 WHEN 'woody' THEN 3 WHEN 'fresh' THEN 4 END
WHERE "slug" IN ('floral', 'oud', 'woody', 'fresh');

-- 3. Remove the other Home Fragrance subcategories, but only while nothing uses them
--    (no products and no subcategories), so no product is ever left without a category.
DELETE FROM "categories" c
WHERE c."slug" IN ('linen-fabric-sprays', 'aroma-diffusers', 'essential-oils', 'car-fragrances', 'incense-bakhoor')
  AND c."parentId" = (SELECT "id" FROM "categories" WHERE "slug" = 'home-fragrance')
  AND NOT EXISTS (SELECT 1 FROM "products" p WHERE p."categoryId" = c."id")
  AND NOT EXISTS (SELECT 1 FROM "categories" k WHERE k."parentId" = c."id");
