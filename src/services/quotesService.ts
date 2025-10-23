import {
  ChargesResponse,
  NewCreateQuoteRequest,
  NewCreateQuoteResponse,
  SeaLevelResponse,
} from "../types";
import { api } from "./api";

// Quotes API endpoints
export const quotesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQuote: builder.mutation<
      NewCreateQuoteResponse,
      NewCreateQuoteRequest
    >({
      query: (body) => ({
        url: "/api/v1/property/quote",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Quote"],
    }),
    getPendingQuotes: builder.query<NewCreateQuoteResponse[], void>({
      query: () => ({
        url: "/api/v1/property/pending-quotes",
        method: "GET",
      }),
      providesTags: ["Quote"],
    }),
    quotePayment: builder.mutation<NewCreateQuoteResponse, { quoteId: string }>(
      {
        query: (body) => ({
          url: `/api/v1/property/pay`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["Quote"],
      }
    ),
    getCharges: builder.query<ChargesResponse, void>({
      query: () => ({
        url: "/api/v1/property/charges",
        method: "GET",
      }),
    }),
    getSeaLevel: builder.mutation<SeaLevelResponse, { location: string }>({
      query: (body) => ({
        url: "/sea-level",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateQuoteMutation,
  useGetChargesQuery,
  useGetSeaLevelMutation,
  useGetPendingQuotesQuery,
  useQuotePaymentMutation,
} = quotesApi;
