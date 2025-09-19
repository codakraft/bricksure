import {
  FundWalletResponse,
  GetAllTransactionsResponse,
  WalletResponse,
} from "../types";
import { api } from "./api";

// Wallet API endpoints
export const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<WalletResponse, void>({
      query: () => ({
        url: "/api/v1/wallet",
        method: "GET",
      }),
    }),
    fundWallet: builder.mutation<
      FundWalletResponse,
      {
        amount: number;
        email: string;
      }
    >({
      query: (body) => ({
        url: "/api/v1/wallet/fund/paystack",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet"],
    }),
    fundWalletByEmbeddly: builder.mutation<
      FundWalletResponse,
      {
        amount: number;
        email: string;
      }
    >({
      query: (body) => ({
        url: "/api/v1/wallet/fund/paystack",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet"],
    }),
    getWalletTransactions: builder.query<GetAllTransactionsResponse, void>({
      query: () => ({
        url: "/api/v1/wallet/transaction/view-all",
        method: "GET",
      }),
      providesTags: ["Transaction"],
    }),
  }),
});

export const {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useFundWalletMutation,
} = walletApi;
