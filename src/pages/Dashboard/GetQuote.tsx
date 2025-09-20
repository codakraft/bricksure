import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Wallet,
  X,
  AlertTriangle,
  Star,
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
import {
  useCreateQuoteMutation,
  useGetPoliciesQuery,
  useGetWalletQuery,
} from "../../services";
import { useFundWalletMutation } from "../../services/walletService";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";

interface PropertyDetails {
  address: string;
  state: string;
  lga: string;
  propertyType: string;
  yearBuilt: string;
  materials: string;
  occupancy: string;
}

interface QuizAnswer {
  questionId: number;
  answers: string[];
}

interface CoverageOption {
  id: string;
  name: string;
  description: string;
  price: number;
  included: boolean;
}

interface PolicyTier {
  id: string;
  name: string;
  basePrice: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

// Currency formatting utility function
const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export function GetQuote() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fundWallet] = useFundWalletMutation();
  const { authData: user } = useSelector((state: RootState) => state.auth);

  // Form data
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    address: "",
    state: "",
    lga: "",
    propertyType: "",
    yearBuilt: "",
    materials: "",
    occupancy: "",
  });

  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [selectedCoverages, setSelectedCoverages] = useState<string[]>([]);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  const { data: propertyTypesData } = useGetPropertyTypeQuery();
  const { data: statesData } = useGetStatesQuery();
  const [getLGAs, { data: lgaData }] = useLazyGetStatesLGAQuery();

  // console.log("property Data", propertyTypesData);

  // Extract state names from statesData using useMemo
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

  const propertyTypeOptions = useMemo(() => {
    if (!propertyTypesData?.data?.propertyTypes) {
      return [];
    }
    return propertyTypesData.data.propertyTypes.map((type) => ({
      value: type._id,
      label: type.name,
    }));
  }, [propertyTypesData]);

  const { data: policiesData } = useGetPoliciesQuery();
  console.log("Policies Data", policiesData);

  const { data: walletData } = useGetWalletQuery();

  const walletBalance = useMemo(() => {
    return walletData?.data?.wallet?.balance || 0;
  }, [walletData]);

  const [createQuote] = useCreateQuoteMutation();

  // Mock data
  const buildingMaterials = [
    "Brick",
    "Concrete blocks",
    "Wood/plank",
    "Others",
  ];

  const occupancyTypes = ["Under construction", "Occupied", "Not occupied"];

  const quizQuestions = useMemo(
    () => [
      {
        id: 1,
        question: "What type of property do you want to insure?",
        options:
          propertyTypeOptions.length > 0
            ? propertyTypeOptions.map((type) => type.label)
            : [
                "Owner-occupied home",
                "Rental property",
                "Short-let property",
                "Commercial building",
              ],
        type: "single" as const,
      },
      {
        id: 2,
        question: "How old is your property?",
        options: [
          "Less than 5 years",
          "5-15 years",
          "15-30 years",
          "Over 30 years",
        ],
        type: "single" as const,
      },
      {
        id: 3,
        question: "What are your main concerns? (Select all that apply)",
        options: [
          "Fire damage",
          "Flood damage",
          "Theft/burglary",
          "Storm damage",
          "Structural collapse",
        ],
        type: "multiple" as const,
      },
      {
        id: 4,
        question: "What's your preferred payment frequency?",
        options: ["Monthly", "Quarterly", "Bi-annual", "Annual"],
        type: "single" as const,
      },
      {
        id: 5,
        question: "What's your approximate property value?",
        options: ["Under ₦10M", "₦10M - ₦25M", "₦25M - ₦50M", "Over ₦50M"],
        type: "single" as const,
      },
    ],
    [propertyTypeOptions]
  );

  const policyTiers: PolicyTier[] = useMemo(() => {
    const defaultTiers = [
      {
        id: "basic",
        name: "Basic",
        basePrice: 15000,
        description: "Essential protection for core risks",
        features: [
          "Fire protection",
          "Lightning coverage",
          "Explosion damage",
          "Basic theft protection",
        ],
      },
      {
        id: "standard",
        name: "Standard",
        basePrice: 25000,
        description: "Comprehensive everyday protection",
        features: [
          "Everything in Basic",
          "Burglary/theft coverage",
          "Flood protection",
          "Storm & water damage",
        ],
        recommended: true,
      },
      {
        id: "plus",
        name: "Plus",
        basePrice: 40000,
        description: "Premium comprehensive coverage",
        features: [
          "Everything in Standard",
          "Accidental damage",
          "Public liability cover",
          "Alternative accommodation",
        ],
      },
    ];

    if (!policiesData?.data?.policyPrices) {
      return defaultTiers;
    }

    const prices = policiesData.data.policyPrices;

    // Update the tiers with API prices
    return defaultTiers.map((tier) => ({
      ...tier,
      basePrice:
        tier.id === "basic"
          ? parseInt(prices.basic) || tier.basePrice
          : tier.id === "standard"
          ? parseInt(prices.standard) || tier.basePrice
          : tier.id === "plus"
          ? parseInt(prices.plus) || tier.basePrice
          : tier.basePrice,
    }));
  }, [policiesData]);

  const additionalCoverages: CoverageOption[] = useMemo(() => {
    if (!policiesData?.data?.policyPrices) {
      // Fallback data if API data is not available
      return [
        {
          id: "liability",
          name: "Public Liability",
          description: "Protection against third-party claims",
          price: 8000,
          included: false,
        },
        {
          id: "contents",
          name: "Contents Insurance",
          description: "Coverage for personal belongings",
          price: 12000,
          included: false,
        },
        {
          id: "lossOfRent",
          name: "Loss of Rent",
          description: "Compensation for rental income loss",
          price: 6000,
          included: false,
        },
        {
          id: "accidental",
          name: "Accidental Damage",
          description: "Coverage for accidental property damage",
          price: 10000,
          included: false,
        },
      ];
    }

    const prices = policiesData.data.policyPrices;

    // Skip the first 3 items (basic, standard, plus) and use the remaining coverage options
    return [
      {
        id: "liability",
        name: "Public Liability",
        description: "Protection against third-party claims",
        price: parseInt(prices.publicLiability) || 8000,
        included: false,
      },
      {
        id: "contents",
        name: "Contents Insurance",
        description: "Coverage for personal belongings",
        price: parseInt(prices.contentsIssurance) || 12000,
        included: false,
      },
      {
        id: "accidental",
        name: "Accidental Damage",
        description: "Coverage for accidental property damage",
        price: parseInt(prices.accidentalDamage) || 10000,
        included: false,
      },
      {
        id: "lossOfRent",
        name: "Loss of Rent",
        description: "Compensation for rental income loss",
        price: parseInt(prices.lossOfRent) || 6000,
        included: false,
      },
    ];
  }, [policiesData]);

  // const walletBalance = 15000; // Mock wallet balance

  const handlePropertyDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPropertyDetails((prev) => ({ ...prev, [name]: value }));

    // If state is changed, fetch LGAs for that state
    if (name === "state" && value && statesData?.data?.states) {
      const selectedState = statesData.data.states.find(
        (state) => state.name === value
      );
      if (selectedState) {
        getLGAs({ id: selectedState._id });
        // Clear the LGA field when state changes
        setPropertyDetails((prev) => ({ ...prev, lga: "" }));
      }
    }
  };

  const handleQuizAnswer = (
    questionId: number,
    answer: string,
    isMultiple = false
  ) => {
    const existingAnswerIndex = quizAnswers.findIndex(
      (qa) => qa.questionId === questionId
    );

    if (isMultiple) {
      if (existingAnswerIndex >= 0) {
        const currentAnswers = quizAnswers[existingAnswerIndex].answers;
        const newAnswers = currentAnswers.includes(answer)
          ? currentAnswers.filter((a) => a !== answer)
          : [...currentAnswers, answer];

        const updatedQuizAnswers = [...quizAnswers];
        updatedQuizAnswers[existingAnswerIndex] = {
          questionId,
          answers: newAnswers,
        };
        setQuizAnswers(updatedQuizAnswers);
      } else {
        setQuizAnswers([...quizAnswers, { questionId, answers: [answer] }]);
      }
    } else {
      if (existingAnswerIndex >= 0) {
        const updatedQuizAnswers = [...quizAnswers];
        updatedQuizAnswers[existingAnswerIndex] = {
          questionId,
          answers: [answer],
        };
        setQuizAnswers(updatedQuizAnswers);
      } else {
        setQuizAnswers([...quizAnswers, { questionId, answers: [answer] }]);
      }
    }
  };

  const toggleCoverage = (coverageId: string) => {
    setSelectedCoverages((prev) =>
      prev.includes(coverageId)
        ? prev.filter((id) => id !== coverageId)
        : [...prev, coverageId]
    );
  };

  const calculateTotalPrice = () => {
    const selectedTierData = policyTiers.find(
      (tier) => tier.id === selectedTier
    );
    const basePrice = selectedTierData?.basePrice || 0;
    const additionalPrice = selectedCoverages.reduce((total, coverageId) => {
      const coverage = additionalCoverages.find((c) => c.id === coverageId);
      return total + (coverage?.price || 0);
    }, 0);
    return basePrice + additionalPrice;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate property details
      const requiredFields = [
        "address",
        "state",
        "lga",
        "propertyType",
        "yearBuilt",
        "materials",
        "occupancy",
      ];
      const missingFields = requiredFields.filter(
        (field) => !propertyDetails[field as keyof PropertyDetails]
      );

      if (missingFields.length > 0) {
        addToast({
          type: "error",
          title: "Missing Information",
          message: "Please fill in all required fields",
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Risk quiz navigation
      if (currentQuizQuestion < quizQuestions.length - 1) {
        const currentAnswer = quizAnswers.find(
          (qa) => qa.questionId === quizQuestions[currentQuizQuestion].id
        );
        if (!currentAnswer || currentAnswer.answers.length === 0) {
          addToast({
            type: "error",
            title: "Answer Required",
            message: "Please answer the current question before proceeding",
          });
          return;
        }
        setCurrentQuizQuestion(currentQuizQuestion + 1);
      } else {
        // Quiz completed, move to recommendations
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (!selectedTier) {
        addToast({
          type: "error",
          title: "Select Policy",
          message: "Please select a policy tier",
        });
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Proceed to checkout
      const totalPrice = calculateTotalPrice();
      if (walletBalance < totalPrice) {
        setShowFundModal(true);
      } else {
        handleCheckout();
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2 && currentQuizQuestion > 0) {
      setCurrentQuizQuestion(currentQuizQuestion - 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 3) {
        setCurrentQuizQuestion(quizQuestions.length - 1);
      }
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    const data = {
      address: propertyDetails.address,
      state: propertyDetails.state,
      lga: propertyDetails.lga,
      propertyType: propertyDetails.propertyType,
      year: Number(propertyDetails.yearBuilt),
      buildingMaterials: propertyDetails.materials,
      occupancyStatus: propertyDetails.occupancy,
      paymentFrequency: getCurrentQuizAnswer(4)[0].toLowerCase() || "",
      policy: selectedTier,
      propertyValue: getCurrentQuizAnswer(5)[0] || "",
      concerns: getCurrentQuizAnswer(3),
      extraCoverage: {
        lossOfRent: selectedCoverages.includes("lossOfRent"),
        contentInsurance: selectedCoverages.includes("contents"),
        publicLiability: selectedCoverages.includes("liability"),
        accidentalDamage: selectedCoverages.includes("accidental"),
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
    if (calculateTotalPrice() - walletBalance > parseFloat(fundAmount)) {
      addToast({
        type: "error",
        title: "Insufficient Amount",
        message: `Please enter at least ${formatCurrency(
          calculateTotalPrice() - walletBalance
        )} to cover the quote`,
      });
      return;
    }

    const data = {
      address: propertyDetails.address,
      state: propertyDetails.state,
      lga: propertyDetails.lga,
      propertyType: propertyDetails.propertyType,
      year: Number(propertyDetails.yearBuilt),
      buildingMaterials: propertyDetails.materials,
      occupancyStatus: propertyDetails.occupancy,
      paymentFrequency: getCurrentQuizAnswer(4)[0].toLowerCase() || "",
      policy: selectedTier,
      propertyValue: getCurrentQuizAnswer(5)[0] || "",
      concerns: getCurrentQuizAnswer(3),
      extraCoverage: {
        lossOfRent: selectedCoverages.includes("lossOfRent"),
        contentInsurance: selectedCoverages.includes("contents"),
        publicLiability: selectedCoverages.includes("liability"),
        accidentalDamage: selectedCoverages.includes("accidental"),
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

  const getCurrentQuizAnswer = (questionId: number) => {
    return (
      quizAnswers.find((qa) => qa.questionId === questionId)?.answers || []
    );
  };

  const steps = [
    {
      number: 1,
      title: "Property Details",
      description: "Basic property information",
    },
    {
      number: 2,
      title: "Risk Assessment",
      description: "Answer a few questions",
    },
    {
      number: 3,
      title: "Policy Selection",
      description: "Choose your coverage",
    },
    { number: 4, title: "Checkout", description: "Review and pay" },
  ];

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Get a Quote
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Step {currentStep} of 4: {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      currentStep >= step.number
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 dark:border-gray-600 text-gray-400"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-20 h-0.5 mx-4 transition-all duration-300 ${
                        currentStep > step.number
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <p
                    className={`text-xs font-medium ${
                      currentStep >= step.number
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="p-8">
            {/* Step 1: Property Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Property Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Tell us about your property to get an accurate quote.
                  </p>
                </div>

                <Input
                  label="Property Address"
                  name="address"
                  value={propertyDetails.address}
                  onChange={handlePropertyDetailsChange}
                  placeholder="Enter full property address"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      State *
                    </label>
                    <select
                      name="state"
                      value={propertyDetails.state}
                      onChange={handlePropertyDetailsChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select State</option>
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Local Government Area (LGA) *
                    </label>
                    <select
                      name="lga"
                      value={propertyDetails.lga}
                      onChange={handlePropertyDetailsChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={
                        !propertyDetails.state || lgaOptions.length === 0
                      }
                    >
                      <option value="">
                        {!propertyDetails.state
                          ? "Select State first"
                          : lgaOptions.length === 0
                          ? "Loading LGAs..."
                          : "Select LGA"}
                      </option>
                      {lgaOptions.map((lga) => (
                        <option key={lga} value={lga}>
                          {lga}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Property Type *
                    </label>
                    <select
                      name="propertyType"
                      value={propertyDetails.propertyType}
                      onChange={handlePropertyDetailsChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select Property Type</option>
                      {propertyTypeOptions.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Year Built"
                    name="yearBuilt"
                    type="number"
                    value={propertyDetails.yearBuilt}
                    onChange={handlePropertyDetailsChange}
                    placeholder="e.g. 2018"
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Building Materials *
                    </label>
                    <select
                      name="materials"
                      value={propertyDetails.materials}
                      onChange={handlePropertyDetailsChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select Building Materials</option>
                      {buildingMaterials.map((material) => (
                        <option key={material} value={material}>
                          {material}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Occupancy Status *
                    </label>
                    <select
                      name="occupancy"
                      value={propertyDetails.occupancy}
                      onChange={handlePropertyDetailsChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select Occupancy Status</option>
                      {occupancyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Risk Quiz */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Risk Assessment Quiz
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Help us understand your needs better with a few quick
                    questions.
                  </p>
                </div>

                {/* Quiz Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>
                      Question {currentQuizQuestion + 1} of{" "}
                      {quizQuestions.length}
                    </span>
                    <span>
                      {Math.round(
                        ((currentQuizQuestion + 1) / quizQuestions.length) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${
                          ((currentQuizQuestion + 1) / quizQuestions.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Current Question */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    {quizQuestions[currentQuizQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {quizQuestions[currentQuizQuestion].options.map(
                      (option, index) => {
                        const currentAnswers = getCurrentQuizAnswer(
                          quizQuestions[currentQuizQuestion].id
                        );
                        const isSelected = currentAnswers.includes(option);

                        return (
                          <button
                            key={index}
                            onClick={() =>
                              handleQuizAnswer(
                                quizQuestions[currentQuizQuestion].id,
                                option,
                                quizQuestions[currentQuizQuestion].type ===
                                  "multiple"
                              )
                            }
                            className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                                )}
                              </div>
                              {option}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Policy Recommendations */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Choose Your Policy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Select the policy tier that best fits your needs and budget.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {policyTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="cursor-pointer transition-all duration-300 hover:scale-105"
                      onClick={() => setSelectedTier(tier.id)}
                    >
                      <Card
                        className={`p-6 h-full ${
                          selectedTier === tier.id
                            ? "ring-2 ring-blue-500 shadow-xl bg-blue-50 dark:bg-blue-900/20"
                            : "hover:shadow-lg"
                        } ${tier.recommended ? "ring-2 ring-green-500" : ""}`}
                      >
                        {tier.recommended && (
                          <div className="flex items-center justify-center mb-4">
                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              Recommended
                            </span>
                          </div>
                        )}

                        {selectedTier === tier.id && (
                          <div className="flex items-center justify-center mb-4">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Selected
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {tier.name}
                          </h3>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            {formatCurrency(tier.basePrice)}/year
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {tier.description}
                          </p>
                        </div>

                        <ul className="space-y-2">
                          {tier.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-center text-sm"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6">
                          <Button
                            className={`w-full ${
                              selectedTier === tier.id
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-400 hover:bg-gray-500"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTier(tier.id);
                            }}
                          >
                            {selectedTier === tier.id
                              ? "Selected"
                              : "Select This Plan"}
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>

                {selectedTier && (
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Selected:{" "}
                          {policyTiers.find((t) => t.id === selectedTier)?.name}{" "}
                          Tier
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {
                            policyTiers.find((t) => t.id === selectedTier)
                              ?.description
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(
                            policyTiers.find((t) => t.id === selectedTier)
                              ?.basePrice || 0
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          per year
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Step 4: Additional Coverage & Checkout */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Customize Your Coverage
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Add optional coverage to enhance your protection.
                  </p>
                </div>

                {/* Selected Policy Summary */}
                <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Selected:{" "}
                        {policyTiers.find((t) => t.id === selectedTier)?.name}{" "}
                        Tier
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {
                          policyTiers.find((t) => t.id === selectedTier)
                            ?.description
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(
                          policyTiers.find((t) => t.id === selectedTier)
                            ?.basePrice || 0
                        )}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Additional Coverage Options */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Additional Coverage Options
                  </h3>
                  <div className="space-y-4">
                    {additionalCoverages.map((coverage) => (
                      <div
                        key={coverage.id}
                        className="cursor-pointer transition-all duration-200"
                        onClick={() => toggleCoverage(coverage.id)}
                      >
                        <Card
                          className={`p-4 hover:shadow-md ${
                            selectedCoverages.includes(coverage.id)
                              ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                  selectedCoverages.includes(coverage.id)
                                    ? "bg-blue-500 border-blue-500 text-white"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {selectedCoverages.includes(coverage.id) && (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </button>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {coverage.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {coverage.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                +{formatCurrency(coverage.price)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                per year
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Summary */}
                <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Total Annual Premium
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCoverages.length > 0 &&
                          `Includes ${
                            selectedCoverages.length
                          } additional coverage${
                            selectedCoverages.length > 1 ? "s" : ""
                          }`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(calculateTotalPrice())}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        per year
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Wallet Balance */}
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Wallet Balance
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(walletBalance)}
                    </span>
                  </div>
                  {walletBalance < calculateTotalPrice() && (
                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          Insufficient balance. You'll need to fund your wallet
                          to proceed.
                        </p>
                      </div>
                    </div>
                  )}
                  {walletBalance >= calculateTotalPrice() && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-800 dark:text-green-300">
                          Sufficient balance available. Ready to proceed with
                          payment.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === 1 && currentQuizQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNextStep}
                loading={loading}
                disabled={currentStep === 3 && !selectedTier}
              >
                {currentStep === 4
                  ? walletBalance >= calculateTotalPrice()
                    ? "Complete Purchase"
                    : "Fund Wallet & Pay"
                  : "Next Step"}
                {currentStep < 4 && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Fund Wallet
                </h3>
                <button
                  onClick={() => setShowFundModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    You need{" "}
                    {formatCurrency(calculateTotalPrice() - walletBalance)} more
                    to complete this purchase.
                  </p>
                </div>

                <Input
                  label="Amount to Fund (₦)"
                  type="text"
                  value={
                    fundAmount
                      ? formatCurrency(parseInt(fundAmount)).replace("₦", "")
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setFundAmount(value);
                  }}
                  placeholder={`Minimum: ${formatCurrency(
                    calculateTotalPrice() - walletBalance
                  ).replace("₦", "")}`}
                  min={calculateTotalPrice() - walletBalance}
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 After funding, your payment will be processed
                    automatically and your policy application will be submitted.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowFundModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleFundWallet}
                    loading={loading}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Fund Wallet & Complete Purchase
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
