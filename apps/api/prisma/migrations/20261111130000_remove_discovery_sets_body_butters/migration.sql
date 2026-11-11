-- Remove two subcategories the store won't sell. Data only; no table or column changes.
-- Deleted only while nothing uses them (no products and no subcategories).
DELETE FROM "categories" c
WHERE c."slug" IN ('discovery-sets-miniatures', 'body-butters')
  AND NOT EXISTS (SELECT 1 FROM "products" p WHERE p."categoryId" = c."id")
  AND NOT EXISTS (SELECT 1 FROM "categories" k WHERE k."parentId" = c."id");

-- Close the gap Body Butters (3rd in Body Care) leaves. Discovery Sets was last, so nothing moves there.
UPDATE "categories" SET "position" = 3 WHERE "slug" = 'shower-gels';
UPDATE "categories" SET "position" = 4 WHERE "slug" = 'hand-creams';
