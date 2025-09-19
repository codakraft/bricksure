import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Camera,
  Shield,
  CreditCard,
  Wallet,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Clock,
  FileText,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { Layout } from "../../components/Layout/Layout";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { useToast } from "../../components/UI/Toast";
import { useLazyGetPropertyByIDQuery } from "../../services/propertiesService";
import { useGetWalletQuery } from "../../services";
import { useFundWalletMutation } from "../../services/walletService";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [getPropertyByID, { data: propertyData, isLoading }] =
    useLazyGetPropertyByIDQuery();
  useEffect(() => {
    if (id) {
      getPropertyByID({ id });
    }
  }, [id, getPropertyByID]);

  const { data: walletData } = useGetWalletQuery();
  const [fundWallet, { isLoading: isFunding }] = useFundWalletMutation();
  const { authData: user } = useSelector((state: RootState) => state.auth);

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Transform API property data
  const property = useMemo(() => {
    if (!propertyData?.data?.property) {
      return null;
    }

    const apiProperty = propertyData.data.property;

    return {
      id: apiProperty._id,
      address: apiProperty.address,
      type: apiProperty.occupancyStatus,
      status: apiProperty.status === "approved" ? "active" : apiProperty.status,
      yearBuilt: apiProperty.year,
      images: 0, // Not available in API, default to 0
      lastUpdated: apiProperty.updatedAt,
      premium: apiProperty.totalAmount,
      tier: "Standard", // Not available in API, default to Standard
      nextPayment: apiProperty.nextPayment,
      policyNumber: apiProperty.policyCode || `BS-${apiProperty._id.slice(-6)}`,
      coverage: {
        fire:
          (apiProperty.concerns &&
            Array.isArray(apiProperty.concerns) &&
            (apiProperty.concerns.includes("Fire damage") ||
              apiProperty.concerns.includes("Fire Risk"))) ||
          false,
        flood:
          (apiProperty.concerns &&
            Array.isArray(apiProperty.concerns) &&
            (apiProperty.concerns.includes("Flood damage") ||
              apiProperty.concerns.includes("Flood Risk"))) ||
          false,
        burglary:
          (apiProperty.concerns &&
            Array.isArray(apiProperty.concerns) &&
            (apiProperty.concerns.includes("Burglary damage") ||
              apiProperty.concerns.includes("Theft damage") ||
              apiProperty.concerns.includes("Burglary Risk") ||
              apiProperty.concerns.includes("Theft Risk"))) ||
          false,
        storm:
          (apiProperty.concerns &&
            Array.isArray(apiProperty.concerns) &&
            (apiProperty.concerns.includes("Storm damage") ||
              apiProperty.concerns.includes("Wind damage") ||
              apiProperty.concerns.includes("Storm Risk") ||
              apiProperty.concerns.includes("Wind Risk"))) ||
          false,
        liability: apiProperty.extraCoverage?.publicLiability || false,
      },
      documents: [
        { name: "Certificate of Insurance", type: "certificate", url: "#" },
        { name: "Policy Document", type: "policy", url: "#" },
        { name: "Property Photos", type: "photos", url: "#" },
      ],
      propertyType: apiProperty.propertyType,
      buildingMaterials: apiProperty.buildingMaterials,
      concerns: apiProperty.concerns,
      extraCoverage: apiProperty.extraCoverage,
    };
  }, [propertyData]);

  // Get wallet balance from real API data
  const walletBalance = useMemo(() => {
    return walletData?.data?.wallet?.balance || 0;
  }, [walletData]);

  const coverageOptions = [
    {
      id: "liability",
      name: "Public Liability",
      price: 8000,
      description: "Protection against third-party claims",
    },
    {
      id: "contents",
      name: "Contents Insurance",
      price: 12000,
      description: "Coverage for personal belongings",
    },
    {
      id: "lossOfRent",
      name: "Loss of Rent",
      price: 6000,
      description: "Compensation for rental income loss",
    },
  ];

  const handleFundWallet = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      addToast({
        type: "error",
        title: "Invalid Amount",
        message: "Please enter a valid amount to fund your wallet",
      });
      return;
    }

    setLoading(true);
    // try {
    //   // Simulate API call
    //   await new Promise((resolve) => setTimeout(resolve, 2000));
    //   addToast({
    //     type: "success",
    //     title: "Wallet Funded Successfully!",
    //     message: `₦${parseFloat(
    //       fundAmount
    //     ).toLocaleString()} has been added to your wallet`,
    //   });
    //   setShowWalletModal(false);
    //   setFundAmount("");
    // } catch {
    //   addToast({
    //     type: "error",
    //     title: "Funding Failed",
    //     message: "Please try again or contact support",
    //   });
    // } finally {
    //   setLoading(false);
    // }
    try {
      const response = await fundWallet({
        amount: parseFloat(fundAmount),
        email: user.email,
      }).unwrap();

      console.log("Fund Wallet Response:", response);

      // Check if we have the authorization URL from Paystack
      if (response?.data?.data?.authorizationUrl) {
        // Navigate to the Paystack payment page inline
        window.location.href = response.data.data.authorizationUrl;

        addToast({
          type: "success",
          title: "Payment Initiated",
          message: "Redirecting to Paystack for payment...",
        });

        // Close the fund modal
        setShowWalletModal(false);
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

  const handleEarlyPayment = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      addToast({
        type: "success",
        title: "Payment Successful!",
        message: "Your next premium has been paid early. Thank you!",
      });
    } catch {
      addToast({
        type: "error",
        title: "Payment Failed",
        message: "Please try again or contact support",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      addToast({
        type: "success",
        title: "Subscription Cancelled",
        message:
          "Your policy will remain active until the current term expires",
      });
      setShowCancelModal(false);
    } catch {
      addToast({
        type: "error",
        title: "Cancellation Failed",
        message: "Please contact support for assistance",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard/properties")}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </button>

            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
              </div>
            ) : property ? (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Property Details
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Policy #{property.policyNumber}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      property.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400"
                    }`}
                  >
                    {property.status === "active" ? "Active Policy" : "Pending"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Property not found
                </p>
              </div>
            )}
          </div>

          {!isLoading && property && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Property Information */}
                <Card className="p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Property Information
                    </h2>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                        Basic Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Address
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {property.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Year Built
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {property.yearBuilt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Camera className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Photos
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {property.images} uploaded
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                        Coverage Details
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(property.coverage).map(
                          ([key, covered]) => (
                            <div
                              key={key}
                              className="flex items-center space-x-2"
                            >
                              {covered ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-gray-400" />
                              )}
                              <span
                                className={`text-sm ${
                                  covered
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {key.charAt(0).toUpperCase() + key.slice(1)}{" "}
                                Protection
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Coverage Upgrade Options */}
                <Card
                  className="p-6 animate-fade-in"
                  style={{ animationDelay: "150ms" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Upgrade Your Coverage
                    </h2>
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {coverageOptions.map((option) => (
                      <div
                        key={option.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
                      >
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          {option.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {option.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            +₦{option.price.toLocaleString()}/year
                          </span>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Documents */}
                <Card
                  className="p-6 animate-fade-in"
                  style={{ animationDelay: "300ms" }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Documents & Certificates
                  </h2>

                  <div className="space-y-3">
                    {property.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {doc.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Wallet Balance */}
                <Card
                  className="p-6 animate-fade-in"
                  style={{ animationDelay: "450ms" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Wallet Balance
                    </h3>
                    <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      ₦{walletBalance.toLocaleString()}
                    </p>
                    <Button
                      className="w-full mb-3"
                      onClick={() => setShowWalletModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use wallet for instant payments
                    </p>
                  </div>
                </Card>

                {/* Payment Information */}
                <Card
                  className="p-6 animate-fade-in"
                  style={{ animationDelay: "600ms" }}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Payment Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current Tier
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {property.tier}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Annual Premium
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₦{property.premium.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Next Payment
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(property.nextPayment).toLocaleDateString(
                          "en-NG",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card
                  className="p-6 animate-fade-in"
                  style={{ animationDelay: "750ms" }}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleEarlyPayment}
                      loading={loading}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Early
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Upgrade Coverage
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Policy Settings
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      onClick={() => setShowCancelModal(true)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fund Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fund Wallet
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Amount (₦)"
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="Enter amount to fund"
                min="100"
              />

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowWalletModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleFundWallet}
                  loading={loading}
                >
                  Fund Wallet
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cancel Subscription
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Are you sure you want to cancel?
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Your policy will remain active until{" "}
                    {property &&
                      new Date(property.nextPayment).toLocaleDateString(
                        "en-NG"
                      )}
                    . After that, your property will no longer be covered.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Policy
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={handleCancelSubscription}
                  loading={loading}
                >
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
}
