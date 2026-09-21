CREATE TABLE public.delivery_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_mode text NOT NULL DEFAULT 'simulated' CHECK (calculation_mode IN ('simulated','maps_api')),
  max_distance_km numeric(5,2) NOT NULL DEFAULT 8 CHECK (max_distance_km > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.delivery_settings TO anon, authenticated;
GRANT ALL ON public.delivery_settings TO service_role;

ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Checkout publico: configuracao de entrega visivel"
  ON public.delivery_settings FOR SELECT TO anon, authenticated USING (active = true);

CREATE TABLE public.delivery_ranges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_settings_id uuid NOT NULL REFERENCES public.delivery_settings(id) ON DELETE CASCADE,
  min_distance_km numeric(5,2) NOT NULL CHECK (min_distance_km >= 0),
  max_distance_km numeric(5,2) NOT NULL CHECK (max_distance_km > min_distance_km),
  fee_cents integer NOT NULL CHECK (fee_cents >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT delivery_ranges_unique_bounds UNIQUE (delivery_settings_id, min_distance_km, max_distance_km)
);

GRANT SELECT ON public.delivery_ranges TO anon, authenticated;
GRANT ALL ON public.delivery_ranges TO service_role;

ALTER TABLE public.delivery_ranges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Checkout publico: faixas de entrega visiveis"
  ON public.delivery_ranges FOR SELECT TO anon, authenticated USING (active = true);

CREATE INDEX delivery_ranges_settings_idx
  ON public.delivery_ranges (delivery_settings_id, sort_order);

CREATE TRIGGER update_delivery_settings_updated_at BEFORE UPDATE ON public.delivery_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_ranges_updated_at BEFORE UPDATE ON public.delivery_ranges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();