import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  MoreVertical,
  RefreshCw,
  Archive,
} from "lucide-react";
import { Layout } from "../../components/Layout/Layout";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { useGetPropertiesQuery } from "../../services";

export function Policies() {
  const [activeTab, setActiveTab] = useState<"active" | "expired" | "all">(
    "active"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: propertiesData, isLoading } = useGetPropertiesQuery();

  const properties = useMemo(() => {
    if (!propertiesData?.data) return [];

    return propertiesData.data.map((property) => ({
      id: property._id,
      propertyAddress: property.address,
      type: property.occupancyStatus, // Using occupancyStatus as type
      status: property.status,
      yearBuilt: property.year,
      images: 0, // Default to 0 since images aren't in API response
      lastUpdated: property.updatedAt,
      premium: property.amountPaid,
      policyNumber: property.policyCode,
      propertyType: property.propertyType,
      paymentFrequency: property.paymentFrequency || "Annual",
      totalAmount: property.totalAmount,
      coverage: property.extraCoverage,
      startDate: property.createdAt,
      nextPayment: property.nextPayment,
      // Add other fields as needed
    }));
  }, [propertiesData]);

  console.log("Fetched properties:", properties);

  // Transform properties data for policies display
  const policies = useMemo(() => {
    return properties.map((property) => {
      // Determine policy tier based on coverage or premium amount
      const getTier = (coverage: any, premium: number) => {
        if (!coverage) return "Basic";
        const coverageCount = Object.values(coverage).filter(Boolean).length;
        if (coverageCount >= 4) return "Plus";
        if (coverageCount >= 2) return "Standard";
        return "Basic";
      };

      // Convert coverage object to array of strings
      const getCoverageArray = (coverage: any) => {
        if (!coverage) return ["Fire", "Lightning"];
        const coverageList = [];
        if (coverage.lossOfRent) coverageList.push("Loss of Rent");
        if (coverage.contentInsurance) coverageList.push("Contents");
        if (coverage.publicLiability) coverageList.push("Public Liability");
        if (coverage.accidentalDamage) coverageList.push("Accidental Damage");

        // Add default coverage if none specified
        if (coverageList.length === 0) {
          coverageList.push("Fire", "Storm", "Lightning");
        } else {
          // Always include basic coverage
          coverageList.unshift("Fire", "Storm");
        }

        return [...new Set(coverageList)]; // Remove duplicates
      };

      // Calculate end date (assuming 1 year policy)
      const startDate = new Date(property.startDate);
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 1);

      return {
        id: property.id,
        propertyAddress: property.propertyAddress,
        policyNumber:
          property.policyNumber ||
          `BS-${new Date().getFullYear()}-${property.id.slice(-6)}`,
        status: property.status,
        tier: getTier(property.coverage, property.premium || 0),
        premium: property.premium || property.totalAmount || 0,
        startDate: property.startDate,
        endDate: endDate.toISOString(),
        nextPayment: property.nextPayment,
        certificateUrl: "#",
        policyDocUrl: "#",
        coverage: getCoverageArray(property.coverage),
        propertyType: property.propertyType,
        paymentFrequency: property.paymentFrequency,
      };
    });
  }, [properties]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" &&
        (policy.status === "approved" || policy.status === "active")) ||
      (activeTab === "expired" && policy.status === "expired");

    const matchesSearch =
      policy.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      policy.status === filterStatus ||
      (filterStatus === "active" &&
        (policy.status === "approved" || policy.status === "active"));

    return matchesTab && matchesSearch && matchesFilter;
  });

  const downloadAllHistory = () => {
    // Simulate download
    const element = document.createElement("a");
    element.href =
      "data:text/plain;charset=utf-8," +
      encodeURIComponent(
        "Policy History Report\n\nGenerated on: " +
          new Date().toLocaleDateString()
      );
    element.download = "policy-history.pdf";
    element.click();
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                My Policies
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all your insurance policies
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={downloadAllHistory}>
                <Download className="h-4 w-4 mr-2" />
                Download History
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 mr-4 transition-transform duration-300 hover:rotate-6">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Policies
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {
                      properties.filter(
                        (p) => p.status === "approved" || p.status === "active"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: "150ms" }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 mr-4 transition-transform duration-300 hover:rotate-6">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Coverage
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₦
                    {properties
                      .filter(
                        (p) => p.status === "approved" || p.status === "active"
                      )
                      .reduce(
                        (sum, p) => sum + (p.premium || p.totalAmount || 0),
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-700 mr-4 transition-transform duration-300 hover:rotate-6">
                  <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Next Renewal
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {properties.find((p) => p.nextPayment)
                      ? new Date(
                          properties.find((p) => p.nextPayment)!.nextPayment!
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "No renewals"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card
            className="p-6 mb-8 animate-fade-in"
            style={{ animationDelay: "450ms" }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                  {
                    key: "active",
                    label: "Active",
                    count: properties.filter(
                      (p) => p.status === "approved" || p.status === "active"
                    ).length,
                  },
                  {
                    key: "expired",
                    label: "Expired",
                    count: properties.filter((p) => p.status === "expired")
                      .length,
                  },
                  { key: "all", label: "All", count: properties.length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.key
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search policies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Policies List */}
          {isLoading ? (
            <Card className="p-12 text-center animate-fade-in">
              <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Loading your policies...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we fetch your insurance policies
              </p>
            </Card>
          ) : filteredPolicies.length === 0 ? (
            <Card className="p-12 text-center animate-fade-in">
              <Archive className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No policies found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "You don't have any policies in this category yet"}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/dashboard/quote">Get Your First Quote</Link>
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPolicies.map((policy, index) => (
                <Card
                  key={policy.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {policy.propertyAddress}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              policy.status
                            )}`}
                          >
                            {getStatusIcon(policy.status)}
                            <span className="ml-1">
                              {policy.status.charAt(0).toUpperCase() +
                                policy.status.slice(1)}
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Policy: {policy.policyNumber}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {policy.tier} Tier • ₦
                          {policy.premium.toLocaleString()}/year
                        </p>
                      </div>

                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Policy Period
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(policy.startDate).toLocaleDateString()} -{" "}
                          {new Date(policy.endDate).toLocaleDateString()}
                        </p>
                      </div>

                      {policy.nextPayment && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Next Payment
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(policy.nextPayment).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Coverage
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {policy.coverage.slice(0, 3).map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 rounded"
                            >
                              {item}
                            </span>
                          ))}
                          {policy.coverage.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                              +{policy.coverage.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <Link to={`/dashboard/properties/${policy.id}/details`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Certificate
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Policy Doc
                        </Button>
                      </div>

                      {policy.status === "active" && (
                        <Button size="sm" asChild>
                          <Link
                            to={`/dashboard/properties/${policy.id}/details`}
                          >
                            Manage Policy
                          </Link>
                        </Button>
                      )}

                      {policy.status === "expired" && (
                        <Button size="sm" variant="outline">
                          Renew Policy
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
