
CREATE TABLE public.sale_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Flash Sale!',
  title_somali text NOT NULL DEFAULT 'Qiimo Gaar ah!',
  discount_text text NOT NULL DEFAULT 'Up to 50% off!',
  discount_text_somali text NOT NULL DEFAULT 'ilaa 50% dhimis!',
  is_active boolean NOT NULL DEFAULT false,
  end_time timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sale_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sale banners viewable by everyone" ON public.sale_banners FOR SELECT USING (true);
CREATE POLICY "Admins can manage sale banners" ON public.sale_banners FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default banner
INSERT INTO public.sale_banners (title, title_somali, discount_text, discount_text_somali, is_active, end_time)
VALUES ('Flash Sale!', 'Qiimo Gaar ah!', 'Up to 50% off!', 'ilaa 50% dhimis!', true, now() + interval '24 hours');

CREATE TRIGGER update_sale_banners_updated_at
BEFORE UPDATE ON public.sale_banners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
