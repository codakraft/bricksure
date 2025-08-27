import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, FileCheck, Users, ArrowRight, CheckCircle, ChevronDown, Star, DollarSign, FileText, Calendar } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { useState } from 'react';

export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: Clock,
      title: 'Fast Approvals',
      description: 'Get your property insured in minutes with our streamlined process'
    },
    {
      icon: FileCheck,
      title: 'Verifiable Certificate',
      description: 'Digital certificates with QR codes for instant verification'
    },
    {
      icon: Shield,
      title: 'Comprehensive Coverage',
      description: 'Fire, flood, burglary, and liability protection options'
    },
    {
      icon: Users,
      title: 'Nigeria-wide',
      description: 'Coverage available across all states and local government areas'
    }
  ];

  const propertyTypes = [
    'Owner-occupied homes',
    'Rental properties',
    'Short-let properties',
    'Commercial buildings',
    'Properties under development'
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Add Property',
      description: 'Upload photos and property details with GPS verification'
    },
    {
      step: 2,
      title: 'Get Quote',
      description: 'Choose from our flexible coverage tiers and payment options'
    },
    {
      step: 3,
      title: 'Pay Securely',
      description: 'Fund your wallet or pay directly via card, transfer, or USSD'
    },
    {
      step: 4,
      title: 'Get Certificate',
      description: 'Download your verifiable digital certificate instantly'
    }
  ];

  const coverageTiers = [
    {
      name: 'Basic',
      icon: Shield,
      description: 'Essential protection for core risks',
      features: ['Fire protection', 'Lightning coverage', 'Explosion damage'],
      color: 'bg-blue-500'
    },
    {
      name: 'Standard',
      icon: FileCheck,
      description: 'Comprehensive everyday protection',
      features: ['Everything in Basic', 'Burglary/theft', 'Flood protection', 'Storm & water damage'],
      color: 'bg-green-500'
    },
    {
      name: 'Plus',
      icon: Star,
      description: 'Premium comprehensive coverage',
      features: ['Everything in Standard', 'Accidental damage', 'Liability cover', 'Alternative accommodation'],
      color: 'bg-purple-500'
    },
    {
      name: 'Custom',
      icon: Users,
      description: 'Tailored for unique properties',
      features: ['Bespoke coverage', 'Builder requirements', 'Special property types', 'Flexible terms'],
      color: 'bg-orange-500'
    }
  ];

  const riders = [
    'Fire Protection',
    'Flood Coverage',
    'Burglary Protection',
    'Liability Cover',
    'Loss of Rent',
    'All-Risk Contents'
  ];

  const paymentFeatures = [
    {
      icon: Calendar,
      title: 'Flexible Frequencies',
      description: 'Monthly, quarterly, bi-annual, or annual payments'
    },
    {
      icon: DollarSign,
      title: 'Multiple Payment Methods',
      description: 'Wallet, cards, bank transfers, or USSD'
    },
    {
      icon: FileText,
      title: 'Instant Certificates',
      description: 'Verifiable PDF with QR code upon approval'
    }
  ];

  const faqs = [
    {
      question: 'How do I create an account with Bricksure?',
      answer: 'Simply sign up with your phone number or email, verify with an OTP, and complete basic KYC.'
    },
    {
      question: 'What documents do I need to insure my property?',
      answer: 'You\'ll need valid ID (BVN/NIN), property photos/videos, and title documents. Optional: valuation reports.'
    },
    {
      question: 'Why do I need to enable location when capturing my property?',
      answer: 'Location data ensures the address matches the actual property and prevents fraud.'
    },
    {
      question: 'What kinds of properties can I insure?',
      answer: 'Owner-occupied, rental, short-let, commercial, and even properties under development.'
    },
    {
      question: 'How often can I pay my premiums?',
      answer: 'Choose monthly, quarterly, bi-annual, or annual payments from your Bricksure wallet or linked accounts.'
    },
    {
      question: 'How quickly will I get my certificate after payment?',
      answer: 'Certificates are issued digitally, usually within minutes after underwriting approval.'
    },
    {
      question: 'What if my property photos are rejected?',
      answer: 'Photos must be taken within 72 hours and include location data. If rejected, you\'ll be prompted to retake and upload again.'
    },
    {
      question: 'Can I add multiple properties under one account?',
      answer: 'Yes, you can register and manage multiple properties with one Bricksure login.'
    },
    {
      question: 'How do I contact support if I have issues?',
      answer: 'Use the in-app Contact form, live chat, or call-back request. Each request generates a ticket ID.'
    },
    {
      question: 'What happens when my policy is about to expire?',
      answer: 'You\'ll get renewal reminders 30, 7, and 1 day before expiry. You can renew instantly from your dashboard.'
    },
    {
      question: 'Who underwrites Bricksure insurance policies?',
      answer: 'All policies purchased through Bricksure are underwritten by Sovereign Trust Insurance PLC, ensuring you\'re covered by a trusted Nigerian insurer.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 overflow-hidden">
              <span className="inline-block animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                Insure your space,
              </span>
              <br />
              <span className="inline-block text-blue-600 dark:text-blue-400 animate-bounce-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
                secure your peace
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              BrickSure lets homeowners, landlords, and builders in Nigeria insure properties in minutes—quote, pay, and get a verifiable certificate on your phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">Get a Quote</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/how-it-works">
                  How It Works <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Takes under 5 minutes for low-risk homes
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose BrickSure?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Modern insurance built for Nigeria's property market
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="text-center hover:shadow-md transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage & Pricing */}
      <section id="coverage-pricing" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Coverage & Pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Transparent, flexible insurance backed by Sovereign Trust Insurance PLC
            </p>
          </div>

          {/* Overview */}
          <Card className="p-8 mb-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 animate-fade-in">
            <Shield className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Underwritten by Sovereign Trust Insurance PLC
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              All Bricksure home insurance policies are backed by a licensed Nigerian insurer, 
              giving you complete peace of mind and regulatory protection.
            </p>
          </Card>

          {/* Coverage Tiers */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Coverage Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coverageTiers.map((tier, index) => (
                <Card 
                  key={index} 
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`w-12 h-12 ${tier.color} rounded-lg flex items-center justify-center mb-4`}>
                    <tier.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {tier.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {tier.description}
                  </p>
                  <ul className="space-y-2">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          {/* Riders */}
          <div className="mb-16">
            <Card className="p-8 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                Optional Add-Ons (Riders)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {riders.map((rider, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{rider}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Payment & Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {paymentFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <feature.icon className={`h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 ${
                  feature.title === 'Multiple Payment Methods' ? 'animate-pulse' : 
                  feature.title === 'Flexible Frequencies' ? 'animate-bounce' : 
                  'animate-pulse'
                }`} />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Pricing Note */}
          <Card className="p-6 text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 animate-fade-in">
            <div className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4 flex items-center justify-center text-2xl font-bold animate-bounce">
              ₦
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Transparent Pricing
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get instant quotes with clear deductibles and excess amounts. 
              Sample premiums available by state and LGA during your quote journey.
            </p>
          </Card>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              We Cover All Property Types
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {propertyTypes.map((type, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get insured in 4 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/register">Start Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to know about BrickSure
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card 
                  key={index} 
                  className="overflow-hidden animate-fade-in hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {index + 1}. {faq.question}
                      </h3>
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                          openFaq === index ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Still have questions?
              </p>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Protect Your Property?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Nigerians who trust BrickSure with their property insurance
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/register">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}