import { formatBRL } from "../pricing";

export function CartBar({
  itemCount,
  totalCents,
}: {
  itemCount: number;
  totalCents: number;
}) {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30">
      <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 p-2.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        <div className="relative grid shrink-0 place-items-center">
          <span className="text-2xl">🛒</span>
          <span className="absolute -top-1 -right-2 grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
            {itemCount}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-cream/60">
            {itemCount === 1 ? "1 item no carrinho" : `${itemCount} itens no carrinho`}
          </p>
          <p className="font-display text-lg leading-none font-bold">
            {formatBRL(totalCents)}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_var(--brand-soft)]"
        >
          Ver carrinho
        </button>
      </div>
    </div>
  );
}
