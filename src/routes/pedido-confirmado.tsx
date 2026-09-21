import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock3, Copy, Home } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/modules/restaurant/components/GlassCard";
import { formatBRL } from "@/modules/restaurant/pricing";

const searchSchema = z.object({
  numero: z.coerce.number().int().positive(),
  codigo: z.string().uuid(),
  total: z.coerce.number().int().nonnegative(),
  pagamento: z.enum(["online", "on_delivery"]),
});

export const Route = createFileRoute("/pedido-confirmado")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Pedido confirmado — João Burguer" },
      { name: "description", content: "Confirmação do pedido feito no João Burguer." },
      { property: "og:title", content: "Pedido confirmado — João Burguer" },
      { property: "og:description", content: "Seu pedido foi recebido pelo João Burguer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfirmedOrderPage,
});

function ConfirmedOrderPage() {
  const { numero, codigo, total, pagamento } = Route.useSearch();
  const [copied, setCopied] = useState(false);
  const shortCode = codigo.split("-")[0]?.toUpperCase() ?? codigo.toUpperCase();

  const copyCode = async () => {
    await navigator.clipboard.writeText(codigo);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="min-h-screen bg-page px-4 py-10 font-body text-cream">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-accent-warm text-ink">
          <Check className="size-8" strokeWidth={3} />
        </div>
        <p className="mt-5 text-xs font-bold uppercase text-accent-warm">Pedido recebido</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Pedido #{numero}</h1>
        <p className="mt-2 text-sm leading-relaxed text-cream/60">O João Burguer já recebeu seu pedido.</p>

        <GlassCard className="mt-7 p-5 text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-sm text-cream/60">Total confirmado</span>
            <strong className="font-display text-xl text-accent-warm">{formatBRL(total)}</strong>
          </div>
          <div className="mt-4 flex items-start gap-3">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-brand" />
            <div>
              <p className="text-sm font-semibold">Aguardando aceite da loja</p>
              <p className="mt-1 text-xs leading-relaxed text-cream/50">
                {pagamento === "online"
                  ? "O pagamento online permanece pendente até a próxima etapa da integração."
                  : "O pagamento será feito no recebimento, como você escolheu."}
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left">
          <p className="text-xs text-cream/50">Código privado do pedido</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <code className="font-display text-lg font-bold text-cream">{shortCode}</code>
            <Button type="button" variant="ghost" size="icon" onClick={copyCode} aria-label="Copiar código" className="rounded-xl text-cream hover:bg-white/10 hover:text-cream">
              <Copy />
            </Button>
          </div>
          {copied ? <p className="mt-1 text-xs text-accent-warm" role="status">Código copiado.</p> : null}
          <p className="mt-2 text-[11px] leading-relaxed text-cream/40">Guarde este código. Ele será usado para acompanhar o pedido.</p>
        </div>

        <Button asChild className="mt-6 h-11 w-full rounded-xl bg-brand font-semibold text-cream hover:bg-brand/90">
          <Link to="/"><Home /> Voltar ao cardápio</Link>
        </Button>
      </div>
    </main>
  );
}