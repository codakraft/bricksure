import { api } from "./api";

// Policy types
interface Policy {
  id: string;
  propertyId: string;
  status: string;
  premium: number;
  coverage: string;
  startDate: string;
  endDate: string;
}

// Policies API endpoints
export const policiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPolicies: builder.query<{ ok: boolean; data: Policy[] }, void>({
      query: () => '/policies',
      providesTags: ['Policy'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetPoliciesQuery,
} = policiesApi;