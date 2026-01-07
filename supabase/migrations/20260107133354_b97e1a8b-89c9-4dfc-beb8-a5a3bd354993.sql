-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);

-- Allow anyone to view product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow admins to upload product images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND has_role(auth.uid(), 'admin'));

-- Allow admins to update product images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products' AND has_role(auth.uid(), 'admin'));

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND has_role(auth.uid(), 'admin'));

-- Create function to reduce stock when order is paid
CREATE OR REPLACE FUNCTION public.reduce_stock_on_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Only reduce stock when status changes to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    UPDATE public.products p
    SET stock = p.stock - oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for stock reduction
CREATE TRIGGER trigger_reduce_stock_on_paid
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.reduce_stock_on_paid();

-- Auto-assign admin role to specific email on signup
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'bakoollttd@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto admin assignment
CREATE TRIGGER trigger_auto_assign_admin
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_admin_role();

-- Allow admins to manage profiles (for password change feature)
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR auth.uid() = id);