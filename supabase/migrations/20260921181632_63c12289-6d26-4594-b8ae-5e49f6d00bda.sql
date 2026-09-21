CREATE TABLE public.restaurant (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  logo_initial text NOT NULL DEFAULT 'J',
  cover_image_key text,
  address text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  average_prep_minutes integer NOT NULL DEFAULT 20,
  status text NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto','fechado','pausado')),
  rating numeric(2,1) NOT NULL DEFAULT 5.0,
  rating_count text NOT NULL DEFAULT '0',
  primary_color text NOT NULL DEFAULT '#FF5A1F',
  secondary_color text NOT NULL DEFAULT '#FFC24B',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_key text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  promo_price_cents integer CHECK (promo_price_cents IS NULL OR promo_price_cents >= 0),
  available boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_category_id_idx ON public.products (category_id);

GRANT SELECT ON public.restaurant TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.restaurant TO service_role;
GRANT ALL ON public.categories TO service_role;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.restaurant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cardapio publico: restaurante visivel para todos"
  ON public.restaurant FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cardapio publico: categorias visiveis para todos"
  ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cardapio publico: produtos visiveis para todos"
  ON public.products FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_restaurant_updated_at BEFORE UPDATE ON public.restaurant
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.restaurant (name, description, logo_initial, cover_image_key, address, whatsapp, instagram, average_prep_minutes, status, rating, rating_count, primary_color, secondary_color)
VALUES (
  'João Burguer',
  'Hambúrgueres artesanais, pão brioche e ingredientes frescos. Feito na hora, entregue quentinho.',
  'J',
  'capa-restaurante',
  'Rua das Flores, 128',
  '5511999990000',
  'joaoburguer',
  12,
  'aberto',
  4.9,
  '2.3k',
  '#FF5A1F',
  '#FFC24B'
);

INSERT INTO public.categories (slug, name, sort_order, active) VALUES
  ('hamburgueres', 'Hambúrgueres', 1, true),
  ('combos', 'Combos', 2, true),
  ('porcoes', 'Porções', 3, true),
  ('bebidas', 'Bebidas', 4, true),
  ('sobremesas', 'Sobremesas', 5, true);

INSERT INTO public.products (category_id, slug, name, description, image_key, price_cents, promo_price_cents, available, featured, tags, sort_order)
VALUES
  ((SELECT id FROM public.categories WHERE slug = 'hamburgueres'), 'smash-duplo-bacon', 'Smash Duplo Bacon', 'Dois smash, bacon crocante, cheddar', 'smash-duplo-bacon', 2990, 2490, true, true, '{}', 1),
  ((SELECT id FROM public.categories WHERE slug = 'porcoes'), 'batata-rustica', 'Batata Rústica', 'Com alecrim e parmesão', 'batata-rustica', 1890, NULL, true, true, '{}', 1),
  ((SELECT id FROM public.categories WHERE slug = 'hamburgueres'), 'joao-classico', 'João Clássico', 'Pão brioche, blend 160g, cheddar, alface, tomate e maionese da casa.', 'joao-classico', 2490, NULL, true, false, '{"+ Adicionais","Retirada"}', 2),
  ((SELECT id FROM public.categories WHERE slug = 'hamburgueres'), 'crispy-chicken', 'Crispy Chicken', 'Frango empanado crocante, maionese de alho, picles e cebola roxa.', 'crispy-chicken', 2690, NULL, true, false, '{"Escolha o molho","Entrega"}', 3),
  ((SELECT id FROM public.categories WHERE slug = 'hamburgueres'), 'veggie-beet', 'Veggie Beet', 'Patty de beterraba, abacate e maionese de ervas.', 'veggie-beet', 2790, NULL, false, false, '{}', 4);