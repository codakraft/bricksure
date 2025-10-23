import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Camera,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Phone,
  MessageCircle,
  X,
  Plus,
  Home,
} from "lucide-react";
import { Layout } from "../../components/Layout/Layout";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { useToast } from "../../components/UI/Toast";
import { useGetPropertiesQuery } from "../../services/propertiesService";

export function FileClaim() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's properties
  const { data: propertiesData } = useGetPropertiesQuery();

  // Filter approved properties
  const approvedProperties = useMemo(() => {
    if (!propertiesData?.data) return [];
    return propertiesData.data.filter(
      (property) => property.status === "approved"
    );
  }, [propertiesData]);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPolicy, setSelectedPolicy] = useState<string>("");
  const [formData, setFormData] = useState({
    // Step 1: Claim Basics
    policyId: "",
    claimType: "",
    claimTypeOther: "",
    causeOfLoss: "",
    causeOfLossOther: "",
    lossDate: "",
    lossTime: "",
    address: "",
    latitude: "",
    longitude: "",

    // Step 2: What Happened
    description: "",
    anyoneInjured: "",
    policeReportFiled: "",
    policeReportRef: "",
    emergencyServices: "",
    estimatedLoss: "",

    // Step 3: Evidence
    images: [] as File[],
    videos: [] as File[],
    documents: [] as File[],

    // Step 4: Review
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const claimTypes = [
    { value: "HOME", label: "🏠 Home/Residential", icon: "🏠" },
    { value: "CONSTRUCTION", label: "🏗️ Construction Site", icon: "🏗️" },
    { value: "MIXED_USE", label: "🏢 Mixed-use Building", icon: "🏢" },
    { value: "OFFICE", label: "🏢 Office Building", icon: "🏢" },
    { value: "SCHOOL", label: "🏫 School/Training", icon: "🏫" },
    { value: "PETROL_GAS", label: "⛽ Petrol/Gas Station", icon: "⛽" },
    { value: "HOSPITAL_CLINIC", label: "🏥 Hospital/Clinic", icon: "🏥" },
    { value: "RECREATION_CINEMA", label: "🎭 Recreation/Cinema", icon: "🎭" },
    { value: "HOTEL_HOSTEL", label: "🏨 Hotel/Hostel", icon: "🏨" },
    { value: "OTHER", label: "📋 Other (specify)", icon: "📋" },
  ];

  const causesOfLoss = [
    { value: "FIRE", label: "🔥 Fire", icon: "🔥" },
    { value: "FLOOD", label: "🌊 Flood", icon: "🌊" },
    { value: "STORM", label: "⛈️ Storm", icon: "⛈️" },
    { value: "THEFT", label: "🔓 Burglary/Theft", icon: "🔓" },
    { value: "VANDALISM", label: "🔨 Vandalism", icon: "🔨" },
    { value: "ACCIDENT", label: "💥 Accidental Damage", icon: "💥" },
    { value: "COLLAPSE", label: "🏚️ Collapse", icon: "🏚️" },
    { value: "TPL", label: "👥 Third-Party Liability", icon: "👥" },
    { value: "SITE_LOSS", label: "🚧 Construction Site Loss", icon: "🚧" },
    { value: "OTHER", label: "📝 Other (specify)", icon: "📝" },
  ];

  const steps = [
    { number: 1, title: "Claim Basics", description: "Tell us what happened" },
    { number: 2, title: "Details", description: "Share the story" },
    { number: 3, title: "Evidence", description: "Upload photos & documents" },
    { number: 4, title: "Review", description: "Confirm and submit" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = (type: "images" | "videos" | "documents") => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    if (type === "images") {
      input.accept = "image/*";
    } else if (type === "videos") {
      input.accept = "video/*";
    } else {
      input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
    }

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);

      // Validate file sizes and types
      const validFiles = files.filter((file) => {
        if (type === "videos" && file.size > 100 * 1024 * 1024) {
          // 100MB limit for videos
          addToast({
            type: "error",
            title: "File too large",
            message: `${file.name} is too large. Videos must be under 100MB.`,
          });
          return false;
        }
        if (type === "images" && file.size > 10 * 1024 * 1024) {
          // 10MB limit for images
          addToast({
            type: "error",
            title: "File too large",
            message: `${file.name} is too large. Images must be under 10MB.`,
          });
          return false;
        }
        return true;
      });

      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], ...validFiles],
      }));
    };

    input.click();
  };

  const removeFile = (
    type: "images" | "videos" | "documents",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.policyId) newErrors.policyId = "Please select a policy";
      if (!formData.causeOfLoss)
        newErrors.causeOfLoss = "Please select the cause of loss";
      if (
        formData.causeOfLoss === "OTHER" &&
        !formData.causeOfLossOther.trim()
      ) {
        newErrors.causeOfLossOther = "Please specify the cause of loss";
      }
      if (!formData.lossDate)
        newErrors.lossDate = "Please enter the date of loss";
      if (!formData.lossTime)
        newErrors.lossTime = "Please enter the time of loss";
      if (!formData.address.trim())
        newErrors.address = "Please enter the loss location";
    }

    if (step === 2) {
      if (!formData.description.trim())
        newErrors.description = "Please describe what happened";
      if (formData.description.length < 30)
        newErrors.description =
          "Please provide more details (at least 30 characters)";
      if (!formData.estimatedLoss)
        newErrors.estimatedLoss = "Please provide an estimated loss amount";
    }

    if (step === 3) {
      if (formData.images.length === 0 && formData.videos.length === 0) {
        newErrors.evidence =
          "Please upload at least one photo or video as evidence";
      }
    }

    if (step === 4) {
      if (!formData.termsAccepted)
        newErrors.termsAccepted = "Please accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const claimRef = "CLM-" + Date.now().toString(36).toUpperCase();

      addToast({
        type: "success",
        title: "Claim Filed Successfully!",
        message: `Your claim ${claimRef} has been submitted and is being processed.`,
      });

      navigate(`/dashboard/claims/${claimRef}`);
    } catch (error) {
      addToast({
        type: "error",
        title: "Failed to File Claim",
        message: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateLocationPin = () => {
    setFormData((prev) => ({
      ...prev,
      latitude: "6.5244",
      longitude: "3.3792",
    }));

    addToast({
      type: "success",
      title: "Location Confirmed!",
      message: "Loss location has been pinned on the map.",
    });
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard/claims")}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Claims
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              File a New Claim
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

          {/* Form Content */}
          <Card className="p-8">
            {/* Step 1: Select Policy & Claim Basics */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Select the policy you're claiming against 📋
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Choose which insured property was affected by the loss.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Policy *
                  </label>

                  {approvedProperties.length === 0 ? (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You don't have any active policies yet.
                      </p>
                      <Button
                        onClick={() => navigate("/dashboard/quote")}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Get a Quote
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {approvedProperties.map((property) => {
                        const isSelected = formData.policyId === property._id;
                        return (
                          <button
                            key={property._id}
                            type="button"
                            onClick={() => {
                              setSelectedPolicy(property._id);
                              setFormData((prev) => ({
                                ...prev,
                                policyId: property._id,
                                claimType: property.propertyType,
                                address: property.address,
                              }));
                              if (errors.policyId) {
                                setErrors((prev) => ({
                                  ...prev,
                                  policyId: "",
                                }));
                              }
                            }}
                            className={`p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <Home
                                  className={`h-6 w-6 mt-1 ${
                                    isSelected
                                      ? "text-blue-500"
                                      : "text-gray-400"
                                  }`}
                                />
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {property.propertyType}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {property.address}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Policy: {property.policyCode}</span>
                                    <span>•</span>
                                    <span>
                                      Value: ₦
                                      {parseInt(
                                        property.propertyValue
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {errors.policyId && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {errors.policyId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    What caused the loss? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {causesOfLoss.map((cause) => (
                      <button
                        key={cause.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            causeOfLoss: cause.value,
                          }))
                        }
                        className={`p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          formData.causeOfLoss === cause.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{cause.icon}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {cause.label.replace(/^.+ /, "")}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.causeOfLoss && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {errors.causeOfLoss}
                    </p>
                  )}
                </div>

                {formData.causeOfLoss === "OTHER" && (
                  <Input
                    label="Please specify the cause of loss"
                    name="causeOfLossOther"
                    value={formData.causeOfLossOther}
                    onChange={handleInputChange}
                    error={errors.causeOfLossOther}
                    placeholder="e.g., Equipment failure, Natural disaster, etc."
                    maxLength={50}
                    required
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Date of Loss"
                    name="lossDate"
                    type="date"
                    value={formData.lossDate}
                    onChange={handleInputChange}
                    error={errors.lossDate}
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />

                  <Input
                    label="Time of Loss"
                    name="lossTime"
                    type="time"
                    value={formData.lossTime}
                    onChange={handleInputChange}
                    error={errors.lossTime}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Location of Loss"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={errors.address}
                    placeholder="Enter the address where the loss occurred"
                    help="Be as specific as possible"
                    required
                  />

                  {/* Map Placeholder */}
                  {/* <div className="mt-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-800">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Pin the exact location on the map
                    </p>
                    <Button onClick={simulateLocationPin} variant="outline">
                      <MapPin className="h-4 w-4 mr-2" />
                      Drop Pin Here
                    </Button>
                  </div> */}
                </div>
              </div>
            )}

            {/* Step 2: What Happened */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Tell us what happened 📝
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Share the details of the incident in your own words.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Describe what happened *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Please describe the incident in detail. Include what you were doing, how it happened, and what damage occurred..."
                    minLength={30}
                    maxLength={500}
                    required
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.description.length}/500 characters
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Was anyone injured? *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="anyoneInjured"
                          value="yes"
                          checked={formData.anyoneInjured === "yes"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="anyoneInjured"
                          value="no"
                          checked={formData.anyoneInjured === "no"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          No
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Police report filed? *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="policeReportFiled"
                          value="yes"
                          checked={formData.policeReportFiled === "yes"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="policeReportFiled"
                          value="no"
                          checked={formData.policeReportFiled === "no"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          No
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emergency services called? *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="emergencyServices"
                          value="yes"
                          checked={formData.emergencyServices === "yes"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="emergencyServices"
                          value="no"
                          checked={formData.emergencyServices === "no"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          No
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {formData.policeReportFiled === "yes" && (
                  <Input
                    label="Police Report Reference Number"
                    name="policeReportRef"
                    value={formData.policeReportRef}
                    onChange={handleInputChange}
                    placeholder="Enter the police report reference number"
                  />
                )}

                <Input
                  label="Estimated Loss Amount (₦)"
                  name="estimatedLoss"
                  type="number"
                  value={formData.estimatedLoss}
                  onChange={handleInputChange}
                  error={errors.estimatedLoss}
                  placeholder="Enter rough estimate of damages"
                  help="A rough estimate is fine - we'll assess the actual amount"
                  min="0"
                  required
                />
              </div>
            )}

            {/* Step 3: Evidence Upload */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Upload evidence 📸
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Photos and documents help us process your claim faster.
                  </p>
                </div>

                {/* Photos Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Photos of Damage * (Up to 10 images)
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => handleFileUpload("images")}
                  >
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Click to upload photos of the damage
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG up to 10MB each. Take clear photos from multiple
                      angles.
                    </p>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {file.name}
                          </p>
                          <button
                            onClick={() => removeFile("images", index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Videos Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Videos (Optional, up to 3 videos)
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => handleFileUpload("videos")}
                  >
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Click to upload videos
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      MP4, MOV up to 100MB each. Keep videos under 60 seconds.
                    </p>
                  </div>

                  {formData.videos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.videos.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {file.name}
                          </span>
                          <button
                            onClick={() => removeFile("videos", index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Supporting Documents (Optional)
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => handleFileUpload("documents")}
                  >
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Click to upload documents
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receipts, invoices, police reports, repair quotes (PDF,
                      DOC, JPG, PNG)
                    </p>
                  </div>

                  {formData.documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.documents.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {file.name}
                            </span>
                          </div>
                          <button
                            onClick={() => removeFile("documents", index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {errors.evidence && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{errors.evidence}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Review your claim ✅
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please review all information before submitting your claim.
                  </p>
                </div>

                {/* Summary Card */}
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Claim Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Claim Type:
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {claimTypes
                          .find((t) => t.value === formData.claimType)
                          ?.label.replace(/^.+ /, "") ||
                          formData.claimTypeOther}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Cause of Loss:
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {causesOfLoss
                          .find((c) => c.value === formData.causeOfLoss)
                          ?.label.replace(/^.+ /, "") ||
                          formData.causeOfLossOther}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Date & Time:
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(
                          `${formData.lossDate}T${formData.lossTime}`
                        ).toLocaleString("en-NG")}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Location:
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formData.address}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Estimated Loss:
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₦{parseInt(formData.estimatedLoss).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Evidence:
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formData.images.length} photos,{" "}
                        {formData.videos.length} videos,{" "}
                        {formData.documents.length} documents
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Description:
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {formData.description}
                    </p>
                  </div>
                </Card>

                {/* Terms & Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        I confirm that the information provided is accurate and
                        complete to the best of my knowledge. I understand that
                        providing false information may void my claim.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        By submitting this claim, you agree to our{" "}
                        <a
                          href="/legal/terms"
                          target="_blank"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Terms & Conditions
                        </a>
                      </p>
                    </div>
                  </div>
                  {errors.termsAccepted && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.termsAccepted}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                loading={loading}
                disabled={currentStep === 4 && !formData.termsAccepted}
              >
                {currentStep === 4 ? "Submit Claim" : "Next Step"}
                {currentStep < 4 && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </Card>

          {/* Help Section */}
          <Card className="p-6 mt-8 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-3">
              <MessageCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
                  Need Help?
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Our claims team is here to help. Contact us if you have
                  questions or need assistance.
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
