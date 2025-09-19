import { http, HttpResponse } from 'msw';
import EncryptionService from '../utils/encryptionService';

const encryptionService = new EncryptionService();
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_SERVICE_KEY || 'default-encryption-key-2023';
const IV_KEY = import.meta.env.VITE_IV_KEY || 'default-iv-key-16';

const generateUserId = () => 
  'USR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

// Helper function to decrypt request data
const decryptRequestData = async (request: Request): Promise<any> => {
  try {
    const body = await request.json() as { encryptedData?: string };
    if (body.encryptedData) {
      const decryptedData = await encryptionService.decrypt(body.encryptedData, ENCRYPTION_KEY, IV_KEY);
      return JSON.parse(decryptedData);
    }
    return body;
  } catch (error) {
    console.error('Mock decryption error:', error);
    return {};
  }
};

// Helper function to encrypt response data
const encryptResponseData = async (data: any): Promise<{ encryptedData: string }> => {
  try {
    const dataString = JSON.stringify(data);
    const encryptedData = await encryptionService.encrypt(dataString, ENCRYPTION_KEY, IV_KEY);
    return { encryptedData };
  } catch (error) {
    console.error('Mock encryption error:', error);
    return { encryptedData: '' };
  }
};

export const handlers = [
  // Auth endpoints
  http.post('/auth/register', async ({ request }) => {
    const data = await decryptRequestData(request);
    const responseData = { ok: true, data: { message: 'Registration successful' } };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),

  http.post('/auth/login', async ({ request }) => {
    const data = await decryptRequestData(request);
    const responseData = {
      ok: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: generateUserId(),
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+2348012345678',
          kycStatus: 'pending',
          createdAt: new Date().toISOString()
        }
      }
    };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),

  http.post('/auth/otp/verify', async ({ request }) => {
    const data = await decryptRequestData(request);
    const { code } = data;
    
    // Only accept the static OTP: 099887
    if (code !== '099887') {
      const errorResponse = { 
        ok: false, 
        error: { 
          message: 'Invalid OTP code. Please enter the correct verification code.' 
        } 
      };
      const encryptedError = await encryptResponseData(errorResponse);
      return HttpResponse.json(encryptedError, { status: 400 });
    }
    
    const responseData = { 
      ok: true, 
      data: { 
        token: 'mock-jwt-token',
        user: {
          id: generateUserId(),
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+2348012345678',
          kycStatus: 'verified',
          createdAt: new Date().toISOString()
        }
      }
    };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),

  // Profile endpoints
  http.get('/profile/me', async () => {
    const responseData = {
      ok: true,
      data: {
        id: generateUserId(),
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        kycStatus: 'verified',
        createdAt: new Date().toISOString()
      }
    };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),

  // Properties endpoints
  http.get('/properties', async () => {
    const responseData = { ok: true, data: [] };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),

  http.post('/properties', async ({ request }) => {
    const data = await decryptRequestData(request);
    const responseData = { ok: true, data: { id: '1', ...data } };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),

  // Quotes endpoints
  http.post('/quotes', async ({ request }) => {
    const data = await decryptRequestData(request);
    const responseData = { 
      ok: true, 
      data: {
        id: '1',
        propertyId: data.propertyId || '1',
        tier: data.tier || 'standard',
        riders: data.riders || ['fire', 'flood'],
        premium: 25000,
        frequency: 'annual',
        createdAt: new Date().toISOString()
      }
    };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),

  // Policies endpoints
  http.get('/policies', async () => {
    const responseData = { ok: true, data: [] };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),

  // Wallet endpoints
  http.get('/wallet', async () => {
    const responseData = { 
      ok: true, 
      data: { balance: 0, currency: 'NGN' }
    };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),

  http.get('/wallet/transactions', async () => {
    const responseData = { ok: true, data: [] };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),

  // Notifications
  http.get('/notifications', async () => {
    const responseData = { ok: true, data: [] };
    const encryptedResponse = await encryptResponseData(responseData);
    return HttpResponse.json(encryptedResponse);
  }),
];