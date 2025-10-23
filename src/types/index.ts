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

export interface NewCreateQuoteRequest {
  propertyTypeCharges: {
    [key: string]: {
      charges: {
        perPlot?: number;
        perFloor?: number;
        perBlock?: number;
        perPupilSeat?: number;
        perRoom?: number;
        perBed?: number;
        perPump?: number;
        perCinemaSeat?: number;
        perApartmentOfficeWing?: number;
      };
    };
  };
  address: string;
  paymentFrequency: string;
  propertyValue: number;
  riskAdjustments: {
    wallMaterial: string;
    buildingAge: string;
    pastLoss: boolean;
    unOccupiedForAwhile: boolean;
    unOccupiedDuration: number;
    floodRisk: boolean;
  };
  safetySecurityDiscounts: {
    securitySafety: {
      estateGate: boolean;
      cctv: boolean;
      securityGuards: boolean;
      strongLocks: boolean;
      noGlassPanels: boolean;
      occupied: boolean;
    };
    fireSafety: {
      fireExtinguisher: boolean;
      smokeAlarm: boolean;
      waterAccess: boolean;
    };
  };
  extraCoverageFees: {
    theft: boolean;
    floodProtection: boolean;
    publicLiability: boolean;
    extendedFireCover: boolean;
    burglaryCover: boolean;
  };
  duration: number;
  propertyAge: number;
  step: number;
  _id?: string;
}

export interface CreateQuoteResponse {
  message: string;
  data: CreateQuoteData;
}

export interface NewCreateQuoteResponse {
  message: string;
  data: {
    _id: string;
    user: string;
    status: string;
    expired: boolean;
    charges: {
      perPlot: number;
    };
    category: string;
    otherPropertyType: string;
    extraCoverage: {
      theft: boolean;
      floodProtection: boolean;
      publicLiability: boolean;
      extendedFireCover: boolean;
      burglaryCover: boolean;
    };
    wallMaterial: string;
    floodRisk: string;
    specialRisk: string;
    roofMaterial: string;
    buildingAge: string;
    rent: boolean;
    residentDomesticStaff: boolean;
    repairNeeded: boolean;
    furnished: boolean;
    commercialUse: boolean;
    pastInsurance: boolean;
    pastInsuranceDetails: string;
    currentlyInsured: boolean;
    pastLoss: boolean;
    pastLossDetails: string;
    address: string;
    duration: number;
    propertyValue: number;
    propertyAge: number;
    totalAmount: number;
    amountPaid: number;
    nextPayment: string;
    policyPeriod: string;
    securitySafety: {
      estateGate: boolean;
      cctv: boolean;
      securityGuards: boolean;
      strongLocks: boolean;
      noGlassPanels: boolean;
      occupied: boolean;
    };
    fireSafety: {
      fireExtinguisher: boolean;
      smokeAlarm: boolean;
      waterAccess: boolean;
    };
    highTransactionPolicy: boolean;
    step: number;
    unOccupiedForAwhile: boolean;
    unOccupiedDuration: number;
    createdAt: string;
    updatedAt: string;
    policyCode: string;
    __v: number;
    paymentFrequency: string;
  };
}

export interface CreateQuoteData {
  property: PropertyData;
}

export interface PropertyData {
  user: string;
  status: string;
  address: string;
  state: string;
  propertyType: string;
  year: number;
  buildingMaterials: string;
  occupancyStatus: string;
  paymentFrequency: string;
  policy: string;
  propertyValue: string;
  extraCoverage: ExtraCoverage;
  concerns: string[];
  totalAmount: number;
  nextPayment: string;
  policyPeriod: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  policyCode: string;
  __v: number;
}

export interface ExtraCoverage {
  lossOfRent: boolean;
  publicLiability: boolean;
  accidentalDamage: boolean;
  contentsIssurance: boolean;
}

export interface ViewAllPropertiesResponse {
  message: string;
  data: ViewAllPropData[];
  metaData: MetaData;
}

export interface ViewAllPropData {
  extraCoverage: ExtraCoverage;
  _id: string;
  user: string;
  status: string;
  address: string;
  state: string;
  propertyType: string;
  year: number;
  buildingMaterials: string;
  occupancyStatus: string;
  paymentFrequency: string;
  policy: string;
  propertyValue: string;
  concerns: string[];
  totalAmount: number;
  nextPayment: string;
  policyPeriod: string;
  createdAt: string;
  updatedAt: string;
  policyCode: string;
  amountPaid: number;
  __v: number;
}

export interface ExtraCoverage {
  lossOfRent: boolean;
  publicLiability: boolean;
  accidentalDamage: boolean;
  contentsIssurance: boolean;
}

export interface MetaData {
  totalProperties: number;
  page: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ViewPropertyByIdResponse {
  message: string;
  data: ViewPropertyByIdData;
}

export interface ViewPropertyByIdData {
  property: ViewAllPropData;
}

export interface AuthUserResponse {
  message: string;
  data: AuthUserData;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  data?: {
    email?: string;
    expiresIn?: number;
  };
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface AuthUserData {
  user: UserAuth;
}

export interface UserAuth {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  disabled: boolean;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  emailOtp: string;
  emailOtpSentAt: string;
  otp: string;
  otpSentAt: string | null;
  sessionId: string;
}

// charges types

export interface ChargesResponse {
  message: string;
  data: ChargesResponseData;
}

export interface ChargesResponseData {
  // categories: ChargesCategories;
  propertyTypeCharges: PropertyTypeCharges;
  riskAdjustments: RiskAdjustments;
  safetySecurityDiscounts: SafetySecurityDiscounts;
  extraCoverageFees: ExtraCoverageFees;
  _id: string;
  createdBy: string;
  propertyBaseFee: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastUpdatedBy: string;
}

export interface PropertyTypeCharges {
  bungalow: Bungalow;
  duplex: Duplex;
  storeyBuilding: StoreyBuilding;
  flats: Flats;
  singleOccOffice: SingleOccOffice;
  singleOccResidential: SingleOccResidential;
  hotelHostelGuest: HotelHostelGuest;
  recreationCinema: RecreationCinema;
  school: School;
  petrolGasStation: PetrolGasStation;
  hospitalClinic: HospitalClinic;
  multiOccBusiness: MultiOccBusiness;
  multiOccMixedRes: MultiOccMixedRes;
  others: Others;
}

export interface Bungalow {
  perPlot: number;
}

export interface Duplex {
  perFloor: number;
  perPlot: number;
}

export interface StoreyBuilding {
  perFloor: number;
  perPlot: number;
}

export interface Flats {
  perPlot: number;
}

export interface SingleOccOffice {
  perFloor: number;
  perPlot: number;
}

export interface SingleOccResidential {
  perFloor: number;
  perPlot: number;
}

export interface HotelHostelGuest {
  perRoom: number;
  perBed: number;
}

export interface RecreationCinema {
  perFloor: number;
  perCinemaSeat: number;
}

export interface School {
  perBlock: number;
  perPupilSeat: number;
  perPlot: number;
}

export interface PetrolGasStation {
  perPump: number;
}

export interface HospitalClinic {
  perFloor: number;
  perPlot: number;
}

export interface MultiOccBusiness {
  perApartmentOfficeWing: number;
}

export interface MultiOccMixedRes {
  perApartmentOfficeWing: number;
}

export interface Others {
  perFloor: number;
  perPlot: number;
}

export interface RiskAdjustments {
  wallMaterial: WallMaterial;
  buildingAge: BuildingAge;
  pastLoss: number;
  unOccupiedForAwhile: number;
  floodRisk: number;
  specialRisk: number;
  repairNeeded: number;
  commercialUse: number;
}

export interface WallMaterial {
  brick: number;
  mud: number;
  wood: number;
  mixedMaterials: number;
}

export interface BuildingAge {
  "0-5": number;
  "5-10": number;
  "10-20": number;
  "20+": number;
}

export interface SafetySecurityDiscounts {
  securitySafety: SecuritySafety;
  fireSafety: FireSafety;
}

export interface SecuritySafety {
  estateGate: number;
  cctv: number;
  securityGuards: number;
  strongLocks: number;
  noGlassPanels: number;
  occupied: number;
}

export interface FireSafety {
  fireExtinguisher: number;
  smokeAlarm: number;
  waterAccess: number;
}

export interface ExtraCoverageFees {
  theft: number;
  floodProtection: number;
  publicLiability: number;
  extendedFireCover: number;
  burglaryCover: number;
}

// export interface ChargesCategories {
//   propertyBaseFee: string;
//   propertyCategory: PropertyCategory;
//   pastLoss: string;
//   wallMaterial: WallMaterial;
//   buildingAge: BuildingAge;
//   floodRisk: string;
//   specialRisk: number;
//   securitySafety: SecuritySafety;
//   fireSafety: FireSafety;
//   repairNeeded: string;
//   commercialUse: string;
//   extraCoverage: ChargesExtraCoverage;
// }

// export interface PropertyCategory {
//   singleOccOffice: SingleOccOffice;
//   singleOccResidential: SingleOccResidential;
//   hotelHostelGuest: HotelHostelGuest;
//   recreationCinema: RecreationCinema;
//   schoolTraining: SchoolTraining;
//   petrolGasStation: PetrolGasStation;
//   hospitalClinic: HospitalClinic;
//   multiOccBusiness: MultiOccBusiness;
//   multiOccMixedRes: MultiOccMixedRes;
//   others: Others;
// }

// export interface SingleOccOffice {
//   charges: Charges;
// }

// export interface Charges {
//   perFloor: string;
//   perPlot: string;
// }

// export interface SingleOccResidential {
//   charges: Charges2;
// }

// export interface Charges2 {
//   perFloor: string;
//   perPlot: string;
// }

// export interface HotelHostelGuest {
//   charges: Charges3;
// }

// export interface Charges3 {
//   perRoom: string;
//   perBed: string;
// }

// export interface RecreationCinema {
//   charges: Charges4;
// }

// export interface Charges4 {
//   perFloor: string;
//   perCinemaSeat: string;
// }

// export interface SchoolTraining {
//   charges: Charges5;
// }

// export interface Charges5 {
//   perBlock: string;
//   perPupilSeat: string;
// }

// export interface PetrolGasStation {
//   charges: Charges6;
// }

// export interface Charges6 {
//   perPump: string;
// }

// export interface HospitalClinic {
//   charges: Charges7;
// }

// export interface Charges7 {
//   perFloor: string;
//   perPlot: string;
// }

// export interface MultiOccBusiness {
//   charges: Charges8;
// }

// export interface Charges8 {
//   perApartmentOfficeWing: string;
// }

// export interface MultiOccMixedRes {
//   charges: Charges9;
// }

// export interface Charges9 {
//   perApartmentOfficeWing: string;
// }

// export interface Others {
//   charges: Charges10;
// }

// export interface Charges10 {
//   perFloor: string;
//   perPlot: string;
// }

// export interface WallMaterial {
//   brick: string;
//   mud: string;
//   wood: string;
//   mixedMaterials: string;
// }

// export interface BuildingAge {
//   "0-5": string;
//   "5-10": string;
//   "10-20": string;
//   "20+": string;
// }

// export interface SecuritySafety {
//   estateGate: string;
//   cctv: string;
//   securityGuards: string;
//   strongLocks: string;
//   noGlassPanels: string;
//   occupied: string;
// }

// export interface FireSafety {
//   fireExtinguisher: string;
//   smokeAlarm: string;
//   waterAccess: string;
// }

// export interface ChargesExtraCoverage {
//   theft: string;
//   floodProtection: string;
//   publicLiability: string;
//   extendedFireCover: string;
//   burglaryCover: string;
// }

export interface SeaLevelResponse {
  location: string;
  sea_level_assessment: string;
  distance_from_sea_level?: string;
  distance_to_sea_level_km?: number;
  elevation_meters?: number;
  success: boolean;
  error: null;
}
