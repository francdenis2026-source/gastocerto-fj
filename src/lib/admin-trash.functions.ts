import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Sistema de Quarentena / Lixeira para itens administrativos.
 * Mantém itens por 30 dias antes da exclusão permanente.
 * Os dados são armazenados na tabela admin_logs com metadados de quarentena.
 */

export const moveToTrash = createServerFn({ method: "POST" })
  .inputValidator((data) => 
    z.object({
      itemId: z.string(),
      itemType: z.enum(["user", "license", "transaction", "category", "other"]),
      originalData: z.any(),
      reason: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { itemId, itemType, originalData, reason } = data;
    
    // Calcula expiração: 30 dias
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error } = await supabaseAdmin
      .from("admin_logs")
      .insert({
        action: `trash_move:${itemType}`,
        details: {
          itemId,
          itemType,
          originalData,
          reason,
          quarantine: true,
          expires_at: expiresAt.toISOString(),
          status: "in_quarantine"
        }
      });

    if (error) throw error;
    return { success: true, expiresAt };
  });

export const getTrashItems = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Filtra no servidor por performance (embora idealmente fosse via query SQL se tivéssemos colunas dedicadas)
    return (data || []).filter(log => {
      const d = log.details as any;
      return d && d.quarantine === true && d.status === "in_quarantine";
    });
  });

export const restoreFromTrash = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ logId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: log, error: fetchError } = await supabaseAdmin
      .from("admin_logs")
      .select("*")
      .eq("id", data.logId)
      .single();

    if (fetchError || !log) throw new Error("Item não encontrado");
    
    const details = log.details as any;
    if (!details.quarantine || details.status !== "in_quarantine") {
      throw new Error("Item não está em quarentena");
    }

    const { error: updateError } = await supabaseAdmin
      .from("admin_logs")
      .update({
        details: {
          ...details,
          status: "restored",
          restored_at: new Date().toISOString()
        }
      })
      .eq("id", data.logId);

    if (updateError) throw updateError;
    
    return { success: true, itemType: details.itemType, originalData: details.originalData };
  });

export const permanentDeleteFromTrash = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ logId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("admin_logs")
      .update({
        details: {
          status: "purged",
          purged_at: new Date().toISOString(),
          quarantine: false // Remove flag de visualização
        }
      })
      .eq("id", data.logId);

    if (error) throw error;
    return { success: true };
  });
