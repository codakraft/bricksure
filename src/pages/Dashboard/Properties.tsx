import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Camera, Calendar, MoreVertical } from "lucide-react";
import { Layout } from "../../components/Layout/Layout";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { ApplicationTracker } from "./ApplicationTracker";
import { useGetPropertiesQuery } from "../../services";

export function Properties() {
  const navigate = useNavigate();
  const { data: propertiesData, isLoading } = useGetPropertiesQuery();

  const properties = useMemo(() => {
    if (!propertiesData?.data) return [];

    return propertiesData.data.map((property) => ({
      id: property._id,
      address: property.address,
      type: property.occupancyStatus, // Using occupancyStatus as type
      status: property.status,
      yearBuilt: property.year,
      images: 0, // Default to 0 since images aren't in API response
      lastUpdated: property.updatedAt,
      premium: property.totalAmount,
      policyCode: property.policyCode,
      propertyType: property.propertyType,
    }));
  }, [propertiesData]);

  // Get the most recent pending application for ApplicationTracker
  const pendingApplication = useMemo(() => {
    if (!properties.length) return null;

    const pendingProperty = properties.find((p) => p.status === "pending");
    if (!pendingProperty) return null;

    const mapStatus = (
      propertyStatus: string
    ): "pending-review" | "underwriting" | "approval" | "approved" => {
      switch (propertyStatus.toLowerCase()) {
        case "pending":
          return "pending-review";
        case "approved":
          return "approved";
        case "underwriting":
          return "underwriting";
        case "approval":
          return "approval";
        default:
          return "pending-review";
      }
    };

    return {
      id: pendingProperty.policyCode || pendingProperty.id,
      status: mapStatus(pendingProperty.status),
      submittedDate: pendingProperty.lastUpdated,
      propertyAddress: pendingProperty.address,
    };
  }, [properties]);

  // Navigation helpers
  const handleViewProperty = (propertyId: string) => {
    navigate(`/dashboard/properties/${propertyId}/details`);
  };

  const handleGetQuote = () => {
    navigate("/dashboard/quote");
  };

  const handleAddProperty = () => {
    navigate("/dashboard/properties/new");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case "owner":
      case "owner-occupied":
        return "Owner-Occupied";
      case "rental":
      case "rented":
        return "Rental Property";
      case "shortlet":
      case "short-let":
        return "Short-let";
      case "commercial":
        return "Commercial";
      case "development":
      case "under development":
        return "Under Development";
      case "vacant":
        return "Vacant";
      default:
        return type || "Unknown";
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Properties
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your property portfolio
              </p>
            </div>
            <Button onClick={handleGetQuote}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>

          {/* Show Application Tracker for pending applications */}
          {pendingApplication && (
            <div className="mb-8">
              <ApplicationTracker
                status={pendingApplication.status}
                applicationId={pendingApplication.id}
                submittedDate={pendingApplication.submittedDate}
                propertyAddress={pendingApplication.propertyAddress}
              />
            </div>
          )}

          {isLoading ? (
            /* Loading State */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : properties.length === 0 ? (
            /* Empty State */
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No properties yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add your first property to get started with insurance quotes
                </p>
                <Button onClick={handleAddProperty}>
                  Add Your First Property
                </Button>
              </div>
            </Card>
          ) : (
            /* Properties Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card
                  key={property.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Property Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>

                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          property.status
                        )}`}
                      >
                        {property.status.charAt(0).toUpperCase() +
                          property.status.slice(1)}
                      </span>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    {/* Address */}
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {property.address}
                    </h3>

                    {/* Property Details */}
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {getTypeLabel(property.type)}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Built {property.yearBuilt}
                      </div>
                      <div className="flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        {property.images} photos
                      </div>
                    </div>

                    {/* Premium */}
                    {property.premium && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Annual Premium
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          ₦{property.premium.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewProperty(property.id)}
                      >
                        View Details
                      </Button>
                      {property.status === "approved" && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={handleGetQuote}
                        >
                          Get Quote
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
