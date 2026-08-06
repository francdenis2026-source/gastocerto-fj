import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Sparkles } from "lucide-react";
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
import { MoneyInput } from "@/components/ui/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { amountToInput } from "@/lib/money-input";
import { parseAmount } from "@/lib/finance";
import {
  isValidKidCode,
  isValidKidPin,
  normalizeKidCode,
  suggestKidCode,
} from "@/lib/kids-account";
import { revokeKidAccess, saveKidAccess } from "@/lib/kids-account.functions";
import {
  DEPENDENT_RELATIONS,
  useSaveDependent,
  type Dependent,
} from "@/lib/dependents";

const COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#a855f7", "#f43f5e", "#eab308"];

/** Cadastro de filhos e dependentes usados nos gastos do dia a dia. */
export function DependentDialog({
  open,
  onOpenChange,
  dependent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dependent?: Dependent | null;
}) {
  const save = useSaveDependent();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [relation, setRelation] = useState<string>("filho");
  const [birthDate, setBirthDate] = useState("");
  const [school, setSchool] = useState("");
  const [allowance, setAllowance] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [notes, setNotes] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [allowanceDay, setAllowanceDay] = useState("");


  useEffect(() => {
    if (!open) return;
    setName(dependent?.name ?? "");
    setNickname(dependent?.nickname ?? "");
    setRelation(dependent?.relation ?? "filho");
    setBirthDate(dependent?.birth_date ?? "");
    setSchool(dependent?.school ?? "");
    setAllowance(amountToInput(dependent?.monthly_allowance ?? ""));
    setPinCode((dependent as any)?.pin_code ?? "");
    setMonthlyLimit(amountToInput((dependent as any)?.monthly_limit ?? ""));
    setAllowanceDay(((dependent as any)?.recurring_allowance_day ?? "").toString());
    setColor(dependent?.color ?? COLORS[0]);

    setNotes(dependent?.notes ?? "");
  }, [open, dependent]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Informe o nome do dependente.");
      return;
    }

    // Validação de idade para migração automática
    if (birthDate) {
      const birth = new Date(`${birthDate}T12:00:00`);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;

      if (age >= 14) {
        setShowUpgradeModal(true);
        return;
      }

    }

    try {
      await save.mutateAsync({
        id: dependent?.id,
        values: {
          name: name.trim(),
          nickname: nickname.trim() || null,
          relation,
          birth_date: birthDate || null,
          school: school.trim() || null,
          monthly_allowance: allowance ? parseAmount(allowance) : null,
          color,
          notes: notes.trim() || null,
          pin_code: pinCode.trim() || null,
          monthly_limit: monthlyLimit ? parseAmount(monthlyLimit) : null,
          recurring_allowance_day: allowanceDay ? parseInt(allowanceDay) : null,
          active: true,
        },
      });

      toast.success(dependent ? "Dependente atualizado." : `${name.trim()} adicionado.`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Não foi possível salvar.", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dependent ? "Editar dependente" : "Adicionar filho / dependente"}</DialogTitle>
          <DialogDescription>
            Cadastre cada filho para acompanhar os gastos extras. Defina um PIN de 4 dígitos para que a criança possa entrar no Modo Criança sozinha. 
            Contas Kids podem ser migradas para contas independentes automaticamente ao atingirem 14 anos.
          </DialogDescription>

        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="dep-name">Nome</Label>
            <Input
              id="dep-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1"
              maxLength={80}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="dep-nick">Apelido (opcional)</Label>
              <Input
                id="dep-nick"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                className="mt-1"
                maxLength={40}
              />
            </div>
            <div>
              <Label htmlFor="dep-relation">Parentesco</Label>
              <Select value={relation} onValueChange={setRelation}>
                <SelectTrigger id="dep-relation" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPENDENT_RELATIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="dep-birth">Nascimento (opcional)</Label>
              <Input
                id="dep-birth"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dep-allowance">Mesada mensal (opcional)</Label>
              <MoneyInput
                id="dep-allowance"
                value={allowance}
                onValueChange={setAllowance}
                placeholder="0,00"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dep-school">Escola / faculdade (opcional)</Label>
            <Input
              id="dep-school"
              value={school}
              onChange={(event) => setSchool(event.target.value)}
              className="mt-1"
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="dep-pin" className="flex items-center gap-2">
                PIN de Acesso (4 dígitos)
                <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-bold">Obrigatório para Modo Kids</span>
              </Label>
              <Input
                id="dep-pin"
                value={pinCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPinCode(val);
                }}
                placeholder="Ex: 1234"
                maxLength={4}
                className="mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                Evite PINs óbvios como 1234 ou 0000. Este código será usado pela criança para entrar no ambiente dela.
              </p>
            </div>
            <div>
              <Label htmlFor="dep-recur">Dia da Mesada (1-28)</Label>
              <Input
                id="dep-recur"
                type="number"
                min="1"
                max="28"
                value={allowanceDay}
                onChange={(e) => setAllowanceDay(e.target.value)}
                placeholder="Ex: 5"
                className="mt-1"
              />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-700 dark:text-emerald-400">
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Migração Automática (Futuro)
            </p>
            Ao completar 14 anos, este dependente poderá migrar seus dados para uma conta GastoCerto independente de forma automática, preservando todo o histórico financeiro.
          </div>

          <div>

            <Label htmlFor="dep-limit">Limite de Alerta de Gastos</Label>
            <MoneyInput
              id="dep-limit"
              value={monthlyLimit}
              onValueChange={setMonthlyLimit}
              placeholder="0,00"
              className="mt-1"
            />
          </div>

          {dependent?.id ? (
            <KidAccessSection 
              dependentId={dependent.id} 
              name={name} 
              currentCode={dependent.kid_login_code ?? null} 
              expiresAt={dependent.kid_code_expires_at ?? null}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-border p-3 text-[12px] text-muted-foreground">
              Salve o cadastro para liberar o acesso independente da criança (entrada pela tela inicial
              com código e senha).
            </p>
          )}


          <div>
            <Label>Cor de identificação</Label>

            <div className="mt-1.5 flex gap-2">
              {COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Cor ${option}`}
                  onClick={() => setColor(option)}
                  className={
                    color === option
                      ? "size-7 rounded-full ring-2 ring-ring ring-offset-2 ring-offset-background"
                      : "size-7 rounded-full"
                  }
                  style={{ backgroundColor: option }}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="dep-notes">Observações</Label>
            <Textarea
              id="dep-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1"
              rows={2}
              maxLength={400}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={save.isPending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Sugestão de Upgrade
            </DialogTitle>
            <DialogDescription className="text-foreground">
              Detectamos que <strong>{name}</strong> já atingiu 14 anos, que é o limite para ser acompanhado como dependente infantil no Espaço Kids.
              <br /><br />
              Nesta idade, o ideal é que ele(a) tenha uma <strong>conta independente</strong> para começar a gerir as próprias finanças de forma completa e profissional.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
            <p className="text-sm font-bold text-primary mb-1">Deseja cadastrar uma conta independente agora?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A nova conta iniciará no <strong>Plano Gratuito</strong>. O histórico atual poderá ser migrado manualmente ou via suporte futuramente.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)} className="flex-1">
              Manter como dependente
            </Button>
            <Button onClick={() => {
              setShowUpgradeModal(false);
              onOpenChange(false);
              window.location.href = "/auth?mode=signup";
            }} className="flex-1">
              Sim, criar conta agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Dialog>
  );
}


/**
 * Acesso próprio da criança: código + senha numérica usados na tela inicial.
 * Assim ela abre o painel dela sem depender da conta do responsável.
 */
function KidAccessSection({
  dependentId,
  name,
  currentCode,
  expiresAt,
}: {
  dependentId: string;
  name: string;
  currentCode: string | null;
  expiresAt?: string | null;
}) {
  const queryClient = useQueryClient();
  const saveAccess = useServerFn(saveKidAccess);
  const revokeAccess = useServerFn(revokeKidAccess);
  const [code, setCode] = useState(currentCode ?? "");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["dependents"] });

  const handleSave = async () => {
    const clean = normalizeKidCode(code);
    if (!isValidKidCode(clean)) {
      toast.error("Escolha um código com pelo menos 4 caracteres (letras, números ou hífen).");
      return;
    }
    if (!isValidKidPin(pin)) {
      toast.error("A senha da criança deve ter de 4 a 6 números.");
      return;
    }
    setBusy(true);
    try {
      await saveAccess({ data: { dependentId, code: clean, pin } });
      toast.success("Acesso da criança liberado!", {
        description: `Código ${clean} — ela entra pela tela inicial em “Sou criança”.`,
      });
      setPin("");
      void refresh();
    } catch (error) {
      toast.error("Não foi possível salvar o acesso.", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async () => {
    setBusy(true);
    try {
      await revokeAccess({ data: { dependentId } });
      toast.success("Acesso independente removido.");
      setCode("");
      setPin("");
      void refresh();
    } catch (error) {
      toast.error("Não foi possível remover o acesso.", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <h3 className="flex items-center gap-2 text-[13px] font-bold text-foreground">
        <KeyRound className="size-4 text-primary" aria-hidden />
        Acesso próprio da criança
      </h3>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
        Com o código e a senha abaixo, ela entra direto no espaço dela pela tela inicial, sem usar sua
        conta. Ela só vê o saldo, as metas e os lançamentos dela.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="kid-access-code" className="text-[12px]">
            Código da criança
          </Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="kid-access-code"
              value={code}
              onChange={(event) => setCode(normalizeKidCode(event.target.value))}
              placeholder="EX: JOAO-A1B"
              className="font-mono uppercase tracking-wide"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setCode(suggestKidCode(name || "KID"))}
            >
              Gerar
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="kid-access-pin" className="text-[12px]">
            Senha (4 a 6 números)
          </Label>
          <Input
            id="kid-access-pin"
            inputMode="numeric"
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="••••"
            className="mt-1 tracking-[0.3em]"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave} disabled={busy} size="sm">
          {currentCode ? "Atualizar acesso" : "Liberar acesso"}
        </Button>
        {currentCode ? (
          <Button type="button" variant="ghost" size="sm" onClick={handleRevoke} disabled={busy}>
            Remover acesso
          </Button>
        ) : null}
      </div>
      {currentCode ? (
        <p className="mt-2 text-[11px] font-semibold text-primary">
          Código ativo: <span className="font-mono">{currentCode}</span>
          {expiresAt && (
            <span className="block mt-0.5 text-[10px] text-muted-foreground font-normal">
              Válido até: {new Date(expiresAt).toLocaleDateString("pt-BR")}
            </span>
          )}
        </p>
      ) : null}
    </section>
  );
}
