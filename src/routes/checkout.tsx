import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, CreditCard, MapPin, ShoppingBag, Store } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkoutSchema } from "@/modules/checkout/checkout-schema";
import { deliveryQueryOptions, findDeliveryFee } from "@/modules/checkout/delivery-queries";
import { useCart } from "@/modules/cart/cart-context";
import { GlassCard } from "@/modules/restaurant/components/GlassCard";
import { formatBRL } from "@/modules/restaurant/pricing";

type Fulfillment = "delivery" | "pickup";
type PaymentTiming = "online" | "on_delivery";
type PaymentMethod = "pix" | "card" | "cash";
type Errors = Record<string, string>;

export const Route = createFileRoute("/checkout")({
  loader: ({ context }) => context.queryClient.ensureQueryData(deliveryQueryOptions),
  head: () => ({
    meta: [
      { title: "Checkout — João Burguer" },
      { name: "description", content: "Informe seus dados, escolha entrega ou retirada e a forma de pagamento." },
      { property: "og:title", content: "Finalize seu pedido — João Burguer" },
      { property: "og:description", content: "Checkout do cardápio online do João Burguer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="grid min-h-screen place-items-center bg-page px-6 text-center text-cream">
      <div>
        <p>Não foi possível carregar as opções de entrega.</p>
        <p className="mt-2 text-sm text-cream/50">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => <div>Checkout não encontrado.</div>,
  component: CheckoutPage,
});

const inputClass = "h-11 rounded-xl border-white/15 bg-white/10 text-cream placeholder:text-cream/35 focus-visible:ring-brand";

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={name} className="text-xs text-cream/70">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-destructive" role="alert">{error}</p> : null}
    </div>
  );
}

function CheckoutPage() {
  const { lines, itemCount, subtotalCents } = useCart();
  const { data: delivery } = useSuspenseQuery(deliveryQueryOptions);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [distanceKm, setDistanceKm] = useState(1);
  const [paymentTiming, setPaymentTiming] = useState<PaymentTiming>("online");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [ready, setReady] = useState(false);

  const deliveryFeeCents = useMemo(
    () => fulfillment === "pickup" ? 0 : findDeliveryFee(delivery.ranges, distanceKm),
    [delivery.ranges, distanceKm, fulfillment],
  );
  const outsideArea = fulfillment === "delivery" && deliveryFeeCents === undefined;
  const totalCents = subtotalCents + (deliveryFeeCents ?? 0);

  if (lines.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-page px-6 text-center font-body text-cream">
        <div>
          <ShoppingBag className="mx-auto size-10 text-accent-warm" />
          <h1 className="mt-4 font-display text-2xl font-bold">Seu carrinho está vazio</h1>
          <Button asChild className="mt-5 rounded-xl bg-brand text-cream hover:bg-brand/90"><Link to="/">Ver cardápio</Link></Button>
        </div>
      </div>
    );
  }

  const changePaymentTiming = (timing: PaymentTiming) => {
    setPaymentTiming(timing);
    setPaymentMethod(timing === "online" ? "pix" : "cash");
    setReady(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReady(false);
    const form = new FormData(event.currentTarget);
    const rawChange = String(form.get("changeFor") ?? "").replace(/[^\d,]/g, "").replace(",", ".");
    const result = checkoutSchema.safeParse({
      customerName: form.get("customerName"),
      phone: form.get("phone"),
      fulfillment,
      postalCode: form.get("postalCode") ?? "",
      street: form.get("street") ?? "",
      number: form.get("number") ?? "",
      complement: form.get("complement") ?? "",
      neighborhood: form.get("neighborhood") ?? "",
      city: form.get("city") ?? "",
      state: String(form.get("state") ?? "").toUpperCase(),
      reference: form.get("reference") ?? "",
      distanceKm,
      paymentTiming,
      paymentMethod,
      changeForCents: rawChange ? Math.round(Number(rawChange) * 100) : null,
      marketingConsent,
    });

    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    if (outsideArea) {
      setErrors({ distanceKm: "Este endereço está fora da área de entrega." });
      return;
    }
    if (paymentTiming === "on_delivery" && paymentMethod === "cash" && result.data.changeForCents !== null && result.data.changeForCents < totalCents) {
      setErrors({ changeFor: "O valor para troco deve ser igual ou maior que o total." });
      return;
    }
    setErrors({});
    setReady(true);
  };

  return (
    <div className="min-h-screen bg-page font-body text-cream">
      <div className="mx-auto w-full max-w-lg pb-36">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-white/10 bg-page/85 px-4 backdrop-blur-2xl">
          <Button asChild variant="ghost" size="icon" className="rounded-xl text-cream hover:bg-white/10 hover:text-cream">
            <Link to="/carrinho" aria-label="Voltar ao carrinho"><ArrowLeft /></Link>
          </Button>
          <div className="flex-1 pr-10 text-center"><h1 className="font-display text-lg font-bold">Finalizar pedido</h1><p className="text-[11px] text-cream/50">{itemCount} {itemCount === 1 ? "item" : "itens"}</p></div>
        </header>

        <form id="checkout-form" onSubmit={submit} noValidate className="space-y-5 px-4 pt-5">
          <section>
            <h2 className="font-display text-base font-bold">Seus dados</h2>
            <div className="mt-3 grid gap-3">
              <Field label="Nome completo" name="customerName" error={errors.customerName}><Input id="customerName" name="customerName" maxLength={100} autoComplete="name" placeholder="Como podemos chamar você?" className={inputClass} /></Field>
              <Field label="Telefone" name="phone" error={errors.phone}><Input id="phone" name="phone" type="tel" maxLength={16} inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" className={inputClass} /></Field>
            </div>
          </section>

          <section>
            <h2 className="font-display text-base font-bold">Como deseja receber?</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => { setFulfillment("delivery"); setReady(false); }} className={`h-12 rounded-xl border-white/15 ${fulfillment === "delivery" ? "bg-brand text-cream hover:bg-brand/90" : "bg-white/10 text-cream hover:bg-white/15"}`}><MapPin /> Entrega</Button>
              <Button type="button" variant="outline" onClick={() => { setFulfillment("pickup"); setReady(false); }} className={`h-12 rounded-xl border-white/15 ${fulfillment === "pickup" ? "bg-brand text-cream hover:bg-brand/90" : "bg-white/10 text-cream hover:bg-white/15"}`}><Store /> Retirada</Button>
            </div>
          </section>

          {fulfillment === "delivery" ? (
            <section>
              <div className="flex items-end justify-between gap-3"><h2 className="font-display text-base font-bold">Endereço de entrega</h2><span className="text-[10px] text-cream/40">* obrigatórios</span></div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="CEP *" name="postalCode" error={errors.postalCode}><Input id="postalCode" name="postalCode" inputMode="numeric" maxLength={9} autoComplete="postal-code" placeholder="00000-000" className={inputClass} /></Field>
                <Field label="Número *" name="number" error={errors.number}><Input id="number" name="number" maxLength={20} autoComplete="address-line2" placeholder="128" className={inputClass} /></Field>
                <div className="col-span-2"><Field label="Rua *" name="street" error={errors.street}><Input id="street" name="street" maxLength={120} autoComplete="address-line1" placeholder="Nome da rua" className={inputClass} /></Field></div>
                <Field label="Bairro *" name="neighborhood" error={errors.neighborhood}><Input id="neighborhood" name="neighborhood" maxLength={80} placeholder="Bairro" className={inputClass} /></Field>
                <Field label="Complemento" name="complement" error={errors.complement}><Input id="complement" name="complement" maxLength={80} placeholder="Apto, bloco..." className={inputClass} /></Field>
                <Field label="Cidade *" name="city" error={errors.city}><Input id="city" name="city" maxLength={80} autoComplete="address-level2" placeholder="Cidade" className={inputClass} /></Field>
                <Field label="Estado *" name="state" error={errors.state}><Input id="state" name="state" maxLength={2} autoComplete="address-level1" placeholder="SP" className={`${inputClass} uppercase`} /></Field>
                <div className="col-span-2"><Field label="Ponto de referência" name="reference" error={errors.reference}><Input id="reference" name="reference" maxLength={120} placeholder="Próximo à praça..." className={inputClass} /></Field></div>
              </div>

              <GlassCard className="mt-4 p-3">
                <p className="text-xs font-semibold">Simulação de distância</p>
                <p className="mt-1 text-[11px] leading-relaxed text-cream/50">Escolha uma distância para testar a taxa enquanto o mapa não está conectado.</p>
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {[1, 3, 5, 7, 9].map((km) => <Button key={km} type="button" variant="outline" onClick={() => { setDistanceKm(km); setReady(false); }} className={`h-9 rounded-lg border-white/15 px-1 text-xs ${distanceKm === km ? "bg-accent-warm text-ink hover:bg-accent-warm/90" : "bg-white/5 text-cream hover:bg-white/10"}`}>{km} km</Button>)}
                </div>
                {outsideArea ? <p className="mt-3 rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive" role="alert">Endereço fora da área de entrega. Atendemos até {delivery.maxDistanceKm} km.</p> : <p className="mt-3 text-xs text-cream/65">Taxa para esta distância: <strong className="text-accent-warm">{formatBRL(deliveryFeeCents ?? 0)}</strong></p>}
              </GlassCard>
            </section>
          ) : (
            <GlassCard className="p-3"><p className="text-sm font-semibold">Retirada no João Burguer</p><p className="mt-1 text-xs text-cream/55">Rua das Flores, 128 · sem taxa de entrega.</p></GlassCard>
          )}

          <section>
            <h2 className="font-display text-base font-bold">Pagamento</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => changePaymentTiming("online")} className={`h-11 rounded-xl border-white/15 ${paymentTiming === "online" ? "bg-brand text-cream hover:bg-brand/90" : "bg-white/10 text-cream hover:bg-white/15"}`}>Online</Button>
              <Button type="button" variant="outline" onClick={() => changePaymentTiming("on_delivery")} className={`h-11 rounded-xl border-white/15 ${paymentTiming === "on_delivery" ? "bg-brand text-cream hover:bg-brand/90" : "bg-white/10 text-cream hover:bg-white/15"}`}>No recebimento</Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(paymentTiming === "online" ? (["pix", "card"] as const) : (["cash", "card"] as const)).map((method) => (
                <Button key={method} type="button" variant="outline" onClick={() => { setPaymentMethod(method); setReady(false); }} className={`h-11 rounded-xl border-white/15 ${paymentMethod === method ? "bg-accent-warm text-ink hover:bg-accent-warm/90" : "bg-white/5 text-cream hover:bg-white/10"}`}>
                  <CreditCard /> {method === "pix" ? "Pix" : method === "cash" ? "Dinheiro" : "Cartão"}
                </Button>
              ))}
            </div>
            {paymentTiming === "on_delivery" && paymentMethod === "cash" ? <div className="mt-3"><Field label="Troco para quanto?" name="changeFor" error={errors.changeFor}><Input id="changeFor" name="changeFor" inputMode="decimal" placeholder="Ex.: 100,00 (opcional)" className={inputClass} /></Field></div> : null}
          </section>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-cream/65">
            <input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} className="mt-0.5 size-4 accent-[var(--brand)]" />
            <span>Aceito receber ofertas e novidades desta loja.</span>
          </label>

          <section className="border-t border-white/10 pt-4">
            <div className="flex justify-between text-sm text-cream/60"><span>Subtotal</span><span>{formatBRL(subtotalCents)}</span></div>
            <div className="mt-2 flex justify-between text-sm text-cream/60"><span>Taxa de entrega</span><span>{outsideArea ? "—" : formatBRL(deliveryFeeCents ?? 0)}</span></div>
            <div className="mt-3 flex justify-between font-display text-lg font-bold"><span>Total</span><span>{formatBRL(totalCents)}</span></div>
          </section>

          {ready ? <div className="flex gap-2 rounded-xl border border-accent-warm/40 bg-accent-warm/10 p-3 text-sm text-cream" role="status"><Check className="size-5 shrink-0 text-accent-warm" /><span>Dados conferidos. A criação do pedido será ativada na próxima etapa.</span></div> : null}
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-page/85 p-4 backdrop-blur-2xl">
        <div className="mx-auto max-w-lg"><Button type="submit" form="checkout-form" disabled={outsideArea} className="h-12 w-full justify-between rounded-xl bg-brand px-4 font-semibold text-cream hover:bg-brand/90"><span>Revisar pedido</span><span>{formatBRL(totalCents)}</span></Button></div>
      </div>
    </div>
  );
}