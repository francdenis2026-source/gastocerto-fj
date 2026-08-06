import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSaveTransaction } from '../lib/transactions';
import { supabase } from '../integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock do supabase client
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
  },
}));

// Mock do hook de auth
vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'parent-user-id-123' },
  }),
}));

// Mock do server function assertWriteAllowed
vi.mock('@tanstack/react-start', async () => {
  const actual = await vi.importActual('@tanstack/react-start');
  return {
    ...actual,
    useServerFn: () => vi.fn().mockResolvedValue({}),
  };
});

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('Espaço Kids Integration - Transaction Saving', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('deve salvar a transação com o user_id do pai mesmo quando enviado explicitamente no Espaço Kids', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );

    const { result } = renderHook(() => useSaveTransaction(), { wrapper });

    const kidsTransactionValues = {
      description: 'Filho - Lanche',
      amount: 1500,
      transaction_type: 'expense' as const,
      category_id: 'some-cat-id',
      transaction_date: '2023-10-27',
      status: 'paid' as const,
      payment_date: '2023-10-27',
      tags: ['dependente:child-id', 'motivo:gasto_lanche'],
      user_id: 'parent-user-id-123',
    };

    // Mock das chamadas encadeadas do supabase
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
    };
    (supabase.from('transactions').insert as any).mockReturnValue(mockQueryBuilder);

    await result.current.mutateAsync({ values: kidsTransactionValues });

    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(supabase.from('transactions').insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'parent-user-id-123',
      })
    );
  });

  it('deve garantir que o user_id é injetado pelo hook caso não seja fornecido', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );

    const { result } = renderHook(() => useSaveTransaction(), { wrapper });

    const simpleTransactionValues = {
      description: 'Gasto Comum',
      amount: 5000,
      transaction_type: 'expense' as const,
      category_id: 'cat-id',
    };

    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
    };
    (supabase.from('transactions').insert as any).mockReturnValue(mockQueryBuilder);

    await result.current.mutateAsync({ values: simpleTransactionValues });

    expect(supabase.from('transactions').insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'parent-user-id-123',
      })
    );
  });
});
