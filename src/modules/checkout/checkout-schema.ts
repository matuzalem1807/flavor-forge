import { z } from "zod";

const emptyOrLimited = (limit: number) => z.string().trim().max(limit);

export const checkoutSchema = z
  .object({
    customerName: z.string().trim().min(2, "Informe seu nome.").max(100),
    phone: z
      .string()
      .trim()
      .transform((value) => value.replace(/\D/g, ""))
      .refine((value) => value.length >= 10 && value.length <= 11, "Informe um telefone válido."),
    fulfillment: z.enum(["delivery", "pickup"]),
    postalCode: emptyOrLimited(9),
    street: emptyOrLimited(120),
    number: emptyOrLimited(20),
    complement: emptyOrLimited(80),
    neighborhood: emptyOrLimited(80),
    city: emptyOrLimited(80),
    state: emptyOrLimited(2),
    reference: emptyOrLimited(120),
    distanceKm: z.number().min(0),
    paymentTiming: z.enum(["online", "on_delivery"]),
    paymentMethod: z.enum(["pix", "card", "cash"]),
    changeForCents: z.number().int().nonnegative().nullable(),
    marketingConsent: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillment === "delivery") {
      const required: Array<[keyof typeof data, string]> = [
        ["postalCode", "Informe o CEP."],
        ["street", "Informe a rua."],
        ["number", "Informe o número."],
        ["neighborhood", "Informe o bairro."],
        ["city", "Informe a cidade."],
        ["state", "Informe o estado."],
      ];
      for (const [field, message] of required) {
        if (!String(data[field]).trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
        }
      }
      if (data.postalCode.replace(/\D/g, "").length !== 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["postalCode"], message: "Informe um CEP válido." });
      }
      if (data.state.trim().length !== 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["state"], message: "Use a sigla do estado." });
      }
    }
    if (data.paymentTiming === "online" && data.paymentMethod === "cash") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paymentMethod"], message: "Dinheiro está disponível somente no recebimento." });
    }
  });

export type CheckoutData = z.infer<typeof checkoutSchema>;