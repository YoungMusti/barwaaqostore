CREATE TABLE public.storefront_settings (
  id integer PRIMARY KEY DEFAULT 1,
  show_new_arrivals boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.storefront_settings TO anon;
GRANT SELECT, UPDATE ON public.storefront_settings TO authenticated;
GRANT ALL ON public.storefront_settings TO service_role;

ALTER TABLE public.storefront_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storefront settings are viewable by everyone"
ON public.storefront_settings
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can update storefront settings"
ON public.storefront_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.storefront_settings (id, show_new_arrivals)
VALUES (1, true);

CREATE TRIGGER update_storefront_settings_updated_at
BEFORE UPDATE ON public.storefront_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();