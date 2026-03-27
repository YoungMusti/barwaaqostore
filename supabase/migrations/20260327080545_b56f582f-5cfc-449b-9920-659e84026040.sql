
-- Add structured customer/order metadata columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'collection';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_notes text;

-- Update create_validated_order to accept new fields
CREATE OR REPLACE FUNCTION public.create_validated_order(
  _customer_phone text, 
  _payment_reference text, 
  _payment_method text, 
  _items jsonb,
  _customer_name text DEFAULT NULL,
  _delivery_method text DEFAULT 'collection',
  _delivery_address text DEFAULT NULL,
  _order_notes text DEFAULT NULL
)
 RETURNS TABLE(order_id uuid, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  IF _payment_reference IS NOT NULL AND length(_payment_reference) > 200 THEN
    RETURN QUERY SELECT NULL::UUID, 'Payment reference too long';
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
  
  -- Calculate total from actual product prices
  FOR _item IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    SELECT * INTO _product
    FROM public.products p
    WHERE p.id = (_item->>'product_id')::UUID;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT NULL::UUID, 'Product not found: ' || (_item->>'product_id');
      RETURN;
    END IF;
    
    IF _product.stock < COALESCE((_item->>'quantity')::INTEGER, 1) THEN
      RETURN QUERY SELECT NULL::UUID, 'Insufficient stock for: ' || _product.name;
      RETURN;
    END IF;
    
    IF _product.is_on_sale AND _product.sale_price IS NOT NULL THEN
      _item_price := _product.sale_price;
    ELSE
      _item_price := _product.price;
    END IF;
    
    _total_amount := _total_amount + (_item_price * COALESCE((_item->>'quantity')::INTEGER, 1));
  END LOOP;
  
  -- Add delivery fee if delivery
  IF _delivery_method = 'delivery' THEN
    _total_amount := _total_amount + 2;
  END IF;
  
  -- Create order with all metadata
  INSERT INTO public.orders (customer_phone, total_amount, payment_reference, payment_method, status, customer_name, delivery_method, delivery_address, order_notes)
  VALUES (_customer_phone, _total_amount, _payment_reference, COALESCE(_payment_method, 'EVC'), 'pending', _customer_name, COALESCE(_delivery_method, 'collection'), _delivery_address, _order_notes)
  RETURNING id INTO _order_id;
  
  -- Insert order items
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
    
    UPDATE public.products
    SET stock = stock - COALESCE((_item->>'quantity')::INTEGER, 1)
    WHERE id = _product.id;
  END LOOP;
  
  RETURN QUERY SELECT _order_id, NULL::TEXT;
END;
$function$;
