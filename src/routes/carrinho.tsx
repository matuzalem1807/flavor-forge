import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart, type CartLineWithSubtotal } from "@/modules/cart/cart-context";
import { GlassCard } from "@/modules/restaurant/components/GlassCard";
import { formatBRL } from "@/modules/restaurant/pricing";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Seu carrinho — João Burguer" },
      {
        name: "description",
        content:
          "Confira os produtos, escolhas, quantidades e o subtotal do seu pedido no João Burguer.",
      },
      { property: "og:title", content: "Seu carrinho — João Burguer" },
      {
        property: "og:description",
        content: "Revise os itens do seu pedido no cardápio online do João Burguer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function QuantityControl({ line }: { line: CartLineWithSubtotal }) {
  const { updateQuantity } = useCart();

  return (
    <div
      className="flex h-9 items-center rounded-lg border border-white/15 bg-white/10"
      aria-label={`Quantidade de ${line.name}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Diminuir quantidade de ${line.name}`}
        onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
        className="size-9 rounded-lg text-cream hover:bg-white/10 hover:text-cream"
      >
        <Minus aria-hidden="true" />
      </Button>
      <span className="w-7 text-center font-display text-sm font-bold" aria-live="polite">
        {line.quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Aumentar quantidade de ${line.name}`}
        disabled={line.quantity >= 20}
        onClick={() => updateQuantity(line.lineId, Math.min(20, line.quantity + 1))}
        className="size-9 rounded-lg text-cream hover:bg-white/10 hover:text-cream"
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}

function CartLineCard({ line }: { line: CartLineWithSubtotal }) {
  const { removeLine } = useCart();

  return (
    <GlassCard className="overflow-hidden p-3">
      <div className="flex gap-3">
        <img
          src={line.image}
          alt=""
          width={112}
          height={112}
          className="size-20 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-display text-[15px] leading-tight font-bold">{line.name}</h2>
              <p className="mt-1 text-xs font-semibold text-accent-warm">
                {formatBRL(line.unitPriceCents)} cada
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remover ${line.name}`}
              onClick={() => removeLine(line.lineId)}
              className="-mt-2 -mr-2 size-9 shrink-0 rounded-lg text-cream/50 hover:bg-white/10 hover:text-cream"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>

          {line.options.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs leading-snug text-cream/60">
              {line.options.map((option) => (
                <li key={option.optionId}>
                  <span className="text-cream/40">{option.groupName}:</span> {option.name}
                  {option.priceDeltaCents > 0
                    ? ` (+ ${formatBRL(option.priceDeltaCents)})`
                    : ""}
                </li>
              ))}
            </ul>
          ) : null}

          {line.note ? (
            <p className="mt-2 rounded-lg bg-white/5 px-2 py-1.5 text-xs leading-snug text-cream/60">
              <span className="font-semibold text-cream/80">Observação:</span> {line.note}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
        <QuantityControl line={line} />
        <p className="font-display text-base font-bold">{formatBRL(line.subtotalCents)}</p>
      </div>
    </GlassCard>
  );
}

function EmptyCart() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="grid size-20 place-items-center rounded-full border border-white/15 bg-white/10 text-accent-warm backdrop-blur-2xl">
        <ShoppingBag aria-hidden="true" className="size-9" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold">Seu carrinho está vazio</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/60">
        Escolha seus favoritos no cardápio e eles aparecerão aqui.
      </p>
      <Button
        asChild
        className="mt-6 h-11 rounded-xl bg-brand px-6 font-semibold text-cream hover:bg-brand/90"
      >
        <Link to="/">Ver cardápio</Link>
      </Button>
    </main>
  );
}

function CartPage() {
  const { lines, itemCount, subtotalCents, clear } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-page font-body text-cream">
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-brand/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-32 -right-20 size-64 rounded-full bg-accent-warm/25 blur-3xl" />

      {lines.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="relative mx-auto w-full max-w-lg pb-40">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-page/80 px-4 backdrop-blur-2xl">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-xl text-cream hover:bg-white/10 hover:text-cream"
            >
              <Link to="/" aria-label="Voltar ao cardápio">
                <ArrowLeft aria-hidden="true" />
              </Link>
            </Button>
            <div className="text-center">
              <h1 className="font-display text-lg font-bold">Seu carrinho</h1>
              <p className="text-[11px] text-cream/50">
                {itemCount === 1 ? "1 item" : `${itemCount} itens`}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmClear(true)}
              className="h-9 rounded-lg px-2 text-xs font-semibold text-cream/60 hover:bg-white/10 hover:text-cream"
            >
              Limpar
            </Button>
          </header>

          <main className="space-y-3 px-4 pt-4">
            {lines.map((line) => (
              <CartLineCard key={line.lineId} line={line} />
            ))}

            <Link
              to="/"
              className="inline-flex items-center gap-1 py-2 text-sm font-semibold text-accent-warm"
            >
              Adicionar mais itens <Plus aria-hidden="true" className="size-4" />
            </Link>

            <section className="border-t border-white/10 pt-4" aria-labelledby="cart-summary-title">
              <h2 id="cart-summary-title" className="font-display text-base font-bold">
                Resumo
              </h2>
              <div className="mt-3 flex items-center justify-between text-sm text-cream/65">
                <span>Subtotal</span>
                <strong className="font-display text-base text-cream">
                  {formatBRL(subtotalCents)}
                </strong>
              </div>
              <p className="mt-2 text-xs text-cream/45">
                Entrega ou retirada será definida ao continuar.
              </p>
            </section>
          </main>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-page/85 p-4 backdrop-blur-2xl">
            <div className="mx-auto w-full max-w-lg">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs text-cream/60">Subtotal</span>
                <span className="font-display text-lg font-bold">{formatBRL(subtotalCents)}</span>
              </div>
              <Button
                asChild
                className="h-12 w-full justify-between rounded-xl bg-brand px-4 font-semibold text-cream"
              >
                <Link to="/checkout">
                  <span>Continuar</span>
                  <ChevronRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          {confirmClear ? (
            <div
              className="fixed inset-0 z-50 grid place-items-center bg-page/80 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-cart-title"
              aria-describedby="clear-cart-description"
            >
              <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-page p-5 shadow-2xl">
                <h2 id="clear-cart-title" className="font-display text-lg font-bold">
                  Limpar o carrinho?
                </h2>
                <p id="clear-cart-description" className="mt-2 text-sm text-cream/60">
                  Todos os produtos e escolhas serão removidos.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmClear(false)}
                    className="border-white/15 bg-white/10 text-cream hover:bg-white/15 hover:text-cream"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      clear();
                      setConfirmClear(false);
                    }}
                  >
                    Limpar carrinho
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}