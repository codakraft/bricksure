import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  ChevronDown,
  TrendingUp,
  Shield,
  AlertTriangle,
  Droplets,
  Flame,
  Home,
  Cloud,
  Building,
  Share,
  Play,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Users,
  BookOpen,
  Target,
  Zap,
  Calendar,
  Award,
} from "lucide-react";
import { Layout } from "../components/Layout/Layout";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import {
  useGetStatesQuery,
  useLazyGetStatesLGAQuery,
} from "../services/propertiesService";

// Mock data - in real app this would come from API
const riskTypes = [
  { id: "flood", name: "Flood", icon: Droplets, color: "text-blue-600" },
  { id: "fire", name: "Fire", icon: Flame, color: "text-red-600" },
  { id: "burglary", name: "Burglary", icon: Home, color: "text-purple-600" },
  { id: "storm", name: "Storm", icon: Cloud, color: "text-gray-600" },
  {
    id: "collapse",
    name: "Collapse",
    icon: Building,
    color: "text-orange-600",
  },
];

const quizQuestions = [
  {
    id: 1,
    question: "What type of property do you want to insure?",
    options: [
      "Owner-occupied home",
      "Rental property",
      "Short-let property",
      "Commercial building",
    ],
    type: "single",
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
    type: "single",
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
    type: "multiple",
  },
  {
    id: 4,
    question: "What's your preferred payment frequency?",
    options: ["Monthly", "Quarterly", "Bi-annual", "Annual"],
    type: "single",
  },
  {
    id: 5,
    question: "What's your approximate property value?",
    options: ["Under ₦10M", "₦10M - ₦25M", "₦25M - ₦50M", "Over ₦50M"],
    type: "single",
  },
];

const stories = [
  {
    id: 1,
    title: "How Lagos Residents Protected Their Homes During 2023 Floods",
    excerpt:
      "Learn from real experiences of homeowners who had comprehensive flood coverage during the heavy rains.",
    image:
      "https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Success Story",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Seasonal Property Protection: Rainy Season Checklist",
    excerpt:
      "Essential steps to protect your property before, during, and after Nigeria's rainy season.",
    image:
      "https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Seasonal Guide",
    readTime: "3 min read",
  },
  {
    id: 3,
    title: "Fire Safety in Nigerian Homes: Prevention & Coverage",
    excerpt:
      "Understanding fire risks and how proper insurance coverage saved families from financial ruin.",
    image:
      "https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Safety Guide",
    readTime: "4 min read",
  },
];

export function CommunityRiskInsights() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedLGA, setSelectedLGA] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [lgaSearch, setLgaSearch] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showLGADropdown, setShowLGADropdown] = useState(false);
  const [activeRiskLayer, setActiveRiskLayer] = useState("all");
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string[]>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [compareAreas, setCompareAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // API hooks
  const { data: statesData, isLoading: isStatesLoading } = useGetStatesQuery();
  const [getLGAs, { data: lgaData, isLoading: isLGALoading }] =
    useLazyGetStatesLGAQuery();

  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const lgaDropdownRef = useRef<HTMLDivElement>(null);

  // Mock risk data
  const getRiskData = (state: string, lga: string) => ({
    overall: "Medium",
    risks: {
      flood: Math.floor(Math.random() * 100),
      fire: Math.floor(Math.random() * 100),
      burglary: Math.floor(Math.random() * 100),
      storm: Math.floor(Math.random() * 100),
      collapse: Math.floor(Math.random() * 100),
    },
    seasonalTip: "Rainy season approaching - consider flood protection",
    lastUpdated: "2 days ago",
    recommendedTier: "Standard",
    recommendedRiders: ["Flood Protection", "Storm Coverage"],
  });

  const filteredStates = (statesData?.data?.states || []).filter((state) =>
    state.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const selectedStateData = (statesData?.data?.states || []).find(
    (state) => state.name === selectedState
  );
  const filteredLGAs = (lgaData?.data?.lgas || []).filter((lga) =>
    lga.name.toLowerCase().includes(lgaSearch.toLowerCase())
  );

  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedLGA("");
    setStateSearch(stateName);
    setShowStateDropdown(false);
    setLgaSearch("");

    // Get the state ID and fetch LGAs
    const state = (statesData?.data?.states || []).find(
      (s) => s.name === stateName
    );
    if (state) {
      getLGAs({ id: state._id });
    }
  };

  const handleLGASelect = (lgaName: string) => {
    setSelectedLGA(lgaName);
    setLgaSearch(lgaName);
    setShowLGADropdown(false);
  };

  const handleQuizAnswer = (
    questionId: number,
    answer: string,
    isMultiple = false
  ) => {
    if (isMultiple) {
      const currentAnswers = quizAnswers[questionId] || [];
      const newAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter((a) => a !== answer)
        : [...currentAnswers, answer];
      setQuizAnswers({ ...quizAnswers, [questionId]: newAnswers });
    } else {
      setQuizAnswers({ ...quizAnswers, [questionId]: [answer] });
    }
  };

  const nextQuestion = () => {
    if (currentQuizQuestion < quizQuestions.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
    } else {
      setShowQuizResults(true);
    }
  };

  const addToCompare = (area: string) => {
    if (compareAreas.length < 3 && !compareAreas.includes(area)) {
      setCompareAreas([...compareAreas, area]);
    }
  };

  const removeFromCompare = (area: string) => {
    setCompareAreas(compareAreas.filter((a) => a !== area));
  };

  const useMyLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock location detection - in real app would reverse geocode
          setSelectedState("Lagos");
          setSelectedLGA("Ikeja");
          setStateSearch("Lagos");
          setLgaSearch("Ikeja");
          setLoading(false);
        },
        (error) => {
          console.error("Location error:", error);
          setLoading(false);
        }
      );
    }
  };

  const riskData =
    selectedState && selectedLGA
      ? getRiskData(selectedState, selectedLGA)
      : null;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <TrendingUp className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Community & Risk Insights
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Explore property risks across Nigeria, get personalized
              recommendations, and learn from community experiences to make
              informed insurance decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Explorer & Dropdowns */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Risk Explorer
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover property risks in your area and get personalized coverage
              recommendations
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              {/* Location Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* State Dropdown */}
                <div className="relative" ref={stateDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select State
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={stateSearch}
                      onChange={(e) => {
                        setStateSearch(e.target.value);
                        setShowStateDropdown(true);
                      }}
                      onFocus={() => setShowStateDropdown(true)}
                      placeholder="Search states..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>

                  {showStateDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                      {isStatesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            Loading states...
                          </span>
                        </div>
                      ) : filteredStates.length > 0 ? (
                        filteredStates.map((state) => (
                          <button
                            key={state._id}
                            onClick={() => handleStateSelect(state.name)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                          >
                            {state.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          No states found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* LGA Dropdown */}
                <div className="relative" ref={lgaDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select LGA
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={lgaSearch}
                      onChange={(e) => {
                        setLgaSearch(e.target.value);
                        setShowLGADropdown(true);
                      }}
                      onFocus={() => setShowLGADropdown(true)}
                      placeholder={
                        selectedState ? "Search LGAs..." : "Select state first"
                      }
                      disabled={!selectedState}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>

                  {showLGADropdown && selectedState && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                      {isLGALoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            Loading LGAs...
                          </span>
                        </div>
                      ) : filteredLGAs.length > 0 ? (
                        filteredLGAs.map((lga) => (
                          <button
                            key={lga._id}
                            onClick={() => handleLGASelect(lga.name)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                          >
                            {lga.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          No LGAs found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Use My Location Button */}
              <div className="text-center mb-8">
                <Button
                  variant="outline"
                  onClick={useMyLocation}
                  loading={loading}
                  className="mx-auto"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Use My Location
                </Button>
              </div>

              {/* Risk Snapshot Card */}
              {riskData && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Risk Snapshot: {selectedLGA}, {selectedState}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last updated: {riskData.lastUpdated}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    {/* Overall Risk Badge */}
                    <div className="mb-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          riskData.overall === "Low"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                            : riskData.overall === "Medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400"
                        }`}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {riskData.overall} Risk Area
                      </span>
                    </div>

                    {/* Risk Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      {riskTypes.map((risk) => (
                        <div key={risk.id} className="text-center">
                          <risk.icon
                            className={`h-8 w-8 mx-auto mb-2 ${risk.color}`}
                          />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {risk.name}
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${
                                riskData.risks[
                                  risk.id as keyof typeof riskData.risks
                                ] > 70
                                  ? "bg-red-500"
                                  : riskData.risks[
                                      risk.id as keyof typeof riskData.risks
                                    ] > 40
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${
                                  riskData.risks[
                                    risk.id as keyof typeof riskData.risks
                                  ]
                                }%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {
                              riskData.risks[
                                risk.id as keyof typeof riskData.risks
                              ]
                            }
                            %
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Seasonal Tip */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                            Seasonal Tip
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                            {riskData.seasonalTip}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Coverage Advice */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Recommended Coverage
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">
                            {riskData.recommendedTier} Tier
                          </span>
                        </div>
                        <div className="space-y-2">
                          {riskData.recommendedRiders.map((rider, index) => (
                            <div
                              key={index}
                              className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              Add {rider}
                            </div>
                          ))}
                        </div>
                        <div className="pt-4">
                          <Button className="w-full" asChild>
                            <Link to="/register">
                              Get Quote for {selectedLGA}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Map Placeholder */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Interactive Risk Map
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore risk patterns across Nigeria with our interactive
              choropleth map
            </p>
          </div>

          <Card className="p-8">
            {/* Risk Layer Toggles */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveRiskLayer("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeRiskLayer === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                All Risks
              </button>
              {riskTypes.map((risk) => (
                <button
                  key={risk.id}
                  onClick={() => setActiveRiskLayer(risk.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    activeRiskLayer === risk.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <risk.icon className="h-4 w-4 mr-1" />
                  {risk.name}
                </button>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Interactive Nigeria Map
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Choropleth map showing{" "}
                  {activeRiskLayer === "all"
                    ? "all risk types"
                    : `${riskTypes
                        .find((r) => r.id === activeRiskLayer)
                        ?.name.toLowerCase()} risk`}{" "}
                  across all 774 LGAs
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click any LGA to view detailed risk snapshot • Pan and zoom
                  supported
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Inline Quiz */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Property Protection Quiz
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get personalized coverage recommendations based on your specific
              needs
            </p>
          </div>

          <Card className="p-8">
            {!showQuizResults ? (
              <>
                {/* Progress Bar */}
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
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {quizQuestions[currentQuizQuestion].question}
                  </h3>

                  <div className="space-y-3 mb-8">
                    {quizQuestions[currentQuizQuestion].options.map(
                      (option, index) => {
                        const isSelected =
                          quizAnswers[
                            quizQuestions[currentQuizQuestion].id
                          ]?.includes(option);
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
                            className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
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

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentQuizQuestion(
                          Math.max(0, currentQuizQuestion - 1)
                        )
                      }
                      disabled={currentQuizQuestion === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={nextQuestion}
                      disabled={
                        !quizAnswers[quizQuestions[currentQuizQuestion].id]
                          ?.length
                      }
                    >
                      {currentQuizQuestion === quizQuestions.length - 1
                        ? "Get Results"
                        : "Next"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Quiz Results */
              <div className="text-center animate-in slide-in-from-bottom-4 duration-300">
                <Award className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Your Personalized Recommendation
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium bg-blue-600 text-white">
                        Standard Tier Recommended
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Based on your responses, we recommend our Standard tier
                      with flood and fire protection add-ons.
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Confidence Score: 92%
                    </div>
                  </div>
                </div>
                <Button size="lg" asChild>
                  <Link to="/register">
                    Start Your Quote
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Compare Areas */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Compare Risk Areas
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Compare risk levels across up to 3 different areas to make
              informed decisions
            </p>
          </div>

          <Card className="p-8">
            {compareAreas.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Areas Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Use the Risk Explorer above or click on the map to add areas
                  for comparison
                </p>
                {selectedState && selectedLGA && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      addToCompare(`${selectedLGA}, ${selectedState}`)
                    }
                  >
                    Add {selectedLGA}, {selectedState}
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {compareAreas.map((area, index) => (
                  <Card
                    key={index}
                    className="p-6 animate-in slide-in-from-bottom-4 duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {area}
                      </h3>
                      <button
                        onClick={() => removeFromCompare(area)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    {/* Mock comparison data */}
                    <div className="space-y-3">
                      {riskTypes.map((risk) => {
                        const value = Math.floor(Math.random() * 100);
                        return (
                          <div key={risk.id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">
                                {risk.name}
                              </span>
                              <span className="font-medium">{value}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  value > 70
                                    ? "bg-red-500"
                                    : value > 40
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Button className="w-full mt-4" size="sm" asChild>
                      <Link to="/register">Get Quote</Link>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Stories & Tips */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Community Stories & Tips
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Learn from real experiences and expert advice from the BrickSure
              community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, index) => (
              <Card
                key={story.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                      {story.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {story.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {story.excerpt}
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BookOpen className="h-4 w-4 mr-1" />
                      Read More
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to="/register">
                        <Shield className="h-4 w-4 mr-1" />
                        Protect Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Protect Your Property?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Use these insights to make informed decisions about your property
            insurance coverage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/register">
                Get Personalized Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-blue-600"
              asChild
            >
              <Link to="/contact">Talk to an Expert</Link>
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            All policies are underwritten by Sovereign Trust Insurance PLC
          </p>
        </div>
      </section>
    </Layout>
  );
}
