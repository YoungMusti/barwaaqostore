-- Update the auto_assign_admin_role function with new admin email
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'bakoolltd@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Add sale_price column to products table for sale items
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sale_price numeric NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_on_sale boolean NOT NULL DEFAULT false;