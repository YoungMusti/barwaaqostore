CREATE OR REPLACE FUNCTION public.create_order_v2(_customer_name text, _customer_phone text, _delivery_method text, _delivery_city text, _delivery_area text, _delivery_directions text, _alt_phone text, _delivery_instructions text, _payment_method text, _transaction_ref text, _payment_datetime text, _payer_phone text, _order_notes text, _items jsonb)
 RETURNS TABLE(order_id uuid, order_number text, total_amount numeric, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _order_id uuid; _number text; _subtotal numeric := 0; _fee numeric := 0; _total numeric;
  _item jsonb; _product record; _qty int; _price numeric; _pstatus text;
  _name text := btrim(COALESCE(_customer_name, ''));
  _ref text := NULLIF(btrim(COALESCE(_transaction_ref, '')), '');
  _dt text := NULLIF(btrim(COALESCE(_payment_datetime, '')), '');
  _alt text := NULLIF(btrim(COALESCE(_alt_phone, '')), '');
  _payer text := NULLIF(btrim(COALESCE(_payer_phone, '')), '');
BEGIN
  IF _name = '' OR length(_name) > 100 THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Full name is required (max 100 characters)'; RETURN; END IF;
  IF _customer_phone IS NULL OR NOT _customer_phone ~ '^\+252[0-9]{8,9}$' THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Invalid phone number. Use +252 followed by 8-9 digits'; RETURN; END IF;
  IF _alt IS NOT NULL AND NOT _alt ~ '^\+252[0-9]{8,9}$' THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Invalid alternative phone number'; RETURN; END IF;
  IF _payer IS NOT NULL AND NOT _payer ~ '^\+252[0-9]{8,9}$' THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Invalid payer phone number'; RETURN; END IF;
  IF _delivery_method NOT IN ('collection','delivery') THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Invalid delivery method'; RETURN; END IF;
  IF _delivery_method = 'delivery' AND (
       btrim(COALESCE(_delivery_city,'')) = '' OR btrim(COALESCE(_delivery_area,'')) = '' OR btrim(COALESCE(_delivery_directions,'')) = '') THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'City, area/district and location directions are required for delivery'; RETURN; END IF;
  IF length(COALESCE(_delivery_city,'')) > 80 OR length(COALESCE(_delivery_area,'')) > 120
     OR length(COALESCE(_delivery_directions,'')) > 1000 OR length(COALESCE(_delivery_instructions,'')) > 500
     OR length(COALESCE(_order_notes,'')) > 500 OR length(COALESCE(_ref,'')) > 100 OR length(COALESCE(_dt,'')) > 60 THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'One of the fields is too long'; RETURN; END IF;
  IF _payment_method NOT IN ('EVC','SALAAM') THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Invalid payment method'; RETURN; END IF;
  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Order must contain at least one item'; RETURN; END IF;
  IF NOT public.check_order_rate_limit(_customer_phone, 5, 60) THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Too many orders. Please wait before placing another order.'; RETURN; END IF;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := COALESCE((_item->>'quantity')::int, 1);
    IF _qty < 1 OR _qty > 50 THEN
      RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Invalid quantity'; RETURN; END IF;
    SELECT * INTO _product FROM public.products p WHERE p.id = (_item->>'product_id')::uuid;
    IF NOT FOUND THEN
      RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Product not found'; RETURN; END IF;
    IF _product.stock < _qty THEN
      RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::numeric, 'Insufficient stock for: ' || _product.name; RETURN; END IF;
    _price := CASE WHEN _product.is_on_sale AND _product.sale_price IS NOT NULL THEN _product.sale_price ELSE _product.price END;
    _subtotal := _subtotal + _price * _qty;
  END LOOP;

  IF _delivery_method = 'delivery' AND lower(btrim(COALESCE(_delivery_city,''))) IN ('mogadishu','muqdisho') THEN _fee := 2; END IF;
  _total := _subtotal + _fee;
  _pstatus := CASE WHEN _ref IS NOT NULL OR _dt IS NOT NULL THEN 'verification_pending' ELSE 'awaiting_payment' END;

  PERFORM set_config('barwaaqo.trusted', 'on', true);
  INSERT INTO public.orders (customer_name, customer_phone, total_amount, subtotal_amount, delivery_fee, discount_amount,
    payment_method, payment_transaction_ref, payment_datetime, payer_phone, payment_status, fulfilment_status, status,
    delivery_method, delivery_city, delivery_area, delivery_directions, alt_phone, delivery_instructions, delivery_address, order_notes)
  VALUES (_name, _customer_phone, _total, _subtotal, _fee, 0,
    _payment_method, _ref, _dt, _payer, _pstatus, 'new', 'pending',
    _delivery_method,
    CASE WHEN _delivery_method = 'delivery' THEN btrim(_delivery_city) END,
    CASE WHEN _delivery_method = 'delivery' THEN btrim(_delivery_area) END,
    CASE WHEN _delivery_method = 'delivery' THEN btrim(_delivery_directions) END,
    _alt,
    CASE WHEN _delivery_method = 'delivery' THEN NULLIF(btrim(COALESCE(_delivery_instructions,'')), '') END,
    CASE WHEN _delivery_method = 'delivery' THEN btrim(_delivery_city) || ', ' || btrim(_delivery_area) || ' — ' || btrim(_delivery_directions) END,
    NULLIF(btrim(COALESCE(_order_notes,'')), ''))
  RETURNING id, orders.order_number INTO _order_id, _number;
  PERFORM set_config('barwaaqo.trusted', 'off', true);

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := COALESCE((_item->>'quantity')::int, 1);
    SELECT * INTO _product FROM public.products p WHERE p.id = (_item->>'product_id')::uuid;
    _price := CASE WHEN _product.is_on_sale AND _product.sale_price IS NOT NULL THEN _product.sale_price ELSE _product.price END;
    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price, selected_size, selected_color)
    VALUES (_order_id, _product.id, _product.name, _qty, _price, _item->>'selected_size', _item->>'selected_color');
    UPDATE public.products SET stock = stock - _qty WHERE id = _product.id;
  END LOOP;

  INSERT INTO public.order_status_history (order_id, status_type, old_status, new_status, reason)
  VALUES (_order_id, 'payment', NULL, _pstatus, 'Order placed by customer'),
         (_order_id, 'fulfilment', NULL, 'new', 'Order placed by customer');

  RETURN QUERY SELECT _order_id, _number, _total, NULL::text;
END;
$function$;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_quote_status text;
COMMENT ON COLUMN public.orders.delivery_quote_status IS 'NULL = not needed; pending = outside Mogadishu awaiting quote; quoted = admin set fee';

CREATE OR REPLACE FUNCTION public.mark_quote_pending() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.delivery_method = 'delivery' AND lower(btrim(COALESCE(NEW.delivery_city,''))) NOT IN ('mogadishu','muqdisho') THEN
    NEW.delivery_quote_status := 'pending';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_mark_quote_pending ON public.orders;
CREATE TRIGGER trg_mark_quote_pending BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.mark_quote_pending();

CREATE OR REPLACE FUNCTION public.admin_set_delivery_quote(_order_id uuid, _fee numeric)
RETURNS TABLE(ok boolean, message text) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _o record;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RETURN QUERY SELECT false, 'Admins only'; RETURN; END IF;
  IF _fee IS NULL OR _fee < 0 OR _fee > 1000 THEN RETURN QUERY SELECT false, 'Invalid delivery fee'; RETURN; END IF;
  SELECT * INTO _o FROM public.orders WHERE id = _order_id;
  IF NOT FOUND OR _o.delivery_quote_status IS NULL THEN RETURN QUERY SELECT false, 'This order does not need a quote'; RETURN; END IF;
  PERFORM set_config('barwaaqo.trusted', 'on', true);
  UPDATE public.orders SET delivery_fee = _fee,
    total_amount = COALESCE(subtotal_amount, total_amount - delivery_fee) + _fee - discount_amount,
    delivery_quote_status = 'quoted' WHERE id = _order_id;
  PERFORM set_config('barwaaqo.trusted', 'off', true);
  INSERT INTO public.order_status_history (order_id, status_type, old_status, new_status, reason, changed_by, changed_by_email)
  VALUES (_order_id, 'delivery_quote', _o.delivery_quote_status, 'quoted', 'Delivery fee set to $' || _fee,
          auth.uid(), (SELECT email FROM public.profiles WHERE id = auth.uid()));
  RETURN QUERY SELECT true, 'Delivery quote saved';
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_set_delivery_quote(uuid, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_delivery_quote(uuid, numeric) TO authenticated;