import { api } from "./api";

// Quote types
interface Quote {
  id: string;
  propertyId: string;
  tier: string;
  riders: string[];
  premium: number;
  frequency: string;
  createdAt: string;
}

interface CreateQuoteRequest {
  propertyId: string;
  tier: string;
  riders: string[];
}

// Quotes API endpoints
export const quotesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQuote: builder.mutation<{ ok: boolean; data: Quote }, CreateQuoteRequest>({
      query: (body) => ({
        url: '/quotes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Quote'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useCreateQuoteMutation,
} = quotesApi;