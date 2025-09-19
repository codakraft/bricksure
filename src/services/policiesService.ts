import { PolicyResponse } from "../types";
import { api } from "./api";


// Policies API endpoints
export const policiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPolicies: builder.query<PolicyResponse, void>({
      query: () => ({
        url: '/api/v1/property/policy',
      method: 'GET',
      }),
    }),
  }),
});

export const { 
  useGetPoliciesQuery,
} = policiesApi;