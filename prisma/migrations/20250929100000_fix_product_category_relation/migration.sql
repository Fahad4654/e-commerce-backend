-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoryId" INTEGER;

-- Step 1: Insert a default category
INSERT INTO "Category" ("name", "description") VALUES ('Uncategorized', 'Products that have not been assigned a category.');

-- Step 2: Update existing products to use the default category
-- The subquery gets the id of the 'Uncategorized' category.
UPDATE "Product" SET "categoryId" = (SELECT id FROM "Category" WHERE name = 'Uncategorized') WHERE "categoryId" IS NULL;

-- Step 3: Now that all products have a categoryId, make the column non-nullable
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
