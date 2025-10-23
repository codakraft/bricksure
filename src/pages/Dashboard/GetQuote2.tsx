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
import { GooglePlacesInput } from "../../components/UI/GooglePlacesInput";
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
import {
  useGetChargesQuery,
  useGetSeaLevelMutation,
  useQuotePaymentMutation,
} from "../../services/quotesService";

interface QuizAnswer {
  questionId: string;
  value: string | number | string[];
  label?: string;
}

interface QuizState {
  answers: Record<string, QuizAnswer>;
  currentQuestion: number;
  totalQuestions: number;
  currentStep: number; // Track which of the 4 steps (1-4), step 5 is payment
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
  const { data: chargesData } = useGetChargesQuery();
  const [getSeaLevel, { data: seaLevelData, isLoading: isLoadingSeaLevel }] =
    useGetSeaLevelMutation();
  const [quotePayment] = useQuotePaymentMutation();

  console.log("Charges Data:", chargesData);
  console.log("Sea Level Data:", seaLevelData);

  const [quizState, setQuizState] = useState<QuizState>({
    answers: {},
    currentQuestion: 0,
    totalQuestions: 0,
    currentStep: 1, // Start at step 1 (of 4 steps, step 5 is payment)
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    questions.push({
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
    });

    // Add wall material follow-up immediately if "other" is selected
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

    questions.push({
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
    });

    // Add roof type follow-up immediately if "other" is selected
    if (answers.roofType?.value === "other") {
      questions.push({
        id: "roofTypeOther",
        text: "Please specify the roof type",
        emoji: "✏️",
        type: "text",
        validation: { required: true },
      });
    }

    questions.push(
      {
        id: "buildingAge",
        text: "How old is the building?",
        emoji: "📅",
        type: "single",
        options: [
          { value: "0-5", label: "Less than 5 years", icon: Sparkles },
          { value: "5-10", label: "5-10 years", icon: Calendar },
          { value: "10-20", label: "10-20 years", icon: Calendar },
          { value: "20+", label: "Over 20 years", icon: Calendar },
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
      id: "propertyLocation",
      text: "Enter Property Location",
      emoji: "📍",
      type: "text",
      validation: { required: true },
      microCopy: "Provide the full address or location of your property",
    });

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
        type: "text",
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

  // Organize questions into 4 steps
  const getQuestionsForStep = (step: number): Question[] => {
    const allQuestions = generateQuestions();

    // Define step boundaries based on question themes
    // Step 1: Property Type & Basic Info (property type, follow-ups, plots)
    // Step 2: Structure & Condition (walls, roof, age, condition)
    // Step 3: Occupancy, Use & Safety (occupancy, business use, unoccupied, location, risks, security, fire safety)
    // Step 4: Additional Info & Extras (paying guests, staff, insurance history, riders, value, payment frequency)

    const step1Questions = [
      "propertyType",
      "propertyTypeOther",
      "floors",
      "rooms",
      "beds",
      "blocks",
      "pupilSeats",
      "pumps",
      "seats",
      "plots",
    ];

    const step2Questions = [
      "wallMaterial",
      "wallMaterialOther",
      "roofType",
      "roofTypeOther",
      "buildingAge",
      "buildingCondition",
    ];

    const step3Questions = [
      "occupancy",
      "furnished",
      "occupancyOther",
      "businessUse",
      "businessDetails",
      "unoccupied",
      "unoccupiedDuration",
      "propertyLocation",
      "pastLosses",
      "lossDetails",
      "nearbyRisks",
      "nearbyRiskOther",
      "security",
      "fireSafety",
    ];

    const step4Questions = [
      "payingGuests",
      "guestCount",
      "domesticStaff",
      "previousDecline",
      "declineDetails",
      "currentInsurance",
      "insuranceDetails",
      "riders",
      "declaredValue",
      "paymentFrequency",
    ];

    let questionIds: string[] = [];
    if (step === 1) questionIds = step1Questions;
    else if (step === 2) questionIds = step2Questions;
    else if (step === 3) questionIds = step3Questions;
    else if (step === 4) questionIds = step4Questions;

    // Filter questions to only include those for this step
    return allQuestions.filter((q) => questionIds.includes(q.id));
  };

  // Get current step's questions
  const currentStepQuestions = getQuestionsForStep(quizState.currentStep);
  const currentQuestion = currentStepQuestions[quizState.currentQuestion];

  const handleCheckout = async (currentStep?: number) => {
    setLoading(true);

    const answers = quizState.answers;
    const riders = (answers.riders?.value as string[]) || [];
    const security = (answers.security?.value as string[]) || [];
    const fireSafety = (answers.fireSafety?.value as string[]) || [];

    // Determine flood risk from sea level data
    let floodRisk = false;
    if (seaLevelData) {
      const parseDistanceFromText = (
        text: string
      ): { elevation: number | null; waterDistance: number | null } => {
        let elevation: number | null = null;
        let waterDistance: number | null = null;

        const elevationMatch = text.match(
          /(?:distance to sea level|elevation)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
        );
        if (elevationMatch) {
          elevation = parseFloat(elevationMatch[1]);
        }

        const waterMatch = text.match(
          /(?:distance to water)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
        );
        if (waterMatch) {
          waterDistance = parseFloat(waterMatch[1]);
        }

        return { elevation, waterDistance };
      };

      let elevationM = seaLevelData.elevation_meters;
      let distanceToWaterM: number | null = null;

      if (
        (!elevationM || elevationM === 0) &&
        seaLevelData.sea_level_assessment
      ) {
        const parsed = parseDistanceFromText(seaLevelData.sea_level_assessment);
        if (parsed.elevation !== null) {
          elevationM = parsed.elevation;
        }
        distanceToWaterM = parsed.waterDistance;
      }

      // Consider it high flood risk if elevation < 20m or distance to water < 500m
      if (
        (elevationM !== undefined && elevationM !== null && elevationM < 20) ||
        (distanceToWaterM !== null && distanceToWaterM < 500)
      ) {
        floodRisk = true;
      }
    }

    // Calculate property age from building age
    const buildingAgeValue = answers.buildingAge?.value as string;
    let propertyAge = 0;
    if (buildingAgeValue === "0-5") propertyAge = 2;
    else if (buildingAgeValue === "5-10") propertyAge = 7;
    else if (buildingAgeValue === "10-20") propertyAge = 15;
    else if (buildingAgeValue === "20+") propertyAge = 25;

    // Map quiz property type to API property type key
    const propertyType = answers.propertyType?.value as string;
    const occupancy = answers.occupancy?.value as string;

    let apiPropertyTypeKey = "others";
    if (propertyType === "bungalow") {
      apiPropertyTypeKey = "bungalow";
    } else if (propertyType === "duplex") {
      apiPropertyTypeKey = "duplex";
    } else if (propertyType === "storey") {
      apiPropertyTypeKey = "storeyBuilding";
    } else if (propertyType === "flats") {
      apiPropertyTypeKey = "flats";
    } else if (propertyType === "office" || occupancy === "office") {
      apiPropertyTypeKey = "singleOccOffice";
    } else if (
      ["bungalow", "duplex", "flats"].includes(propertyType) &&
      occupancy === "owner"
    ) {
      apiPropertyTypeKey = "singleOccResidential";
    } else if (propertyType === "hostel") {
      apiPropertyTypeKey = "hotelHostelGuest";
    } else if (propertyType === "recreation") {
      apiPropertyTypeKey = "recreationCinema";
    } else if (propertyType === "school") {
      apiPropertyTypeKey = "school";
    } else if (propertyType === "petrol") {
      apiPropertyTypeKey = "petrolGasStation";
    } else if (propertyType === "hospital") {
      apiPropertyTypeKey = "hospitalClinic";
    } else if (
      propertyType === "mixed" &&
      ["business", "commercial"].includes(occupancy)
    ) {
      apiPropertyTypeKey = "multiOccBusiness";
    } else if (propertyType === "mixed") {
      apiPropertyTypeKey = "multiOccMixedRes";
    }

    // Build charges object based on available answers
    const charges: {
      perPlot?: number;
      perFloor?: number;
      perBlock?: number;
      perPupilSeat?: number;
      perRoom?: number;
      perBed?: number;
      perPump?: number;
      perCinemaSeat?: number;
      perApartmentOfficeWing?: number;
    } = {};

    if (answers.plots?.value) {
      charges.perPlot = Number(answers.plots.value);
    }
    if (answers.floors?.value) {
      charges.perFloor = Number(answers.floors.value);
    }
    if (answers.blocks?.value) {
      charges.perBlock = Number(answers.blocks.value);
    }
    if (answers.pupilSeats?.value) {
      charges.perPupilSeat = Number(answers.pupilSeats.value);
    }
    if (answers.rooms?.value) {
      charges.perRoom = Number(answers.rooms.value);
    }
    if (answers.beds?.value) {
      charges.perBed = Number(answers.beds.value);
    }
    if (answers.pumps?.value) {
      charges.perPump = Number(answers.pumps.value);
    }
    if (answers.seats?.value) {
      charges.perCinemaSeat = Number(answers.seats.value);
    }
    if (answers.apartments?.value) {
      charges.perApartmentOfficeWing = Number(answers.apartments.value);
    }

    // Determine the current step number
    const stepNumber =
      currentStep !== undefined ? currentStep : quizState.currentQuestion + 1;

    // Get quote ID from localStorage - check for ALL steps (needed for resume functionality)
    const quoteIdFromStorage: string | null =
      localStorage.getItem("currentQuoteId");

    if (quoteIdFromStorage) {
      console.log(
        "Step",
        stepNumber,
        "- Retrieved Quote ID from localStorage:",
        quoteIdFromStorage
      );
    }

    // For step 2 onwards, quote ID is REQUIRED (unless resuming from step 1)
    if (stepNumber >= 2 && !quoteIdFromStorage) {
      console.error(
        "CRITICAL: No quote ID found in localStorage for step",
        stepNumber
      );
      console.log("localStorage contents:", {
        currentQuoteId: localStorage.getItem("currentQuoteId"),
        allKeys: Object.keys(localStorage),
      });

      addToast({
        type: "error",
        title: "Quote Session Lost",
        message: "Please restart the quote process from step 1",
      });

      // Optionally navigate back to step 1
      // setQuizState(prev => ({ ...prev, currentQuestion: 0 }));
      // setLoading(false);
      // return;
    } else if (stepNumber === 1 && !quoteIdFromStorage) {
      console.log("Step", stepNumber, "- Creating new quote (no existing ID)");
    } else if (stepNumber === 1 && quoteIdFromStorage) {
      console.log(
        "Step",
        stepNumber,
        "- Updating existing quote:",
        quoteIdFromStorage
      );
    }

    // Build the NewCreateQuoteRequest payload matching the exact structure
    const data: {
      propertyTypeCharges: {
        [key: string]: { charges: { [key: string]: number } };
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
    } = {
      propertyTypeCharges: {
        [apiPropertyTypeKey]: {
          charges: charges,
        },
      },
      address: (answers.propertyLocation?.value as string) || "",
      paymentFrequency: (answers.paymentFrequency?.value as string) || "annual",
      propertyValue: Number(answers.declaredValue?.value) || 0,
      riskAdjustments: {
        wallMaterial: (answers.wallMaterial?.value as string) || "",
        buildingAge: buildingAgeValue || "",
        pastLoss: answers.pastLosses?.value === "yes",
        unOccupiedForAwhile: answers.unoccupied?.value === "yes",
        unOccupiedDuration: Number(answers.unoccupiedDuration?.value) || 0,
        floodRisk: floodRisk,
      },
      safetySecurityDiscounts: {
        securitySafety: {
          estateGate: security.includes("gate"),
          cctv: security.includes("cctv"),
          securityGuards: security.includes("guards"),
          strongLocks: security.includes("locks"),
          noGlassPanels: security.includes("noglass"),
          occupied: security.includes("occupied"),
        },
        fireSafety: {
          fireExtinguisher: fireSafety.includes("extinguisher"),
          smokeAlarm: fireSafety.includes("alarm"),
          waterAccess: fireSafety.includes("hydrant"),
        },
      },
      extraCoverageFees: {
        theft: riders.includes("materials"),
        floodProtection: riders.includes("flood"),
        publicLiability: riders.includes("liability"),
        extendedFireCover: riders.includes("fire"),
        burglaryCover: riders.includes("burglary"),
      },
      duration: 12, // Default annual duration
      propertyAge: propertyAge,
      step: stepNumber,
    };

    // Add _id to payload for step 2 onwards OR if we have a saved quote ID (resuming)
    if (quoteIdFromStorage && stepNumber >= 2) {
      data._id = quoteIdFromStorage;
      console.log(
        "Adding _id to payload for step",
        stepNumber,
        ":",
        quoteIdFromStorage
      );
    } else if (quoteIdFromStorage && stepNumber === 1) {
      // If resuming from step 1 with an existing quote, include the _id to update instead of create
      data._id = quoteIdFromStorage;
      console.log(
        "Resuming existing quote - Adding _id to payload for step",
        stepNumber,
        ":",
        quoteIdFromStorage
      );
    }

    console.log("Checkout Data (Step " + data.step + "):", data);

    try {
      const res = await createQuote(data).unwrap();
      console.log("Create Quote Response:", res);
      console.log("Create Quote Step:", stepNumber);

      // If this is step 1 and we don't already have a quote ID (new quote), save it
      // If resuming, the quote ID should already be in localStorage
      if (stepNumber === 1 && !quoteIdFromStorage) {
        console.log(
          "Step 1 completed (NEW quote) - extracting quote ID from response..."
        );

        // Extract quote ID from the response (structure: { message: string, data: { _id: string, ... } })
        const quoteId = res?.data?._id;

        if (quoteId) {
          // Save to localStorage for subsequent steps
          localStorage.setItem("currentQuoteId", quoteId);
          console.log(
            "✅ Successfully saved Quote ID to localStorage:",
            quoteId
          );

          // Verify it was saved
          const verification = localStorage.getItem("currentQuoteId");
          console.log("Verification - localStorage contains:", verification);
        } else {
          console.error(
            "❌ Could not extract quote ID from response. Response structure:",
            {
              hasData: !!res?.data,
              dataKeys: res?.data ? Object.keys(res.data) : [],
              fullResponse: res,
            }
          );

          addToast({
            type: "error",
            title: "Quote Creation Issue",
            message:
              "Quote created but ID not found. Please check your dashboard.",
          });
        }
      } else if (stepNumber === 1 && quoteIdFromStorage) {
        console.log(
          "Step 1 completed (RESUME) - using existing quote ID:",
          quoteIdFromStorage
        );
        // Already have quote ID from resume, no need to extract from response
      }

      if (currentStep === undefined) {
        // Final submission - Process payment with the saved quote ID
        console.log("Final submission - processing payment...");

        // Get the quote ID from localStorage
        const savedQuoteId = localStorage.getItem("currentQuoteId");

        if (savedQuoteId) {
          console.log("Using saved Quote ID for payment:", savedQuoteId);

          // Call quotePayment with the quote ID
          try {
            const paymentRes = await quotePayment({
              quoteId: savedQuoteId,
            }).unwrap();
            console.log("Payment Response:", paymentRes);

            // Clear the quote ID from localStorage after successful payment
            localStorage.removeItem("currentQuoteId");

            addToast({
              type: "success",
              title: "Application Submitted Successfully!",
              message:
                "Your policy application has been submitted and payment processed. You will be notified of the approval status.",
            });
            // Navigate to dashboard with success state
            navigate("/dashboard?success=quote-submitted");
          } catch (paymentErr) {
            console.error("Payment error:", paymentErr);
            addToast({
              type: "error",
              title: "Payment Failed",
              message:
                "Quote created but payment failed. Please try again from your dashboard.",
            });
            navigate("/dashboard");
          }
        } else {
          console.error("No quote ID found in localStorage for payment");
          addToast({
            type: "error",
            title: "Quote Not Found",
            message:
              "Could not find the quote for payment. Please check your dashboard.",
          });
          navigate("/dashboard");
        }
      } else {
        // Step-by-step submission successful
        console.log("Step " + data.step + " saved successfully");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      if (currentStep === undefined) {
        // Only show error toast for final submission
        addToast({
          type: "error",
          title: "Submission Failed",
          message: "Please try again or contact support",
        });
      }
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

    const neededAmount = Math.max(
      0,
      (quizState.premiumBreakdown?.total || 0) -
        (walletData?.data?.wallet?.balance || 0)
    );

    // Validate that fund amount covers the required balance
    if (neededAmount > parseFloat(fundAmount)) {
      addToast({
        type: "error",
        title: "Insufficient Amount",
        message: `Please enter at least ${formatCurrency(
          neededAmount
        )} to cover the quote`,
      });
      return;
    }

    // const data = {
    //   address: getQuizAnswerValue("address") || "",
    //   state: getQuizAnswerValue("state") || "",
    //   lga: getQuizAnswerValue("lga") || "",
    //   propertyType: getPropertyTypeFromQuiz(),
    //   year:
    //     Number(getQuizAnswerValue("buildingAge")) ||
    //     new Date().getFullYear() - 5,
    //   buildingMaterials: getBuildingMaterialsFromQuiz(),
    //   occupancyStatus: getOccupancyStatusFromQuiz(),
    //   paymentFrequency: getQuizAnswerValue("paymentFrequency") || "annual",
    //   policy: "basic", // You can determine this from quiz if you have policy selection
    //   propertyValue: String(Number(getQuizAnswerValue("declaredValue")) || 0),
    //   concerns: getSelectedConcerns(),
    //   extraCoverage: {
    //     lossOfRent:
    //       (getQuizAnswerValue("riders") as string[])?.includes("lossOfRent") ||
    //       false,
    //     contentInsurance:
    //       (getQuizAnswerValue("riders") as string[])?.includes("contents") ||
    //       false,
    //     publicLiability:
    //       (getQuizAnswerValue("riders") as string[])?.includes("liability") ||
    //       false,
    //     accidentalDamage:
    //       (getQuizAnswerValue("riders") as string[])?.includes("accidental") ||
    //       false,
    //   },
    // };

    // localStorage.setItem("quoteData", JSON.stringify(data));
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
      // Wallet has sufficient funds, proceed with payment
      setLoading(true);

      // Set current step to 5 (payment step)
      setQuizState((prev) => ({ ...prev, currentStep: 5 }));

      try {
        // Get the saved quote ID from localStorage
        const savedQuoteId = localStorage.getItem("currentQuoteId");

        if (!savedQuoteId) {
          console.error("No quote ID found in localStorage for payment");
          addToast({
            type: "error",
            title: "Quote Not Found",
            message:
              "Could not find the quote for payment. Please check your dashboard.",
          });
          navigate("/dashboard");
          return;
        }

        console.log("Step 5 (Payment) - Using saved Quote ID:", savedQuoteId);

        // Call quotePayment with the quote ID
        const paymentRes = await quotePayment({
          quoteId: savedQuoteId,
        }).unwrap();

        console.log("Payment Response:", paymentRes);

        // Clear the quote ID from localStorage after successful payment
        localStorage.removeItem("currentQuoteId");

        addToast({
          type: "success",
          title: "Payment Successful!",
          message:
            "Your policy application has been submitted and payment processed. You will be notified of the approval status.",
        });

        // Navigate to dashboard with success state
        navigate("/dashboard?success=quote-submitted");
      } catch (paymentErr) {
        console.error("Payment error:", paymentErr);
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

  // Update total questions when questions change
  useEffect(() => {
    const totalQuestionsInStep = currentStepQuestions.length;
    setQuizState((prev) => ({ ...prev, totalQuestions: totalQuestionsInStep }));
  }, [currentStepQuestions.length]);

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

      // Get category configuration from chargesData
      if (!chargesData?.data) {
        throw new Error("Charges data not available");
      }

      const propertyTypeCharges = chargesData.data.propertyTypeCharges;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let categoryConfig: any = null;

      // Map category to API structure
      switch (category) {
        case "SINGLE_OCC_OFFICE":
          categoryConfig = propertyTypeCharges.singleOccOffice;
          break;
        case "SINGLE_OCC_RESIDENTIAL":
          categoryConfig = propertyTypeCharges.singleOccResidential;
          break;
        case "HOTEL_HOSTEL_GUEST":
          categoryConfig = propertyTypeCharges.hotelHostelGuest;
          break;
        case "RECREATION_CINEMA":
          categoryConfig = propertyTypeCharges.recreationCinema;
          break;
        case "SCHOOLS_TRAINING":
          categoryConfig = propertyTypeCharges.school;
          break;
        case "PETROL_GAS_STATION":
          categoryConfig = propertyTypeCharges.petrolGasStation;
          break;
        case "HOSPITAL_CLINIC":
          categoryConfig = propertyTypeCharges.hospitalClinic;
          break;
        case "MULTI_OCC_BUSINESS":
          categoryConfig = propertyTypeCharges.multiOccBusiness;
          break;
        case "MULTI_OCC_MIXED_RES":
          categoryConfig = propertyTypeCharges.multiOccMixedRes;
          break;
        default:
          categoryConfig = propertyTypeCharges.others;
      }

      if (!categoryConfig) {
        throw new Error("Category configuration not found");
      }

      // Calculate premium table base using API charges (convert strings to numbers)
      let premiumTableBase = 0;
      const breakdown: Record<string, number> = {};

      if (categoryConfig.perFloor && answers.floors) {
        const floors = Number(answers.floors.value) || 1;
        const perFloorCharge = Number(categoryConfig.perFloor) || 0;
        premiumTableBase += floors * perFloorCharge;
        breakdown.floors = floors * perFloorCharge;
      }

      if (categoryConfig.perPlot && answers.plots) {
        const plots = Number(answers.plots.value) || 1;
        const perPlotCharge = Number(categoryConfig.perPlot) || 0;
        premiumTableBase += plots * perPlotCharge;
        breakdown.plots = plots * perPlotCharge;
      }

      if (categoryConfig.perRoom && answers.rooms) {
        const rooms = Number(answers.rooms.value) || 0;
        const perRoomCharge = Number(categoryConfig.perRoom) || 0;
        premiumTableBase += rooms * perRoomCharge;
        breakdown.rooms = rooms * perRoomCharge;
      }

      if (categoryConfig.perBed && answers.beds) {
        const beds = Number(answers.beds.value) || 0;
        const perBedCharge = Number(categoryConfig.perBed) || 0;
        premiumTableBase += beds * perBedCharge;
        breakdown.beds = beds * perBedCharge;
      }

      if (categoryConfig.perPump && answers.pumps) {
        const pumps = Number(answers.pumps.value) || 0;
        const perPumpCharge = Number(categoryConfig.perPump) || 0;
        premiumTableBase += pumps * perPumpCharge;
        breakdown.pumps = pumps * perPumpCharge;
      }

      if (categoryConfig.perCinemaSeat && answers.seats) {
        const seats = Number(answers.seats.value) || 0;
        const perCinemaSeatCharge = Number(categoryConfig.perCinemaSeat) || 0;
        premiumTableBase += seats * perCinemaSeatCharge;
        breakdown.seats = seats * perCinemaSeatCharge;
      }

      if (categoryConfig.perBlock && answers.blocks) {
        const blocks = Number(answers.blocks.value) || 0;
        const perBlockCharge = Number(categoryConfig.perBlock) || 0;
        premiumTableBase += blocks * perBlockCharge;
        breakdown.blocks = blocks * perBlockCharge;
      }

      if (categoryConfig.perPupilSeat && answers.pupilSeats) {
        const pupilSeats = Number(answers.pupilSeats.value) || 0;
        const perPupilSeatCharge = Number(categoryConfig.perPupilSeat) || 0;
        premiumTableBase += pupilSeats * perPupilSeatCharge;
        breakdown.pupilSeats = pupilSeats * perPupilSeatCharge;
      }

      if (categoryConfig.perApartmentOfficeWing && answers.apartments) {
        const apartments = Number(answers.apartments.value) || 0;
        const perApartmentOfficeWingCharge =
          Number(categoryConfig.perApartmentOfficeWing) || 0;
        premiumTableBase += apartments * perApartmentOfficeWingCharge;
        breakdown.apartments = apartments * perApartmentOfficeWingCharge;
      }

      // Risk percentage modifiers from API (applied on premium)
      let totalRiskModifier = 0; // This will be a percentage like 0.05 for 5%

      // Age risk from API (percentage modifiers)
      const buildingAge = answers.buildingAge?.value as string;
      const ageRisks = chargesData.data.riskAdjustments.buildingAge;
      console.log("Building Age:", buildingAge);
      console.log("Age Risks from API:", ageRisks);

      if (buildingAge === "20+" && ageRisks?.["20+"]) {
        totalRiskModifier += Number(ageRisks["20+"]); // e.g., 0.25 for 25% surcharge
        console.log("Applied old building risk:", Number(ageRisks["20+"]));
      } else if (buildingAge === "10-20" && ageRisks?.["10-20"]) {
        totalRiskModifier += Number(ageRisks["10-20"]); // e.g., 0.10 for 10% surcharge
        console.log("Applied mature building risk:", Number(ageRisks["10-20"]));
      } else if (buildingAge === "5-10" && ageRisks?.["5-10"]) {
        totalRiskModifier += Number(ageRisks["5-10"]); // e.g., -0.05 for 5% discount
        console.log("Applied recent building risk:", Number(ageRisks["5-10"]));
      } else if (buildingAge === "0-5" && ageRisks?.["0-5"]) {
        totalRiskModifier += Number(ageRisks["0-5"]); // e.g., -0.01 for 1% discount
        console.log("Applied new building risk:", Number(ageRisks["0-5"]));
      }
      console.log("Total Risk after Age:", totalRiskModifier);

      // Material risk from API (percentage modifiers)
      const wallMaterial = answers.wallMaterial?.value as string;
      const materialRisks = chargesData.data.riskAdjustments.wallMaterial;
      if (wallMaterial === "wood" && materialRisks?.wood) {
        totalRiskModifier += Number(materialRisks.wood); // e.g., 0.15 for 15% surcharge
      } else if (wallMaterial === "mud" && materialRisks?.mud) {
        totalRiskModifier += Number(materialRisks.mud); // e.g., 0.20 for 20% surcharge
      } else if (wallMaterial === "brick" && materialRisks?.brick) {
        totalRiskModifier += Number(materialRisks.brick); // e.g., -0.05 for 5% discount
      } else if (wallMaterial === "mixed" && materialRisks?.mixedMaterials) {
        totalRiskModifier += Number(materialRisks.mixedMaterials); // e.g., 0.05 for 5% surcharge
      }

      // Condition risk (percentage modifier)
      if (answers.buildingCondition?.value === "no") {
        const conditionRisk =
          Number(chargesData.data.riskAdjustments.repairNeeded) || 0.01;
        totalRiskModifier += conditionRisk; // e.g., 0.10 for 10% surcharge
      }

      // Past losses risk (percentage modifier)
      if (answers.pastLosses?.value === "yes") {
        const pastLossesRisk =
          Number(chargesData.data.riskAdjustments.pastLoss) || 0.2;
        totalRiskModifier += pastLossesRisk; // e.g., 0.20 for 20% surcharge
      }

      // Nearby/special risks (percentage modifier)
      const nearbyRisk = answers.nearbyRisks?.value as string;
      if (["petrol", "industrial"].includes(nearbyRisk)) {
        const specialRisk =
          Number(chargesData.data.riskAdjustments.specialRisk) || 0.2;
        totalRiskModifier += specialRisk; // e.g., 0.20 for 20% surcharge
      }

      // Sea level / flood risk from location assessment (percentage modifier)
      // Risk calculation based on distance to sea level and elevation
      if (seaLevelData) {
        // Helper function to parse numeric values from assessment text
        const parseDistanceFromText = (
          text: string
        ): { elevation: number | null; waterDistance: number | null } => {
          let elevation: number | null = null;
          let waterDistance: number | null = null;

          // Pattern 1: "Distance to sea level: X m" or "3. Distance to sea level: X m"
          const elevationMatch = text.match(
            /(?:distance to sea level|elevation)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
          );
          if (elevationMatch) {
            elevation = parseFloat(elevationMatch[1]);
          }

          // Pattern 2: "Distance to water: X m" or "4. Distance to water: X m"
          const waterMatch = text.match(
            /(?:distance to water)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
          );
          if (waterMatch) {
            waterDistance = parseFloat(waterMatch[1]);
          }

          return { elevation, waterDistance };
        };

        // Try to get values from API fields first
        let elevationM = seaLevelData.elevation_meters;
        let distanceToWaterM: number | null = null;

        // If not available, try to parse from assessment text
        if (
          (!elevationM || elevationM === 0) &&
          seaLevelData.sea_level_assessment
        ) {
          const parsed = parseDistanceFromText(
            seaLevelData.sea_level_assessment
          );
          if (parsed.elevation !== null) {
            elevationM = parsed.elevation;
          }
          distanceToWaterM = parsed.waterDistance;
        }

        // Convert distance to water from meters to km if available
        const distanceToWaterKm =
          distanceToWaterM !== null ? distanceToWaterM / 1000 : null;

        console.log(
          "Sea Level Data - Elevation (m):",
          elevationM,
          "Distance to Water (m):",
          distanceToWaterM
        );

        let seaLevelRisk = 0;
        let riskCategory = "";

        // Calculate risk based on elevation (primary) and distance to water (secondary)
        // Priority: Elevation is most critical, then proximity to water

        if (elevationM !== undefined && elevationM !== null && elevationM > 0) {
          // Elevation-based risk calculation
          if (elevationM < 5) {
            // Very high risk: Below 5m elevation (extreme flood risk)
            seaLevelRisk = 0.4; // 40% surcharge
            riskCategory = "VERY HIGH";
          } else if (elevationM < 10) {
            // High risk: 5-10m elevation (high flood risk)
            seaLevelRisk = 0.35; // 35% surcharge
            riskCategory = "HIGH";
          } else if (elevationM < 20) {
            // Medium risk: 10-20m elevation (moderate flood risk)
            seaLevelRisk = 0.2; // 20% surcharge
            riskCategory = "MEDIUM";
          } else if (elevationM < 50) {
            // Low risk: 20-50m elevation (low flood risk)
            seaLevelRisk = 0.08; // 8% surcharge
            riskCategory = "LOW";
          } else {
            // Very low risk: Above 50m elevation (minimal flood risk)
            seaLevelRisk = 0; // No surcharge
            riskCategory = "VERY LOW";
          }

          // Add additional risk if very close to water (< 100m)
          if (distanceToWaterM !== null && distanceToWaterM < 100) {
            seaLevelRisk += 0.05; // Additional 5% surcharge for proximity to water
            console.log(
              "Additional 5% risk added for proximity to water (<100m)"
            );
          }
        } else if (distanceToWaterKm !== null) {
          // Fallback to water distance-based calculation if elevation not available
          if (distanceToWaterKm < 0.1) {
            // Very high risk: Within 100m of water
            seaLevelRisk = 0.4; // 40% surcharge
            riskCategory = "VERY HIGH";
          } else if (distanceToWaterKm < 0.5) {
            // High risk: 100-500m from water
            seaLevelRisk = 0.35; // 35% surcharge
            riskCategory = "HIGH";
          } else if (distanceToWaterKm < 1) {
            // Medium risk: 500m-1km from water
            seaLevelRisk = 0.2; // 20% surcharge
            riskCategory = "MEDIUM";
          } else if (distanceToWaterKm < 5) {
            // Low risk: 1-5km from water
            seaLevelRisk = 0.08; // 8% surcharge
            riskCategory = "LOW";
          } else {
            // Very low risk: More than 5km from water
            seaLevelRisk = 0; // No surcharge
            riskCategory = "VERY LOW";
          }
        }

        if (seaLevelRisk > 0) {
          totalRiskModifier += seaLevelRisk;
          console.log(
            `Applied ${riskCategory} flood risk (${seaLevelRisk * 100}%):`,
            `Elevation: ${elevationM}m, Distance to water: ${
              distanceToWaterKm !== null ? distanceToWaterKm + "km" : "N/A"
            }`
          );
        } else {
          console.log(
            "Applied VERY LOW flood risk: 0% - Property is well elevated"
          );
        }
      }

      // propertyBaseFee is a fixed base amount (e.g., 5000), not a percentage
      const propertyBaseFee = Number(chargesData.data.propertyBaseFee) || 5000;

      // Calculate initial subtotal: premium table base + property base fee
      let subtotal = premiumTableBase + propertyBaseFee;
      console.log("Initial Subtotal (before risk adjustment):", subtotal);

      // FIRST: Apply total risk modifier to subtotal
      console.log("Total Risk Modifier (as percentage):", totalRiskModifier);
      const riskAdjustmentOnSubtotal = subtotal * totalRiskModifier;
      console.log("Risk Adjustment on Subtotal:", riskAdjustmentOnSubtotal);
      subtotal += riskAdjustmentOnSubtotal;
      console.log("Subtotal after risk adjustment:", subtotal);

      // Calculate discounts
      const discounts = [];
      const security = (answers.security?.value as string[]) || [];
      const fireSafety = (answers.fireSafety?.value as string[]) || [];
      const apiSecuritySafety =
        chargesData.data.safetySecurityDiscounts.securitySafety;
      const apiFireSafety = chargesData.data.safetySecurityDiscounts.fireSafety;

      // Security discounts from API
      if (security.includes("gate") && security.includes("guards")) {
        const gateDiscount = Number(apiSecuritySafety?.estateGate) || 0;
        const guardDiscount = Number(apiSecuritySafety?.securityGuards) || 0;
        const totalDiscount = gateDiscount + guardDiscount;
        discounts.push({
          name: "High Security Discount",
          amount: totalDiscount,
          type: "percentage" as const,
        });
      } else if (security.length >= 2) {
        // Calculate combined discount for multiple security features
        let totalDiscount = 0;
        security.forEach((feature) => {
          if (feature === "gate" && apiSecuritySafety?.estateGate) {
            totalDiscount += Number(apiSecuritySafety.estateGate);
          } else if (
            feature === "guards" &&
            apiSecuritySafety?.securityGuards
          ) {
            totalDiscount += Number(apiSecuritySafety.securityGuards);
          } else if (feature === "cctv" && apiSecuritySafety?.cctv) {
            totalDiscount += Number(apiSecuritySafety.cctv);
          } else if (feature === "locks" && apiSecuritySafety?.strongLocks) {
            totalDiscount += Number(apiSecuritySafety.strongLocks);
          }
        });
        if (totalDiscount > 0) {
          discounts.push({
            name: "Security Discount",
            amount: totalDiscount,
            type: "percentage" as const,
          });
        }
      }

      // Fire safety discounts from API
      if (fireSafety.includes("extinguisher") && fireSafety.includes("alarm")) {
        const extinguisherDiscount =
          Number(apiFireSafety?.fireExtinguisher) || 0;
        const alarmDiscount = Number(apiFireSafety?.smokeAlarm) || 0;
        const totalDiscount = extinguisherDiscount + alarmDiscount;
        discounts.push({
          name: "Fire Safety Discount",
          amount: totalDiscount,
          type: "percentage" as const,
        });
      } else if (fireSafety.length >= 1) {
        // Calculate combined discount for fire safety features
        let totalDiscount = 0;
        fireSafety.forEach((feature) => {
          if (feature === "extinguisher" && apiFireSafety?.fireExtinguisher) {
            totalDiscount += Number(apiFireSafety.fireExtinguisher);
          } else if (feature === "alarm" && apiFireSafety?.smokeAlarm) {
            totalDiscount += Number(apiFireSafety.smokeAlarm);
          } else if (feature === "water" && apiFireSafety?.waterAccess) {
            totalDiscount += Number(apiFireSafety.waterAccess);
          }
        });
        if (totalDiscount > 0) {
          discounts.push({
            name: "Basic Fire Safety Discount",
            amount: totalDiscount,
            type: "percentage" as const,
          });
        }
      }

      // New building discount already applied in age risk modifier above
      if (buildingAge === "0-5" && ageRisks?.["0-5"]) {
        const newBuildingBonus = Number(ageRisks["0-5"]);
        if (newBuildingBonus < 0) {
          discounts.push({
            name: "New Property Discount",
            amount: Math.abs(newBuildingBonus),
            type: "percentage" as const,
          });
        }
      }

      // Calculate surcharges (these are already included in totalRiskModifier above)
      // We're creating this list for display purposes in the breakdown
      const surcharges = [];

      if (buildingAge === "20+" && ageRisks?.["20+"]) {
        const oldBuildingSurcharge = Number(ageRisks["20+"]);
        if (oldBuildingSurcharge > 0) {
          surcharges.push({
            name: "Old Property Surcharge",
            amount: oldBuildingSurcharge,
            type: "percentage" as const,
          });
        }
      }

      if (
        ["petrol", "industrial"].includes(answers.nearbyRisks?.value as string)
      ) {
        const specialRiskSurcharge =
          Number(chargesData.data.riskAdjustments.specialRisk) || 0;
        if (specialRiskSurcharge > 0) {
          surcharges.push({
            name: "Special Risk Surcharge",
            amount: specialRiskSurcharge,
            type: "percentage" as const,
          });
        }
      }

      // Sea level risk surcharge for display (using distance and elevation)
      if (seaLevelData) {
        // Parse values from assessment text
        const parseDistanceFromText = (
          text: string
        ): { elevation: number | null; waterDistance: number | null } => {
          let elevation: number | null = null;
          let waterDistance: number | null = null;

          const elevationMatch = text.match(
            /(?:distance to sea level|elevation)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
          );
          if (elevationMatch) {
            elevation = parseFloat(elevationMatch[1]);
          }

          const waterMatch = text.match(
            /(?:distance to water)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
          );
          if (waterMatch) {
            waterDistance = parseFloat(waterMatch[1]);
          }

          return { elevation, waterDistance };
        };

        // Get values from API or parse from text
        let elevationM = seaLevelData.elevation_meters;
        let distanceToWaterM: number | null = null;

        if (
          (!elevationM || elevationM === 0) &&
          seaLevelData.sea_level_assessment
        ) {
          const parsed = parseDistanceFromText(
            seaLevelData.sea_level_assessment
          );
          if (parsed.elevation !== null) {
            elevationM = parsed.elevation;
          }
          distanceToWaterM = parsed.waterDistance;
        }

        const distanceToWaterKm =
          distanceToWaterM !== null ? distanceToWaterM / 1000 : null;
        let seaLevelSurcharge = 0;
        let riskLevel = "";

        // Match the same logic as the risk calculation above
        if (elevationM !== undefined && elevationM !== null && elevationM > 0) {
          if (elevationM < 5) {
            seaLevelSurcharge = 0.4;
            riskLevel = "Very High Flood Risk";
          } else if (elevationM < 10) {
            seaLevelSurcharge = 0.35;
            riskLevel = "High Flood Risk";
          } else if (elevationM < 20) {
            seaLevelSurcharge = 0.2;
            riskLevel = "Medium Flood Risk";
          } else if (elevationM < 50) {
            seaLevelSurcharge = 0.08;
            riskLevel = "Low Flood Risk";
          }

          // Add additional risk if very close to water (< 100m)
          if (distanceToWaterM !== null && distanceToWaterM < 100) {
            seaLevelSurcharge += 0.05;
          }
        } else if (distanceToWaterKm !== null) {
          if (distanceToWaterKm < 0.1) {
            seaLevelSurcharge = 0.4;
            riskLevel = "Very High Flood Risk";
          } else if (distanceToWaterKm < 0.5) {
            seaLevelSurcharge = 0.35;
            riskLevel = "High Flood Risk";
          } else if (distanceToWaterKm < 1) {
            seaLevelSurcharge = 0.2;
            riskLevel = "Medium Flood Risk";
          } else if (distanceToWaterKm < 5) {
            seaLevelSurcharge = 0.08;
            riskLevel = "Low Flood Risk";
          }
        }

        if (seaLevelSurcharge > 0) {
          surcharges.push({
            name: `Location ${riskLevel} Surcharge`,
            amount: seaLevelSurcharge,
            type: "percentage" as const,
          });
        }
      }

      if (answers.businessUse?.value === "yes") {
        const commercialUseSurcharge =
          Number(chargesData.data.riskAdjustments.commercialUse) || 0;
        if (commercialUseSurcharge > 0) {
          surcharges.push({
            name: "Commercial Use Surcharge",
            amount: commercialUseSurcharge,
            type: "percentage" as const,
          });
        }
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

      // Add rider costs from API
      const riders = (answers.riders?.value as string[]) || [];
      const apiExtraCoverage = chargesData.data.extraCoverageFees;
      const riderCosts = {
        flood: Number(apiExtraCoverage?.floodProtection) || 5000,
        burglary: Number(apiExtraCoverage?.burglaryCover) || 3000,
        fire: Number(apiExtraCoverage?.extendedFireCover) || 4000,
        liability: Number(apiExtraCoverage?.publicLiability) || 6000,
        theft: Number(apiExtraCoverage?.theft) || 2500,
      };

      riders.forEach((rider) => {
        total += riderCosts[rider as keyof typeof riderCosts] || 0;
      });

      // Apply frequency multiplier (if available from API in the future)
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

      // SECOND: Apply total risk modifier to the final total amount
      console.log("Total before second risk adjustment:", total);
      const riskAdjustmentOnTotal = total * totalRiskModifier;
      console.log("Risk Adjustment on Total:", riskAdjustmentOnTotal);
      total += riskAdjustmentOnTotal;
      console.log("Total after second risk adjustment:", total);

      // Calculate combined risk adjustment for breakdown
      const totalRiskAdjustment =
        riskAdjustmentOnSubtotal + riskAdjustmentOnTotal;
      console.log("Combined Risk Adjustment:", totalRiskAdjustment);

      // Ensure minimum premium (could also come from API in the future)
      total = Math.max(total, 15000);

      const premiumBreakdown: PremiumBreakdown = {
        premiumTableBase,
        riskUnits: totalRiskAdjustment, // Combined risk adjustment from both subtotal and total
        dvUnits: propertyBaseFee, // Fixed base fee from API
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
    } catch (error: unknown) {
      console.error("Premium calculation error:", error);
      addToast({
        type: "error",
        title: "Calculation Error",
        message: "Could not fetch premium right now. Please retry.",
      });
    } finally {
      setCalculatingPremium(false);
    }
  }, [
    quizState.answers,
    lastCalculationTime,
    addToast,
    chargesData,
    seaLevelData,
  ]);

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

  const handleNext = async () => {
    if (validateCurrentQuestion()) {
      // Check if we're on the last question of the current step
      const isLastQuestionInCurrentStep =
        quizState.currentQuestion === currentStepQuestions.length - 1;

      if (isLastQuestionInCurrentStep) {
        // Save progress for this step
        await handleCheckout(quizState.currentStep);

        // Check if we're on step 4 (last step before payment)
        if (quizState.currentStep === 4) {
          // Show payment modal (step 5)
          setShowTermsModal(true);
        } else {
          // Move to next step and reset question counter
          setQuizState((prev) => ({
            ...prev,
            currentStep: prev.currentStep + 1,
            currentQuestion: 0,
          }));
        }
      } else {
        // Move to next question within current step
        setQuizState((prev) => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
        }));
      }
    }
  };

  const handleBack = () => {
    if (quizState.currentQuestion > 0) {
      // Go back to previous question in current step
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    } else if (quizState.currentStep > 1) {
      // Go back to previous step's last question
      const prevStepQuestions = getQuestionsForStep(quizState.currentStep - 1);
      setQuizState((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
        currentQuestion: prevStepQuestions.length - 1,
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

      // Check if conversion to number was successful
      if (isNaN(numValue)) {
        addToast({
          type: "error",
          title: "Invalid Value",
          message: "Please enter a valid number",
        });
        return false;
      }

      if (validation?.min !== undefined && numValue < validation.min) {
        addToast({
          type: "error",
          title: "Invalid Value",
          message: `Value must be at least ${validation.min}`,
        });
        return false;
      }

      if (validation?.max !== undefined && numValue > validation.max) {
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

  const getProgress = () => {
    // Calculate progress based on steps (4 steps total, each step is 25%)
    const stepProgress = (quizState.currentStep - 1) * 25;
    const questionProgressInStep =
      ((quizState.currentQuestion + 1) / currentStepQuestions.length) * 25;
    return stepProgress + questionProgressInStep;
  };

  // Log quiz start
  useEffect(() => {
    console.log("quiz.start", { timestamp: new Date().toISOString() });
  }, []);

  // Handle resume from pending quote
  useEffect(() => {
    const resumeQuoteData = localStorage.getItem("resumeQuoteData");

    if (resumeQuoteData) {
      try {
        const quoteData = JSON.parse(resumeQuoteData);
        console.log("Resuming quote from:", quoteData);

        // Map the quote data back to quiz answers
        const resumedAnswers: Record<string, QuizAnswer> = {};

        // Map all the fields from the quote data to quiz answers
        if (quoteData.data) {
          const data = quoteData.data;

          // Step 1: Property Info
          if (data.category) {
            resumedAnswers.propertyType = {
              questionId: "propertyType",
              value: data.category.toLowerCase(),
            };
          }
          if (data.otherPropertyType) {
            resumedAnswers.propertyTypeOther = {
              questionId: "propertyTypeOther",
              value: data.otherPropertyType,
            };
          }
          if (data.charges?.perPlot) {
            // Clamp the value to valid range (1-10) to match form validation
            const plotValue = Math.min(Math.max(data.charges.perPlot, 1), 10);
            resumedAnswers.plots = {
              questionId: "plots",
              value: plotValue,
            };
            if (data.charges.perPlot > 10) {
              console.warn(
                `Plots value ${data.charges.perPlot} exceeds max (10), clamped to 10`
              );
            }
          }
          if (data.address) {
            resumedAnswers.address = {
              questionId: "address",
              value: data.address,
            };
          }
          // Extract state from address if needed
          if (data.address && data.address.includes(",")) {
            const addressParts = data.address.split(",");
            if (addressParts.length > 1) {
              resumedAnswers.state = {
                questionId: "state",
                value: addressParts[addressParts.length - 1].trim(),
              };
            }
          }

          // Step 2: Structure & Condition
          if (data.wallMaterial) {
            resumedAnswers.wallMaterial = {
              questionId: "wallMaterial",
              value: data.wallMaterial,
            };
          }
          if (data.roofMaterial) {
            resumedAnswers.roofType = {
              questionId: "roofType",
              value: data.roofMaterial,
            };
          }
          if (data.buildingAge) {
            resumedAnswers.buildingAge = {
              questionId: "buildingAge",
              value: data.buildingAge,
            };
          }
          if (data.repairNeeded !== undefined) {
            resumedAnswers.buildingCondition = {
              questionId: "buildingCondition",
              value: data.repairNeeded ? "poor" : "good",
            };
          }

          // Step 3: Safety, Use & Risks
          if (data.securitySafety?.occupied !== undefined) {
            resumedAnswers.occupancy = {
              questionId: "occupancy",
              value: data.securitySafety.occupied ? "owner" : "vacant",
            };
          }
          if (data.securitySafety) {
            const security = data.securitySafety;
            const securityFeatures: string[] = [];
            if (security.estateGate) securityFeatures.push("gate");
            if (security.cctv) securityFeatures.push("cctv");
            if (security.securityGuards) securityFeatures.push("guards");
            if (security.strongLocks) securityFeatures.push("locks");
            if (security.noGlassPanels) securityFeatures.push("noGlass");
            if (securityFeatures.length > 0) {
              resumedAnswers.security = {
                questionId: "security",
                value: securityFeatures,
              };
            }
          }
          if (data.fireSafety) {
            const fire = data.fireSafety;
            const fireFeatures: string[] = [];
            if (fire.fireExtinguisher) fireFeatures.push("extinguisher");
            if (fire.smokeAlarm) fireFeatures.push("alarm");
            if (fire.waterAccess) fireFeatures.push("water");
            if (fireFeatures.length > 0) {
              resumedAnswers.fireSafety = {
                questionId: "fireSafety",
                value: fireFeatures,
              };
            }
          }
          if (data.floodRisk) {
            resumedAnswers.location = {
              questionId: "location",
              value: data.floodRisk,
            };
          }
          if (
            data.pastLoss !== undefined ||
            data.unOccupiedForAwhile !== undefined
          ) {
            const riskFactors: string[] = [];
            if (data.pastLoss) riskFactors.push("pastClaim");
            if (data.unOccupiedForAwhile) riskFactors.push("vacant");
            if (data.commercialUse) riskFactors.push("commercial");
            resumedAnswers.risks = {
              questionId: "risks",
              value: riskFactors,
            };
          }
          if (data.pastLoss && data.pastLossDetails) {
            resumedAnswers.pastClaimDetails = {
              questionId: "pastClaimDetails",
              value: data.pastLossDetails,
            };
          }
          if (data.unOccupiedDuration) {
            resumedAnswers.vacantMonths = {
              questionId: "vacantMonths",
              value: data.unOccupiedDuration,
            };
          }

          // Step 4: Extras & Value
          if (data.extraCoverage) {
            const riders: string[] = [];
            if (data.extraCoverage.theft) riders.push("burglary");
            if (data.extraCoverage.floodProtection) riders.push("flood");
            if (data.extraCoverage.publicLiability) riders.push("liability");
            if (data.extraCoverage.extendedFireCover) riders.push("fire");
            if (riders.length > 0) {
              resumedAnswers.riders = {
                questionId: "riders",
                value: riders,
              };
            }
          }
          if (data.propertyValue) {
            resumedAnswers.declaredValue = {
              questionId: "declaredValue",
              value: data.propertyValue,
            };
          }
          if (data.paymentFrequency) {
            resumedAnswers.paymentFrequency = {
              questionId: "paymentFrequency",
              value: data.paymentFrequency.toLowerCase(),
            };
          }

          // Determine which step to resume from
          const savedStep = data.step || 1;

          console.log("Resumed answers:", resumedAnswers);
          console.log("Resuming from step:", savedStep);

          // Calculate which question within the step to resume from
          // We need to determine which questions in the current step have NOT been answered
          const step1Questions = [
            "propertyType",
            "propertyTypeOther",
            "floors",
            "rooms",
            "beds",
            "blocks",
            "pupilSeats",
            "pumps",
            "seats",
            "plots",
          ];
          const step2Questions = [
            "wallMaterial",
            "wallMaterialOther",
            "roofType",
            "roofTypeOther",
            "buildingAge",
            "buildingCondition",
          ];
          const step3Questions = [
            "occupancy",
            "furnished",
            "occupancyOther",
            "businessUse",
            "businessDetails",
            "unoccupied",
            "unoccupiedDuration",
            "propertyLocation",
            "pastLosses",
            "lossDetails",
            "nearbyRisks",
            "nearbyRiskOther",
            "security",
            "fireSafety",
          ];
          const step4Questions = [
            "payingGuests",
            "guestCount",
            "domesticStaff",
            "previousDecline",
            "declineDetails",
            "currentInsurance",
            "insuranceDetails",
            "riders",
            "declaredValue",
            "paymentFrequency",
          ];

          let currentStepQuestionIds: string[] = [];
          if (savedStep === 1) currentStepQuestionIds = step1Questions;
          else if (savedStep === 2) currentStepQuestionIds = step2Questions;
          else if (savedStep === 3) currentStepQuestionIds = step3Questions;
          else if (savedStep === 4) currentStepQuestionIds = step4Questions;

          // Find the first unanswered question in the current step
          let resumeQuestionIndex = 0;
          for (let i = 0; i < currentStepQuestionIds.length; i++) {
            const questionId = currentStepQuestionIds[i];
            if (!resumedAnswers[questionId]) {
              resumeQuestionIndex = i;
              break;
            }
            // If all questions are answered, start at the last question
            if (i === currentStepQuestionIds.length - 1) {
              resumeQuestionIndex = i;
            }
          }

          console.log("Resume question index:", resumeQuestionIndex);

          // Set the quiz state with resumed data
          setQuizState({
            answers: resumedAnswers,
            currentQuestion: resumeQuestionIndex, // Resume at the first unanswered question
            totalQuestions: 0, // Will be updated by the questions effect
            currentStep: savedStep,
            propertyCategory: data.category || "",
            premiumBreakdown: null,
          });

          addToast({
            type: "success",
            title: "Welcome Back!",
            message: `Resuming from Step ${savedStep}, Question ${
              resumeQuestionIndex + 1
            }. Your previous answers have been restored.`,
          });
        }

        // Clear the resume data after loading (keep quoteId for updates)
        localStorage.removeItem("resumeQuoteData");
      } catch (error) {
        console.error("Failed to parse resume quote data:", error);
        localStorage.removeItem("resumeQuoteData");
        addToast({
          type: "error",
          title: "Resume Failed",
          message: "Could not restore your previous answers. Starting fresh.",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

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
                Step {quizState.currentStep} of 4 • Question{" "}
                {quizState.currentQuestion + 1} of {currentStepQuestions.length}
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div
            className="mb-8 animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                          step < quizState.currentStep
                            ? "bg-green-500 text-white"
                            : step === quizState.currentStep
                            ? "bg-blue-600 text-white ring-4 ring-blue-200"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {step < quizState.currentStep ? "✓" : step}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          step === quizState.currentStep
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {step === 1 && "Property Info"}
                        {step === 2 && "Structure"}
                        {step === 3 && "Safety & Use"}
                        {step === 4 && "Extras & Value"}
                      </span>
                    </div>
                    {step < 4 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded ${
                          step < quizState.currentStep
                            ? "bg-green-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="mb-12 animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="max-w-2xl mx-auto">
              {/* <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Step Progress</span>
                <span>{Math.round(getProgress())}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${getProgress()}%` }}
                />
              </div> */}

              {/* Step Indicators */}
              {/* <div className="flex justify-between mt-4">
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
              </div> */}
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
                      {currentQuestion.id === "propertyLocation" ? (
                        <>
                          <GooglePlacesInput
                            value={
                              quizState.answers[
                                currentQuestion.id
                              ]?.value?.toString() || ""
                            }
                            onChange={async (value, placeDetails) => {
                              handleAnswer(currentQuestion.id, value);
                              // Call sea level API when address is selected
                              if (
                                placeDetails &&
                                placeDetails.formatted_address
                              ) {
                                console.log("Place details:", placeDetails);
                                try {
                                  await getSeaLevel({
                                    location: placeDetails.formatted_address,
                                  });
                                  addToast({
                                    type: "info",
                                    title: "Location Risk Assessment",
                                    message: "Analyzing location flood risk...",
                                  });
                                } catch (error) {
                                  console.error(
                                    "Error fetching sea level data:",
                                    error
                                  );
                                }
                              }
                            }}
                            placeholder="Start typing your address..."
                            className="text-lg p-4"
                          />

                          {/* Sea Level Assessment Display */}
                          {isLoadingSeaLevel && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-2 duration-300">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                                  </div>
                                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"></div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <div className="h-4 w-32 bg-blue-200/50 dark:bg-blue-700/50 rounded animate-pulse"></div>
                                  </div>
                                  <div className="mt-1 h-3 w-48 bg-blue-100/50 dark:bg-blue-800/50 rounded animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          )}

                          {seaLevelData && !isLoadingSeaLevel && (
                            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                              {(() => {
                                // Parse values from assessment text
                                const parseDistanceFromText = (
                                  text: string
                                ): {
                                  elevation: number | null;
                                  waterDistance: number | null;
                                } => {
                                  let elevation: number | null = null;
                                  let waterDistance: number | null = null;

                                  const elevationMatch = text.match(
                                    /(?:distance to sea level|elevation)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
                                  );
                                  if (elevationMatch) {
                                    elevation = parseFloat(elevationMatch[1]);
                                  }

                                  const waterMatch = text.match(
                                    /(?:distance to water)[:\s]+(\d+(?:\.\d+)?)\s*m(?:etres|eters)?/i
                                  );
                                  if (waterMatch) {
                                    waterDistance = parseFloat(waterMatch[1]);
                                  }

                                  return { elevation, waterDistance };
                                };

                                // Get values from API or parse from text
                                let elevationM = seaLevelData.elevation_meters;
                                let distanceToWaterM: number | null = null;

                                if (
                                  (!elevationM || elevationM === 0) &&
                                  seaLevelData.sea_level_assessment
                                ) {
                                  const parsed = parseDistanceFromText(
                                    seaLevelData.sea_level_assessment
                                  );
                                  if (parsed.elevation !== null) {
                                    elevationM = parsed.elevation;
                                  }
                                  distanceToWaterM = parsed.waterDistance;
                                }

                                const distanceKm =
                                  seaLevelData.distance_to_sea_level_km;

                                let bgGradient = "";
                                let borderColor = "";
                                let iconBg = "";
                                let iconColor = "";
                                let riskBadgeColor = "";
                                let riskBadgeBg = "";
                                let riskLevel = "";
                                let icon = Droplets;

                                // Determine risk level based on elevation (primary) or distance (fallback)
                                if (
                                  elevationM !== undefined &&
                                  elevationM !== null &&
                                  elevationM > 0
                                ) {
                                  if (elevationM < 5) {
                                    bgGradient =
                                      "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20";
                                    borderColor =
                                      "border-red-300 dark:border-red-700";
                                    iconBg = "bg-red-100 dark:bg-red-900/40";
                                    iconColor =
                                      "text-red-600 dark:text-red-400";
                                    riskBadgeColor =
                                      "text-red-700 dark:text-red-300";
                                    riskBadgeBg =
                                      "bg-red-100 dark:bg-red-900/40";
                                    riskLevel = "Very High Flood Risk";
                                    icon = AlertTriangle;
                                  } else if (elevationM < 10) {
                                    bgGradient =
                                      "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20";
                                    borderColor =
                                      "border-red-300 dark:border-red-700";
                                    iconBg = "bg-red-100 dark:bg-red-900/40";
                                    iconColor =
                                      "text-red-600 dark:text-red-400";
                                    riskBadgeColor =
                                      "text-red-700 dark:text-red-300";
                                    riskBadgeBg =
                                      "bg-red-100 dark:bg-red-900/40";
                                    riskLevel = "High Flood Risk";
                                    icon = AlertTriangle;
                                  } else if (elevationM < 20) {
                                    bgGradient =
                                      "from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20";
                                    borderColor =
                                      "border-yellow-300 dark:border-yellow-700";
                                    iconBg =
                                      "bg-yellow-100 dark:bg-yellow-900/40";
                                    iconColor =
                                      "text-yellow-600 dark:text-yellow-400";
                                    riskBadgeColor =
                                      "text-yellow-700 dark:text-yellow-300";
                                    riskBadgeBg =
                                      "bg-yellow-100 dark:bg-yellow-900/40";
                                    riskLevel = "Medium Flood Risk";
                                    icon = Droplets;
                                  } else if (elevationM < 50) {
                                    bgGradient =
                                      "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20";
                                    borderColor =
                                      "border-blue-300 dark:border-blue-700";
                                    iconBg = "bg-blue-100 dark:bg-blue-900/40";
                                    iconColor =
                                      "text-blue-600 dark:text-blue-400";
                                    riskBadgeColor =
                                      "text-blue-700 dark:text-blue-300";
                                    riskBadgeBg =
                                      "bg-blue-100 dark:bg-blue-900/40";
                                    riskLevel = "Low Flood Risk";
                                    icon = Droplets;
                                  } else {
                                    bgGradient =
                                      "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20";
                                    borderColor =
                                      "border-green-300 dark:border-green-700";
                                    iconBg =
                                      "bg-green-100 dark:bg-green-900/40";
                                    iconColor =
                                      "text-green-600 dark:text-green-400";
                                    riskBadgeColor =
                                      "text-green-700 dark:text-green-300";
                                    riskBadgeBg =
                                      "bg-green-100 dark:bg-green-900/40";
                                    riskLevel = "Very Low Risk";
                                    icon = CheckCircle;
                                  }
                                } else if (
                                  distanceKm !== undefined &&
                                  distanceKm !== null
                                ) {
                                  // Fallback to distance-based UI
                                  if (distanceKm < 1) {
                                    bgGradient =
                                      "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20";
                                    borderColor =
                                      "border-red-300 dark:border-red-700";
                                    iconBg = "bg-red-100 dark:bg-red-900/40";
                                    iconColor =
                                      "text-red-600 dark:text-red-400";
                                    riskBadgeColor =
                                      "text-red-700 dark:text-red-300";
                                    riskBadgeBg =
                                      "bg-red-100 dark:bg-red-900/40";
                                    riskLevel = "Very High Flood Risk";
                                    icon = AlertTriangle;
                                  } else if (distanceKm < 5) {
                                    bgGradient =
                                      "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20";
                                    borderColor =
                                      "border-red-300 dark:border-red-700";
                                    iconBg = "bg-red-100 dark:bg-red-900/40";
                                    iconColor =
                                      "text-red-600 dark:text-red-400";
                                    riskBadgeColor =
                                      "text-red-700 dark:text-red-300";
                                    riskBadgeBg =
                                      "bg-red-100 dark:bg-red-900/40";
                                    riskLevel = "High Flood Risk";
                                    icon = AlertTriangle;
                                  } else if (distanceKm < 10) {
                                    bgGradient =
                                      "from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20";
                                    borderColor =
                                      "border-yellow-300 dark:border-yellow-700";
                                    iconBg =
                                      "bg-yellow-100 dark:bg-yellow-900/40";
                                    iconColor =
                                      "text-yellow-600 dark:text-yellow-400";
                                    riskBadgeColor =
                                      "text-yellow-700 dark:text-yellow-300";
                                    riskBadgeBg =
                                      "bg-yellow-100 dark:bg-yellow-900/40";
                                    riskLevel = "Medium Flood Risk";
                                    icon = Droplets;
                                  } else if (distanceKm < 20) {
                                    bgGradient =
                                      "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20";
                                    borderColor =
                                      "border-blue-300 dark:border-blue-700";
                                    iconBg = "bg-blue-100 dark:bg-blue-900/40";
                                    iconColor =
                                      "text-blue-600 dark:text-blue-400";
                                    riskBadgeColor =
                                      "text-blue-700 dark:text-blue-300";
                                    riskBadgeBg =
                                      "bg-blue-100 dark:bg-blue-900/40";
                                    riskLevel = "Low Flood Risk";
                                    icon = Droplets;
                                  } else {
                                    bgGradient =
                                      "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20";
                                    borderColor =
                                      "border-green-300 dark:border-green-700";
                                    iconBg =
                                      "bg-green-100 dark:bg-green-900/40";
                                    iconColor =
                                      "text-green-600 dark:text-green-400";
                                    riskBadgeColor =
                                      "text-green-700 dark:text-green-300";
                                    riskBadgeBg =
                                      "bg-green-100 dark:bg-green-900/40";
                                    riskLevel = "Very Low Risk";
                                    icon = CheckCircle;
                                  }
                                }

                                const Icon = icon;

                                return (
                                  <div
                                    className={`p-4 bg-gradient-to-r ${bgGradient} rounded-xl border ${borderColor} shadow-sm`}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div
                                        className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}
                                      >
                                        <Icon
                                          className={`h-5 w-5 ${iconColor}`}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Location Risk Assessment
                                          </h4>
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${riskBadgeBg} ${riskBadgeColor}`}
                                          >
                                            {riskLevel}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                          {seaLevelData.sea_level_assessment}
                                        </p>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                          {elevationM !== undefined &&
                                            elevationM !== null &&
                                            elevationM > 0 && (
                                              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                <span className="mr-1">⛰️</span>
                                                <span>
                                                  Elevation:{" "}
                                                  {elevationM.toFixed(1)}m
                                                </span>
                                              </div>
                                            )}
                                          {distanceToWaterM !== undefined &&
                                            distanceToWaterM !== null && (
                                              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                <span className="mr-1">💧</span>
                                                <span>
                                                  Water:{" "}
                                                  {distanceToWaterM < 1000
                                                    ? `${distanceToWaterM.toFixed(
                                                        0
                                                      )}m`
                                                    : `${(
                                                        distanceToWaterM / 1000
                                                      ).toFixed(1)}km`}
                                                </span>
                                              </div>
                                            )}
                                          {distanceKm !== undefined &&
                                            distanceKm !== null && (
                                              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                <span className="mr-1">📏</span>
                                                <span>
                                                  Distance:{" "}
                                                  {distanceKm.toFixed(1)}km
                                                </span>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </>
                      ) : (
                        <Input
                          type={
                            currentQuestion.id === "declaredValue"
                              ? "text"
                              : currentQuestion.type === "number"
                              ? "number"
                              : "text"
                          }
                          value={
                            currentQuestion.id === "declaredValue"
                              ? quizState.answers[currentQuestion.id]?.value
                                ? `₦${parseFloat(
                                    String(
                                      quizState.answers[currentQuestion.id]
                                        ?.value
                                    ).replace(/[₦,]/g, "") || "0"
                                  ).toLocaleString()}`
                                : ""
                              : quizState.answers[
                                  currentQuestion.id
                                ]?.value?.toString() || ""
                          }
                          onChange={(e) => {
                            if (currentQuestion.id === "declaredValue") {
                              // Remove currency symbol and commas, keep only numbers
                              const numericValue = e.target.value.replace(
                                /[₦,]/g,
                                ""
                              );
                              if (
                                numericValue === "" ||
                                /^\d+$/.test(numericValue)
                              ) {
                                handleAnswer(
                                  currentQuestion.id,
                                  numericValue ? Number(numericValue) : ""
                                );
                              }
                            } else {
                              const value =
                                currentQuestion.type === "number"
                                  ? Number(e.target.value)
                                  : e.target.value;
                              handleAnswer(currentQuestion.id, value);
                            }
                          }}
                          placeholder={
                            currentQuestion.id === "declaredValue"
                              ? "₦1,000,000"
                              : currentQuestion.type === "number"
                              ? "Enter number"
                              : "Enter details"
                          }
                          min={currentQuestion.validation?.min}
                          max={currentQuestion.validation?.max}
                          className="text-lg p-4"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={
                      quizState.currentQuestion === 0 || isLoadingSeaLevel
                    }
                    className="group"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="group"
                    disabled={isLoadingSeaLevel}
                  >
                    {isLoadingSeaLevel ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing Location...
                      </>
                    ) : quizState.currentStep === 4 &&
                      quizState.currentQuestion ===
                        currentStepQuestions.length - 1 ? (
                      <>
                        Review & Pay
                        <Sparkles className="h-4 w-4 ml-2 group-hover:rotate-12 transition-transform" />
                      </>
                    ) : quizState.currentQuestion ===
                      currentStepQuestions.length - 1 ? (
                      <>
                        Next Step
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
              <Card className="p-6 animate-in slide-in-from-right-4 duration-500 delay-200">
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

                {/* <Button
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
                </Button> */}
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
                  onClick={() => handleCheckout()}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Processing..." : "Make Payment"}
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
                  type="text"
                  value={
                    fundAmount
                      ? `₦${parseFloat(
                          fundAmount.replace(/[₦,]/g, "") || "0"
                        ).toLocaleString()}`
                      : ""
                  }
                  onChange={(e) => {
                    // Remove currency symbol and commas, keep only numbers
                    const numericValue = e.target.value.replace(/[₦,]/g, "");
                    if (numericValue === "" || /^\d+$/.test(numericValue)) {
                      setFundAmount(numericValue);
                    }
                  }}
                  placeholder="₦0"
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
