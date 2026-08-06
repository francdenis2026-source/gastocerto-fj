import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Baby, KeyRound, Loader2, Users, UserPlus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { CategoryPicker, readRecentCategories, rememberCategory } from "@/components/finance/category-picker";
import { PurchaseItemsEditor } from "@/components/finance/purchase-items-editor";
import { ReceiptField } from "@/components/finance/receipt-field";
import { StoredTransactionPanel } from "@/components/finance/panels/stored-transaction-panel";

import { Button } from "@/components/ui/button";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { Textarea } from "@/components/ui/textarea";

import {
  EXPENSE_TYPES,
  INCOME_SOURCES,
  PAYMENT_METHODS,
  TRANSACTION_STATUS,
  isoDate,
  parseAmount,
  toCents,
} from "@/lib/finance";
import { useClosings } from "@/lib/closing";
import { MIN_TRANSACTION_DATE, lockedMonthKeys } from "@/lib/closing-lock";
import { useClosingPolicy } from "@/lib/use-closing-policy";
import { PAST_EDIT_UNLOCK_MINUTES, usePastEditUnlock } from "@/lib/past-edit-unlock";
import { useAuth } from "@/hooks/use-auth";
import { PasswordConfirmDialog } from "@/components/finance/dialogs/password-confirm-dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";


import { formatDate } from "@/lib/format-utils";
import { amountToInput, maskAmountInput } from "@/lib/money-input";
import { upperText } from "@/lib/text-case";

import { useCategories } from "@/lib/queries";
import {
  itemFromRow,
  useSaveTransactionItems,
  useTransactionItems,
  validatePurchaseItems,
  type ItemDraft,
} from "@/lib/purchase-items";
import {
  useAccounts,
  useDeleteTransaction,
  useLastTransaction,
  useRestoreTransaction,
  useSaveCategoryFeedback,
  useSaveTransaction,
  type Transaction,
} from "@/lib/transactions";

import { sanitizeText } from "@/lib/validation";
import { cn } from "@/lib/utils";

type Kind = "expense" | "income";

export function TransactionDialog({
  open,
  onOpenChange,
  kind: initialKind = "expense",
  transaction,
  defaultDate,
  onSaved,
  presetCategoryId,
  presetSubCategoryId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind?: Kind;
  transaction?: Transaction | null;
  /** Data inicial sugerida (permite lançar em meses anteriores). */
  defaultDate?: string;
  onSaved?: (date: string) => void;
  /** Categoria já escolhida no menu rápido. */
  presetCategoryId?: string | null;
  /** Subcategoria já escolhida no menu rápido. */
  presetSubCategoryId?: string | null;
}) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (open && initialKind) setKind(initialKind);
  }, [open, initialKind]);

  const editing = Boolean(transaction);
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();
  const restore = useRestoreTransaction();
  const saveItems = useSaveTransactionItems();
  const { data: existingItems } = useTransactionItems(open ? transaction?.id : null);
  const [items, setItems] = useState<ItemDraft[]>([]);

  const options = useMemo(
    () => (categories ?? []).filter((category) => category.type === kind),
    [categories, kind],
  );


  const [errors, setErrors] = useState<Record<string, string>>({});
  const [advanced, setAdvanced] = useState(false);

  const [description, setDescription] = useState(transaction?.description ?? "");
  const [amount, setAmount] = useState(amountToInput(transaction?.amount));

  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? "");
  const [date, setDate] = useState(
    transaction?.transaction_date ?? defaultDate ?? isoDate(new Date()),
  );
  const [time, setTime] = useState(transaction?.transaction_time ?? "");
  const [paymentMethod, setPaymentMethod] = useState(transaction?.payment_method ?? "pix");
  const [expenseType, setExpenseType] = useState(transaction?.expense_type ?? "variavel");
  const [accountId, setAccountId] = useState(transaction?.account_id ?? "");
  const [merchant, setMerchant] = useState(transaction?.merchant_name ?? "");
  const [notes, setNotes] = useState(transaction?.notes ?? "");


  const [tags, setTags] = useState((transaction?.tags ?? []).join(", "));
  const [essential, setEssential] = useState(transaction?.is_essential ?? false);
  const [status, setStatus] = useState<string>(transaction?.status ?? (kind === "income" ? "received" : "paid"));
  const [recurring, setRecurring] = useState(transaction?.is_recurring ?? false);
  const [installments, setInstallments] = useState(
    transaction?.total_installments ? String(transaction.total_installments) : "",
  );
  const [dueDate, setDueDate] = useState(transaction?.due_date ?? "");
  const [attachment, setAttachment] = useState<string | null>(transaction?.attachment_url ?? null);
  const [suggestion, setSuggestion] = useState<{ id: string; name: string; subCategoryId?: string | null } | null>(null);
  const [subCategoryId, setSubCategoryId] = useState((transaction as any)?.sub_category_id ?? "");
  const [beneficiaryType, setBeneficiaryType] = useState<"adult_child" | "family_member" | "none">("none");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const saveFeedback = useSaveCategoryFeedback();
  const [revenueSuggestion, setRevenueSuggestion] = useState<{ message: string; date: string } | null>(null);


  const selectedCategory = useMemo(
    () => (categories ?? []).find((c) => c.id === (subCategoryId || categoryId)),
    [categories, subCategoryId, categoryId],
  );

  useEffect(() => {
    async function checkRevenue() {
      if (kind === "income" && date && !editing) {
        const { suggestRevenueTransfer } = await import("@/lib/reconciliation.functions");
        const res = await suggestRevenueTransfer({ data: { userId: "temp", date } });
        if (res.shouldSuggest && res.suggestedDate) {
          setRevenueSuggestion({ message: res.message, date: res.suggestedDate });
        } else {
          setRevenueSuggestion(null);
        }
      }
    }
    checkRevenue();
  }, [date, kind, editing]);

  const { data: lastTransaction } = useLastTransaction(kind);


  /** Sugestão automática baseada na descrição */
  useEffect(() => {
    if (!description || editing || categoryId) return;
    const clean = description.trim().toLowerCase();
    if (clean.length < 3) return;

    // Busca simples nas categorias existentes por nome
    const match = options.find(cat => 
      cat.name.toLowerCase().includes(clean) || 
      clean.includes(cat.name.toLowerCase())
    );
    
    if (match) {
      if (match.parent_id) {
        setCategoryId(match.parent_id);
        setSubCategoryId(match.id);
      } else {
        setCategoryId(match.id);
        setSubCategoryId("");
      }
      setSuggestion({ id: match.id, name: match.name });
    } else {
      setSuggestion(null);
    }


  }, [description, options, editing, categoryId]);

  /** Sugestão inteligente de categoria familiar */
  const autoCategorize = useServerFn(async (d: { description: string, beneficiaryType: any }) => {
    try {
      const { autoCategorizeFamilyExpense } = await import("@/lib/categorization/family-categories.functions");
      return await autoCategorizeFamilyExpense({ data: d });
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (!open || editing || kind !== "expense") return;
    if (beneficiaryType === "none" && !description) return;

    const timer = setTimeout(async () => {
      const result = await autoCategorize({ 
        description, 
        beneficiaryType: beneficiaryType === "none" ? undefined : beneficiaryType 
      });

      if (result) {
        const cat = options.find(c => c.name === result.categoryName);
        if (cat) {
          setCategoryId(cat.id);
          // Se houver subcategoria, poderíamos buscar aqui também
        }
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [description, beneficiaryType, kind, open, editing, options]);

  /**
   * Ao abrir um novo lançamento, herda categoria/forma de pagamento/conta do
   * último registro do mesmo tipo.
   */
  useEffect(() => {
    if (!open || editing || !lastTransaction) return;
    setSuggestion(null);
    setCategoryId((current) => {
      if (current) return current;
      const recent = readRecentCategories().find((id) =>
        options.some((option) => option.id === id),
      );
      
      const lastCat = lastTransaction.category_id;
      const lastSub = (lastTransaction as any).sub_category_id;
      
      if (lastSub) {
        setSubCategoryId(lastSub);
      }
      
      return recent ?? lastCat ?? "";
    });
    setPaymentMethod((current) => current || lastTransaction.payment_method || "pix");
    setAccountId((current) => current || lastTransaction.account_id || "");
    if (kind === "expense") {
      setExpenseType((current) => current || lastTransaction.expense_type || "variavel");
      setEssential((current) => current || Boolean(lastTransaction.is_essential));
    }
  }, [open, editing, lastTransaction, kind, options]);

  /** Categoria/subcategoria escolhidas no menu rápido têm prioridade. */
  useEffect(() => {
    if (!open || editing) return;
    if (presetCategoryId) setCategoryId(presetCategoryId);
    if (presetSubCategoryId !== undefined) setSubCategoryId(presetSubCategoryId ?? "");
  }, [open, editing, presetCategoryId, presetSubCategoryId]);



  /** Carrega os itens detalhados quando abre um lançamento existente. */
  useEffect(() => {
    if (!open) return;
    if (!transaction?.id) {
      setItems([]);
      return;
    }
    setItems((existingItems ?? []).map(itemFromRow));
  }, [open, transaction?.id, existingItems]);


  const isPastMonth = date.slice(0, 7) < isoDate(new Date()).slice(0, 7);
  const { data: closings } = useClosings();
  const lockedKeys = lockedMonthKeys(closings ?? []);
  const monthKey = date.slice(0, 7);
  const isBeforeStart = Boolean(date) && date < MIN_TRANSACTION_DATE;
  const isLockedMonth = lockedKeys.has(monthKey);

  /** Política global do administrador para competências passadas. */
  const { policy } = useClosingPolicy();
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  /** Liberação reaproveitável: vale para toda a competência por alguns minutos. */
  const pastUnlock = usePastEditUnlock(monthKey);
  const adminBlockedPast = policy.lockPastMonths && isPastMonth;
  const needsPassword =
    policy.requirePasswordForPastEdits && isPastMonth && !adminBlockedPast && !pastUnlock.unlocked;




  const { confirm: professionalConfirm, ConfirmDialog } = useConfirm();


  function shiftDate(kindOfShift: "today" | "yesterday" | "lastMonth") {

    const base = new Date();
    if (kindOfShift === "yesterday") base.setDate(base.getDate() - 1);
    if (kindOfShift === "lastMonth") base.setMonth(base.getMonth() - 1);
    setDate(isoDate(base));
  }

  /**
   * Competência inconsistente: a data escolhida está fora do dia/semana/mês
   * atual. Serve para oferecer atalhos de correção antes de salvar.
   */
  const competence = useMemo(() => {
    const now = new Date();
    const todayIso = isoDate(now);
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const weekStart = isoDate(monday);
    const monthStart = isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
    /** Mesmo dia do mês atual (ajustado ao último dia quando não existir). */
    const day = Number(date.slice(8, 10)) || now.getDate();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const sameDayThisMonth = isoDate(
      new Date(now.getFullYear(), now.getMonth(), Math.min(day, lastDay)),
    );

    return {
      todayIso,
      weekStart,
      monthStart,
      sameDayThisMonth,
      outOfToday: Boolean(date) && date !== todayIso,
      outOfWeek: Boolean(date) && (date < weekStart || date > todayIso),
      outOfMonth: Boolean(date) && date.slice(0, 7) !== todayIso.slice(0, 7),
    };
  }, [date]);

  const dateInconsistent = competence.outOfWeek || competence.outOfMonth;



  /** Ctrl/Cmd + Enter salva; Alt + C abre o seletor de categoria. */
  function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    const target = event.target as HTMLElement | null;
    const isTextarea = target?.tagName === "TEXTAREA";

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
      return;
    }

    if (event.key === "Enter" && !isTextarea && target?.tagName === "INPUT") {
      event.preventDefault();
      const fields = Array.from(
        event.currentTarget.querySelectorAll<HTMLElement>(
          "input:not([type=hidden]), button[data-category-trigger], textarea",
        ),
      );
      const index = fields.indexOf(target);
      const next = fields[index + 1];
      if (next) next.focus();
      else event.currentTarget.requestSubmit();
      return;
    }

    if (event.altKey && (event.key === "c" || event.key === "C")) {
      event.preventDefault();
      event.currentTarget
        .querySelector<HTMLButtonElement>("button[data-category-trigger]")
        ?.click();
    }
  }





  function reset() {
    setDescription("");
    setAmount("");
    setCategoryId("");
    setSubCategoryId("");
    setDate(defaultDate ?? isoDate(new Date()));
    setTime("");
    setMerchant("");
    setNotes("");
    setTags("");
    setInstallments("");
    setDueDate("");
    setAttachment(null);
    setErrors({});
    setSuggestion(null);
    setItems([]);
    setBeneficiaryType("none");
    setBeneficiaryName("");


  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const cleanDescription = sanitizeText(description);
    const value = toCents(parseAmount(amount));

    if (cleanDescription.length < 2) nextErrors.description = "Descreva o lançamento.";
    if (cleanDescription.length > 140) nextErrors.description = "Descrição muito longa.";
    if (!Number.isFinite(value) || value <= 0) nextErrors.amount = "Informe um valor maior que zero.";
    if (value > 100_000_000) nextErrors.amount = "Valor muito alto.";
    if (!date) nextErrors.date = "Informe a data.";
    else if (isBeforeStart)
      nextErrors.date = "O sistema começa em julho de 2026. Escolha uma data a partir de 01/07/2026.";
    else if (isLockedMonth)
      nextErrors.date =
        "Este mês já foi fechado. Solicite a liberação ao administrador em Fechamento mensal.";
    else if (adminBlockedPast)
      nextErrors.date =
        policy.notice ||
        "O administrador desativou alterações em meses anteriores. Solicite a liberação em Fechamento mensal.";

    if (!nextErrors.date && needsPassword) {
      setErrors({});
      setPasswordOpen(true);
      return;
    }



    const itemsCheck = validatePurchaseItems(items, value);
    
    // Alerta de inconsistência de data/competência e data incoerente
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDate = new Date(date);
    
    const isPast = selectedDate < todayStart;
    const isFuture = selectedDate > now;
    const isDifferentDay = selectedDate.getDate() !== now.getDate() || 
                           selectedDate.getMonth() !== now.getMonth() ||
                           selectedDate.getFullYear() !== now.getFullYear();

    // Se houver beneficiário familiar, anexamos às notas se não houver um campo específico no DB ainda
    let finalNotes = notes;
    if (beneficiaryType !== "none" && beneficiaryName) {
      const prefix = beneficiaryType === "adult_child" ? "[Filho Maior]" : "[Outro Familiar]";
      if (!finalNotes.includes(prefix)) {
        finalNotes = `${prefix} ${beneficiaryName}${finalNotes ? ` - ${finalNotes}` : ""}`;
      }
    }

    
    if (!editing && isDifferentDay) {
      const msg = `Você selecionou a data ${formatDate(date)}, que é diferente de hoje.${isPast ? " Isso afetará o saldo de meses anteriores." : isFuture ? " Isso ficará pendente no saldo futuro." : ""}`;
      
      professionalConfirm({
        title: "Confirmar Data",
        description: `${msg} Deseja prosseguir com o lançamento para este dia?`,
        type: isPast ? "warning" : "question",
        onConfirm: () => void executeSubmit(value, cleanDescription)
      });
      return;
    }


    await executeSubmit(value, cleanDescription);
  }

  async function executeSubmit(value: number, cleanDescription: string) {
    const itemsCheck = validatePurchaseItems(items, value);
    const nextErrors: Record<string, string> = {};

    if (itemsCheck.issues.length > 0) {

      nextErrors.items = "Corrija os itens destacados da compra.";
    } else if (itemsCheck.totalMismatch) {
      nextErrors.items = `A soma dos itens (${itemsCheck.total
        .toFixed(2)
        .replace(".", ",")}) não bate com o valor do gasto. Diferença de ${Math.abs(itemsCheck.diff)
        .toFixed(2)
        .replace(".", ",")}.`;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const total = installments ? Number(installments) : null;

    try {
      const saved = await save.mutateAsync({
        id: transaction?.id,
        values: {
          description: cleanDescription,
          amount: value,
          transaction_type: kind,
          category_id: categoryId || null,
          sub_category_id: subCategoryId || null,
          account_id: accountId || null,
          transaction_date: date,
          transaction_time: time || null,
          payment_method: paymentMethod || null,
          expense_type: kind === "expense" ? expenseType : null,
          merchant_name: merchant ? sanitizeText(merchant) : null,
          notes: notes ? sanitizeText(notes) : null,
          tags: tags
            .split(",")
            .map((tag) => sanitizeText(tag))
            .filter(Boolean)
            .slice(0, 10),
          is_essential: essential,
          is_recurring: recurring,
          total_installments: total && total > 1 ? total : null,
          installment_number: total && total > 1 ? 1 : null,
          due_date: dueDate || null,
          attachment_url: attachment,
          status: status as Transaction["status"],

        },
      });

      const filledItems = items.filter((item) => item.name.trim().length > 0);
      if (saved?.id && (filledItems.length > 0 || (existingItems ?? []).length > 0)) {
        await saveItems.mutateAsync({ transactionId: saved.id, items: filledItems });
      }

      if (categoryId) rememberCategory(categoryId);
      const savedDate = date;
      onOpenChange(false);
      reset();
      onSaved?.(savedDate);

      if (editing) {
        toast.success("Lançamento atualizado.", {
          description: isPastMonth ? `Registrado em ${formatDate(savedDate)}.` : undefined,
        });
        return;
      }

      toast.success("Lançamento salvo!", {
        description: cleanDescription,
        action: {
          label: "Desfazer",
          onClick: async () => {
            await remove.mutateAsync([saved.id]);
            toast("Lançamento desfeito.", {
              action: {
                label: "Refazer",
                onClick: () => restore.mutate([saved.id]),
              },
            });
          },
        },
        duration: 8000,
      });
    } catch (error) {
      console.error("[transacoes] falha ao salvar", error);
      toast.error("Não foi possível salvar o lançamento.");
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-h-[92svh] sm:max-w-xl p-0 gap-0 overflow-hidden">
        <div className="flex items-center justify-between px-8 pt-8">
           <div className="flex gap-2">
              <Badge variant={currentStep === 1 ? "default" : "outline"} className="cursor-pointer" onClick={() => setCurrentStep(1)}>Básico</Badge>
              <Badge variant={currentStep === 2 ? "default" : "outline"} className="cursor-pointer" onClick={() => setCurrentStep(2)}>Detalhes</Badge>
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className={cn("size-1.5 rounded-full", kind === "expense" ? "bg-destructive" : "bg-primary")} />
              {kind === "expense" ? "Despesa" : "Receita"}
           </div>
        </div>

        <DialogHeader className="px-8 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {editing ? "Editar lançamento" : kind === "income" ? "Nova receita" : "Novo gasto"}
          </DialogTitle>
        </DialogHeader>

        <form autoComplete="off" data-1p-ignore
          ref={formRef}
          onSubmit={handleSubmit}
          onKeyDown={handleFormKeyDown}
          noValidate
        >
          {currentStep === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">O que você comprou ou recebeu?</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={140}
                    className="mt-2 h-12 text-base rounded-2xl bg-muted/30 border-none px-5"
                    placeholder={kind === "income" ? "Ex: Salário Mensal..." : "Ex: Supermercado Silva..."}
                  />
                  {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valor (R$)</Label>
                  <Input
                    id="amount"
                    value={amount}
                    inputMode="numeric"
                    onChange={(event) => setAmount(maskAmountInput(event.target.value))}
                    className="h-12 text-xl font-bold rounded-2xl bg-muted/30 border-none px-5 text-primary tabular-nums"
                    placeholder="0,00"
                  />
                  {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="h-12 rounded-2xl bg-muted/30 border-none px-5"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria</Label>
                  <CategoryPicker
                    categories={options}
                    value={subCategoryId || categoryId}
                    onChange={(id) => {
                      const selectedCat = options.find((c) => c.id === id);
                      if (selectedCat?.parent_id) {
                        setCategoryId(selectedCat.parent_id);
                        setSubCategoryId(id);
                      } else {
                        setCategoryId(id);
                        setSubCategoryId("");
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none px-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conta</Label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none px-5">
                      <SelectValue placeholder="Padrão" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="merchant" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Local / Beneficiário</Label>
                  <Input
                    id="merchant"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="h-12 rounded-2xl bg-muted/30 border-none px-5"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Observações</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] rounded-2xl bg-muted/30 border-none px-5 py-3 resize-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                   <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Despesa Essencial</Label>
                      <p className="text-[11px] text-muted-foreground">Marque se for um gasto vital</p>
                   </div>
                   <Switch checked={essential} onCheckedChange={setEssential} />
                </div>
              </div>
            </div>
          )}
        {currentStep === 1 ? (
          <div className="px-8 py-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">O que você comprou ou recebeu?</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={140}
                  className="mt-2 h-12 text-base rounded-2xl bg-muted/30 border-none px-5"
                  placeholder={kind === "income" ? "Ex: Salário Mensal..." : "Ex: Supermercado Silva..."}
                />
                {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valor (R$)</Label>
                <Input
                  id="amount"
                  value={amount}
                  inputMode="numeric"
                  onChange={(event) => setAmount(maskAmountInput(event.target.value))}
                  className="h-12 text-xl font-bold rounded-2xl bg-muted/30 border-none px-5 text-primary tabular-nums"
                  placeholder="0,00"
                />
                {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="h-12 rounded-2xl bg-muted/30 border-none px-5"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria</Label>
                <CategoryPicker
                  categories={options}
                  value={subCategoryId || categoryId}
                  onChange={(id) => {
                    const cat = options.find(c => c.id === id);
                    if (cat?.parent_id) {
                      setCategoryId(cat.parent_id);
                      setSubCategoryId(id);
                    } else {
                      setCategoryId(id);
                      setSubCategoryId("");
                    }
                  }}
                />
                {errors.categoryId && <p className="mt-1 text-xs text-destructive">{errors.categoryId}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[60svh]">
             <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Forma de pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-2 h-11 rounded-xl bg-muted/30 border-none">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conta ou carteira</Label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger className="mt-2 h-11 rounded-xl bg-muted/30 border-none">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      {(accounts ?? []).map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                   <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Observações</Label>
                   <Textarea
                     id="notes"
                     value={notes}
                     onChange={(event) => setNotes(sanitizeText(event.target.value))}
                     className="mt-2 rounded-xl bg-muted/30 border-none resize-none"
                     placeholder="Detalhes adicionais..."
                     rows={3}
                   />
                </div>
             </div>
          </div>
        )}

        <DialogFooter className="px-8 py-6 border-t border-border bg-muted/10">
          <div className="flex w-full items-center justify-between gap-3">
             {currentStep === 1 ? (
               <Button type="button" variant="ghost" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancelar</Button>
             ) : (
               <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setCurrentStep(1)}>Voltar</Button>
             )}
             
             <div className="flex gap-2">
                {currentStep === 1 && (
                  <Button type="button" variant="secondary" className="rounded-xl px-6" onClick={() => setCurrentStep(2)}>Mais Detalhes</Button>
                )}
                <Button type="submit" disabled={save.isPending} className="rounded-xl px-8 shadow-lg shadow-primary/20">
                  {save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {editing ? "Atualizar" : "Salvar Lançamento"}
                </Button>
             </div>
          </div>
        </DialogFooter>

      </form>
      <PasswordConfirmDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        email={user?.email}
        description={`Para ${editing ? "editar" : "registrar"} um lançamento de ${formatDate(date)} (mês anterior) confirme sua senha. A liberação vale ${PAST_EDIT_UNLOCK_MINUTES} minutos para todo o mês.`}
        onConfirmed={() => {
          pastUnlock.grant();
          window.setTimeout(() => formRef.current?.requestSubmit(), 0);
        }}
      />
      </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </>
  );
}

