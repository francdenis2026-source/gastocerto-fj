import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Copy, Loader2, Landmark, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

import { PENDING_LICENSE_KEY } from "@/components/landing/code-access-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  confirmCheckoutVerification,
  getCheckoutStatus,
  getManualPaymentInstructions,
  requestCheckoutVerification,
  startManualOrder,
} from "@/lib/checkout.functions";

import {
  CHECKOUT_PLANS,
  CHECKOUT_STATUS_LABEL,
  checkoutPrice,
  type CheckoutCycle,
  type CheckoutPlan,
} from "@/lib/checkout";
import { maskCpf } from "@/lib/cpf";
import { formatCurrency } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { livePrice, usePublicPlans } from "@/hooks/use-public-plans";

type Step = "plan" | "details" | "form" | "code" | "manual" | "done";

type Order = Awaited<ReturnType<typeof startManualOrder>>;
type Verification = Awaited<ReturnType<typeof requestCheckoutVerification>>;

export function CheckoutDialog({
  open,
  onOpenChange,
  initialPlan,
  initialCycle = "annual",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlan?: CheckoutPlan["slug"];
  initialCycle?: CheckoutCycle;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("plan");
  const [planSlug, setPlanSlug] = useState<CheckoutPlan["slug"]>(initialPlan ?? "premium_ia");
  const [cycle, setCycle] = useState<CheckoutCycle>(initialCycle);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("pending");
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [code, setCode] = useState("");
  const pollRef = useRef<number | null>(null);

  const { data: livePlans } = usePublicPlans();

  const { data: manual } = useQuery({
    queryKey: ["manual-payment-instructions"],
    queryFn: () => getManualPaymentInstructions(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const catalog = CHECKOUT_PLANS.map((item) => {
    const live = livePrice(livePlans, item.slug, { monthly: item.monthly, annual: item.annual });
    return { ...item, monthly: live.monthly, annual: live.annual };
  });

  const plan = catalog.find((item) => item.slug === planSlug) || catalog.find(p => p.slug === "premium") || catalog[0];
  const price = checkoutPrice(plan, cycle);

  useEffect(() => {
    if (!open) return;
    console.log("Dialog opened with initialPlan:", initialPlan);
    setStep(initialPlan ? "details" : "plan");
    if (initialPlan) setPlanSlug(initialPlan);
    setCycle(initialCycle);
    setOrder(null);
    setLicenseKey(null);
    setStatus("pending");
    setVerification(null);
    setCode("");
  }, [open, initialPlan, initialCycle]);

  useEffect(() => {
    if (step !== "manual" || !order) return;
    const check = async () => {
      try {
        const result = await getCheckoutStatus({ data: { paymentId: order.paymentId } });
        setStatus(result.status);
        if (result.status === "approved" && result.licenseKey) {
          setLicenseKey(result.licenseKey);
          setStep("done");
        }
      } catch {
        /* retry later */
      }
    };
    void check();
    pollRef.current = window.setInterval(check, 15000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [step, order]);

  const verify = useMutation({
    mutationFn: () =>
      requestCheckoutVerification({ data: { planSlug, cycle, fullName, email, cpf } }),
    onSuccess: (result) => {
      setVerification(result);
      setCode("");
      setStep("code");
      toast.success(
        result.emailDelivered
          ? `Código enviado para ${result.email}.`
          : "Código gerado.",
      );
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Erro ao enviar código."),
  });

  const create = useMutation({
    mutationFn: () =>
      startManualOrder({
        data: {
          planSlug: planSlug as "premium" | "premium_ia",
          cycle,
          fullName,
          email,
          cpf,
          verificationId: verification?.verificationId ?? "",
        },
      }),
    onSuccess: (result) => {
      setOrder(result);
      setStatus(result.status);
      setStep("manual");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Erro ao registrar pedido."),
  });

  const confirm = useMutation({
    mutationFn: () =>
      confirmCheckoutVerification({
        data: { verificationId: verification?.verificationId ?? "", code: code.trim() },
      }),
    onSuccess: () => {
      if (price > 0) {
        toast.success("E-mail confirmado. Gerando Pix...");
        create.mutate();
      } else {
        toast.success("E-mail confirmado. Acesso liberado.");
        setStep("done");
        setLicenseKey(PENDING_LICENSE_KEY);
      }
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Código inválido."),
  });

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado.`);
    } catch {
      toast.error("Copie manualmente.");
    }
  };

  const activateNow = () => {
    if (!licenseKey) return;
    try {
      sessionStorage.setItem(PENDING_LICENSE_KEY, licenseKey);
    } catch {
      /* ignore */
    }
    onOpenChange(false);
    navigate({ to: "/auth", search: { mode: "signup" } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95dvh] max-w-2xl overflow-y-auto p-0 border-white/10 bg-[#0A1512] shadow-2xl">
        {step === "plan" && (
          <div className="relative h-48 w-full overflow-hidden sm:h-64">
            <img 
              src={plan.slug === 'premium_ia' ? "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop" : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"} 
              alt={plan.name}
              className="h-full w-full object-cover brightness-[0.4]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1512] to-transparent" />
            <div className="absolute bottom-6 left-8 text-left">
              <Badge className="mb-2 bg-emerald-500 text-black font-black uppercase tracking-widest">{plan.recommended ? 'Recomendado' : 'Plano Selecionado'}</Badge>
              <h2 className="text-3xl font-black text-white">{plan.name}</h2>
              <p className="text-white/60 font-medium">{plan.tagline}</p>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <DialogHeader className={cn(step === 'plan' && 'sr-only')}>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" aria-hidden="true" />
              {step === "done" ? "Acesso Liberado" : step === "details" ? `Sobre o plano ${plan.name}` : "Assinar o GastoCerto"}
            </DialogTitle>
            <DialogDescription>
              {step === "plan"
                ? "Escolha o plano e o ciclo de cobrança."
                : step === "details"
                  ? "Confira os detalhes e benefícios exclusivos deste plano."
                  : step === "form"
                    ? "Informe seus dados para confirmação."
                  : step === "code"
                    ? "Digite o código enviado ao seu e-mail."
                    : step === "manual"
                      ? "Faça o pagamento e aguarde."
                      : "Tudo pronto!"}
            </DialogDescription>
          </DialogHeader>

          {step === "plan" ? (
            <div className="space-y-4">
              <div
                role="group"
                aria-label="Ciclo de cobrança"
                className="inline-flex rounded-full border border-white/10 bg-white/5 p-1"
              >
                {[
                  { key: "monthly" as const, label: "Mensal" },
                  { key: "annual" as const, label: "Anual" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setCycle(option.key)}
                    className={cn(
                      "min-h-9 rounded-full px-6 text-xs font-bold transition-all",
                      cycle === option.key
                        ? "bg-emerald-500 text-black"
                        : "text-white/40 hover:text-white",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3">
                {catalog.map((item) => {
                  const selected = item.slug === planSlug;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => setPlanSlug(item.slug)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        selected
                          ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                          : "border-white/10 hover:border-white/20",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-bold text-white">
                          {item.name}
                          {item.recommended && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[10px]">IA Ativa</Badge>
                          )}
                        </span>
                        <span className="tabular text-lg font-black text-white">
                          {formatCurrency(checkoutPrice(item, cycle))}
                          <span className="ml-1 text-xs font-medium text-white/40">
                            {cycle === "annual" ? "/ano" : "/mês"}
                          </span>
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/40 font-medium">{item.tagline}</p>
                    </button>
                  );
                })}
              </div>

              <ul className="grid gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                {plan.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-xs font-medium">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                    <span className="text-white/60">{highlight}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full h-12 text-sm font-black uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400" onClick={() => setStep("details")}>
                Ver Detalhes do Plano
              </Button>
            </div>
          ) : null}

          {step === "details" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">{plan.details?.title || plan.name}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{plan.details?.description || plan.tagline}</p>
              </div>

              <div className="grid gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-1">O que você terá acesso:</p>
                {(plan.details?.items || plan.highlights).map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-emerald-500/20 p-0.5">
                      <Check className="size-3 text-emerald-500" />
                    </div>
                    <span className="text-sm font-medium text-white/80">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" className="flex-1 border border-white/10 hover:bg-white/5 text-white/60" onClick={() => setStep("plan")}>
                  Trocar Plano
                </Button>
                <Button className="flex-[2] h-12 bg-emerald-500 text-black font-black uppercase tracking-widest" onClick={() => setStep("form")}>
                  Continuar — {formatCurrency(price)}
                </Button>
              </div>
            </div>
          )}

          {step === "form" && (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); verify.mutate(); }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <p className="font-bold text-white">{plan.name} · {cycle === "annual" ? "Anual" : "Mensal"}</p>
                <p className="text-emerald-500 font-black mt-1">{formatCurrency(price)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Nome completo</Label>
                <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-white/5 border-white/10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">E-mail</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">CPF</Label>
                <Input required value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} className="bg-white/5 border-white/10 rounded-xl" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 border-white/10" onClick={() => setStep("plan")}>Voltar</Button>
                <Button type="submit" className="flex-1 bg-emerald-500 text-black font-bold" disabled={verify.isPending}>
                  {verify.isPending ? <Loader2 className="size-4 animate-spin" /> : "Confirmar"}
                </Button>
              </div>
            </form>
          )}

          {step === "code" && (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); confirm.mutate(); }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-sm text-white/60">Código enviado para</p>
                <p className="font-bold text-white">{email}</p>
              </div>
              <div className="space-y-2 text-center">
                <Label className="text-white/60">Digite os 6 dígitos</Label>
                <Input 
                  className="text-center text-2xl tracking-[0.5em] font-black h-16 bg-white/5 border-white/10" 
                  maxLength={6} 
                  required 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} 
                />
              </div>
              <Button className="w-full h-12 bg-emerald-500 text-black font-black" disabled={confirm.isPending || code.length < 6}>
                {confirm.isPending ? <Loader2 className="size-4 animate-spin" /> : "Ativar Agora"}
              </Button>
            </form>
          )}

          {step === "manual" && order && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Pagamento via Pix</p>
                <p className="text-3xl font-black text-white">{formatCurrency(order.amount)}</p>
              </div>

              {manual?.pixKey ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="bg-white p-1.5 rounded-lg shadow-inner">
                      {/* QR Code placeholder or image logic */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(manual.pixKey)}`} 
                        alt="Pix QR" 
                        className="size-32 sm:size-36" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/40 text-[10px] font-bold uppercase tracking-tight">Chave Pix</Label>
                    <div className="flex gap-1.5">
                      <Input readOnly value={manual.pixKey} className="h-8 bg-white/5 border-white/10 font-mono text-[11px] px-2" />
                      <Button variant="outline" size="sm" onClick={() => copy(manual.pixKey, "Chave Pix")} className="h-8 border-white/10 px-2.5"><Copy className="size-3.5" /></Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <Loader2 className="size-8 animate-spin mx-auto mb-4 text-emerald-500" />
                  <p className="text-sm text-white/60 font-medium">Aguardando chave do sistema...</p>
                </div>
              )}

              <div className="pt-4 space-y-3">
                <p className="text-center text-[10px] text-white/40 font-bold uppercase tracking-widest">Status: {CHECKOUT_STATUS_LABEL[status as keyof typeof CHECKOUT_STATUS_LABEL] || status}</p>
                <Button variant="outline" className="w-full border-white/10" onClick={() => onOpenChange(false)}>Fechar e aguardar</Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="text-center space-y-6 py-4">
              <div className="size-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <Check className="size-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Acesso Liberado!</h3>
                <p className="text-white/60 font-medium mt-2">Sua assinatura foi confirmada com sucesso.</p>
              </div>
              <Button className="w-full h-14 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl" onClick={activateNow}>
                Começar Agora
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
