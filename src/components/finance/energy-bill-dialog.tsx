import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveEnergyBill, type EnergyBill } from "@/lib/energy";
import { isoDate, parseAmount } from "@/lib/finance";
import { maskAmountInput } from "@/lib/money-input";

export function EnergyBillDialog({
  bill,
  open,
  onOpenChange,
}: {
  bill?: EnergyBill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useSaveEnergyBill();
  const [date, setDate] = useState(isoDate(new Date()));
  const [amount, setAmount] = useState("");
  const [kwh, setKwh] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (bill) {
        setDate(bill.bill_date);
        setAmount(String(bill.amount).replace(".", ","));
        setKwh(String(bill.consumption_kwh).replace(".", ","));
        setDueDate(bill.due_date || "");
        setNotes(bill.notes || "");
      } else {
        setDate(isoDate(new Date()));
        setAmount("");
        setKwh("");
        setDueDate("");
        setNotes("");
      }
    }
  }, [open, bill]);

  async function handleSave() {
    const value = parseAmount(amount);
    const cons = parseAmount(kwh);
    if (isNaN(value) || value <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    if (isNaN(cons) || cons <= 0) {
      toast.error("Informe o consumo em kWh.");
      return;
    }

    try {
      await save.mutateAsync({
        id: bill?.id,
        bill_date: date,
        amount: value,
        consumption_kwh: cons,
        due_date: dueDate || null,
        notes: notes.trim() || null,
      });
      toast.success(bill ? "Fatura atualizada." : "Fatura adicionada.");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar fatura.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bill ? "Editar fatura" : "Adicionar fatura de energia"}</DialogTitle>
          <DialogDescription>
            Registre o consumo e valor da sua conta de luz para acompanhar a evolução.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="eb-date">Mês de referência (ou data da leitura)</Label>
            <Input
              id="eb-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="eb-amount">Valor (R$)</Label>
              <Input
                id="eb-amount"
                value={amount}
                onChange={(e) => setAmount(maskAmountInput(e.target.value))}
                placeholder="0,00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eb-kwh">Consumo (kWh)</Label>
              <Input
                id="eb-kwh"
                value={kwh}
                onChange={(e) => setKwh(maskAmountInput(e.target.value))}
                placeholder="0,0"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="eb-due">Data de vencimento (opcional)</Label>
            <Input
              id="eb-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="eb-notes">Observações</Label>
            <Textarea
              id="eb-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Bandeira tarifária vermelha"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={save.isPending}>
            {bill ? "Salvar alterações" : "Lançar fatura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
