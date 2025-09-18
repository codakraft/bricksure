import { api } from "./api";

// Wallet types
interface Wallet {
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  status: string;
}

// Wallet API endpoints
export const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<{ ok: boolean; data: Wallet }, void>({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),
    getWalletTransactions: builder.query<{ ok: boolean; data: Transaction[] }, void>({
      query: () => '/wallet/transactions',
      providesTags: ['Transaction'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
} = walletApi;