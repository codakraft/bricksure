import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Custom base query with auth token handling and error handling
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'https://bricksure-api.onrender.com',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('bricksure-token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Enhanced base query with error handling
const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    localStorage.removeItem('bricksure-token');
    window.location.href = '/login';
  }
  
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ['User', 'Property', 'Quote', 'Policy', 'Wallet', 'Transaction'],
  endpoints: () => ({}),
});