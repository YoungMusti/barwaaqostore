-- 1. Order numbering
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.format_order_number(n bigint)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT 'BARWAAQO' || CASE WHEN n < 10 THEN '0' || n::text ELSE n::text END
$$;

CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS text LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.format_order_number(nextval('public.order_number_seq'))
$$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS delivery_city text,
  ADD COLUMN IF NOT EXISTS delivery_area text,
  ADD COLUMN IF NOT EXISTS delivery_directions text,
  ADD COLUMN IF NOT EXISTS alt_phone text,
  ADD COLUMN IF NOT EXISTS delivery_instructions text,
  ADD COLUMN IF NOT EXISTS payment_transaction_ref text,
  ADD COLUMN IF NOT EXISTS payment_datetime text,
  ADD COLUMN IF NOT EXISTS payer_phone text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'awaiting_payment',
  ADD COLUMN IF NOT EXISTS fulfilment_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS payment_rejection_reason text,
  ADD COLUMN IF NOT EXISTS subtotal_amount numeric,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0;

-- Backfill existing orders (oldest first)
UPDATE public.orders o SET order_number = public.format_order_number(s.rn)
FROM (SELECT id, row_number() OVER (ORDER BY created_at, id) AS rn FROM public.orders) s
WHERE o.id = s.id AND o.order_number IS NULL;

SELECT setval('public.order_number_seq',
  GREATEST((SELECT count(*) FROM public.orders), 1),
  (SELECT count(*) FROM public.orders) > 0);

UPDATE public.orders SET
  payment_status = CASE
    WHEN status IN ('paid','processing','completed') THEN 'paid'
    WHEN payment_reference IS NOT NULL AND payment_reference <> '' THEN 'verification_pending'
    ELSE 'awaiting_payment' END,
  fulfilment_status = CASE status
    WHEN 'processing' THEN 'processing'
    WHEN 'completed' THEN 'completed'
    WHEN 'cancelled' THEN 'cancelled'
    ELSE 'new' END,
  payment_transaction_ref = COALESCE(payment_transaction_ref, payment_reference),
  delivery_fee = CASE WHEN delivery_method = 'delivery' THEN 2 ELSE 0 END,
  subtotal_amount = total_amount - CASE WHEN delivery_method = 'delivery' THEN 2 ELSE 0 END;

ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT public.next_order_number();
ALTER TABLE public.orders ALTER COLUMN order_number SET NOT NULL;
ALTER TABLE public.orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('awaiting_payment','verification_pending','paid','rejected','refunded'));
ALTER TABLE public.orders ADD CONSTRAINT orders_fulfilment_status_check
  CHECK (fulfilment_status IN ('new','processing','ready_for_dispatch','out_for_delivery','completed','cancelled'));

COMMENT ON COLUMN public.orders.status IS 'DEPRECATED: replaced by payment_status and fulfilment_status';
COMMENT ON COLUMN public.orders.payment_reference IS 'DEPRECATED: replaced by payment_transaction_ref and payment_datetime';

-- 2. Status history
CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status_type text NOT NULL CHECK (status_type IN ('payment','fulfilment')),
  old_status text,
  new_status text NOT NULL,
  reason text,
  changed_by uuid,
  changed_by_email text,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.order_status_history TO authenticated;
GRANT ALL ON public.order_status_history TO service_role;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view order status history" ON public.order_status_history
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Guard: statuses can only change through trusted functions
CREATE OR REPLACE FUNCTION public.guard_order_statuses()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF COALESCE(current_setting('barwaaqo.trusted', true), '') = 'on' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.fulfilment_status := 'new';
    NEW.payment_status := CASE WHEN COALESCE(NEW.payment_reference, NEW.payment_transaction_ref, NEW.payment_datetime, '') <> ''
      THEN 'verification_pending' ELSE 'awaiting_payment' END;
  ELSE
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
       OR NEW.fulfilment_status IS DISTINCT FROM OLD.fulfilment_status
       OR NEW.order_number IS DISTINCT FROM OLD.order_number
       OR NEW.total_amount IS DISTINCT FROM OLD.total_amount THEN
      RAISE EXCEPTION 'Order statuses can only be changed through admin actions';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_guard_order_statuses BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_order_statuses();

-- Orders and items are only created through the checkout function
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- 4. Checkout function
CREATE OR REPLACE FUNCTION public.create_order_v2(
  _customer_name text, _customer_phone text, _delivery_method text,
  _delivery_city text, _delivery_area text, _delivery_directions text,
  _alt_phone text, _delivery_instructions text,
  _payment_method text, _transaction_ref text, _payment_datetime text,
  _payer_phone text, _order_notes text, _items jsonb)
RETURNS TABLE(order_id uuid, order_number text, total_amount numeric, error_message text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

  IF _delivery_method = 'delivery' THEN _fee := 2; END IF;
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
$$;
GRANT EXECUTE ON FUNCTION public.create_order_v2(text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb) TO anon, authenticated;

-- 5. Customer order lookup (needs order number AND phone)
CREATE OR REPLACE FUNCTION public.lookup_order(_order_number text, _phone text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'order_number', o.order_number, 'created_at', o.created_at, 'total_amount', o.total_amount,
    'subtotal_amount', o.subtotal_amount, 'delivery_fee', o.delivery_fee,
    'payment_method', o.payment_method, 'payment_status', o.payment_status, 'fulfilment_status', o.fulfilment_status,
    'delivery_method', o.delivery_method, 'delivery_city', o.delivery_city, 'delivery_area', o.delivery_area,
    'items', COALESCE((SELECT jsonb_agg(jsonb_build_object('product_name', i.product_name, 'quantity', i.quantity,
       'price', i.price, 'selected_size', i.selected_size)) FROM public.order_items i WHERE i.order_id = o.id), '[]'::jsonb))
  FROM public.orders o
  WHERE upper(btrim(o.order_number)) = upper(btrim(_order_number))
    AND regexp_replace(o.customer_phone, '[^0-9]', '', 'g') = regexp_replace(_phone, '[^0-9]', '', 'g')
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.lookup_order(text, text) TO anon, authenticated;

-- 6. Admin actions
CREATE OR REPLACE FUNCTION public.admin_set_payment_status(_order_id uuid, _new_status text, _reason text DEFAULT NULL, _allow_duplicate boolean DEFAULT false)
RETURNS TABLE(ok boolean, message text, duplicate_order_numbers text[])
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _o record; _dups text[]; _email text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF _new_status NOT IN ('awaiting_payment','verification_pending','paid','rejected','refunded') THEN
    RETURN QUERY SELECT false, 'Invalid payment status', NULL::text[]; RETURN; END IF;
  SELECT * INTO _o FROM public.orders WHERE id = _order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 'Order not found', NULL::text[]; RETURN; END IF;
  IF _o.payment_status = _new_status THEN RETURN QUERY SELECT false, 'Payment already has this status', NULL::text[]; RETURN; END IF;
  IF _new_status = 'rejected' AND btrim(COALESCE(_reason,'')) = '' THEN
    RETURN QUERY SELECT false, 'A reason is required to reject a payment', NULL::text[]; RETURN; END IF;
  IF _new_status = 'refunded' AND _o.payment_status <> 'paid' THEN
    RETURN QUERY SELECT false, 'Only paid orders can be refunded', NULL::text[]; RETURN; END IF;
  IF _new_status = 'paid' AND COALESCE(btrim(_o.payment_transaction_ref), '') <> '' THEN
    SELECT array_agg(x.order_number ORDER BY x.order_number) INTO _dups FROM public.orders x
    WHERE x.id <> _o.id AND x.payment_status IN ('paid','verification_pending')
      AND lower(regexp_replace(x.payment_transaction_ref, '\s', '', 'g')) = lower(regexp_replace(_o.payment_transaction_ref, '\s', '', 'g'));
    IF _dups IS NOT NULL AND NOT _allow_duplicate THEN
      RETURN QUERY SELECT false, 'This transaction reference is also used on other orders', _dups; RETURN; END IF;
  END IF;

  SELECT email INTO _email FROM public.profiles WHERE id = auth.uid();
  PERFORM set_config('barwaaqo.trusted', 'on', true);
  UPDATE public.orders SET payment_status = _new_status,
    payment_rejection_reason = CASE WHEN _new_status = 'rejected' THEN btrim(_reason) ELSE payment_rejection_reason END
  WHERE id = _order_id;
  PERFORM set_config('barwaaqo.trusted', 'off', true);
  INSERT INTO public.order_status_history (order_id, status_type, old_status, new_status, reason, changed_by, changed_by_email)
  VALUES (_order_id, 'payment', _o.payment_status, _new_status,
    NULLIF(btrim(COALESCE(_reason,'')), '') || CASE WHEN _dups IS NOT NULL THEN ' [duplicate reference override]' ELSE '' END,
    auth.uid(), _email);
  RETURN QUERY SELECT true, 'Payment status updated', _dups;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_fulfilment_status(_order_id uuid, _new_status text, _note text DEFAULT NULL)
RETURNS TABLE(ok boolean, message text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _o record; _email text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF _new_status NOT IN ('new','processing','ready_for_dispatch','out_for_delivery','completed','cancelled') THEN
    RETURN QUERY SELECT false, 'Invalid order status'; RETURN; END IF;
  SELECT * INTO _o FROM public.orders WHERE id = _order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 'Order not found'; RETURN; END IF;
  IF _o.fulfilment_status = _new_status THEN RETURN QUERY SELECT false, 'Order already has this status'; RETURN; END IF;
  SELECT email INTO _email FROM public.profiles WHERE id = auth.uid();
  PERFORM set_config('barwaaqo.trusted', 'on', true);
  UPDATE public.orders SET fulfilment_status = _new_status WHERE id = _order_id;
  PERFORM set_config('barwaaqo.trusted', 'off', true);
  INSERT INTO public.order_status_history (order_id, status_type, old_status, new_status, reason, changed_by, changed_by_email)
  VALUES (_order_id, 'fulfilment', _o.fulfilment_status, _new_status, NULLIF(btrim(COALESCE(_note,'')), ''), auth.uid(), _email);
  RETURN QUERY SELECT true, 'Order status updated';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_payment_status(uuid, text, text, boolean) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_set_fulfilment_status(uuid, text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_set_payment_status(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_fulfilment_status(uuid, text, text) TO authenticated;