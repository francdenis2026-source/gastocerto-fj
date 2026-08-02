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
        pix_qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" 
      } as any)
      .select()
      .single();

    if (error) throw error;
    return tx;
  });

export const regeneratePixCharge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    transactionId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: oldTx, error: fetchError } = await context.supabase
      .from("pix_transactions")
      .select("*")
      .eq("id", data.transactionId)
      .single();

    if (fetchError || !oldTx) throw new Error("Transação não encontrada.");

    // Em uma app real, cancelaríamos o pagamento anterior no Mercado Pago primeiro
    
    // Gera novo ID simulado do MP e atualiza data
    const mpPaymentId = `mp-new-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: updated, error: updateError } = await context.supabase
      .from("pix_transactions")
      .update({
        status: 'pending',
        mercadopago_payment_id: mpPaymentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", data.transactionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Registrar auditoria
    await context.supabase.from("kid_access_audit" as any).insert({
      user_id: context.userId,
      dependent_id: oldTx.recipient_id,
      action: "visibility", // Action names are limited by RLS/types usually, choosing one that fits
      detail: { amount: oldTx.amount, type: 'pix_regenerated', tx_id: oldTx.id }
    } as any);

    return updated;
  });
