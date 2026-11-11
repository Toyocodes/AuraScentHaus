-- Delivery options and fees, managed by admins on the Delivery page.

-- CreateEnum
CREATE TYPE "DeliveryZoneKind" AS ENUM ('LAGOS_AXIS', 'LAGOS_OTHER', 'NIGERIA', 'PICKUP');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterTable: the Lagos area of a saved address
ALTER TABLE "addresses" ADD COLUMN     "area" TEXT;

-- AlterTable: what the customer chose at checkout, copied onto the order
ALTER TABLE "orders" ADD COLUMN     "deliveryMethod" "DeliveryMethod",
ADD COLUMN     "deliveryOption" TEXT,
ADD COLUMN     "deliveryTime" TEXT,
ADD COLUMN     "shipArea" TEXT;

-- CreateTable
CREATE TABLE "delivery_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "DeliveryZoneKind" NOT NULL DEFAULT 'LAGOS_AXIS',
    "areas" TEXT[],
    "fee" INTEGER NOT NULL,
    "deliveryTime" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_zones_position_idx" ON "delivery_zones"("position");

-- Starting options (fees in kobo: 3000_00 = ₦3,000). Admins can change all of these.
INSERT INTO "delivery_zones" ("id", "name", "kind", "areas", "fee", "deliveryTime", "position", "updatedAt")
SELECT gen_random_uuid()::text, v.name, v.kind::"DeliveryZoneKind", v.areas, v.fee, v.delivery_time, v.position, CURRENT_TIMESTAMP
FROM (VALUES
  ('Ikeja Axis', 'LAGOS_AXIS', ARRAY['Ikeja', 'Maryland', 'Anthony', 'Ojota'], 300000, '1 to 2 working days', 1),
  ('Yaba Axis', 'LAGOS_AXIS', ARRAY['Yaba', 'Akoka', 'Sabo'], 350000, '1 to 2 working days', 2),
  ('Surulere Axis', 'LAGOS_AXIS', ARRAY['Surulere', 'Lawanson', 'Bode Thomas'], 400000, '1 to 2 working days', 3),
  ('Ipaja Axis', 'LAGOS_AXIS', ARRAY['Ipaja', 'Iyana Ipaja', 'Command', 'Ayobo', 'Abule Egba'], 500000, '1 to 2 working days', 4),
  ('Igando / Ikotun Axis', 'LAGOS_AXIS', ARRAY['Igando', 'Ikotun'], 500000, '1 to 2 working days', 5),
  ('Apapa Axis', 'LAGOS_AXIS', ARRAY['Apapa', 'Festac'], 500000, '1 to 2 working days', 6),
  ('Ikorodu Axis', 'LAGOS_AXIS', ARRAY['Ikorodu'], 600000, '1 to 2 working days', 7),
  ('Lekki / Ajah Axis', 'LAGOS_AXIS', ARRAY['Lekki', 'Ajah', 'Sangotedo'], 700000, '1 to 2 working days', 8),
  ('Other Lagos area', 'LAGOS_OTHER', ARRAY[]::TEXT[], 700000, '1 to 2 working days', 9),
  ('Outside Lagos (GIG Logistics)', 'NIGERIA', ARRAY[]::TEXT[], 700000, '3 to 7 working days', 10),
  ('Store pickup', 'PICKUP', ARRAY[]::TEXT[], 0, NULL, 11)
) AS v(name, kind, areas, fee, delivery_time, position);
