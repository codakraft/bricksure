import { http, HttpResponse } from 'msw';

const generateUserId = () => 
  'USR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

export const handlers = [
  // Auth endpoints
  http.post('/auth/register', () => {
    return HttpResponse.json({ ok: true, data: { message: 'Registration successful' } });
  }),

  http.post('/auth/login', () => {
    return HttpResponse.json({
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
    });
  }),

  http.post('/auth/otp/verify', async ({ request }) => {
    const data = await request.json() as { code: string };
    const { code } = data;
    
    // Only accept the static OTP: 099887
    if (code !== '099887') {
      return HttpResponse.json({ 
        ok: false, 
        error: { 
          message: 'Invalid OTP code. Please enter the correct verification code.' 
        } 
      }, { status: 400 });
    }
    
    return HttpResponse.json({ 
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
    });
  }),

  // Profile endpoints
  http.get('/profile/me', () => {
    return HttpResponse.json({
      ok: true,
      data: {
        id: generateUserId(),
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2348012345678',
        kycStatus: 'verified',
        createdAt: new Date().toISOString()
      }
    });
  }),

  // Properties endpoints
  http.get('/properties', () => {
    return HttpResponse.json({ ok: true, data: [] });
  }),

  http.post('/properties', () => {
    return HttpResponse.json({ ok: true, data: { id: '1' } });
  }),

  // Quotes endpoints
  http.post('/quotes', () => {
    return HttpResponse.json({ 
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
  }),

  // Policies endpoints
  http.get('/policies', () => {
    return HttpResponse.json({ ok: true, data: [] });
  }),

  // Wallet endpoints
  http.get('/wallet', () => {
    return HttpResponse.json({ 
      ok: true, 
      data: { balance: 0, currency: 'NGN' }
    });
  }),

  http.get('/wallet/transactions', () => {
    return HttpResponse.json({ ok: true, data: [] });
  }),

  // Notifications
  http.get('/notifications', () => {
    return HttpResponse.json({ ok: true, data: [] });
  }),
];