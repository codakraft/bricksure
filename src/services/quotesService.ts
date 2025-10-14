import {
  ChargesResponse,
  CreateQuoteRequest,
  CreateQuoteResponse,
} from "../types";
import { api } from "./api";

// Quotes API endpoints
export const quotesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQuote: builder.mutation<CreateQuoteResponse, CreateQuoteRequest>({
      query: (body) => ({
        url: "/api/v1/property/quote",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Quote"],
    }),
    getCharges: builder.query<ChargesResponse, void>({
      query: () => ({
        url: "/api/v1/property/charges",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useCreateQuoteMutation, useGetChargesQuery } = quotesApi;
