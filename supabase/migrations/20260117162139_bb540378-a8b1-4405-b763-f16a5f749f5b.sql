-- Create catalogues table
CREATE TABLE public.catalogues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('men', 'women', 'kids', 'sports', 'football')),
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;

-- Public can view catalogues
CREATE POLICY "Catalogues are viewable by everyone"
ON public.catalogues
FOR SELECT
USING (true);

-- Admins can manage catalogues
CREATE POLICY "Admins can manage catalogues"
ON public.catalogues
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_catalogues_updated_at
BEFORE UPDATE ON public.catalogues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for catalogues
INSERT INTO storage.buckets (id, name, public) VALUES ('catalogues', 'catalogues', true);

-- Storage policies for catalogues bucket
CREATE POLICY "Catalogue PDFs are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'catalogues');

CREATE POLICY "Admins can upload catalogue PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'catalogues' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update catalogue PDFs"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'catalogues' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete catalogue PDFs"
ON storage.objects
FOR DELETE
USING (bucket_id = 'catalogues' AND auth.role() = 'authenticated');