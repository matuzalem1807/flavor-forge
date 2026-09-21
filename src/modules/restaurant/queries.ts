import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import { resolveImage } from "./images";
import type { Category, Product, Restaurant, StoreStatus } from "./types";

/** Cardápio público: restaurante + categorias ativas + produtos. */
export const menuQueryOptions = queryOptions({
  queryKey: ["menu"],
  queryFn: async (): Promise<{
    restaurant: Restaurant;
    categories: Category[];
    products: Product[];
  }> => {
    const [restaurantRes, categoriesRes, productsRes] = await Promise.all([
      supabase.from("restaurant").select("*").limit(1).maybeSingle(),
      supabase.from("categories").select("*").eq("active", true).order("sort_order"),
      supabase.from("products").select("*").order("sort_order"),
    ]);

    if (restaurantRes.error) throw restaurantRes.error;
    if (categoriesRes.error) throw categoriesRes.error;
    if (productsRes.error) throw productsRes.error;
    if (!restaurantRes.data) throw new Error("Restaurante não configurado.");

    const r = restaurantRes.data;

    return {
      restaurant: {
        id: r.id,
        name: r.name,
        description: r.description,
        logoInitial: r.logo_initial,
        coverImage: resolveImage(r.cover_image_key),
        address: r.address,
        whatsapp: r.whatsapp,
        instagram: r.instagram,
        averagePrepMinutes: r.average_prep_minutes,
        status: r.status as StoreStatus,
        rating: Number(r.rating),
        ratingCount: r.rating_count,
        primaryColor: r.primary_color,
        secondaryColor: r.secondary_color,
      },
      categories: (categoriesRes.data ?? []).map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        order: c.sort_order,
        active: c.active,
      })),
      products: (productsRes.data ?? []).map((p) => ({
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
      })),
    };
  },
});
