-- Customers now pick their delivery option (Lagos axis, other Lagos area or other states) at checkout,
-- instead of the fee being worked out from the address. The area columns added earlier today were
-- never filled in (checked before writing this), so they are replaced.

-- AlterTable: remember the option last used with each address
ALTER TABLE "addresses" DROP COLUMN "area",
ADD COLUMN     "deliveryZoneId" TEXT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "shipArea";

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "delivery_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Say plainly what the outside-Lagos option is.
UPDATE "delivery_zones" SET "name" = 'Other states (GIG Logistics)', "updatedAt" = CURRENT_TIMESTAMP
WHERE "kind" = 'NIGERIA' AND "name" = 'Outside Lagos (GIG Logistics)';
