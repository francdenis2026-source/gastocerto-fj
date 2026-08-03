import { useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCreateUser } from "@/lib/admin-users.functions";
import { maskCpf, onlyDigits } from "@/lib/cpf";

/** Cadastro manual de contas de clientes pelo painel administrativo. */
export function CreateUserDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [pin, setPin] = useState("");
  const [planSlug, setPlanSlug] = useState<"free" | "premium" | "premium_ia">("free");

  async function handleCreate() {
    if (fullName.trim().length < 2) {
      toast.error("Informe o nome completo do cliente.");
      return;
    }
    if (onlyDigits(cpf).length !== 11) {
      toast.error("Informe um CPF com 11 dígitos.");
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      toast.error("A senha de acesso deve ter 6 números.");
      return;
    }

    setLoading(true);
    try {
      await adminCreateUser({
        data: {
          fullName: fullName.trim(),
          cpf: onlyDigits(cpf),
          pin,
          contactEmail: contactEmail.trim(),
          planSlug,
        },
      });
      toast.success(`Conta de ${fullName.trim()} criada com sucesso.`);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      setOpen(false);
      setFullName("");
      setCpf("");
      setContactEmail("");
      setPin("");
      setPlanSlug("free");
    } catch (error: any) {
      toast.error(error?.message || "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-10">
          <UserPlus className="mr-2 size-4" />
          Nova conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar conta de cliente</DialogTitle>
          <DialogDescription>
            A conta já entra ativa e o cliente acessa com o CPF e a senha de 6 números.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="new-user-name">Nome completo</Label>
            <Input
              id="new-user-name"
              className="mt-1.5"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="new-user-cpf">CPF</Label>
              <Input
                id="new-user-cpf"
                className="mt-1.5"
                inputMode="numeric"
                value={maskCpf(cpf)}
                onChange={(event) => setCpf(onlyDigits(event.target.value).slice(0, 11))}
              />
            </div>
            <div>
              <Label htmlFor="new-user-pin">Senha (6 números)</Label>
              <Input
                id="new-user-pin"
                className="mt-1.5"
                inputMode="numeric"
                value={pin}
                onChange={(event) => setPin(onlyDigits(event.target.value).slice(0, 6))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="new-user-email">E-mail de contato (opcional)</Label>
            <Input
              id="new-user-email"
              className="mt-1.5"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-user-plan">Plano inicial</Label>
            <Select value={planSlug} onValueChange={(value) => setPlanSlug(value as typeof planSlug)}>
              <SelectTrigger id="new-user-plan" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Grátis</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="premium_ia">Premium com IA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Criar conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
