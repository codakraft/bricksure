import { api } from "./api";

// User types
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: string;
  createdAt: string;
}

// Profile API endpoints
export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<{ ok: boolean; data: User }, void>({
      query: () => '/profile/me',
      providesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetProfileQuery,
} = profileApi;