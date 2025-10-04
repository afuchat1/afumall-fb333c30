-- Create table for product inquiries/contact messages
CREATE TABLE public.product_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product inquiries
CREATE POLICY "Users can view their own inquiries"
ON public.product_inquiries
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create inquiries"
ON public.product_inquiries
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries"
ON public.product_inquiries
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update inquiries"
ON public.product_inquiries
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete inquiries"
ON public.product_inquiries
FOR DELETE
USING (is_admin(auth.uid()));

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_product_inquiries_updated_at
BEFORE UPDATE ON public.product_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();