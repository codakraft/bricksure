import { api } from "./api";

// Property types
interface Property {
  id: string;
  address: string;
  value: number;
  type: string;
}

// Properties API endpoints
export const propertiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<{ ok: boolean; data: Property[] }, void>({
      query: () => '/properties',
      providesTags: ['Property'],
    }),
    createProperty: builder.mutation<{ ok: boolean; data: Property }, Partial<Property>>({
      query: (body) => ({
        url: '/properties',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Property'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetPropertiesQuery,
  useCreatePropertyMutation,
} = propertiesApi;