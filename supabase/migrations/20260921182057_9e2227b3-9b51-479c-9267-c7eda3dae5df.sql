CREATE TABLE public.option_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  selection_type text NOT NULL DEFAULT 'single' CHECK (selection_type IN ('single','multiple')),
  required boolean NOT NULL DEFAULT false,
  min_select integer NOT NULL DEFAULT 0 CHECK (min_select >= 0),
  max_select integer NOT NULL DEFAULT 1 CHECK (max_select >= 1),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT option_groups_min_max CHECK (min_select <= max_select)
);

CREATE TABLE public.options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.option_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_delta_cents integer NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX option_groups_product_id_idx ON public.option_groups (product_id);
CREATE INDEX options_group_id_idx ON public.options (group_id);

GRANT SELECT ON public.option_groups TO anon, authenticated;
GRANT SELECT ON public.options TO anon, authenticated;
GRANT ALL ON public.option_groups TO service_role;
GRANT ALL ON public.options TO service_role;

ALTER TABLE public.option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cardapio publico: grupos de opcoes visiveis para todos"
  ON public.option_groups FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cardapio publico: opcoes visiveis para todos"
  ON public.options FOR SELECT TO anon, authenticated USING (true);

CREATE TRIGGER update_option_groups_updated_at BEFORE UPDATE ON public.option_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON public.options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.products (category_id, slug, name, description, image_key, price_cents, promo_price_cents, available, featured, tags, sort_order)
VALUES (
  (SELECT id FROM public.categories WHERE slug = 'combos'),
  'combo-joao',
  'Combo João',
  'Hambúrguer + batata rústica + bebida. Escolha o seu combo.',
  'smash-duplo-bacon',
  4590,
  NULL,
  true,
  false,
  '{"Escolha obrigatória"}',
  1
);

INSERT INTO public.option_groups (product_id, name, selection_type, required, min_select, max_select, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'smash-duplo-bacon'), 'Ponto da carne', 'single', true, 1, 1, 1),
  ((SELECT id FROM public.products WHERE slug = 'joao-classico'), 'Adicionais', 'multiple', false, 0, 3, 1),
  ((SELECT id FROM public.products WHERE slug = 'crispy-chicken'), 'Escolha o molho', 'single', true, 1, 1, 1),
  ((SELECT id FROM public.products WHERE slug = 'combo-joao'), 'Escolha o hambúrguer', 'single', true, 1, 1, 1),
  ((SELECT id FROM public.products WHERE slug = 'combo-joao'), 'Escolha a bebida', 'single', true, 1, 1, 2);

INSERT INTO public.options (group_id, name, price_delta_cents, available, sort_order)
SELECT g.id, v.name, v.delta, v.available, v.ord
FROM (VALUES
  ('smash-duplo-bacon', 'Ponto da carne', 'Ao ponto', 0, true, 1),
  ('smash-duplo-bacon', 'Ponto da carne', 'Bem passado', 0, true, 2),
  ('joao-classico', 'Adicionais', 'Bacon extra', 600, true, 1),
  ('joao-classico', 'Adicionais', 'Cheddar extra', 400, true, 2),
  ('joao-classico', 'Adicionais', 'Ovo', 300, true, 3),
  ('joao-classico', 'Adicionais', 'Cebola caramelizada', 350, false, 4),
  ('crispy-chicken', 'Escolha o molho', 'Barbecue', 0, true, 1),
  ('crispy-chicken', 'Escolha o molho', 'Maionese de alho', 0, true, 2),
  ('crispy-chicken', 'Escolha o molho', 'Molho picante', 200, true, 3),
  ('combo-joao', 'Escolha o hambúrguer', 'João Clássico', 0, true, 1),
  ('combo-joao', 'Escolha o hambúrguer', 'Smash Duplo Bacon', 500, true, 2),
  ('combo-joao', 'Escolha a bebida', 'Refrigerante lata', 0, true, 1),
  ('combo-joao', 'Escolha a bebida', 'Suco natural', 400, true, 2)
) AS v(product_slug, group_name, name, delta, available, ord)
JOIN public.products p ON p.slug = v.product_slug
JOIN public.option_groups g ON g.product_id = p.id AND g.name = v.group_name;