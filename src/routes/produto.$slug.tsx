import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useCart, type CartLineOption } from "@/modules/cart/cart-context";
import { GlassCard } from "@/modules/restaurant/components/GlassCard";
import { effectivePriceCents, formatBRL, hasPromo } from "@/modules/restaurant/pricing";
import { productQueryOptions } from "@/modules/restaurant/product-queries";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productQueryOptions(params.slug)),
  head: ({ params }) => ({
    meta: [
      { title: `Peça agora — João Burguer` },
      {
        name: "description",
        content: `Monte seu pedido de ${params.slug.replace(/-/g, " ")} no João Burguer: escolha as opções, os adicionais e finalize pelo cardápio online.`,
      },
      { property: "og:title", content: "Monte seu pedido — João Burguer" },
      {
        property: "og:description",
        content:
          "Escolha opções e adicionais, adicione observações e envie seu pedido pelo cardápio do João Burguer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQueryOptions(slug));
  const navigate = useNavigate();
  const { addLine } = useCart();

  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-6 text-center font-body text-cream">
        <p className="text-cream/70">Este produto não está mais no cardápio.</p>
        <Link
          to="/"
          className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white"
        >
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  const { product, groups } = data;

  const toggle = (
    groupId: string,
    optionId: string,
    type: "single" | "multiple",
    maxSelect: number,
  ) => {
    setError(null);
    setSelected((current) => {
      const chosen = current[groupId] ?? [];
      if (type === "single") return { ...current, [groupId]: [optionId] };
      if (chosen.includes(optionId)) {
        return { ...current, [groupId]: chosen.filter((id) => id !== optionId) };
      }
      if (chosen.length >= maxSelect) return current;
      return { ...current, [groupId]: [...chosen, optionId] };
    });
  };

  const chosenOptions: CartLineOption[] = groups.flatMap((group) =>
    (selected[group.id] ?? []).flatMap((optionId) => {
      const option = group.options.find((o) => o.id === optionId);
      if (!option) return [];
      return [
        {
          optionId: option.id,
          groupName: group.name,
          name: option.name,
          priceDeltaCents: option.priceDeltaCents,
        },
      ];
    }),
  );

  const basePriceCents = effectivePriceCents(product);
  const optionsCents = chosenOptions.reduce((sum, o) => sum + o.priceDeltaCents, 0);
  const unitPriceCents = basePriceCents + optionsCents;
  const totalCents = unitPriceCents * quantity;

  const handleAdd = () => {
    if (!product.available) return;

    for (const group of groups) {
      const chosen = selected[group.id] ?? [];
      const min = group.required ? Math.max(1, group.minSelect) : group.minSelect;
      if (chosen.length < min) {
        setError(
          min === 1
            ? `Escolha uma opção em "${group.name}".`
            : `Escolha ao menos ${min} opções em "${group.name}".`,
        );
        return;
      }
      if (chosen.length > group.maxSelect) {
        setError(`Escolha no máximo ${group.maxSelect} opções em "${group.name}".`);
        return;
      }
    }

    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      unitPriceCents,
      quantity,
      options: chosenOptions,
      note: note.trim(),
    });

    void navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-page font-body text-cream">
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-brand/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 -right-16 size-64 rounded-full bg-accent-warm/30 blur-3xl" />

      <div className="relative mx-auto w-full max-w-lg pb-36">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            width={816}
            height={816}
            className="h-64 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-page via-page/40 to-transparent" />
          <Link
            to="/"
            aria-label="Voltar ao cardápio"
            className="absolute top-4 left-4 grid size-10 place-items-center rounded-full border border-white/20 bg-white/15 text-lg backdrop-blur-xl"
          >
            ←
          </Link>
        </div>

        <div className="-mt-8 px-4">
          <GlassCard className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-xl leading-tight font-bold">{product.name}</h1>
              <div className="flex shrink-0 flex-col items-end leading-none">
                {hasPromo(product) ? (
                  <span className="text-[11px] text-cream/40 line-through">
                    {formatBRL(product.priceCents)}
                  </span>
                ) : null}
                <span className="font-display text-lg font-bold text-accent-warm">
                  {formatBRL(basePriceCents)}
                </span>
              </div>
            </div>
            <p className="mt-2 text-[13px] leading-snug text-cream/70">
              {product.description}
            </p>
            {!product.available ? (
              <p className="mt-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[12px] font-medium text-cream/70">
                Produto indisponível no momento.
              </p>
            ) : null}
          </GlassCard>
        </div>

        {groups.map((group) => {
          const chosen = selected[group.id] ?? [];
          return (
            <section key={group.id} className="mt-5 px-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-base font-bold tracking-tight">
                  {group.name}
                </h2>
                <span className="text-[11px] font-medium text-cream/50">
                  {group.required ? "Obrigatório" : "Opcional"}
                  {group.selectionType === "multiple"
                    ? ` · até ${group.maxSelect}`
                    : ""}
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {group.options.map((option) => {
                  const active = chosen.includes(option.id);
                  return (
                    <GlassCard
                      key={option.id}
                      className={active ? "border-brand/70 p-0" : "p-0"}
                    >
                      <button
                        type="button"
                        disabled={!option.available || !product.available}
                        onClick={() =>
                          toggle(
                            group.id,
                            option.id,
                            group.selectionType,
                            group.maxSelect,
                          )
                        }
                        className="flex w-full items-center gap-3 p-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span
                          className={
                            group.selectionType === "multiple"
                              ? `grid size-5 shrink-0 place-items-center rounded-md border text-[11px] font-bold ${active ? "border-brand bg-brand text-white" : "border-white/30"}`
                              : `grid size-5 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${active ? "border-brand bg-brand text-white" : "border-white/30"}`
                          }
                        >
                          {active ? "✓" : ""}
                        </span>
                        <span className="min-w-0 flex-1 text-[14px] font-medium">
                          {option.name}
                          {!option.available ? (
                            <span className="ml-2 text-[11px] text-cream/50">
                              indisponível
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-[13px] font-semibold text-cream/70">
                          {option.priceDeltaCents > 0
                            ? `+ ${formatBRL(option.priceDeltaCents)}`
                            : "grátis"}
                        </span>
                      </button>
                    </GlassCard>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="mt-5 px-4">
          <h2 className="font-display text-base font-bold tracking-tight">Observação</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="Ex.: sem cebola, ponto da carne bem passado..."
            className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 p-3 text-[14px] text-cream placeholder:text-cream/40 focus:border-brand focus:outline-none"
          />
        </section>

        {error ? (
          <p className="mt-4 mx-4 rounded-xl border border-brand/60 bg-brand/15 px-3 py-2 text-[13px] font-medium text-cream">
            {error}
          </p>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-page/80 p-4 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-lg items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-lg font-bold text-cream/80"
            >
              −
            </button>
            <span className="min-w-4 text-center font-display font-bold">{quantity}</span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="text-lg font-bold text-cream/80"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={!product.available}
            onClick={handleAdd}
            className="flex flex-1 items-center justify-between gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_var(--brand-soft)] disabled:opacity-50"
          >
            <span>{product.available ? "Adicionar" : "Indisponível"}</span>
            <span className="font-display font-bold">{formatBRL(totalCents)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
