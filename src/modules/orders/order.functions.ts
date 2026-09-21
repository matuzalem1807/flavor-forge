import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
  optionIds: z.array(z.string().uuid()).max(20),
  note: z.string().max(280),
});

const createOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(20),
  fulfillment: z.enum(["delivery", "pickup"]),
  postalCode: z.string().max(9),
  street: z.string().max(120),
  number: z.string().max(20),
  complement: z.string().max(80),
  neighborhood: z.string().max(80),
  city: z.string().max(80),
  state: z.string().max(2),
  reference: z.string().max(120),
  distanceKm: z.number().min(0).max(100),
  paymentTiming: z.enum(["online", "on_delivery"]),
  paymentMethod: z.enum(["pix", "card", "cash"]),
  changeForCents: z.number().int().nonnegative().nullable(),
  marketingConsent: z.boolean(),
  items: z.array(orderItemSchema).min(1).max(50),
});

export interface CreatedOrder {
  orderId: string;
  orderNumber: number;
  trackingCode: string;
  status: "NEW";
  paymentStatus: "PENDING";
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => createOrderSchema.parse(input))
  .handler(async ({ data }): Promise<CreatedOrder> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("create_public_order", {
      payload: data,
    });

    if (error) {
      const message = error.message.includes("statement timeout")
        ? "A finalização demorou demais. Tente novamente."
        : error.message;
      throw new Error(message);
    }
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      throw new Error("Não foi possível confirmar o pedido.");
    }

    const parsed = z.object({
      orderId: z.string().uuid(),
      orderNumber: z.coerce.number().int().positive(),
      trackingCode: z.string().uuid(),
      status: z.literal("NEW"),
      paymentStatus: z.literal("PENDING"),
      subtotalCents: z.number().int().nonnegative(),
      deliveryFeeCents: z.number().int().nonnegative(),
      totalCents: z.number().int().nonnegative(),
    }).parse(result);

    return parsed;
  });