-- Create table for product images (gallery)
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for product colors
CREATE TABLE public.product_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hex_code TEXT NOT NULL DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for product sizes (EU/US)
CREATE TABLE public.product_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  eu_size TEXT NOT NULL,
  us_size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_images
CREATE POLICY "Product images are viewable by everyone" 
ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Admins can manage product images" 
ON public.product_images FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for product_colors
CREATE POLICY "Product colors are viewable by everyone" 
ON public.product_colors FOR SELECT USING (true);

CREATE POLICY "Admins can manage product colors" 
ON public.product_colors FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for product_sizes
CREATE POLICY "Product sizes are viewable by everyone" 
ON public.product_sizes FOR SELECT USING (true);

CREATE POLICY "Admins can manage product sizes" 
ON public.product_sizes FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Add indexes for better performance
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_colors_product_id ON public.product_colors(product_id);
CREATE INDEX idx_product_sizes_product_id ON public.product_sizes(product_id);

-- Update order_items to store selected size and color
ALTER TABLE public.order_items 
ADD COLUMN selected_size TEXT,
ADD COLUMN selected_color TEXT;