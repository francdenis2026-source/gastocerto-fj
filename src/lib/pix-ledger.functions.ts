import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPixHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("pix_transactions")
      .select(`
        *,
        recipient:recipient_id (name, nickname)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

export const getLedgerEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ dependentId: z.string().optional() }).parse(data))
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("ledger_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.dependentId) {
      query = query.eq("dependent_id", data.dependentId);
    }

    const { data: entries, error } = await query;
    if (error) throw error;
    return entries;
  });

export const createPixCharge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    amount: z.number().positive(),
    description: z.string().optional(),
    recipientId: z.string().optional(),
    externalKey: z.string().optional(),
    externalName: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    // Simulação de chamada ao Mercado Pago
    // Em produção, usaríamos fetch('https://api.mercadopago.com/v1/payments', ...)
    const mpPaymentId = `mp-${Math.random().toString(36).substr(2, 9)}`;
    const mockQrCode = "00020126580014BR.GOV.BCB.PIX0136mock-key-123-456-789-000520400005303986540510.005802BR5913GASTOCERTO-FJ6005FEIJO62070503***6304E2B4";

    const { data: tx, error } = await context.supabase
      .from("pix_transactions")
      .insert({
        user_id: context.userId,
        amount: data.amount,
        description: data.description || "Transferência PIX",
        recipient_id: data.recipientId || null,
        external_recipient_key: data.externalKey || null,
        external_recipient_name: data.externalName || null,
        status: 'pending',
        mercadopago_payment_id: mpPaymentId,
        pix_copy_paste: mockQrCode,
        pix_qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" // Mock transparent pixel
      })
      .select()
      .single();

    if (error) throw error;
    return tx;
  });
