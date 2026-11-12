-- When an order reached each step, for the progress tracker.
ALTER TABLE "orders" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "processingAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3);

-- Existing orders: the best guess for when they reached their current step is their last update.
UPDATE "orders" SET "processingAt" = "updatedAt" WHERE "status" = 'PROCESSING';
UPDATE "orders" SET "shippedAt" = "updatedAt" WHERE "status" = 'SHIPPED';
UPDATE "orders" SET "deliveredAt" = "updatedAt" WHERE "status" = 'DELIVERED';
UPDATE "orders" SET "cancelledAt" = "updatedAt" WHERE "status" = 'CANCELLED';

-- In-app notifications (the bell).
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
