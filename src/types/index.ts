// Core type definitions for BrickSure

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: "pending" | "verified" | "failed";
  createdAt: string;
}

export interface Property {
  id: string;
  ownerId: string;
  address: string;
  state: string;
  lga: string;
  type: "owner" | "rental" | "shortlet" | "commercial" | "development";
  status: "draft" | "submitted" | "approved";
  lat: number;
  lng: number;
  geohash: string;
  yearBuilt?: number;
  materials?: string;
  occupancy?: string;
  media: Array<{
    url: string;
    kind: "photo" | "video";
    ts: string;
    lat?: number;
    lng?: number;
  }>;
  docs: Array<{
    url: string;
    type: "title" | "valuation" | "other";
  }>;
}

export interface Quote {
  id: string;
  propertyId: string;
  tier: "basic" | "standard" | "plus" | "custom";
  riders: string[];
  premium: number;
  frequency: "monthly" | "quarterly" | "biannual" | "annual";
  createdAt: string;
}

export interface Policy {
  id: string;
  propertyId: string;
  status: "draft" | "submitted" | "underwriting" | "approved" | "active";
  certificateUrl?: string;
  renewalDate?: string;
  premium: number;
  tier: string;
}

export interface Wallet {
  balance: number;
  currency: "NGN";
}

export interface WalletTransaction {
  id: string;
  type: "fund" | "debit" | "refund";
  amount: number;
  createdAt: string;
  description: string;
  status: "pending" | "completed" | "failed";
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
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
}

// Auth types
// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   kycStatus: string;
//   createdAt: string;
// }

export interface AuthResponse {
  message: string;
  token: string;
  data: {
    _id: string;
    email: string;
    isVerified: boolean;
  };
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  otp: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface PropertyTypeResponse {
  message: string;
  data: {
    propertyTypes: PropertyTypeData[];
  };
}

export interface PropertyTypeData {
  _id: string;
  name: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface StateResponse {
  message: string;
  data: Data;
}

export interface Data {
  states: State[];
}

export interface State {
  _id: string;
  name: string;
  alias: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface LGA {
  _id: string;
  name: string;
  alias: string;
  state: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface LGAResponse {
  message: string;
  data: {
    lgas: LGA[];
  };
}

export interface PolicyResponse {
  message: string;
  data: PolicyData;
}

export interface PolicyData {
  policyPrices: PolicyPrices;
}

export interface PolicyPrices {
  basic: string;
  standard: string;
  plus: string;
  publicLiability: string;
  contentsIssurance: string;
  accidentalDamage: string;
  lossOfRent: string;
}

export interface WalletResponse {
  message: string;
  data: WalletData;
}

export interface WalletData {
  wallet: Wallet;
}

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  totalAmountFunded: number;
  hasPin: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface FundWalletResponse {
  message: string;
  data: WalletResponseData;
}

export interface WalletResponseData {
  data: WalletData;
}

export interface WalletData {
  status: boolean;
  message: string;
  accessCode: string;
  reference: string;
  authorizationUrl: string;
}

export interface GetAllTransactionsResponse {
  message: string;
  data: TransactionData[];
}

export interface TransactionData {
  _id: string;
  user: string;
  walletId: string;
  amount: number;
  paymentType: string;
  platform: string;
  reference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateQuoteRequest {
  address: string;
  state: string;
  lga: string;
  year: number;
  buildingMaterials: string;
  occupancyStatus: string;
  paymentFrequency: string;
  policy: string;
  propertyType: string;
  propertyValue: string;
  concerns: string[];
  extraCoverage: {
    lossOfRent: boolean;
    contentInsurance: boolean;
    publicLiability: boolean;
    accidentalDamage: boolean;
  };
}

export interface CreateQuoteResponse {
  message: string
  data: CreateQuoteData
}

export interface CreateQuoteData {
  property: PropertyData
}

export interface PropertyData {
  user: string
  status: string
  address: string
  state: string
  propertyType: string
  year: number
  buildingMaterials: string
  occupancyStatus: string
  paymentFrequency: string
  policy: string
  propertyValue: string
  extraCoverage: ExtraCoverage
  concerns: string[]
  totalAmount: number
  nextPayment: string
  policyPeriod: string
  _id: string
  createdAt: string
  updatedAt: string
  policyCode: string
  __v: number
}

export interface ExtraCoverage {
  lossOfRent: boolean
  publicLiability: boolean
  accidentalDamage: boolean
  contentsIssurance: boolean
}

export interface ViewAllPropertiesResponse {
  message: string
  data: ViewAllPropData[]
  metaData: MetaData
}

export interface ViewAllPropData {
  extraCoverage: ExtraCoverage
  _id: string
  user: string
  status: string
  address: string
  state: string
  propertyType: string
  year: number
  buildingMaterials: string
  occupancyStatus: string
  paymentFrequency: string
  policy: string
  propertyValue: string
  concerns: string[]
  totalAmount: number
  nextPayment: string
  policyPeriod: string
  createdAt: string
  updatedAt: string
  policyCode: string
  __v: number
}

export interface ExtraCoverage {
  lossOfRent: boolean
  publicLiability: boolean
  accidentalDamage: boolean
  contentsIssurance: boolean
}

export interface MetaData {
  totalProperties: number
  page: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ViewPropertyByIdResponse {
  message: string
  data: ViewPropertyByIdData
}

export interface ViewPropertyByIdData {
  property: ViewAllPropData
}

export interface AuthUserResponse {
  message: string
  data: AuthUserData
}

export interface AuthUserData {
  user: UserAuth
}

export interface UserAuth {
  _id: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  disabled: boolean
  phoneNumber: string
  createdAt: string
  updatedAt: string
  __v: number
  emailOtp: string
  emailOtpSentAt: string
  otp: string
  otpSentAt: any
  sessionId: string
}
