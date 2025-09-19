import { StateResponse, LGAResponse, PropertyTypeResponse, ViewAllPropertiesResponse, ViewPropertyByIdResponse } from "../types";
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
    getProperties: builder.query<ViewAllPropertiesResponse, void>({
      query: () => ({
        url: "/api/v1/property/view-all",
        method: "GET",
      }),
      providesTags: ["Property"],
    }),
    createProperty: builder.mutation<
      { ok: boolean; data: Property },
      Partial<Property>
    >({
      query: (body) => ({
        url: "/properties",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Property"],
    }),
    getStates: builder.query<StateResponse, void>({
      query: () => ({
        url: "/api/v1/utils/view-states",
        method: "GET",
      }),
    }),
    getStatesLGA: builder.query<LGAResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/utils/view-lgas/${id}`,
        method: "GET",
      }),
    }),
    getPropertyType: builder.query<PropertyTypeResponse, void>({
      query: () => ({
        url: `/api/v1/property/types`,
        method: "GET",
      }),
    }),
    getPropertyByID: builder.query<ViewPropertyByIdResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/property/${id}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPropertiesQuery,
  useCreatePropertyMutation,
  useGetStatesQuery,
  useLazyGetStatesLGAQuery,
  useGetPropertyTypeQuery,
  useLazyGetPropertyByIDQuery
} = propertiesApi;
