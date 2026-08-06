import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { transactionService, accountService, budgetService } from "@/services/supabase/finance";
import { TransactionRange, TransactionType } from "@/types/finance";

export function useTransactions(range?: TransactionRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id, range?.start ?? "all", range?.end ?? "all"],
    enabled: Boolean(user?.id),
    queryFn: () => transactionService.getAll(user!.id, range),
  });
}

export function useLastTransaction(kind: TransactionType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["last-transaction", user?.id, kind],
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    queryFn: () => transactionService.getLast(user!.id, kind),
  });
}

export function useAccounts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["accounts", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => accountService.getAll(user!.id),
  });
}

export function useBudgets(year: number, month: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["budgets", user?.id, year, month],
    enabled: Boolean(user?.id),
    queryFn: () => budgetService.getForPeriod(user!.id, year, month),
  });
}
