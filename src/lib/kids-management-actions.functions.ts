import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const deleteKidManagementTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      transactionId: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { transactionId } = data;
    const userId = context.userId;

    // 1. Verificar se a transação pertence ao pai e tem a tag kids_management
    const { data: parentTx, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("id, amount, tags")
      .eq("id", transactionId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !parentTx || !parentTx.tags?.includes("kids_management")) {
      throw new Error("Transação não encontrada ou não é permitida a exclusão.");
    }

    // 2. Tentar encontrar a transação correspondente da criança
    // A transação do pai tem a tag dependente:{id}
    const dependentIdTag = parentTx.tags.find(t => t.startsWith("dependente:"));
    const dependentId = dependentIdTag?.split(":")[1];

    if (dependentId) {
      const { data: dependent } = await supabaseAdmin
        .from("dependents")
        .select("kid_user_id")
        .eq("id", dependentId)
        .single();

      if (dependent?.kid_user_id) {
        // Deletar a transação espelhada da criança (mesmo valor, data e descrição similar)
        // Como não temos um ID direto, usamos critérios
        await supabaseAdmin
          .from("transactions")
          .delete()
          .eq("user_id", dependent.kid_user_id)
          .eq("amount", parentTx.amount)
          .contains("tags", ["from_parent"]);
      }
    }

    // 3. Deletar a transação do pai
    const { error: deleteError } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (deleteError) throw deleteError;

    return { success: true };
  });

export const updateKidManagementTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      transactionId: z.string().uuid(),
      amount: z.number().positive(),
      description: z.string().min(1),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { transactionId, amount, description } = data;
    const userId = context.userId;

    const { data: parentTx, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("id, amount, tags")
      .eq("id", transactionId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !parentTx || !parentTx.tags?.includes("kids_management")) {
      throw new Error("Transação não encontrada.");
    }

    // Atualizar pai
    await supabaseAdmin
      .from("transactions")
      .update({ amount, description: `[Envio] ${description}` })
      .eq("id", transactionId);

    // Tentar atualizar criança
    const dependentIdTag = parentTx.tags.find(t => t.startsWith("dependente:"));
    const dependentId = dependentIdTag?.split(":")[1];

    if (dependentId) {
      const { data: dependent } = await supabaseAdmin
        .from("dependents")
        .select("kid_user_id")
        .eq("id", dependentId)
        .single();

      if (dependent?.kid_user_id) {
        await supabaseAdmin
          .from("transactions")
          .update({ amount, description: `Recebido: ${description}` })
          .eq("user_id", dependent.kid_user_id)
          .eq("amount", parentTx.amount)
          .contains("tags", ["from_parent"]);
      }
    }

    return { success: true };
  });
