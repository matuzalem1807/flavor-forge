import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useCart } from "@/modules/cart/cart-context";
import { menuQueryOptions } from "@/modules/restaurant/queries";
import type { Product } from "@/modules/restaurant/types";
import { CartBar } from "@/modules/restaurant/components/CartBar";
import { CategoryChips } from "@/modules/restaurant/components/CategoryChips";
import { FeaturedProductCard } from "@/modules/restaurant/components/FeaturedProductCard";
import { ProductRow } from "@/modules/restaurant/components/ProductRow";
import { RestaurantHero } from "@/modules/restaurant/components/RestaurantHero";
import { RestaurantTopBar } from "@/modules/restaurant/components/RestaurantTopBar";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(menuQueryOptions),
  head: () => ({
    meta: [
      { title: "João Burguer — Hambúrgueres artesanais com entrega" },
      {
        name: "description",
        content:
          "Cardápio online do João Burguer: smash burgers, combos, porções e bebidas com entrega ou retirada.",
      },
      { property: "og:title", content: "João Burguer — Peça online" },
      {
        property: "og:description",
        content:
          "Smash burgers feitos na hora, entrega em cerca de 12 minutos. Monte seu pedido pelo cardápio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RestaurantPage,
});

function RestaurantPage() {
  const { data } = useSuspenseQuery(menuQueryOptions);
  const { restaurant, categories, products } = data;
  const navigate = useNavigate();
  const { itemCount, subtotalCents } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const activeCategoryId = selectedCategoryId ?? categories[0]?.id ?? null;

  const featured = products.filter((p) => p.featured && p.available);
  const listed = products.filter((p) => p.categoryId === activeCategoryId);

  const openProduct = (product: Product) => {
    if (!product.available) return;
    void navigate({ to: "/produto/$slug", params: { slug: product.slug } });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-page font-body text-cream">
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-brand/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-20 size-64 rounded-full bg-accent-warm/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 size-60 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-lg">
        <RestaurantTopBar restaurant={restaurant} />
        <RestaurantHero restaurant={restaurant} />

        {activeCategoryId ? (
          <CategoryChips
            categories={categories}
            activeId={activeCategoryId}
            onSelect={setSelectedCategoryId}
          />
        ) : null}

        {featured.length > 0 ? (
          <section className="relative z-20 mt-5 px-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-tight">Em destaque</h2>
            </div>
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
              {featured.map((product) => (
                <FeaturedProductCard
                  key={product.id}
                  product={product}
                  onAdd={openProduct}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="relative z-20 mt-6 px-4 pb-32">
          <h2 className="font-display text-lg font-bold tracking-tight">Cardápio</h2>
          <div className="mt-3 space-y-3">
            {listed.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-cream/60">
                Nenhum produto nesta categoria por enquanto.
              </p>
            ) : (
              listed.map((product) => (
                <ProductRow key={product.id} product={product} onAdd={openProduct} />
              ))
            )}
          </div>
        </section>
      </div>

      <CartBar itemCount={itemCount} totalCents={subtotalCents} />
    </div>
  );
}
