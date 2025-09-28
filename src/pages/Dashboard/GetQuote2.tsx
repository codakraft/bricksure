import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  // MapPin,
  // Camera,
  // Upload,
  Shield,
  CreditCard,
  Wallet,
  X,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Eye,
  // EyeOff,
  Info,
  ChevronDown,
  // ChevronUp,
  // Zap,
  Home,
  Lock,
  Flame,
  Droplets,
  Users,
  Building,
  Calendar,
  DollarSign,
  Building2,
  School,
  Car,
  Heart,
  Coffee,
  Briefcase,
  HelpCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Layout } from "../../components/Layout/Layout";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { useToast } from "../../components/UI/Toast";
import {
  useGetPropertyTypeQuery,
  useGetStatesQuery,
  useLazyGetStatesLGAQuery,
} from "../../services/propertiesService";
import { useCreateQuoteMutation, useGetPoliciesQuery } from "../../services";
import {
  useFundWalletMutation,
  useGetWalletQuery,
} from "../../services/walletService";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface QuizAnswer {
  questionId: string;
  value: string | number | string[];
  label?: string;
}

interface QuizState {
  answers: Record<string, QuizAnswer>;
  currentQuestion: number;
  totalQuestions: number;
  propertyCategory: string;
  premiumBreakdown: PremiumBreakdown | null;
}

interface PremiumBreakdown {
  premiumTableBase: number;
  riskUnits: number;
  dvUnits: number;
  subtotal: number;
  discounts: Array<{
    name: string;
    amount: number;
    type: "percentage" | "fixed";
  }>;
  surcharges: Array<{
    name: string;
    amount: number;
    type: "percentage" | "fixed";
  }>;
  total: number;
  frequency: string;
  frequencyMultiplier: number;
  breakdown: {
    floors?: number;
    plots?: number;
    rooms?: number;
    beds?: number;
    pumps?: number;
    seats?: number;
    blocks?: number;
    apartments?: number;
  };
}

interface Question {
  id: string;
  text: string;
  emoji: string;
  type: "single" | "multiple" | "number" | "text";
  options?: Array<{
    value: string;
    label: string;
    icon?: any;
    followUp?: string[];
  }>;
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
  };
  showIf?: (answers: Record<string, QuizAnswer>) => boolean;
  microCopy?: string;
}

// Premium Table Configuration
const PREMIUM_TABLE = {
  version: "pt_v1",
  categories: {
    SINGLE_OCC_OFFICE: {
      label: "Single Occupier – Office Building",
      charges: { perFloor: 10000, perPlot: 5000 },
    },
    SINGLE_OCC_RESIDENTIAL: {
      label: "Single Occupier – Residential Building",
      charges: { perFloor: 5000, perPlot: 5000 },
    },
    HOTEL_HOSTEL_GUEST: {
      label: "Hotel/Hostel/Guest House",
      charges: { perRoom: 1500, perBed: 500 },
    },
    RECREATION_CINEMA: {
      label: "Recreation Centre/Cinema Halls",
      charges: { perFloor: 15000, perCinemaSeat: 200 },
    },
    SCHOOLS_TRAINING: {
      label: "Schools & Training Institutions",
      charges: { perBlock: 5000, perPupilSeat: 100 },
    },
    PETROL_GAS_STATION: {
      label: "Petrol/Gas Station",
      charges: { perPump: 10000 },
    },
    HOSPITAL_CLINIC: {
      label: "Hospital/Health Centre & Clinics",
      charges: { perFloor: 12000, perPlot: 6000 },
    },
    MULTI_OCC_BUSINESS: {
      label: "Multi-Occupier – Multi-Purpose Business Building",
      charges: { perApartmentOfficeWing: 10000 },
    },
    MULTI_OCC_MIXED_RES: {
      label: "Multi-Occupier – Mixed-use Residential Building",
      charges: { perApartmentOfficeWing: 7500 },
    },
    OTHERS: {
      label: "Others",
      charges: { perFloor: 5000, perPlot: 5000 },
    },
  },
};

export function GetQuote() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: propertyTypesData } = useGetPropertyTypeQuery();
  const { data: statesData } = useGetStatesQuery();
  const [getLGAs, { data: lgaData }] = useLazyGetStatesLGAQuery();
  const { data: policiesData } = useGetPoliciesQuery();
  const [createQuote] = useCreateQuoteMutation();
  const [fundWallet] = useFundWalletMutation();
  const { data: walletData } = useGetWalletQuery();
  const { authData: user } = useSelector((state: RootState) => state.auth);

  const [quizState, setQuizState] = useState<QuizState>({
    answers: {},
    currentQuestion: 0,
    totalQuestions: 0,
    propertyCategory: "",
    premiumBreakdown: null,
  });

  const nigerianStates = useMemo(() => {
    if (!statesData?.data?.states) {
      return ["Lagos", "Abuja", "Kano", "Rivers", "Ogun", "Kaduna"]; // Fallback data
    }
    return statesData.data.states.map((state) => state.name);
  }, [statesData]);

  // Extract LGA names from lgaData using useMemo
  const lgaOptions = useMemo(() => {
    if (!lgaData?.data?.lgas) {
      return [];
    }
    return lgaData.data.lgas.map((lga) => lga.name);
  }, [lgaData]);

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculatingPremium, setCalculatingPremium] = useState(false);
  const [lastCalculationTime, setLastCalculationTime] = useState(0);

  // Helper functions to extract quiz answers
  const getQuizAnswerValue = (questionId: string): any => {
    return quizState.answers[questionId]?.value || null;
  };

  const getQuizAnswerLabel = (questionId: string): string => {
    return quizState.answers[questionId]?.label || "";
  };

  // Function to get selected concerns from quiz answers
  const getSelectedConcerns = (): string[] => {
    const riders = getQuizAnswerValue("riders");
    if (!Array.isArray(riders)) return [];

    const concernsMap: Record<string, string> = {
      flood: "Flood damage",
      burglary: "Theft/burglary",
      fire: "Fire damage",
      storm: "Storm damage",
      earthquake: "Structural collapse",
    };

    return riders.map((rider) => concernsMap[rider] || rider).filter(Boolean);
  };

  // Function to determine property type from quiz answers
  const getPropertyTypeFromQuiz = (): string => {
    const propertyType = getQuizAnswerValue("propertyType");

    const propertyTypeMap: Record<string, string> = {
      bungalow: "Bungalow",
      duplex: "Duplex",
      storey: "Storey Building",
      flats: "Flats",
      hostel: "Hostel",
      office: "Office Building",
      school: "School",
      petrol: "Petrol Station",
      hospital: "Hospital",
      recreation: "Recreation Centre",
      mixed: "Mixed-use",
      other: getQuizAnswerValue("propertyTypeOther") || "Other",
    };

    return propertyTypeMap[propertyType] || "Bungalow";
  };

  // Function to determine occupancy status from quiz answers
  const getOccupancyStatusFromQuiz = (): string => {
    const occupancy = getQuizAnswerValue("occupancy");

    const occupancyMap: Record<string, string> = {
      owner: "Owner-occupied",
      rental: "Rental",
      shortlet: "Short-let",
      commercial: "Commercial",
      boarding: "Boarding House",
      business: "Business Premises",
      office: "Office",
      factory: "Factory",
      other: getQuizAnswerValue("occupancyOther") || "Occupied",
    };

    return occupancyMap[occupancy] || "Owner-occupied";
  };

  // Function to get building materials from quiz answers
  const getBuildingMaterialsFromQuiz = (): string => {
    const wallMaterial = getQuizAnswerValue("wallMaterial");
    const roofType = getQuizAnswerValue("roofType");

    const wallMaterialMap: Record<string, string> = {
      brick: "Brick/Concrete",
      wood: "Wood",
      mud: "Mud/Clay",
      mixed: "Mixed Materials",
      other: getQuizAnswerValue("wallMaterialOther") || "Brick",
    };

    const roofTypeMap: Record<string, string> = {
      metal: "Corrugated Iron",
      longspan: "Longspan Metal",
      tiles: "Stone-Coated Tiles",
      concrete: "Concrete Slabs",
      thatch: "Thatch",
      asbestos: "Asbestos Sheets",
      other: getQuizAnswerValue("roofTypeOther") || "Corrugated Iron",
    };

    const wall = wallMaterialMap[wallMaterial] || "Brick";
    const roof = roofTypeMap[roofType] || "Corrugated Iron";

    return `${wall} walls, ${roof} roof`;
  };

  // Helper function to calculate total price from quiz answers
  const getTotalPriceFromQuiz = (): number => {
    if (!policiesData?.data) return 0;

    const propertyValue = Number(getQuizAnswerValue("declaredValue")) || 0;
    const propertyType = getPropertyTypeFromQuiz();
    const paymentFrequency =
      (getQuizAnswerValue("paymentFrequency") as string) || "annual";

    // Find the policy price for the property type
    const policyPrice = policiesData.data.find(
      (policy: any) =>
        policy.propertyType.toLowerCase() === propertyType.toLowerCase()
    );

    if (!policyPrice) return 0;

    const basePrice = policyPrice.price;

    // Apply payment frequency adjustments
    let frequencyMultiplier = 1;
    switch (paymentFrequency.toLowerCase()) {
      case "monthly":
        frequencyMultiplier = 1.05; // 5% surcharge
        break;
      case "quarterly":
        frequencyMultiplier = 1.035; // 3.5% surcharge
        break;
      case "bi-annual":
        frequencyMultiplier = 1.02; // 2% surcharge
        break;
      default:
        frequencyMultiplier = 1; // Annual
    }

    return basePrice * frequencyMultiplier;
  };
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  // Dynamic question generation based on answers
  const generateQuestions = (): Question[] => {
    const questions: Question[] = [
      {
        id: "propertyType",
        text: "What type of property are you insuring?",
        emoji: "🏠",
        type: "single",
        options: [
          { value: "bungalow", label: "Bungalow", icon: Home },
          { value: "duplex", label: "Duplex", icon: Building },
          {
            value: "storey",
            label: "Storey Building",
            icon: Building2,
            followUp: ["floors"],
          },
          { value: "flats", label: "Flats/Apartments", icon: Building },
          {
            value: "hostel",
            label: "Hostel/Guest House",
            icon: Users,
            followUp: ["rooms", "beds"],
          },
          { value: "office", label: "Office Building", icon: Briefcase },
          {
            value: "school",
            label: "School",
            icon: School,
            followUp: ["blocks", "pupilSeats"],
          },
          {
            value: "petrol",
            label: "Petrol Station",
            icon: Car,
            followUp: ["pumps"],
          },
          { value: "hospital", label: "Hospital/Clinic", icon: Heart },
          {
            value: "recreation",
            label: "Recreation Centre",
            icon: Coffee,
            followUp: ["seats"],
          },
          { value: "mixed", label: "Mixed-use", icon: Building2 },
          {
            value: "other",
            label: "Other (specify)",
            icon: HelpCircle,
            followUp: ["propertyTypeOther"],
          },
        ],
        microCopy: "This helps us understand your property's risk profile",
      },
    ];

    const answers = quizState.answers;

    // Add follow-up questions based on property type
    if (answers.propertyType?.value === "other") {
      questions.push({
        id: "propertyTypeOther",
        text: "Please specify your property type",
        emoji: "✏️",
        type: "text",
        validation: { required: true },
        microCopy: "We'll review this to ensure fair pricing",
      });
    }

    if (answers.propertyType?.value === "storey") {
      questions.push({
        id: "floors",
        text: "How many floors does it have (including ground)?",
        emoji: "🏢",
        type: "number",
        validation: { min: 1, max: 20, required: true },
        microCopy: "Count all levels including the ground floor",
      });
    }

    if (answers.propertyType?.value === "hostel") {
      questions.push(
        {
          id: "rooms",
          text: "How many rooms does it have?",
          emoji: "🚪",
          type: "number",
          validation: { min: 1, max: 500, required: true },
        },
        {
          id: "beds",
          text: "How many beds in total?",
          emoji: "🛏️",
          type: "number",
          validation: { min: 1, max: 1000, required: true },
        }
      );
    }

    if (answers.propertyType?.value === "school") {
      questions.push(
        {
          id: "blocks",
          text: "How many blocks/buildings?",
          emoji: "🏫",
          type: "number",
          validation: { min: 1, max: 50, required: true },
        },
        {
          id: "pupilSeats",
          text: "How many pupil seats in total?",
          emoji: "🪑",
          type: "number",
          validation: { min: 10, max: 10000, required: true },
        }
      );
    }

    if (answers.propertyType?.value === "petrol") {
      questions.push({
        id: "pumps",
        text: "How many fuel pumps?",
        emoji: "⛽",
        type: "number",
        validation: { min: 1, max: 20, required: true },
      });
    }

    if (answers.propertyType?.value === "recreation") {
      questions.push({
        id: "seats",
        text: "How many seats/capacity?",
        emoji: "🎭",
        type: "number",
        validation: { min: 10, max: 5000, required: true },
      });
    }

    // Always ask for plots
    questions.push({
      id: "plots",
      text: "How many plots of land does it sit on?",
      emoji: "📐",
      type: "number",
      validation: { min: 1, max: 10, required: true },
      microCopy: "Standard plot size assumed",
    });

    // Step 2: Structure & Condition
    questions.push(
      {
        id: "wallMaterial",
        text: "What are the outside walls made of?",
        emoji: "🧱",
        type: "single",
        options: [
          { value: "brick", label: "Brick/Concrete", icon: Building },
          { value: "wood", label: "Wood", icon: Home },
          { value: "mud", label: "Mud/Clay", icon: Home },
          { value: "mixed", label: "Mixed Materials", icon: Building },
          {
            value: "other",
            label: "Other (specify)",
            icon: HelpCircle,
            followUp: ["wallMaterialOther"],
          },
        ],
        microCopy: "This affects your property's risk rating",
      },
      {
        id: "roofType",
        text: "What type of roof does it have?",
        emoji: "🏠",
        type: "single",
        options: [
          {
            value: "metal",
            label: "Corrugated Iron/Aluminium Sheets",
            icon: Home,
          },
          { value: "longspan", label: "Longspan Metal", icon: Building },
          { value: "tiles", label: "Stone-Coated Tiles", icon: Building2 },
          { value: "concrete", label: "Concrete Slabs", icon: Building },
          { value: "thatch", label: "Thatch", icon: Home },
          { value: "asbestos", label: "Asbestos Sheets", icon: Building },
          {
            value: "other",
            label: "Other (specify)",
            icon: HelpCircle,
            followUp: ["roofTypeOther"],
          },
        ],
      },
      {
        id: "buildingAge",
        text: "How old is the building?",
        emoji: "📅",
        type: "single",
        options: [
          { value: "new", label: "Less than 5 years", icon: Sparkles },
          { value: "recent", label: "5-10 years", icon: Calendar },
          { value: "mature", label: "10-20 years", icon: Calendar },
          { value: "old", label: "Over 20 years", icon: Calendar },
        ],
      },
      {
        id: "buildingCondition",
        text: "Is the building in a good state of repair?",
        emoji: "🔧",
        type: "single",
        options: [
          {
            value: "yes",
            label: "Yes, excellent condition",
            icon: CheckCircle,
          },
          { value: "no", label: "No, needs some repairs", icon: AlertTriangle },
        ],
      }
    );

    // Add follow-up questions for "other" materials
    if (answers.wallMaterial?.value === "other") {
      questions.push({
        id: "wallMaterialOther",
        text: "Please specify the wall material",
        emoji: "✏️",
        type: "text",
        validation: { required: true },
        microCopy: "We'll review this for accurate pricing",
      });
    }

    if (answers.roofType?.value === "other") {
      questions.push({
        id: "roofTypeOther",
        text: "Please specify the roof type",
        emoji: "✏️",
        type: "text",
        validation: { required: true },
      });
    }

    // Step 3: Occupancy & Use
    questions.push({
      id: "occupancy",
      text: "How is it occupied?",
      emoji: "👥",
      type: "single",
      options: [
        { value: "owner", label: "Owner-occupied", icon: Home },
        {
          value: "rental",
          label: "Rental",
          icon: Users,
          followUp: ["furnished"],
        },
        {
          value: "shortlet",
          label: "Short-let",
          icon: Calendar,
          followUp: ["furnished"],
        },
        {
          value: "commercial",
          label: "Commercial",
          icon: Briefcase,
          followUp: ["furnished"],
        },
        { value: "boarding", label: "Boarding House", icon: Building },
        { value: "business", label: "Business Premises", icon: Briefcase },
        { value: "office", label: "Office", icon: Building2 },
        { value: "factory", label: "Factory", icon: Building },
        {
          value: "other",
          label: "Other (specify)",
          icon: HelpCircle,
          followUp: ["occupancyOther"],
        },
      ],
    });

    // Add furnished question for rental/shortlet/commercial
    if (
      ["rental", "shortlet", "commercial"].includes(
        answers.occupancy?.value as string
      )
    ) {
      questions.push({
        id: "furnished",
        text: "Is it furnished or unfurnished?",
        emoji: "🪑",
        type: "single",
        options: [
          { value: "furnished", label: "Furnished", icon: Home },
          { value: "unfurnished", label: "Unfurnished", icon: Building },
        ],
      });
    }

    if (answers.occupancy?.value === "other") {
      questions.push({
        id: "occupancyOther",
        text: "Please specify the occupancy type",
        emoji: "✏️",
        type: "text",
        validation: { required: true },
      });
    }

    questions.push({
      id: "businessUse",
      text: "Any part of it used for business or trade?",
      emoji: "💼",
      type: "single",
      options: [
        {
          value: "yes",
          label: "Yes",
          icon: CheckCircle,
          followUp: ["businessDetails"],
        },
        { value: "no", label: "No", icon: X },
      ],
    });

    if (answers.businessUse?.value === "yes") {
      questions.push({
        id: "businessDetails",
        text: "Please provide details about the business use",
        emoji: "📝",
        type: "text",
        validation: { required: true },
        microCopy:
          "Describe the type of business and how much space it occupies",
      });
    }

    questions.push({
      id: "unoccupied",
      text: "Will it be left unoccupied for long periods?",
      emoji: "🔒",
      type: "single",
      options: [
        {
          value: "yes",
          label: "Yes",
          icon: AlertTriangle,
          followUp: ["unoccupiedDuration"],
        },
        { value: "no", label: "No", icon: CheckCircle },
      ],
    });

    if (answers.unoccupied?.value === "yes") {
      questions.push({
        id: "unoccupiedDuration",
        text: "How long will it be unoccupied?",
        emoji: "⏰",
        type: "text",
        validation: { required: true },
        microCopy: "e.g., '3 months during travel' or 'weekends only'",
      });
    }

    // Step 4: Risks & Safety
    questions.push({
      id: "waterProximity",
      text: "Is it low-lying or close to water?",
      emoji: "🌊",
      type: "single",
      options: [
        {
          value: "sea",
          label: "Near Sea/Ocean",
          icon: Droplets,
          followUp: ["waterDistance"],
        },
        {
          value: "river",
          label: "Near River/Stream",
          icon: Droplets,
          followUp: ["waterDistance"],
        },
        {
          value: "reservoir",
          label: "Near Reservoir/Dam",
          icon: Droplets,
          followUp: ["waterDistance"],
        },
        { value: "none", label: "Not near water", icon: CheckCircle },
      ],
    });

    if (
      ["sea", "river", "reservoir"].includes(
        answers.waterProximity?.value as string
      )
    ) {
      questions.push({
        id: "waterDistance",
        text: "Distance from water and height above normal level?",
        emoji: "📏",
        type: "text",
        validation: { required: true },
        microCopy: "e.g., '500m away, 10m above sea level'",
      });
    }

    questions.push({
      id: "pastLosses",
      text: "Any past losses from flood, fire, storm, or earthquake?",
      emoji: "⚠️",
      type: "single",
      options: [
        {
          value: "yes",
          label: "Yes",
          icon: AlertTriangle,
          followUp: ["lossDetails"],
        },
        { value: "no", label: "No", icon: CheckCircle },
      ],
    });

    if (answers.pastLosses?.value === "yes") {
      questions.push({
        id: "lossDetails",
        text: "Please provide details about past losses",
        emoji: "📋",
        type: "text",
        validation: { required: true },
        microCopy:
          "Include when it happened, estimated amount, and any precautions taken",
      });
    }

    questions.push({
      id: "nearbyRisks",
      text: "Any special risks nearby?",
      emoji: "🚨",
      type: "single",
      options: [
        { value: "petrol", label: "Petrol Station", icon: Car },
        { value: "industrial", label: "Industrial Zone", icon: Building },
        { value: "none", label: "None", icon: CheckCircle },
        {
          value: "other",
          label: "Other (specify)",
          icon: HelpCircle,
          followUp: ["nearbyRiskOther"],
        },
      ],
    });

    if (answers.nearbyRisks?.value === "other") {
      questions.push({
        id: "nearbyRiskOther",
        text: "Please specify the nearby risk",
        emoji: "✏️",
        type: "text",
        validation: { required: true },
      });
    }

    questions.push(
      {
        id: "security",
        text: "How secure is it?",
        emoji: "🔒",
        type: "multiple",
        options: [
          { value: "gate", label: "Estate Gate", icon: Lock },
          { value: "guards", label: "Security Guards", icon: Shield },
          { value: "cctv", label: "CCTV", icon: Eye },
          { value: "occupied", label: "Occupied During Day", icon: Users },
          { value: "locks", label: "Strong Locks", icon: Lock },
          { value: "noglass", label: "No Glass Panels", icon: Shield },
        ],
        microCopy:
          "Select all that apply - security features can reduce your premium",
      },
      {
        id: "fireSafety",
        text: "Fire safety measures in place?",
        emoji: "🔥",
        type: "multiple",
        options: [
          { value: "extinguisher", label: "Fire Extinguisher", icon: Flame },
          { value: "alarm", label: "Smoke Alarm", icon: AlertTriangle },
          { value: "hydrant", label: "Hydrant/Water Access", icon: Droplets },
        ],
        microCopy: "Fire safety features can significantly reduce your premium",
      }
    );

    // Step 5: Extras & History
    questions.push({
      id: "payingGuests",
      text: "Any part let out to paying guests?",
      emoji: "🏨",
      type: "single",
      options: [
        { value: "yes", label: "Yes", icon: Users, followUp: ["guestCount"] },
        { value: "no", label: "No", icon: X },
      ],
    });

    if (answers.payingGuests?.value === "yes") {
      questions.push({
        id: "guestCount",
        text: "How many paying guests?",
        emoji: "🔢",
        type: "number",
        validation: { min: 1, max: 50, required: true },
      });
    }

    questions.push(
      {
        id: "domesticStaff",
        text: "Resident domestic staff?",
        emoji: "👨‍💼",
        type: "single",
        options: [
          { value: "yes", label: "Yes", icon: Users },
          { value: "no", label: "No", icon: X },
        ],
      },
      {
        id: "previousDecline",
        text: "Have you ever had insurance declined or required special terms?",
        emoji: "📋",
        type: "single",
        options: [
          {
            value: "yes",
            label: "Yes",
            icon: AlertTriangle,
            followUp: ["declineDetails"],
          },
          { value: "no", label: "No", icon: CheckCircle },
        ],
      }
    );

    if (answers.previousDecline?.value === "yes") {
      questions.push({
        id: "declineDetails",
        text: "Please provide details about the decline or special terms",
        emoji: "📝",
        type: "text",
        validation: { required: true },
      });
    }

    questions.push({
      id: "currentInsurance",
      text: "Is this property currently insured with another insurer?",
      emoji: "🛡️",
      type: "single",
      options: [
        {
          value: "yes",
          label: "Yes",
          icon: Shield,
          followUp: ["insuranceDetails"],
        },
        { value: "no", label: "No", icon: X },
      ],
    });

    if (answers.currentInsurance?.value === "yes") {
      questions.push({
        id: "insuranceDetails",
        text: "Please provide details about your current insurance",
        emoji: "📄",
        type: "text",
        validation: { required: true },
        microCopy: "Include insurer name, policy number, and expiry date",
      });
    }

    questions.push(
      {
        id: "riders",
        text: "Would you like extra cover add-ons?",
        emoji: "➕",
        type: "multiple",
        options: [
          { value: "flood", label: "Flood Protection", icon: Droplets },
          { value: "burglary", label: "Enhanced Burglary Cover", icon: Lock },
          { value: "fire", label: "Extended Fire Cover", icon: Flame },
          { value: "liability", label: "Public Liability", icon: Shield },
          { value: "materials", label: "Theft of Materials", icon: Building },
        ],
        microCopy: "Optional add-ons for enhanced protection",
      },
      {
        id: "declaredValue",
        text: "What's the declared value of the property?",
        emoji: "💰",
        type: "number",
        validation: { min: 1000000, required: true },
        microCopy: "Current market value in Nigerian Naira",
      },
      {
        id: "paymentFrequency",
        text: "How would you like to pay your premium?",
        emoji: "💳",
        type: "single",
        options: [
          { value: "monthly", label: "Monthly (+15%)", icon: Calendar },
          { value: "quarterly", label: "Quarterly (+8%)", icon: Calendar },
          { value: "biannual", label: "Bi-annual (+3%)", icon: Calendar },
          { value: "annual", label: "Annual (Best Value)", icon: DollarSign },
        ],
        microCopy: "Annual payments offer the best value",
      }
    );

    return questions.filter((q) => !q.showIf || q.showIf(answers));
  };

  const handleCheckout = async () => {
    setLoading(true);

    // Extract data from quiz answers
    const data = {
      address: getQuizAnswerValue("address") || "",
      state: getQuizAnswerValue("state") || "",
      lga: getQuizAnswerValue("lga") || "",
      propertyType: getPropertyTypeFromQuiz(),
      year:
        Number(getQuizAnswerValue("buildingAge")) ||
        new Date().getFullYear() - 5,
      buildingMaterials: getBuildingMaterialsFromQuiz(),
      occupancyStatus: getOccupancyStatusFromQuiz(),
      paymentFrequency: getQuizAnswerValue("paymentFrequency") || "annual",
      policy: "basic", // You can determine this from quiz if you have policy selection
      propertyValue: String(Number(getQuizAnswerValue("declaredValue")) || 0),
      concerns: getSelectedConcerns(),
      extraCoverage: {
        lossOfRent:
          (getQuizAnswerValue("riders") as string[])?.includes("lossOfRent") ||
          false,
        contentInsurance:
          (getQuizAnswerValue("riders") as string[])?.includes("contents") ||
          false,
        publicLiability:
          (getQuizAnswerValue("riders") as string[])?.includes("liability") ||
          false,
        accidentalDamage:
          (getQuizAnswerValue("riders") as string[])?.includes("accidental") ||
          false,
      },
    };
    console.log("Checkout Data:", data);
    try {
      const res = await createQuote(data).unwrap();
      console.log("Create Quote Response:", res);
      if (res?.data?.property?._id) {
        addToast({
          type: "success",
          title: "Application Submitted Successfully!",
          message:
            "Your policy application has been submitted and payment processed. You will be notified of the approval status.",
        });
        // Navigate to dashboard with success state
        navigate("/dashboard?success=quote-submitted");
      }

      // await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch {
      addToast({
        type: "error",
        title: "Submission Failed",
        message: "Please try again or contact support",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      addToast({
        type: "error",
        title: "Invalid Amount",
        message: "Please enter a valid amount",
      });
      return;
    }

    // Get total price from current quiz
    const totalPrice = quizState.premiumBreakdown?.total || 0;
    const currentWalletBalance = 0; // We'll get this from API if needed

    // Validate that fund amount covers the required balance
    if (totalPrice - currentWalletBalance > parseFloat(fundAmount)) {
      addToast({
        type: "error",
        title: "Insufficient Amount",
        message: `Please enter at least ${formatCurrency(
          totalPrice - currentWalletBalance
        )} to cover the quote`,
      });
      return;
    }

    const data = {
      address: getQuizAnswerValue("address") || "",
      state: getQuizAnswerValue("state") || "",
      lga: getQuizAnswerValue("lga") || "",
      propertyType: getPropertyTypeFromQuiz(),
      year:
        Number(getQuizAnswerValue("buildingAge")) ||
        new Date().getFullYear() - 5,
      buildingMaterials: getBuildingMaterialsFromQuiz(),
      occupancyStatus: getOccupancyStatusFromQuiz(),
      paymentFrequency: getQuizAnswerValue("paymentFrequency") || "annual",
      policy: "basic", // You can determine this from quiz if you have policy selection
      propertyValue: String(Number(getQuizAnswerValue("declaredValue")) || 0),
      concerns: getSelectedConcerns(),
      extraCoverage: {
        lossOfRent:
          (getQuizAnswerValue("riders") as string[])?.includes("lossOfRent") ||
          false,
        contentInsurance:
          (getQuizAnswerValue("riders") as string[])?.includes("contents") ||
          false,
        publicLiability:
          (getQuizAnswerValue("riders") as string[])?.includes("liability") ||
          false,
        accidentalDamage:
          (getQuizAnswerValue("riders") as string[])?.includes("accidental") ||
          false,
      },
    };

    localStorage.setItem("quoteData", JSON.stringify(data));
    // setTimeout(() => {
    //   navigate("/payment-success");
    // }, 5000);

    setLoading(true);
    try {
      const response = await fundWallet({
        amount: parseFloat(fundAmount),
        email: user.email,
      }).unwrap();

      console.log("Fund Wallet Response:", response);

      if (response?.data?.data?.authorizationUrl) {
        window.location.href = response.data.data.authorizationUrl;

        addToast({
          type: "success",
          title: "Payment Initiated",
          message: "Redirecting to Paystack for payment...",
        });

        // Close the fund modal
        setShowFundModal(false);
        setFundAmount("");
      } else {
        throw new Error("Authorization URL not received");
      }
    } catch {
      addToast({
        type: "error",
        title: "Funding Failed",
        message: "Please try again or contact support",
      });
    }
  };

  const handleWalletPayment = async () => {
    const totalPrice = quizState.premiumBreakdown?.total || 0;
    const currentWalletBalance = walletData?.data?.wallet?.balance || 0;

    if (currentWalletBalance >= totalPrice) {
      // Wallet has sufficient funds, proceed with checkout
      setLoading(true);
      try {
        await handleCheckout();
      } catch (error) {
        addToast({
          type: "error",
          title: "Payment Failed",
          message: "Please try again or contact support",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Wallet needs funding, show fund modal
      setShowPaymentModal(false);
      setShowFundModal(true);
    }
  };

  const questions = generateQuestions();
  const currentQuestion = questions[quizState.currentQuestion];

  // Update total questions when questions change
  useEffect(() => {
    setQuizState((prev) => ({ ...prev, totalQuestions: questions.length }));
  }, [questions.length]);

  // Determine property category for premium calculation
  const determinePropertyCategory = (
    answers: Record<string, QuizAnswer>
  ): string => {
    const propertyType = answers.propertyType?.value as string;
    const occupancy = answers.occupancy?.value as string;

    if (propertyType === "office" || occupancy === "office") {
      return "SINGLE_OCC_OFFICE";
    }
    if (
      ["bungalow", "duplex", "flats"].includes(propertyType) &&
      occupancy === "owner"
    ) {
      return "SINGLE_OCC_RESIDENTIAL";
    }
    if (propertyType === "hostel") {
      return "HOTEL_HOSTEL_GUEST";
    }
    if (propertyType === "recreation") {
      return "RECREATION_CINEMA";
    }
    if (propertyType === "school") {
      return "SCHOOLS_TRAINING";
    }
    if (propertyType === "petrol") {
      return "PETROL_GAS_STATION";
    }
    if (propertyType === "hospital") {
      return "HOSPITAL_CLINIC";
    }
    if (
      propertyType === "mixed" &&
      ["business", "commercial"].includes(occupancy)
    ) {
      return "MULTI_OCC_BUSINESS";
    }
    if (propertyType === "mixed") {
      return "MULTI_OCC_MIXED_RES";
    }
    return "OTHERS";
  };

  // Premium calculation with real-time updates
  const calculatePremium = useCallback(async () => {
    const now = Date.now();
    if (now - lastCalculationTime < 1500) return; // Rate limiting

    setCalculatingPremium(true);
    setLastCalculationTime(now);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const answers = quizState.answers;
      const category = determinePropertyCategory(answers);
      const categoryConfig =
        PREMIUM_TABLE.categories[
          category as keyof typeof PREMIUM_TABLE.categories
        ];

      // Calculate premium table base
      let premiumTableBase = 0;
      const breakdown: any = {};

      if (categoryConfig.charges.perFloor && answers.floors) {
        const floors = Number(answers.floors.value) || 1;
        premiumTableBase += floors * categoryConfig.charges.perFloor;
        breakdown.floors = floors * categoryConfig.charges.perFloor;
      }

      if (categoryConfig.charges.perPlot && answers.plots) {
        const plots = Number(answers.plots.value) || 1;
        premiumTableBase += plots * categoryConfig.charges.perPlot;
        breakdown.plots = plots * categoryConfig.charges.perPlot;
      }

      if (categoryConfig.charges.perRoom && answers.rooms) {
        const rooms = Number(answers.rooms.value) || 0;
        premiumTableBase += rooms * categoryConfig.charges.perRoom;
        breakdown.rooms = rooms * categoryConfig.charges.perRoom;
      }

      if (categoryConfig.charges.perBed && answers.beds) {
        const beds = Number(answers.beds.value) || 0;
        premiumTableBase += beds * categoryConfig.charges.perBed;
        breakdown.beds = beds * categoryConfig.charges.perBed;
      }

      if (categoryConfig.charges.perPump && answers.pumps) {
        const pumps = Number(answers.pumps.value) || 0;
        premiumTableBase += pumps * categoryConfig.charges.perPump;
        breakdown.pumps = pumps * categoryConfig.charges.perPump;
      }

      if (categoryConfig.charges.perCinemaSeat && answers.seats) {
        const seats = Number(answers.seats.value) || 0;
        premiumTableBase += seats * categoryConfig.charges.perCinemaSeat;
        breakdown.seats = seats * categoryConfig.charges.perCinemaSeat;
      }

      if (categoryConfig.charges.perBlock && answers.blocks) {
        const blocks = Number(answers.blocks.value) || 0;
        premiumTableBase += blocks * categoryConfig.charges.perBlock;
        breakdown.blocks = blocks * categoryConfig.charges.perBlock;
      }

      if (categoryConfig.charges.perPupilSeat && answers.pupilSeats) {
        const pupilSeats = Number(answers.pupilSeats.value) || 0;
        premiumTableBase += pupilSeats * categoryConfig.charges.perPupilSeat;
        breakdown.pupilSeats = pupilSeats * categoryConfig.charges.perPupilSeat;
      }

      if (categoryConfig.charges.perApartmentOfficeWing && answers.apartments) {
        const apartments = Number(answers.apartments.value) || 0;
        premiumTableBase +=
          apartments * categoryConfig.charges.perApartmentOfficeWing;
        breakdown.apartments =
          apartments * categoryConfig.charges.perApartmentOfficeWing;
      }

      // Risk units calculation
      let riskUnits = 0;
      const baseRiskRate = 2000;

      // Age risk
      const buildingAge = answers.buildingAge?.value as string;
      if (buildingAge === "old") riskUnits += 3;
      else if (buildingAge === "mature") riskUnits += 1;

      // Material risk
      const wallMaterial = answers.wallMaterial?.value as string;
      if (wallMaterial === "wood") riskUnits += 2;
      else if (wallMaterial === "mud") riskUnits += 3;

      // Condition risk
      if (answers.buildingCondition?.value === "no") riskUnits += 2;

      // Water proximity risk
      if (
        ["sea", "river", "reservoir"].includes(
          answers.waterProximity?.value as string
        )
      ) {
        riskUnits += 4;
      }

      // Past losses risk
      if (answers.pastLosses?.value === "yes") riskUnits += 3;

      // Nearby risks
      const nearbyRisk = answers.nearbyRisks?.value as string;
      if (nearbyRisk === "petrol") riskUnits += 2;
      else if (nearbyRisk === "industrial") riskUnits += 3;

      const riskUnitsTotal = riskUnits * baseRiskRate;

      // Declared value units
      const declaredValue = Number(answers.declaredValue?.value) || 0;
      const dvUnits = (declaredValue / 1000000) * baseRiskRate;

      // Calculate subtotal
      const subtotal = premiumTableBase + riskUnitsTotal + dvUnits;

      // Calculate discounts
      const discounts = [];
      const security = (answers.security?.value as string[]) || [];
      const fireSafety = (answers.fireSafety?.value as string[]) || [];

      if (security.includes("gate") && security.includes("guards")) {
        discounts.push({
          name: "High Security Discount",
          amount: 0.15,
          type: "percentage" as const,
        });
      } else if (security.length >= 2) {
        discounts.push({
          name: "Security Discount",
          amount: 0.08,
          type: "percentage" as const,
        });
      }

      if (fireSafety.includes("extinguisher") && fireSafety.includes("alarm")) {
        discounts.push({
          name: "Fire Safety Discount",
          amount: 0.12,
          type: "percentage" as const,
        });
      } else if (fireSafety.length >= 1) {
        discounts.push({
          name: "Basic Fire Safety Discount",
          amount: 0.05,
          type: "percentage" as const,
        });
      }

      if (buildingAge === "new") {
        discounts.push({
          name: "New Property Discount",
          amount: 0.08,
          type: "percentage" as const,
        });
      }

      // Calculate surcharges
      const surcharges = [];

      if (buildingAge === "old") {
        surcharges.push({
          name: "Old Property Surcharge",
          amount: 0.25,
          type: "percentage" as const,
        });
      }

      if (
        ["sea", "river", "reservoir"].includes(
          answers.waterProximity?.value as string
        )
      ) {
        surcharges.push({
          name: "Flood Risk Surcharge",
          amount: 0.3,
          type: "percentage" as const,
        });
      }

      if (answers.nearbyRisks?.value === "industrial") {
        surcharges.push({
          name: "Industrial Risk Surcharge",
          amount: 0.2,
          type: "percentage" as const,
        });
      }

      if (answers.businessUse?.value === "yes") {
        surcharges.push({
          name: "Commercial Use Surcharge",
          amount: 0.15,
          type: "percentage" as const,
        });
      }

      // Apply discounts and surcharges
      let total = subtotal;
      discounts.forEach((discount) => {
        if (discount.type === "percentage") {
          total -= subtotal * discount.amount;
        } else {
          total -= discount.amount;
        }
      });

      surcharges.forEach((surcharge) => {
        if (surcharge.type === "percentage") {
          total += subtotal * surcharge.amount;
        } else {
          total += surcharge.amount;
        }
      });

      // Add rider costs
      const riders = (answers.riders?.value as string[]) || [];
      const riderCosts = {
        flood: 5000,
        burglary: 3000,
        fire: 4000,
        liability: 6000,
        materials: 2500,
      };

      riders.forEach((rider) => {
        total += riderCosts[rider as keyof typeof riderCosts] || 0;
      });

      // Apply frequency multiplier
      const frequency = (answers.paymentFrequency?.value as string) || "annual";
      const frequencyMultipliers = {
        monthly: 1.15,
        quarterly: 1.08,
        biannual: 1.03,
        annual: 1.0,
      };

      const frequencyMultiplier =
        frequencyMultipliers[frequency as keyof typeof frequencyMultipliers];
      total *= frequencyMultiplier;

      // Ensure minimum premium
      total = Math.max(total, 15000);

      const premiumBreakdown: PremiumBreakdown = {
        premiumTableBase,
        riskUnits: riskUnitsTotal,
        dvUnits,
        subtotal,
        discounts,
        surcharges,
        total,
        frequency,
        frequencyMultiplier,
        breakdown,
      };

      setQuizState((prev) => ({
        ...prev,
        premiumBreakdown,
        propertyCategory: category,
      }));
    } catch (error) {
      addToast({
        type: "error",
        title: "Calculation Error",
        message: "Could not fetch premium right now. Please retry.",
      });
    } finally {
      setCalculatingPremium(false);
    }
  }, [quizState.answers, lastCalculationTime, addToast]);

  // Trigger calculation when relevant answers change
  useEffect(() => {
    if (Object.keys(quizState.answers).length > 2) {
      calculatePremium();
    }
  }, [quizState.answers, calculatePremium]);

  const handleAnswer = (
    questionId: string,
    value: string | number | string[],
    label?: string
  ) => {
    const newAnswer: QuizAnswer = { questionId, value, label };

    setQuizState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: newAnswer },
    }));

    // Log quiz answer event
    console.log("quiz.answer", { questionId, value, label });
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      if (quizState.currentQuestion < questions.length - 1) {
        setQuizState((prev) => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
        }));
      } else {
        // Show terms and conditions
        setShowTermsModal(true);
      }
    }
  };

  const handleBack = () => {
    if (quizState.currentQuestion > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return false;

    const answer = quizState.answers[currentQuestion.id];

    if (currentQuestion.validation?.required && !answer?.value) {
      addToast({
        type: "error",
        title: "Answer Required",
        message: "Please answer this question to continue",
      });
      return false;
    }

    if (currentQuestion.type === "number" && answer?.value) {
      const numValue = Number(answer.value);
      const validation = currentQuestion.validation;

      if (validation?.min && numValue < validation.min) {
        addToast({
          type: "error",
          title: "Invalid Value",
          message: `Value must be at least ${validation.min}`,
        });
        return false;
      }

      if (validation?.max && numValue > validation.max) {
        addToast({
          type: "error",
          title: "Invalid Value",
          message: `Value must be no more than ${validation.max}`,
        });
        return false;
      }
    }

    return true;
  };

  const handleProceedToPayment = () => {
    if (!termsAccepted) {
      addToast({
        type: "error",
        title: "Terms Required",
        message: "Please accept the terms and conditions to proceed",
      });
      return;
    }

    setShowTermsModal(false);
    setShowPaymentModal(true);

    // Log quote confirmation
    console.log("quote.confirm", {
      answers: quizState.answers,
      premium: quizState.premiumBreakdown?.total,
      termsAccepted: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgress = () =>
    ((quizState.currentQuestion + 1) / questions.length) * 100;

  // Log quiz start
  useEffect(() => {
    console.log("quiz.start", { timestamp: new Date().toISOString() });
  }, []);

  if (!currentQuestion) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-in">
                Get Your Quote
              </h1>
              <p
                className="text-gray-600 dark:text-gray-400 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                Question {quizState.currentQuestion + 1} of {questions.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="mb-12 animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(getProgress())}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>

              {/* Step Indicators */}
              <div className="flex justify-between mt-4">
                {[1, 2, 3, 4, 5].map((step) => {
                  const stepProgress = ((step - 1) / 4) * 100;
                  const isCompleted = getProgress() > stepProgress;
                  const isCurrent =
                    getProgress() >= stepProgress &&
                    getProgress() < stepProgress + 20;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                          isCompleted
                            ? "bg-blue-600 text-white shadow-lg scale-110"
                            : isCurrent
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 ring-2 ring-blue-300 dark:ring-blue-700"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          step
                        )}
                      </div>
                      <span
                        className={`text-xs mt-1 transition-colors ${
                          isCompleted || isCurrent
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400"
                        }`}
                      >
                        Step {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Quiz */}
            <div className="lg:col-span-2">
              <Card className="p-8 animate-in slide-in-from-left-4 duration-500">
                {/* Question */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-4xl">{currentQuestion.emoji}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentQuestion.text}
                      </h2>
                      {currentQuestion.microCopy && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {currentQuestion.microCopy}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-4 mb-8">
                  {currentQuestion.type === "single" &&
                    currentQuestion.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => {
                          const isSelected =
                            quizState.answers[currentQuestion.id]?.value ===
                            option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() =>
                                handleAnswer(
                                  currentQuestion.id,
                                  option.value,
                                  option.label
                                )
                              }
                              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 hover:shadow-md animate-in slide-in-from-bottom-4 ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                              }`}
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <div className="flex items-center space-x-3">
                                {option.icon && (
                                  <option.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                )}
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {option.label}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {currentQuestion.type === "multiple" &&
                    currentQuestion.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => {
                          const selectedValues =
                            (quizState.answers[currentQuestion.id]
                              ?.value as string[]) || [];
                          const isSelected = selectedValues.includes(
                            option.value
                          );
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                const currentValues = selectedValues;
                                const newValues = isSelected
                                  ? currentValues.filter(
                                      (v) => v !== option.value
                                    )
                                  : [...currentValues, option.value];
                                handleAnswer(currentQuestion.id, newValues);
                              }}
                              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 animate-in slide-in-from-bottom-4 ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                              }`}
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-gray-300 dark:border-gray-600"
                                  }`}
                                >
                                  {isSelected && (
                                    <CheckCircle className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                {option.icon && (
                                  <option.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                )}
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {option.label}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {(currentQuestion.type === "number" ||
                    currentQuestion.type === "text") && (
                    <div className="max-w-md animate-in slide-in-from-bottom-4 duration-300">
                      <Input
                        type={
                          currentQuestion.type === "number" ? "number" : "text"
                        }
                        value={
                          quizState.answers[
                            currentQuestion.id
                          ]?.value?.toString() || ""
                        }
                        onChange={(e) => {
                          const value =
                            currentQuestion.type === "number"
                              ? Number(e.target.value)
                              : e.target.value;
                          handleAnswer(currentQuestion.id, value);
                        }}
                        placeholder={
                          currentQuestion.type === "number"
                            ? "Enter number"
                            : "Enter details"
                        }
                        min={currentQuestion.validation?.min}
                        max={currentQuestion.validation?.max}
                        className="text-lg p-4"
                      />
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={quizState.currentQuestion === 0}
                    className="group"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                  </Button>

                  <Button onClick={handleNext} className="group">
                    {quizState.currentQuestion === questions.length - 1 ? (
                      <>
                        Get Quote
                        <Sparkles className="h-4 w-4 ml-2 group-hover:rotate-12 transition-transform" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Premium Calculator Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 sticky top-8 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Live Quote
                  </h3>
                  {calculatingPremium && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>

                {quizState.premiumBreakdown ? (
                  <div className="space-y-4">
                    {/* Animated Premium Display */}
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {quizState.premiumBreakdown.frequency
                          .charAt(0)
                          .toUpperCase() +
                          quizState.premiumBreakdown.frequency.slice(1)}{" "}
                        Premium
                      </p>
                      <div className="relative">
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                          {formatCurrency(quizState.premiumBreakdown.total)}
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg animate-pulse" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Premium shown is estimate until confirmed
                      </p>
                    </div>

                    {/* Breakdown Toggle */}
                    <button
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        See how we calculated this
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform duration-200 group-hover:scale-110 ${
                          showBreakdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Detailed Breakdown */}
                    {showBreakdown && (
                      <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                        <div className="text-sm space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                            Premium Table Charges
                          </h4>

                          {Object.entries(
                            quizState.premiumBreakdown.breakdown
                          ).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {formatCurrency(value)}
                              </span>
                            </div>
                          ))}

                          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-900 dark:text-white">
                                Table Base:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {formatCurrency(
                                  quizState.premiumBreakdown.premiumTableBase
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Risk Units:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {formatCurrency(
                                quizState.premiumBreakdown.riskUnits
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Declared Value Units:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {formatCurrency(
                                quizState.premiumBreakdown.dvUnits
                              )}
                            </span>
                          </div>

                          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-900 dark:text-white">
                                Subtotal:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {formatCurrency(
                                  quizState.premiumBreakdown.subtotal
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Discounts */}
                          {quizState.premiumBreakdown.discounts.map(
                            (discount, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-green-600 dark:text-green-400"
                              >
                                <span>{discount.name}:</span>
                                <span>
                                  -
                                  {discount.type === "percentage"
                                    ? `${(discount.amount * 100).toFixed(0)}%`
                                    : formatCurrency(discount.amount)}
                                </span>
                              </div>
                            )
                          )}

                          {/* Surcharges */}
                          {quizState.premiumBreakdown.surcharges.map(
                            (surcharge, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-red-600 dark:text-red-400"
                              >
                                <span>{surcharge.name}:</span>
                                <span>
                                  +
                                  {surcharge.type === "percentage"
                                    ? `${(surcharge.amount * 100).toFixed(0)}%`
                                    : formatCurrency(surcharge.amount)}
                                </span>
                              </div>
                            )
                          )}

                          {/* Frequency Multiplier */}
                          {quizState.premiumBreakdown.frequencyMultiplier !==
                            1.0 && (
                            <div className="flex justify-between text-orange-600 dark:text-orange-400">
                              <span>Payment Frequency:</span>
                              <span>
                                ×
                                {quizState.premiumBreakdown.frequencyMultiplier.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Active Discounts */}
                    {quizState.premiumBreakdown.discounts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">
                          🎉 Active Discounts:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {quizState.premiumBreakdown.discounts.map(
                            (discount, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${index * 200}ms` }}
                              >
                                {discount.name}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Answer a few questions to see your premium
                    </p>
                  </div>
                )}
              </Card>

              {/* Help Card */}
              <Card
                className="p-6 animate-in slide-in-from-right-4 duration-500"
                style={{ animationDelay: "200ms" }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Need Help?
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Our insurance experts are here to help you get the right
                  coverage.
                </p>
                <Button variant="outline" size="sm" className="w-full group">
                  <HelpCircle className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Contact Support
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Terms & Conditions
                </h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Premium Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Your Premium
                  </p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {quizState.premiumBreakdown
                      ? formatCurrency(quizState.premiumBreakdown.total)
                      : "---"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {quizState.premiumBreakdown?.frequency} payment
                  </p>
                </div>
              </div>

              {/* Terms Text */}
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  By continuing, you agree to the{" "}
                  <a
                    href="/legal/terms/home-policy-v1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    BrickSure Home Insurance Terms
                  </a>
                  .
                </p>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="terms-checkbox"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    I have read and agree to the Terms & Conditions
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleProceedToPayment}
                  disabled={!termsAccepted}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </Button>

                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    Download T&Cs (PDF)
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Email me a copy
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Quote Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your premium has been calculated. Choose your payment method
                  to activate your policy.
                </p>
              </div>

              {/* Premium Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {quizState.premiumBreakdown
                      ? formatCurrency(quizState.premiumBreakdown.total)
                      : "---"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {quizState.premiumBreakdown?.frequency} premium •
                    Underwritten by STI
                  </p>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-3 mb-6">
                <Button
                  className="w-full justify-start group"
                  onClick={handleWalletPayment}
                  disabled={loading}
                >
                  <Wallet className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-medium">Pay with Wallet</p>
                    <p className="text-xs opacity-75">
                      {(walletData?.data?.wallet?.balance || 0) >=
                      (quizState.premiumBreakdown?.total || 0)
                        ? "Sufficient balance • Direct payment"
                        : "Fund wallet if needed • Smart payment"}
                    </p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start group"
                  onClick={handleWalletPayment}
                  disabled={loading}
                >
                  <CreditCard className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-medium">Pay with Card</p>
                    <p className="text-xs opacity-75">
                      Visa, Mastercard • Direct payment
                    </p>
                  </div>
                </Button>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Save Quote
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Processing..." : "Get Quote"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Fund Wallet
                </h3>
                <button
                  onClick={() => setShowFundModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Current Balance & Required Amount */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Current Wallet Balance:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(walletData?.data?.wallet?.balance || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Premium Amount:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(quizState.premiumBreakdown?.total || 0)}
                      </span>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Amount Needed:
                      </span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(
                          Math.max(
                            0,
                            (quizState.premiumBreakdown?.total || 0) -
                              (walletData?.data?.wallet?.balance || 0)
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fund Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Fund
                </label>
                <Input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={Math.max(
                    0,
                    (quizState.premiumBreakdown?.total || 0) -
                      (walletData?.data?.wallet?.balance || 0)
                  )}
                  className="text-lg p-4"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Minimum:{" "}
                  {formatCurrency(
                    Math.max(
                      0,
                      (quizState.premiumBreakdown?.total || 0) -
                        (walletData?.data?.wallet?.balance || 0)
                    )
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleFundWallet}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Processing..." : "Fund Wallet"}
                </Button>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowFundModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const neededAmount = Math.max(
                        0,
                        (quizState.premiumBreakdown?.total || 0) -
                          (walletData?.data?.wallet?.balance || 0)
                      );
                      setFundAmount(neededAmount.toString());
                    }}
                  >
                    Set Minimum
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
}
