import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Star, Users, DollarSign, Calendar, FileText, ArrowRight } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

export function Coverage() {
  const coverageTiers = [
    {
      name: 'Basic',
      icon: Shield,
      price: 'From ₦15,000/year',
      description: 'Essential protection for core risks',
      features: [
        'Fire protection',
        'Lightning coverage', 
        'Explosion damage',
        'Basic theft protection',
        '24/7 claims support'
      ],
      color: 'bg-blue-500',
      borderColor: 'border-blue-200 dark:border-blue-800',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      popular: false
    },
    {
      name: 'Standard',
      icon: FileText,
      price: 'From ₦25,000/year',
      description: 'Comprehensive everyday protection',
      features: [
        'Everything in Basic',
        'Burglary/theft coverage',
        'Flood protection',
        'Storm & water damage',
        'Malicious damage',
        'Alternative accommodation'
      ],
      color: 'bg-green-500',
      borderColor: 'border-green-200 dark:border-green-800',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      popular: true
    },
    {
      name: 'Plus',
      icon: Star,
      price: 'From ₦40,000/year',
      description: 'Premium comprehensive coverage',
      features: [
        'Everything in Standard',
        'Accidental damage',
        'Public liability cover',
        'Loss of rent coverage',
        'Contents insurance',
        'Legal expenses'
      ],
      color: 'bg-purple-500',
      borderColor: 'border-purple-200 dark:border-purple-800',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      popular: false
    },
    {
      name: 'Custom',
      icon: Users,
      price: 'Quote on request',
      description: 'Tailored for unique properties',
      features: [
        'Bespoke coverage options',
        'Builder requirements',
        'Special property types',
        'Flexible policy terms',
        'Dedicated account manager',
        'Priority claims handling'
      ],
      color: 'bg-orange-500',
      borderColor: 'border-orange-200 dark:border-orange-800',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      popular: false
    }
  ];

  const riders = [
    {
      name: 'Fire Protection',
      description: 'Comprehensive fire damage coverage including smoke and heat damage',
      price: 'Included in Basic+'
    },
    {
      name: 'Flood Coverage',
      description: 'Protection against flood damage from natural disasters',
      price: 'From ₦5,000/year'
    },
    {
      name: 'Burglary Protection',
      description: 'Coverage for theft and burglary with forced entry',
      price: 'From ₦3,000/year'
    },
    {
      name: 'Public Liability',
      description: 'Protection against third-party injury or property damage claims',
      price: 'From ₦8,000/year'
    },
    {
      name: 'Loss of Rent',
      description: 'Compensation for rental income lost due to covered damages',
      price: 'From ₦6,000/year'
    },
    {
      name: 'Contents Insurance',
      description: 'Coverage for personal belongings and furniture inside the property',
      price: 'From ₦10,000/year'
    }
  ];

  const paymentOptions = [
    {
      frequency: 'Monthly',
      description: 'Pay in small monthly installments',
      benefit: 'Better cash flow management',
      icon: Calendar
    },
    {
      frequency: 'Quarterly',
      description: 'Pay every 3 months',
      benefit: 'Balance convenience and savings',
      icon: Calendar
    },
    {
      frequency: 'Bi-Annual',
      description: 'Pay twice a year',
      benefit: 'Moderate discount applied',
      icon: Calendar
    },
    {
      frequency: 'Annual',
      description: 'Pay once a year',
      benefit: 'Maximum discount (up to 15% off)',
      icon: DollarSign
    }
  ];

  const paymentMethods = [
    'BrickSure Wallet (instant)',
    'Debit/Credit Cards',
    'Bank Transfer',
    'USSD Codes',
    'Mobile Money',
    'Direct Debit (annual plans)'
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <Shield className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Coverage & Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Transparent, flexible insurance backed by Sovereign Trust Insurance PLC. Choose the coverage that fits your property and budget.
            </p>
          </div>
        </div>
      </section>

      {/* Underwriter Notice */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 animate-fade-in">
            <Shield className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Underwritten by Sovereign Trust Insurance PLC
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              All BrickSure policies are backed by a licensed Nigerian insurer, regulated by NAICOM, 
              giving you complete peace of mind and regulatory protection.
            </p>
          </Card>
        </div>
      </section>

      {/* Coverage Tiers */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Coverage Tier
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From basic protection to comprehensive coverage, we have options for every property and budget
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coverageTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in ${
                  tier.popular ? 'ring-2 ring-green-500 shadow-lg' : ''
                } ${tier.borderColor}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 ${tier.color} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                  <tier.icon className="h-6 w-6 text-white" />
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {tier.price}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={tier.popular ? 'primary' : 'outline'}
                  asChild
                >
                  <Link to="/register">
                    {tier.name === 'Custom' ? 'Get Quote' : 'Choose Plan'}
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Optional Add-ons */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Optional Add-Ons (Riders)
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Enhance your coverage with these additional protection options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riders.map((rider, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {rider.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {rider.description}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                      {rider.price}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Flexible Payment Options
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose how and when you pay your premiums
            </p>
          </div>

          {/* Payment Frequencies */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Payment Frequencies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paymentOptions.map((option, index) => (
                <Card 
                  key={index} 
                  className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <option.icon className={`h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 ${
                    option.frequency === 'Annual' ? 'animate-bounce' : 'animate-pulse'
                  }`} />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {option.frequency}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {option.description}
                  </p>
                  <p className="text-green-600 dark:text-green-400 font-medium text-sm">
                    {option.benefit}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Payment Methods
              </h3>
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{method}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 animate-fade-in">
              <div className="text-center">
                <div className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4 flex items-center justify-center text-3xl font-bold animate-bounce">
                  ₦
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Transparent Pricing
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">No hidden fees or charges</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">Clear deductibles and excess amounts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">Instant quotes with breakdown</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">Sample premiums by state and LGA</span>
                  </div>
                </div>
              </div>
            </Card>
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
            Get an instant quote and see how affordable property insurance can be
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/register">
                Get Instant Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link to="/how-it-works">Learn How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}