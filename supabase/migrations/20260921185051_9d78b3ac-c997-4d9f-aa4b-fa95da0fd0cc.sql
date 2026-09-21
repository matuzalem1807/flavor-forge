CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 100),
  phone text NOT NULL UNIQUE CHECK (phone ~ '^[0-9]{10,11}$'),
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  tracking_code uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  fulfillment text NOT NULL CHECK (fulfillment IN ('delivery','pickup')),
  postal_code text,
  street text,
  address_number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  reference text,
  distance_km numeric(5,2),
  subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  delivery_fee_cents integer NOT NULL DEFAULT 0 CHECK (delivery_fee_cents >= 0),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  status text NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','ACCEPTED','IN_PREPARATION','READY','OUT_FOR_DELIVERY','DELIVERED','READY_FOR_PICKUP','PICKED_UP','CANCELLED')),
  payment_timing text NOT NULL CHECK (payment_timing IN ('online','on_delivery')),
  payment_method text NOT NULL CHECK (payment_method IN ('pix','card','cash')),
  payment_status text NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','PAID','FAILED','REFUND_REQUESTED','REFUND_PENDING','REFUNDED')),
  change_for_cents integer CHECK (change_for_cents IS NULL OR change_for_cents >= 0),
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_delivery_address CHECK (
    fulfillment = 'pickup' OR (
      postal_code IS NOT NULL AND street IS NOT NULL AND address_number IS NOT NULL
      AND neighborhood IS NOT NULL AND city IS NOT NULL AND state IS NOT NULL
      AND distance_km IS NOT NULL
    )
  ),
  CONSTRAINT orders_pickup_no_fee CHECK (fulfillment <> 'pickup' OR delivery_fee_cents = 0),
  CONSTRAINT orders_total_math CHECK (total_cents = subtotal_cents + delivery_fee_cents)
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  base_price_cents integer NOT NULL CHECK (base_price_cents >= 0),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 280),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_subtotal_math CHECK (subtotal_cents = unit_price_cents * quantity)
);
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_item_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.options(id) ON DELETE SET NULL,
  group_name text NOT NULL,
  option_name text NOT NULL,
  price_delta_cents integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.order_item_options TO service_role;
ALTER TABLE public.order_item_options ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('NEW','ACCEPTED','IN_PREPARATION','READY','OUT_FOR_DELIVERY','DELIVERED','READY_FOR_PICKUP','PICKED_UP','CANCELLED')),
  responsible_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  responsible_label text NOT NULL DEFAULT 'Cliente',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.order_status_history TO service_role;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  timing text NOT NULL CHECK (timing IN ('online','on_delivery')),
  method text NOT NULL CHECK (method IN ('pix','card','cash')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','FAILED','REFUND_REQUESTED','REFUND_PENDING','REFUNDED')),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  provider_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.marketing_consents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  accepted boolean NOT NULL,
  consent_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.marketing_consents TO service_role;
ALTER TABLE public.marketing_consents ENABLE ROW LEVEL SECURITY;

CREATE INDEX orders_customer_id_idx ON public.orders (customer_id, created_at DESC);
CREATE INDEX orders_status_idx ON public.orders (status, created_at DESC);
CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);
CREATE INDEX order_item_options_item_id_idx ON public.order_item_options (order_item_id);
CREATE INDEX order_status_history_order_id_idx ON public.order_status_history (order_id, created_at);
CREATE INDEX payments_order_id_idx ON public.payments (order_id);
CREATE INDEX marketing_consents_customer_id_idx ON public.marketing_consents (customer_id, created_at DESC);

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.create_public_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_customer public.customers%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_restaurant_status text;
  v_fulfillment text := payload->>'fulfillment';
  v_payment_timing text := payload->>'paymentTiming';
  v_payment_method text := payload->>'paymentMethod';
  v_name text := btrim(coalesce(payload->>'customerName', ''));
  v_phone text := regexp_replace(coalesce(payload->>'phone', ''), '\D', '', 'g');
  v_distance numeric;
  v_delivery_fee integer := 0;
  v_subtotal integer := 0;
  v_change integer;
  v_item jsonb;
  v_product public.products%ROWTYPE;
  v_order_item_id uuid;
  v_quantity integer;
  v_base_price integer;
  v_unit_price integer;
  v_note text;
  v_selected_ids uuid[];
  v_option record;
  v_group record;
  v_selected_count integer;
BEGIN
  IF v_name = '' OR char_length(v_name) < 2 OR char_length(v_name) > 100 THEN
    RAISE EXCEPTION 'Informe um nome válido.' USING ERRCODE = '22023';
  END IF;
  IF v_phone !~ '^[0-9]{10,11}$' THEN
    RAISE EXCEPTION 'Informe um telefone válido.' USING ERRCODE = '22023';
  END IF;
  IF v_fulfillment NOT IN ('delivery','pickup') THEN
    RAISE EXCEPTION 'Forma de recebimento inválida.' USING ERRCODE = '22023';
  END IF;
  IF v_payment_timing NOT IN ('online','on_delivery') OR v_payment_method NOT IN ('pix','card','cash')
     OR (v_payment_timing = 'online' AND v_payment_method = 'cash') THEN
    RAISE EXCEPTION 'Forma de pagamento inválida.' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(payload->'items') <> 'array' OR jsonb_array_length(payload->'items') = 0 OR jsonb_array_length(payload->'items') > 50 THEN
    RAISE EXCEPTION 'O carrinho está vazio ou inválido.' USING ERRCODE = '22023';
  END IF;

  SELECT status INTO v_restaurant_status FROM public.restaurant ORDER BY created_at LIMIT 1;
  IF v_restaurant_status IS DISTINCT FROM 'aberto' THEN
    RAISE EXCEPTION 'A loja não está aceitando pedidos agora.' USING ERRCODE = 'P0001';
  END IF;

  IF v_fulfillment = 'delivery' THEN
    IF regexp_replace(coalesce(payload->>'postalCode', ''), '\D', '', 'g') !~ '^[0-9]{8}$'
       OR btrim(coalesce(payload->>'street', '')) = ''
       OR btrim(coalesce(payload->>'number', '')) = ''
       OR btrim(coalesce(payload->>'neighborhood', '')) = ''
       OR btrim(coalesce(payload->>'city', '')) = ''
       OR upper(btrim(coalesce(payload->>'state', ''))) !~ '^[A-Z]{2}$' THEN
      RAISE EXCEPTION 'Endereço de entrega incompleto.' USING ERRCODE = '22023';
    END IF;
    BEGIN
      v_distance := (payload->>'distanceKm')::numeric;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Distância de entrega inválida.' USING ERRCODE = '22023';
    END;
    SELECT dr.fee_cents INTO v_delivery_fee
    FROM public.delivery_ranges dr
    JOIN public.delivery_settings ds ON ds.id = dr.delivery_settings_id
    WHERE ds.active AND dr.active AND v_distance > dr.min_distance_km AND v_distance <= dr.max_distance_km
    ORDER BY dr.sort_order LIMIT 1;
    IF v_delivery_fee IS NULL THEN
      RAISE EXCEPTION 'Endereço fora da área de entrega.' USING ERRCODE = 'P0001';
    END IF;
  ELSE
    v_distance := NULL;
    v_delivery_fee := 0;
  END IF;

  IF payload->>'changeForCents' IS NOT NULL AND payload->>'changeForCents' <> '' THEN
    BEGIN
      v_change := (payload->>'changeForCents')::integer;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Valor para troco inválido.' USING ERRCODE = '22023';
    END;
  END IF;
  IF v_payment_method <> 'cash' THEN v_change := NULL; END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(payload->'items')
  LOOP
    BEGIN
      v_quantity := (v_item->>'quantity')::integer;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Quantidade inválida.' USING ERRCODE = '22023';
    END;
    IF v_quantity NOT BETWEEN 1 AND 20 THEN
      RAISE EXCEPTION 'A quantidade de cada item deve estar entre 1 e 20.' USING ERRCODE = '22023';
    END IF;
    SELECT * INTO v_product FROM public.products WHERE id = (v_item->>'productId')::uuid;
    IF NOT FOUND OR NOT v_product.available THEN
      RAISE EXCEPTION 'Um produto do carrinho não está mais disponível.' USING ERRCODE = 'P0001';
    END IF;
    v_base_price := coalesce(v_product.promo_price_cents, v_product.price_cents);
    v_unit_price := v_base_price;
    v_note := left(coalesce(v_item->>'note', ''), 280);

    SELECT coalesce(array_agg(DISTINCT value::uuid), ARRAY[]::uuid[])
      INTO v_selected_ids
    FROM jsonb_array_elements_text(coalesce(v_item->'optionIds', '[]'::jsonb));

    IF EXISTS (
      SELECT 1 FROM unnest(v_selected_ids) selected_id
      LEFT JOIN public.options o ON o.id = selected_id
      LEFT JOIN public.option_groups g ON g.id = o.group_id
      WHERE o.id IS NULL OR NOT o.available OR g.product_id <> v_product.id
    ) THEN
      RAISE EXCEPTION 'Uma opção selecionada é inválida ou indisponível.' USING ERRCODE = 'P0001';
    END IF;

    FOR v_group IN SELECT * FROM public.option_groups WHERE product_id = v_product.id
    LOOP
      SELECT count(*) INTO v_selected_count FROM public.options o
      WHERE o.group_id = v_group.id AND o.id = ANY(v_selected_ids);
      IF v_selected_count < v_group.min_select OR v_selected_count > v_group.max_select
         OR (v_group.required AND v_selected_count = 0) THEN
        RAISE EXCEPTION 'Revise as escolhas obrigatórias e os limites de opções.' USING ERRCODE = 'P0001';
      END IF;
    END LOOP;

    SELECT v_unit_price + coalesce(sum(o.price_delta_cents), 0)
      INTO v_unit_price FROM public.options o WHERE o.id = ANY(v_selected_ids);
    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
  END LOOP;

  IF v_change IS NOT NULL AND v_change < v_subtotal + v_delivery_fee THEN
    RAISE EXCEPTION 'O valor para troco deve ser igual ou maior que o total.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.customers (name, phone)
  VALUES (v_name, v_phone)
  ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
  RETURNING * INTO v_customer;

  INSERT INTO public.orders (
    customer_id, customer_name, customer_phone, fulfillment,
    postal_code, street, address_number, complement, neighborhood, city, state, reference, distance_km,
    subtotal_cents, delivery_fee_cents, total_cents, status,
    payment_timing, payment_method, payment_status, change_for_cents
  ) VALUES (
    v_customer.id, v_name, v_phone, v_fulfillment,
    CASE WHEN v_fulfillment = 'delivery' THEN regexp_replace(payload->>'postalCode', '\D', '', 'g') END,
    CASE WHEN v_fulfillment = 'delivery' THEN btrim(payload->>'street') END,
    CASE WHEN v_fulfillment = 'delivery' THEN btrim(payload->>'number') END,
    CASE WHEN v_fulfillment = 'delivery' THEN nullif(btrim(payload->>'complement'), '') END,
    CASE WHEN v_fulfillment = 'delivery' THEN btrim(payload->>'neighborhood') END,
    CASE WHEN v_fulfillment = 'delivery' THEN btrim(payload->>'city') END,
    CASE WHEN v_fulfillment = 'delivery' THEN upper(btrim(payload->>'state')) END,
    CASE WHEN v_fulfillment = 'delivery' THEN nullif(btrim(payload->>'reference'), '') END,
    v_distance, v_subtotal, v_delivery_fee, v_subtotal + v_delivery_fee, 'NEW',
    v_payment_timing, v_payment_method, 'PENDING', v_change
  ) RETURNING * INTO v_order;

  FOR v_item IN SELECT value FROM jsonb_array_elements(payload->'items')
  LOOP
    v_quantity := (v_item->>'quantity')::integer;
    SELECT * INTO v_product FROM public.products WHERE id = (v_item->>'productId')::uuid;
    v_base_price := coalesce(v_product.promo_price_cents, v_product.price_cents);
    SELECT coalesce(array_agg(DISTINCT value::uuid), ARRAY[]::uuid[])
      INTO v_selected_ids FROM jsonb_array_elements_text(coalesce(v_item->'optionIds', '[]'::jsonb));
    SELECT v_base_price + coalesce(sum(o.price_delta_cents), 0)
      INTO v_unit_price FROM public.options o WHERE o.id = ANY(v_selected_ids);
    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, base_price_cents, unit_price_cents, subtotal_cents, note)
    VALUES (v_order.id, v_product.id, v_product.name, v_quantity, v_base_price, v_unit_price, v_unit_price * v_quantity, left(coalesce(v_item->>'note', ''), 280))
    RETURNING id INTO v_order_item_id;
    FOR v_option IN
      SELECT o.id, o.name, o.price_delta_cents, g.name AS group_name
      FROM public.options o JOIN public.option_groups g ON g.id = o.group_id
      WHERE o.id = ANY(v_selected_ids)
    LOOP
      INSERT INTO public.order_item_options (order_item_id, option_id, group_name, option_name, price_delta_cents)
      VALUES (v_order_item_id, v_option.id, v_option.group_name, v_option.name, v_option.price_delta_cents);
    END LOOP;
  END LOOP;

  INSERT INTO public.order_status_history (order_id, status, responsible_label)
  VALUES (v_order.id, 'NEW', 'Cliente');
  INSERT INTO public.payments (order_id, timing, method, status, amount_cents)
  VALUES (v_order.id, v_payment_timing, v_payment_method, 'PENDING', v_order.total_cents);
  INSERT INTO public.marketing_consents (customer_id, order_id, accepted, consent_text)
  VALUES (v_customer.id, v_order.id, coalesce((payload->>'marketingConsent')::boolean, false), 'Aceito receber ofertas e novidades desta loja.');

  RETURN jsonb_build_object(
    'orderId', v_order.id,
    'orderNumber', v_order.order_number,
    'trackingCode', v_order.tracking_code,
    'status', v_order.status,
    'paymentStatus', v_order.payment_status,
    'subtotalCents', v_order.subtotal_cents,
    'deliveryFeeCents', v_order.delivery_fee_cents,
    'totalCents', v_order.total_cents
  );
END;
$$;
REVOKE ALL ON FUNCTION public.create_public_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_order(jsonb) TO anon, authenticated, service_role;