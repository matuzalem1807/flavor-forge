import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import { resolveImage } from "./images";
import type { Product } from "./types";

export interface Option {
  id: string;
  name: string;
  priceDeltaCents: number;
  available: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  selectionType: "single" | "multiple";
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: Option[];
}

export interface ProductDetail {
  product: Product;
  groups: OptionGroup[];
}

/** Produto do cardápio com seus grupos de opções e adicionais. */
export const productQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<ProductDetail | null> => {
      const { data: p, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!p) return null;

      const { data: groups, error: groupsError } = await supabase
        .from("option_groups")
        .select("*, options(*)")
        .eq("product_id", p.id)
        .order("sort_order");

      if (groupsError) throw groupsError;

      const product: Product = {
        id: p.id,
        categoryId: p.category_id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        image: resolveImage(p.image_key),
        priceCents: p.price_cents,
        promoPriceCents: p.promo_price_cents ?? undefined,
        available: p.available,
        featured: p.featured,
        tags: p.tags ?? [],
        order: p.sort_order,
      };

      return {
        product,
        groups: (groups ?? []).map((g) => ({
          id: g.id,
          name: g.name,
          selectionType: g.selection_type === "multiple" ? "multiple" : "single",
          required: g.required,
          minSelect: g.min_select,
          maxSelect: g.max_select,
          options: (g.options ?? [])
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((o) => ({
              id: o.id,
              name: o.name,
              priceDeltaCents: o.price_delta_cents,
              available: o.available,
            })),
        })),
      };
    },
  });
