
-- Add order notes column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes text;

-- Add low stock threshold to products  
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5;
