import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
  const createUser = useServerFn(adminCreateUser);
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
      await createUser({
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
          Adicionar conta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="mb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <UserPlus className="size-6" />
          </div>
          <DialogTitle className="text-xl font-black text-center">Adicionar conta de cliente</DialogTitle>
          <DialogDescription className="text-center text-sm">
            A conta já entra ativa e o cliente acessa com o CPF e a senha de 6 números.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-user-name" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">
              Nome completo
            </Label>
            <Input
              id="new-user-name"
              placeholder="Ex: João Silva"
              className="h-11 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors"
              value={fullName}
              autoComplete="off"
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-user-cpf" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">
                CPF
              </Label>
              <Input
                id="new-user-cpf"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                className="h-11 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors"
                value={maskCpf(cpf)}
                onChange={(event) => setCpf(onlyDigits(event.target.value).slice(0, 11))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-pin" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">
                Senha (6 números)
              </Label>
              <Input
                id="new-user-pin"
                inputMode="numeric"
                autoComplete="new-password"
                placeholder="123456"
                className="h-11 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors"
                value={pin}
                onChange={(event) => setPin(onlyDigits(event.target.value).slice(0, 6))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-user-email" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">
              E-mail de contato (opcional)
            </Label>
            <Input
              id="new-user-email"
              type="email"
              autoComplete="off"
              placeholder="cliente@exemplo.com"
              className="h-11 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-user-plan" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">
              Plano inicial
            </Label>
            <Select value={planSlug} onValueChange={(value) => setPlanSlug(value as typeof planSlug)}>
              <SelectTrigger id="new-user-plan" className="h-11 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-xl">
                <SelectItem value="free" className="py-2.5">Grátis (Limitado)</SelectItem>
                <SelectItem value="premium" className="py-2.5">Premium (Completo)</SelectItem>
                <SelectItem value="premium_ia" className="py-2.5">Premium com IA (Guru)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)}
            className="h-11 rounded-xl font-bold text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={loading}
            className="h-11 flex-1 rounded-xl bg-brand text-brand-foreground font-black shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UserPlus className="mr-2 size-4" />}
            Criar conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
