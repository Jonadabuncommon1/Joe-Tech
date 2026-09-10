-- Run this once in Supabase's SQL Editor (Joe Tech project).
-- Adds storage/size variant support to the products table: one listing can
-- now hold several priced options (e.g. an iPhone 11 with 64GB/128GB/256GB
-- each at a different price) instead of needing a separate product per size.

alter table public.products
  add column if not exists variants jsonb;

-- Shape stored in this column, one entry per option:
-- [
--   { "label": "64GB",  "price": 450000, "inStock": true },
--   { "label": "128GB", "price": 520000, "inStock": true },
--   { "label": "256GB", "price": 650000, "originalPrice": 700000, "inStock": false }
-- ]
-- Set from the admin panel's product form (the new "Storage / Options"
-- section), nothing needs to be typed here by hand.
