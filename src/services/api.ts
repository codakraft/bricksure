import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Env': 'sandbox' // Will be configurable
  }
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bricksure-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bricksure-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API responses for development and demo
if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
  const mock = new MockAdapter(api, { delayResponse: 1000 });

  // Auth endpoints
  mock.onPost('/auth/register').reply(200, { ok: true, data: { message: 'Registration successful' } });
  mock.onPost('/auth/login').reply(200, { 
    ok: true, 
    data: { 
      token: 'mock-jwt-token',
      user: {
        id: 'USR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        kycStatus: 'pending',
        createdAt: new Date().toISOString()
      }
    }
  });
  mock.onPost('/auth/otp/verify').reply(200, { 
    ok: true, 
    data: { 
      token: 'mock-jwt-token',
      user: {
        id: 'USR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        kycStatus: 'verified',
        createdAt: new Date().toISOString()
      }
    }
  });

  // Profile endpoints
  mock.onGet('/profile/me').reply(200, {
    ok: true,
    data: {
      id: 'USR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+2348012345678',
      kycStatus: 'verified',
      createdAt: new Date().toISOString()
    }
  });

  // Properties endpoints
  mock.onGet('/properties').reply(200, { ok: true, data: [] });
  mock.onPost('/properties').reply(200, { ok: true, data: { id: '1' } });

  // Quotes endpoints
  mock.onPost('/quotes').reply(200, { 
    ok: true, 
    data: {
      id: '1',
      propertyId: '1',
      tier: 'standard',
      riders: ['fire', 'flood'],
      premium: 25000,
      frequency: 'annual',
      createdAt: new Date().toISOString()
    }
  });

  // Policies endpoints
  mock.onGet('/policies').reply(200, { ok: true, data: [] });

  // Wallet endpoints
  mock.onGet('/wallet').reply(200, { 
    ok: true, 
    data: { balance: 0, currency: 'NGN' }
  });
  mock.onGet('/wallet/transactions').reply(200, { ok: true, data: [] });

  // Notifications
  mock.onGet('/notifications').reply(200, { ok: true, data: [] });
}