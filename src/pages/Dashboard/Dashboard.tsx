import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Home, FileText, Wallet, HelpCircle, Bell, Shield, Calendar, DollarSign } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';
import { ApplicationTracker } from './ApplicationTracker';

export function Dashboard() {
  const { user } = useAuth();

  // Mock application data - in real app this would come from API
  const mockApplication = {
    id: 'APP-2024-001',
    status: 'underwriting' as const,
    submittedDate: '2024-01-15T10:30:00Z',
    propertyAddress: '15 Admiralty Way, Lekki Phase 1, Lagos'
  };

  const dashboardTiles = [
    {
      title: 'Get a Quote',
      description: 'Quote and insure a new property',
      icon: Plus,
      href: '/dashboard/quote',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'My Properties',
      description: 'Manage your properties',
      icon: Home,
      href: '/dashboard/properties',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'My Policies',
      description: 'View and manage policies',
      icon: FileText,
      href: '/dashboard/policies',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Wallet',
      description: 'Fund wallet and view transactions',
      icon: Wallet,
      href: '/dashboard/wallet',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Support',
      description: 'Get help and contact us',
      icon: HelpCircle,
      href: '/contact',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  const statusCards = [
    {
      title: 'Next Renewal',
      value: 'March 15, 2025',
      description: 'Property at Victoria Island',
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Pending Review',
      value: '2 Properties',
      description: 'Awaiting approval',
      icon: Shield,
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Wallet Balance',
      value: '₦0.00',
      description: 'Available funds',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400'
    }
  ];

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your properties and policies in one place
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {statusCards.map((card, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mr-4 transition-transform duration-300 hover:rotate-6`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{card.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Application Tracker - Show if user has pending applications */}
          <div className="mb-8">
            <ApplicationTracker
              status={mockApplication.status}
              applicationId={mockApplication.id}
              submittedDate={mockApplication.submittedDate}
              propertyAddress={mockApplication.propertyAddress}
            />
          </div>

          {/* Main Dashboard Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {dashboardTiles.map((tile, index) => (
              <Link key={index} to={tile.href} className="group">
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200 group-hover:scale-[1.02] transform">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${tile.color} text-white transition-colors duration-200`}>
                      <tile.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {tile.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {tile.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>

          {/* Empty States */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No recent activity yet
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/quote">Get Your First Quote</Link>
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/quote">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Property
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/dashboard/wallet">
                    <Wallet className="h-4 w-4 mr-2" />
                    Fund Wallet
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/contact">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Get Help
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}