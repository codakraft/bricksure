import { api } from "./api";

// Notification types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

// Notifications API endpoints
export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<{ ok: boolean; data: Notification[] }, void>({
      query: () => '/notifications',
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetNotificationsQuery,
} = notificationsApi;