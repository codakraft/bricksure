import React, {
  useState,
  //  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Camera,
  // Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
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
// import { useGetWalletQuery } from "../../services";

export function AddProperty() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    address: "",
    state: "",
    lga: "",
    propertyType: "",
    yearBuilt: "",
    materials: "",
    occupancy: "",

    // Step 2: Location
    latitude: "",
    longitude: "",
    mapConfirmed: false,

    // Step 3: Media & Documents
    photos: [] as File[],
    videos: [] as File[],
    documents: [] as File[],
  });

  const { data: propertyTypesData } = useGetPropertyTypeQuery();
  const { data: statesData } = useGetStatesQuery();
  const [getLGAs, { data: lgaData }] = useLazyGetStatesLGAQuery();

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      return [
        { value: "owner", label: "Owner-Occupied Home" },
        { value: "rental", label: "Rental Property" },
        { value: "shortlet", label: "Short-let Property" },
        { value: "commercial", label: "Commercial Building" },
      ];
    }
    return propertyTypesData.data.propertyTypes.map((type) => ({
      value: type._id,
      label: type.name,
    }));
  }, [propertyTypesData]);

  // const { data: walletData } = useGetWalletQuery();
  // console.log("Wallet Data", walletData);

  // const walletBalance = useMemo(() => {
  //   return walletData?.data?.wallet?.balance || 0;
  // }, [walletData]);

  const buildingMaterials = [
    "Concrete/Block",
    "Brick",
    "Wood Frame",
    "Steel Frame",
    "Mixed Materials",
  ];

  const occupancyTypes = [
    "Owner Occupied",
    "Tenant Occupied",
    "Vacant",
    "Under Construction",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Load LGAs when state is selected
    if (name === "state" && value) {
      const selectedState = statesData?.data?.states?.find(
        (state) => state.name === value
      );
      if (selectedState) {
        getLGAs({ id: selectedState._id });
        // Clear LGA when state changes
        setFormData((prev) => ({ ...prev, lga: "" }));
      }
    }
  };

  const handleFileUpload = (type: "photos" | "videos" | "documents") => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    if (type === "photos") {
      input.accept = "image/*";
    } else if (type === "videos") {
      input.accept = "video/*";
    } else {
      input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
    }

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], ...files],
      }));
    };

    input.click();
  };

  const removeFile = (
    type: "photos" | "videos" | "documents",
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
      if (!formData.address.trim())
        newErrors.address = "Property address is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.lga.trim())
        newErrors.lga = "Local Government Area is required";
      if (!formData.propertyType)
        newErrors.propertyType = "Property type is required";
      if (!formData.yearBuilt) newErrors.yearBuilt = "Year built is required";
      if (!formData.materials)
        newErrors.materials = "Building materials are required";
      if (!formData.occupancy)
        newErrors.occupancy = "Occupancy type is required";
    }

    if (step === 2) {
      if (!formData.mapConfirmed)
        newErrors.map = "Please confirm your property location on the map";
    }

    if (step === 3) {
      if (formData.photos.length === 0)
        newErrors.photos = "At least one property photo is required";
      if (formData.documents.length === 0)
        newErrors.documents = "Property documents are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
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
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      addToast({
        type: "success",
        title: "Property Added Successfully!",
        message:
          "Your application is now being processed. Track your progress from the dashboard.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.log("Error adding property:", error);
      addToast({
        type: "error",
        title: "Failed to Add Property",
        message: "Please try again or contact support if the problem persists.",
      });
    }
  };

  const simulateLocationPin = () => {
    // Simulate dropping a pin on the map
    setFormData((prev) => ({
      ...prev,
      latitude: "6.5244",
      longitude: "3.3792",
      mapConfirmed: true,
    }));

    addToast({
      type: "success",
      title: "Location Confirmed!",
      message: "Property location has been pinned on the map.",
    });
  };

  const steps = [
    {
      number: 1,
      title: "Property Details",
      description: "Basic information about your property",
    },
    {
      number: 2,
      title: "Location & Map",
      description: "Confirm your property location",
    },
    {
      number: 3,
      title: "Photos & Documents",
      description: "Upload media and supporting documents",
    },
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
              Add New Property
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Step {currentStep} of 3: {steps[currentStep - 1].description}
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
            {/* Step 1: Property Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Property Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Tell us about your property so we can provide accurate
                    coverage options.
                  </p>
                </div>

                <Input
                  label="Property Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                  placeholder="Enter full property address"
                  help="Include street number, street name, and area"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
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
                    {errors.state && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Local Government Area (LGA) *
                    </label>
                    <select
                      name="lga"
                      value={formData.lga}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={!formData.state}
                    >
                      <option value="">
                        {!formData.state ? "Select State first" : "Select LGA"}
                      </option>
                      {lgaOptions.map((lga) => (
                        <option key={lga} value={lga}>
                          {lga}
                        </option>
                      ))}
                    </select>
                    {errors.lga && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.lga}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Property Type *
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
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
                    {errors.propertyType && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.propertyType}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Year Built"
                    name="yearBuilt"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={handleInputChange}
                    error={errors.yearBuilt}
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
                      value={formData.materials}
                      onChange={handleInputChange}
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
                    {errors.materials && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.materials}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Occupancy Status *
                    </label>
                    <select
                      name="occupancy"
                      value={formData.occupancy}
                      onChange={handleInputChange}
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
                    {errors.occupancy && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.occupancy}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Map */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Confirm Property Location
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please confirm your property's exact location on the map.
                    This helps us provide accurate coverage.
                  </p>
                </div>

                {/* Map Placeholder */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Interactive Map
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Address: {formData.address || "No address provided"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Map integration will show here. Click to drop a pin at your
                    exact property location.
                  </p>

                  {formData.mapConfirmed ? (
                    <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Location Confirmed</span>
                      <span className="text-sm">
                        ({formData.latitude}, {formData.longitude})
                      </span>
                    </div>
                  ) : (
                    <Button onClick={simulateLocationPin}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Drop Pin Here
                    </Button>
                  )}
                </div>

                {errors.map && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{errors.map}</span>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Why do we need your exact location?
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        Precise location helps us assess risk factors like flood
                        zones, fire stations proximity, and local crime rates to
                        provide you with the most accurate premium.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Photos & Documents */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Photos & Documents
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Upload fresh photos and supporting documents. Photos must be
                    taken within 72 hours with location enabled.
                  </p>
                </div>

                {/* Photos Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Property Photos * (Required)
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => handleFileUpload("photos")}
                  >
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Click to upload property photos
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Take fresh photos with location enabled. Include exterior
                      and interior shots.
                    </p>
                  </div>

                  {formData.photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.photos.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {file.name}
                          </p>
                          <button
                            onClick={() => removeFile("photos", index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.photos && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {errors.photos}
                    </p>
                  )}
                </div>

                {/* Videos Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Property Videos (Optional)
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => handleFileUpload("videos")}
                  >
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Click to upload property videos
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Short walkthrough videos help with faster approvals.
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
                    Supporting Documents * (Required)
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
                      Title deeds, valuation reports, building permits, etc.
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
                  {errors.documents && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {errors.documents}
                    </p>
                  )}
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Important: Fresh Photos Required
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        All photos must be taken within the last 72 hours with
                        location services enabled. This helps prevent fraud and
                        ensures accurate property assessment.
                      </p>
                    </div>
                  </div>
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

              <Button onClick={handleNext}>
                {currentStep === 3 ? "Submit Property" : "Next Step"}
                {currentStep < 3 && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
