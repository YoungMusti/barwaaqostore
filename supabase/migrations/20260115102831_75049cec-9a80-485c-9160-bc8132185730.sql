-- 1. Add database constraints for input validation on orders table
ALTER TABLE public.orders 
  ADD CONSTRAINT check_phone_format 
    CHECK (customer_phone ~ '^\+252[0-9]{8,9}$');

ALTER TABLE public.orders
  ADD CONSTRAINT check_reference_length
    CHECK (payment_reference IS NULL OR length(payment_reference) <= 100);

-- 2. Create rate limiting table
CREATE TABLE public.order_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_identifier TEXT UNIQUE NOT NULL,
  order_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  blocked_until TIMESTAMPTZ
);

-- Enable RLS but restrict access
ALTER TABLE public.order_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow internal function access (no direct access)
CREATE POLICY "No direct access to rate limits"
  ON public.order_rate_limits FOR ALL
  USING (false);

-- 3. Create rate limit checking function
CREATE OR REPLACE FUNCTION public.check_order_rate_limit(
  _phone TEXT,
  _max_orders INTEGER DEFAULT 5,
  _window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  _record RECORD;
BEGIN
  -- Get existing record
  SELECT * INTO _record 
  FROM public.order_rate_limits 
  WHERE phone_identifier = _phone;
  
  -- No record = first order, allow it
  IF NOT FOUND THEN
    INSERT INTO public.order_rate_limits (phone_identifier, order_count)
    VALUES (_phone, 1);
    RETURN TRUE;
  END IF;
  
  -- Check if blocked
  IF _record.blocked_until IS NOT NULL AND _record.blocked_until > now() THEN
    RETURN FALSE;
  END IF;
  
  -- Reset if window expired
  IF _record.window_start + (_window_minutes || ' minutes')::INTERVAL < now() THEN
    UPDATE public.order_rate_limits
    SET order_count = 1, window_start = now(), blocked_until = NULL
    WHERE phone_identifier = _phone;
    RETURN TRUE;
  END IF;
  
  -- Check limit
  IF _record.order_count >= _max_orders THEN
    UPDATE public.order_rate_limits
    SET blocked_until = now() + '1 hour'::INTERVAL
    WHERE phone_identifier = _phone;
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  UPDATE public.order_rate_limits
  SET order_count = order_count + 1
  WHERE phone_identifier = _phone;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create validated order function to prevent price manipulation
CREATE OR REPLACE FUNCTION public.create_validated_order(
  _customer_phone TEXT,
  _payment_reference TEXT,
  _payment_method TEXT,
  _items JSONB
) RETURNS TABLE(order_id UUID, error_message TEXT) AS $$
DECLARE
  _order_id UUID;
  _total_amount DECIMAL := 0;
  _item JSONB;
  _product RECORD;
  _item_price DECIMAL;
BEGIN
  -- Validate phone format
  IF NOT _customer_phone ~ '^\+252[0-9]{8,9}$' THEN
    RETURN QUERY SELECT NULL::UUID, 'Invalid phone number format. Use +252 followed by 8-9 digits';
    RETURN;
  END IF;
  
  -- Validate reference length
  IF _payment_reference IS NOT NULL AND length(_payment_reference) > 100 THEN
    RETURN QUERY SELECT NULL::UUID, 'Payment reference too long (max 100 characters)';
    RETURN;
  END IF;
  
  -- Check rate limit
  IF NOT check_order_rate_limit(_customer_phone, 5, 60) THEN
    RETURN QUERY SELECT NULL::UUID, 'Too many orders. Please wait before placing another order.';
    RETURN;
  END IF;
  
  -- Validate items array
  IF _items IS NULL OR jsonb_array_length(_items) = 0 THEN
    RETURN QUERY SELECT NULL::UUID, 'Order must contain at least one item';
    RETURN;
  END IF;
  
  -- Calculate total from actual product prices (prevents price manipulation)
  FOR _item IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    SELECT * INTO _product
    FROM public.products p
    WHERE p.id = (_item->>'product_id')::UUID;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT NULL::UUID, 'Product not found: ' || (_item->>'product_id');
      RETURN;
    END IF;
    
    -- Check stock
    IF _product.stock < COALESCE((_item->>'quantity')::INTEGER, 1) THEN
      RETURN QUERY SELECT NULL::UUID, 'Insufficient stock for: ' || _product.name;
      RETURN;
    END IF;
    
    -- Use sale price if on sale
    IF _product.is_on_sale AND _product.sale_price IS NOT NULL THEN
      _item_price := _product.sale_price;
    ELSE
      _item_price := _product.price;
    END IF;
    
    _total_amount := _total_amount + (_item_price * COALESCE((_item->>'quantity')::INTEGER, 1));
  END LOOP;
  
  -- Create order with validated data
  INSERT INTO public.orders (customer_phone, total_amount, payment_reference, payment_method, status)
  VALUES (_customer_phone, _total_amount, _payment_reference, COALESCE(_payment_method, 'EVC'), 'pending')
  RETURNING id INTO _order_id;
  
  -- Insert order items with validated prices from database
  FOR _item IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    SELECT * INTO _product
    FROM public.products p
    WHERE p.id = (_item->>'product_id')::UUID;
    
    IF _product.is_on_sale AND _product.sale_price IS NOT NULL THEN
      _item_price := _product.sale_price;
    ELSE
      _item_price := _product.price;
    END IF;
    
    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price, selected_size, selected_color)
    VALUES (
      _order_id,
      _product.id,
      _product.name,
      COALESCE((_item->>'quantity')::INTEGER, 1),
      _item_price,
      _item->>'selected_size',
      _item->>'selected_color'
    );
    
    -- Decrement stock
    UPDATE public.products
    SET stock = stock - COALESCE((_item->>'quantity')::INTEGER, 1)
    WHERE id = _product.id;
  END LOOP;
  
  RETURN QUERY SELECT _order_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;