import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Baby,
  History,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { KidsManagementPanel } from "@/components/kids/kids-management-panel";
import { KidsWalletPanel } from "@/components/kids/kids-wallet-panel";

import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEPENDENT_RELATIONS,
  dependentAge,
  relationLabel,
  useDeleteDependent,
  useDependents,
  useSaveDependent,
  type Dependent,
} from "@/lib/dependents";
import { parseAmount } from "@/lib/finance";
import { formatCurrency } from "@/lib/format-utils";
import { isValidKidCode, isValidKidPin, suggestKidCode } from "@/lib/kids-account";
import { saveKidAccess } from "@/functions/kids-account.functions";
import { describeKidCodeExpiry } from "@/lib/kids-access";
import { amountToInput } from "@/lib/money-input";

const TITLE = "Central da Família — filhos, mesadas e acessos | GastoCerto";
const DESCRIPTION =
  "Central unificada do responsável: cadastre filhos, crie o acesso do Espaço Kids, registre mesadas e presentes e acompanhe as métricas de gastos com cada criança.";

export const Route = createFileRoute("/_authenticated/filhos")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FamilyHubPage,
});

type FormState = {
  name: string;
  nickname: string;
  relation: string;
  gender: string;
  birthDate: string;
  allowance: string;
  monthlyLimit: string;
  allowanceDay: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  nickname: "",
  relation: "filho",
  gender: "neutral",
  birthDate: "",
  allowance: "",
  monthlyLimit: "",
  allowanceDay: "5",
};

function FamilyHubPage() {
  const { data: dependents, isLoading } = useDependents();
  const saveDependent = useSaveDependent();
  const deleteDependent = useDeleteDependent();
  const queryClient = useQueryClient();
  const saveAccess = useServerFn(saveKidAccess);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Dependent | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [accessKid, setAccessKid] = useState<Dependent | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [accessPin, setAccessPin] = useState("");
  const [kidSearch, setKidSearch] = useState("");
  const [kidPage, setKidPage] = useState(1);

  const kids = useMemo(() => dependents ?? [], [dependents]);
  const filteredKids = useMemo(() => {
    const term = kidSearch.trim().toLocaleLowerCase("pt-BR");
    return term
      ? kids.filter((kid) => `${kid.name} ${kid.nickname ?? ""} ${relationLabel(kid.relation)}`.toLocaleLowerCase("pt-BR").includes(term))
      : kids;
  }, [kids, kidSearch]);
  const kidPages = Math.max(1, Math.ceil(filteredKids.length / 8));
  const visibleKids = filteredKids.slice((Math.min(kidPage, kidPages) - 1) * 8, Math.min(kidPage, kidPages) * 8);

  const accessMutation = useMutation({
    mutationFn: async (input: { dependentId: string; code: string; pin: string }) =>
      saveAccess({ data: { ...input, expiresDays: 365, reason: "updated" } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dependents"] });
      void queryClient.invalidateQueries({ queryKey: ["kids-access-audit"] });
    },
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(kid: Dependent) {
    setEditing(kid);
    setForm({
      name: kid.name ?? "",
      nickname: kid.nickname ?? "",
      relation: kid.relation ?? "filho",
      gender: (kid as { gender?: string | null }).gender ?? "neutral",
      birthDate: kid.birth_date ?? "",
      allowance: kid.monthly_allowance ? amountToInput(Number(kid.monthly_allowance)) : "",
      monthlyLimit: kid.monthly_limit ? amountToInput(Number(kid.monthly_limit)) : "",
      allowanceDay: String(kid.recurring_allowance_day ?? 5),
    });
    setFormOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Informe o nome da criança.");
      return;
    }
    try {
      await saveDependent.mutateAsync({
        id: editing?.id,
        values: {
          name: form.name.trim(),
          nickname: form.nickname.trim() || null,
          relation: form.relation,
          gender: form.gender,
          birth_date: form.birthDate || null,
          monthly_allowance: form.allowance ? parseAmount(form.allowance) : null,
          monthly_limit: form.monthlyLimit ? parseAmount(form.monthlyLimit) : null,
          recurring_allowance_day: Number(form.allowanceDay) || null,
          active: true,
        } as Partial<Dependent>,
      });
      toast.success(editing ? "Cadastro atualizado." : "Filho cadastrado.");
      setFormOpen(false);
    } catch (error) {
      toast.error("Não foi possível salvar.", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  function openAccess(kid: Dependent) {
    setAccessKid(kid);
    setAccessCode(kid.kid_login_code ?? suggestKidCode(kid.nickname || kid.name));
    setAccessPin("");
  }

  async function handleAccess() {
    if (!accessKid) return;
    if (!isValidKidCode(accessCode)) {
      toast.error("Código inválido. Use ao menos 4 letras ou números.");
      return;
    }
    if (!isValidKidPin(accessPin)) {
      toast.error("A senha deve ter de 4 a 6 números.");
      return;
    }
    try {
      await accessMutation.mutateAsync({
        dependentId: accessKid.id,
        code: accessCode,
        pin: accessPin,
      });
      toast.success("Acesso do Espaço Kids atualizado.", {
        description: "A criança entra pela tela inicial com o código e a senha.",
      });
      setAccessKid(null);
    } catch (error) {
      toast.error("Não foi possível salvar o acesso.", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function handleDelete(kid: Dependent) {
    if (!window.confirm(`Remover o cadastro de ${kid.nickname || kid.name}?`)) return;
    try {
      await deleteDependent.mutateAsync(kid.id);
      toast.success("Cadastro removido.");
    } catch (error) {
      toast.error("Não foi possível remover.", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <AppShell>
      <div className="space-y-2 sm:space-y-3">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-sm font-bold sm:text-base md:text-lg">
              <Users className="size-4 shrink-0 text-primary sm:size-5" />
              <span className="truncate">Central da Família</span>
            </h1>
            <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground sm:text-xs">
              Acompanhe as carteiras dos filhos e libere o Espaço Kids.
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5 sm:gap-2">
            <Button asChild variant="outline" size="sm" className="h-8 px-2 sm:h-9 sm:px-3">
              <Link to="/kids-auditoria">
                <History className="size-4 sm:mr-1" />
                <span className="hidden sm:inline">Histórico</span>
              </Link>
            </Button>
            <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3" onClick={openCreate}>
              <Plus className="size-4 sm:mr-1" />
              <span className="hidden sm:inline">Adicionar filho</span>
            </Button>
          </div>
        </header>

        <Tabs defaultValue="registros" className="space-y-2.5 sm:space-y-3">
          <TabsList className="w-full justify-start h-9 bg-muted/40 p-0.5 rounded-xl border border-border/50 overflow-x-auto sm:w-auto">
            <TabsTrigger value="registros" className="text-[11px] px-3 font-bold sm:text-xs">
              Métricas
            </TabsTrigger>
            <TabsTrigger value="cadastro" className="text-[11px] px-3 font-bold sm:text-xs">
              Filhos e Acessos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registros" className="space-y-3">
            <KidsWalletPanel
              onCreate={openCreate}
              onRemove={(id) => {
                const kid = kids.find((item) => item.id === id);
                if (kid) void handleDelete(kid);
              }}
            />
            <KidsManagementPanel />
          </TabsContent>


          <TabsContent value="cadastro" className="space-y-3">
            {kids.length > 0 ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={kidSearch} onChange={(event) => { setKidSearch(event.target.value); setKidPage(1); }} placeholder="Buscar por nome, apelido ou relação..." className="h-9 pl-9 text-xs" />
                </div>
                <span className="text-[11px] text-muted-foreground">{filteredKids.length} cadastro(s)</span>
              </div>
            ) : null}
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : kids.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <Baby className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Nenhum filho cadastrado ainda</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Cadastre para registrar mesadas e liberar o Espaço Kids.
                </p>
                <Button className="mt-3" size="sm" onClick={openCreate}>
                  <Plus className="mr-1 size-4" /> Adicionar filho
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {visibleKids.map((kid) => {
                  const age = dependentAge(kid);
                  const expiry = describeKidCodeExpiry(kid.kid_code_expires_at);
                  return (
                    <article key={kid.id} className="rounded-xl border bg-card p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{kid.nickname?.trim() || kid.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {relationLabel(kid.relation)}
                            {age != null ? ` · ${age} anos` : ""}
                          </p>
                        </div>
                        {kid.kid_user_id ? (
                          <Badge variant="secondary" className="gap-1">
                            <ShieldCheck className="size-3" /> Acesso ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline">Sem acesso</Badge>
                        )}
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border p-2">
                          <dt className="text-muted-foreground">Mesada</dt>
                          <dd className="font-semibold">
                            {kid.monthly_allowance
                              ? formatCurrency(Number(kid.monthly_allowance))
                              : "—"}
                          </dd>
                        </div>
                        <div className="rounded-lg border p-2">
                          <dt className="text-muted-foreground">Limite mensal</dt>
                          <dd className="font-semibold">
                            {kid.monthly_limit ? formatCurrency(Number(kid.monthly_limit)) : "—"}
                          </dd>
                        </div>
                      </dl>

                      {kid.kid_login_code ? (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Código <span className="font-semibold">{kid.kid_login_code}</span> ·{" "}
                          {expiry.label}
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => openEdit(kid)}>
                          <Pencil className="mr-1 size-3.5" /> Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openAccess(kid)}>
                          <KeyRound className="mr-1 size-3.5" /> Código e senha
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void handleDelete(kid)}>
                          <Trash2 className="mr-1 size-3.5" /> Remover
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            {kidPages > 1 ? (
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">Página {Math.min(kidPage, kidPages)} de {kidPages}</span>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="h-8" disabled={kidPage <= 1} onClick={() => setKidPage((page) => Math.max(1, page - 1))}><ChevronLeft className="mr-1 size-3.5" /> Anterior</Button>
                  <Button variant="outline" size="sm" className="h-8" disabled={kidPage >= kidPages} onClick={() => setKidPage((page) => Math.min(kidPages, page + 1))}>Próxima <ChevronRight className="ml-1 size-3.5" /></Button>
                </div>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar cadastro" : "Adicionar filho"}</DialogTitle>
            <DialogDescription>
              Os dados de mesada e limite orientam os avisos automáticos do Espaço Kids.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="kid-name">Nome</Label>
              <Input
                id="kid-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="kid-nick">Apelido</Label>
              <Input
                id="kid-nick"
                value={form.nickname}
                onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="kid-birth">Nascimento</Label>
              <Input
                id="kid-birth"
                type="date"
                value={form.birthDate}
                onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Relação</Label>
              <Select
                value={form.relation}
                onValueChange={(value) => setForm((prev) => ({ ...prev, relation: value }))}
              >
                <SelectTrigger className="mt-1">
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
            <div>
              <Label>Tema do painel</Label>
              <Select
                value={form.gender}
                onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutro</SelectItem>
                  <SelectItem value="boy">Menino</SelectItem>
                  <SelectItem value="girl">Menina</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mesada mensal</Label>
              <MoneyInput
                value={form.allowance}
                onValueChange={(value) => setForm((prev) => ({ ...prev, allowance: value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Limite de gastos no mês</Label>
              <MoneyInput
                value={form.monthlyLimit}
                onValueChange={(value) => setForm((prev) => ({ ...prev, monthlyLimit: value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="kid-day">Dia da mesada</Label>
              <Input
                id="kid-day"
                type="number"
                min={1}
                max={28}
                value={form.allowanceDay}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, allowanceDay: event.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={saveDependent.isPending}>
              {saveDependent.isPending ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(accessKid)} onOpenChange={(open) => !open && setAccessKid(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Acesso do Espaço Kids</DialogTitle>
            <DialogDescription>
              A criança entra na tela inicial do site usando o código e a senha numérica.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="access-code">Código de acesso</Label>
              <Input
                id="access-code"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="access-pin">Senha (4 a 6 números)</Label>
              <Input
                id="access-pin"
                inputMode="numeric"
                value={accessPin}
                onChange={(event) => setAccessPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-1 font-mono tracking-widest"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAccessKid(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleAccess()} disabled={accessMutation.isPending}>
              {accessMutation.isPending ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
              Salvar acesso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
