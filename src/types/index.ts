// Core type definitions for BrickSure

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: 'pending' | 'verified' | 'failed';
  createdAt: string;
}

export interface Property {
  id: string;
  ownerId: string;
  address: string;
  state: string;
  lga: string;
  type: 'owner' | 'rental' | 'shortlet' | 'commercial' | 'development';
  status: 'draft' | 'submitted' | 'approved';
  lat: number;
  lng: number;
  geohash: string;
  yearBuilt?: number;
  materials?: string;
  occupancy?: string;
  media: Array<{
    url: string;
    kind: 'photo' | 'video';
    ts: string;
    lat?: number;
    lng?: number;
  }>;
  docs: Array<{
    url: string;
    type: 'title' | 'valuation' | 'other';
  }>;
}

export interface Quote {
  id: string;
  propertyId: string;
  tier: 'basic' | 'standard' | 'plus' | 'custom';
  riders: string[];
  premium: number;
  frequency: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  createdAt: string;
}

export interface Policy {
  id: string;
  propertyId: string;
  status: 'draft' | 'submitted' | 'underwriting' | 'approved' | 'active';
  certificateUrl?: string;
  renewalDate?: string;
  premium: number;
  tier: string;
}

export interface Wallet {
  balance: number;
  currency: 'NGN';
}

export interface WalletTransaction {
  id: string;
  type: 'fund' | 'debit' | 'refund';
  amount: number;
  createdAt: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  meta?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface KYCData {
  bvn?: string;
  nin?: string;
  selfieUrl?: string;
  bankAccount?: string;
  bankCode?: string;
  verified: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}