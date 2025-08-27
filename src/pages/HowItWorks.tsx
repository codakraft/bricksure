import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LiveChat } from '../components/UI/LiveChat';
import { 
  UserPlus, 
  MapPin, 
  Camera, 
  CreditCard, 
  FileCheck, 
  ChevronDown,
  Shield,
  MessageCircle,
  Phone,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

export function HowItWorks() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Create your account',
      subtitle: 'Sign up with your phone/email and verify with an OTP',
      icon: UserPlus,
      color: 'bg-blue-500',
      details: 'Sign up with your phone/email, verify with OTP, and complete quick KYC.',
      expanded: 'Get started by creating your BrickSure account using your phone number or email address. We\'ll send you a one-time password (OTP) to verify your identity. Complete a quick Know Your Customer (KYC) process with your BVN or NIN to ensure security and compliance.',
      tips: [
        'Have your BVN or NIN ready for quick verification',
        'Use a phone number you have access to for OTP',
        'Keep your email active for important updates'
      ]
    },
    {
      id: 2,
      title: 'Add your property',
      subtitle: 'Type your address and drop a pin on the map',
      icon: MapPin,
      color: 'bg-green-500',
      details: 'Enter your address, drop a map pin, capture fresh photos/videos, and upload supporting documents.',
      expanded: 'Provide your property address and use our interactive map to drop a precise pin at your location. Take fresh, geo-tagged photos and videos of your property (must be taken within 72 hours). Upload supporting documents like title deeds, valuation reports, or building permits.',
      tips: [
        'Enable location services for accurate geo-tagging',
        'Take photos in good lighting conditions',
        'Include exterior and interior shots',
        'Have your property documents ready to upload'
      ]
    },
    {
      id: 3,
      title: 'Get your quote',
      subtitle: 'See cover options instantly and choose how you pay',
      icon: FileCheck,
      color: 'bg-purple-500',
      details: 'Choose a coverage tier, add riders if needed, and pick your payment frequency.',
      expanded: 'Review our coverage tiers (Basic, Standard, Plus, or Custom) and select what works best for your property. Add optional riders like flood protection or liability cover. Choose your preferred payment frequency - monthly, quarterly, bi-annual, or annual.',
      tips: [
        'Compare coverage tiers carefully',
        'Consider adding flood protection if in a risk area',
        'Annual payments often offer better rates',
        'Review deductibles for each tier'
      ]
    },
    {
      id: 4,
      title: 'Pay securely',
      subtitle: 'Fund your wallet or use card/transfer/USSD',
      icon: CreditCard,
      color: 'bg-orange-500',
      details: 'Fund your Bricksure wallet or use card/transfer/USSD to pay your premium.',
      expanded: 'Complete your payment using multiple secure options. Fund your BrickSure wallet for faster future transactions, or pay directly using your debit/credit card, bank transfer, or USSD codes. All payments are processed securely with bank-level encryption.',
      tips: [
        'Wallet funding enables instant policy purchases',
        'All major Nigerian banks supported',
        'USSD works without internet connection',
        'Payment confirmations are instant'
      ]
    },
    {
      id: 5,
      title: 'Receive your certificate',
      subtitle: 'Your verifiable Certificate of Insurance arrives after approval',
      icon: Shield,
      color: 'bg-indigo-500',
      details: 'Once approved, download or share your digital Certificate of Insurance with a QR code.',
      expanded: 'After underwriting approval, receive your digital Certificate of Insurance instantly. The certificate includes a QR code for easy verification by banks, landlords, or authorities. Download the PDF or share it directly from your dashboard.',
      tips: [
        'Certificates are available immediately after approval',
        'QR codes enable instant verification',
        'Save a copy to your device for offline access',
        'Share directly with banks or landlords'
      ]
    }
  ];

  const toggleStep = (stepId: number) => {
    if (expandedStep === stepId) {
      setExpandedStep(null);
    } else {
      setExpandedStep(stepId);
      // Mark step as completed when expanded
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps([...completedSteps, stepId]);
      }
    }
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepExpanded = (stepId: number) => expandedStep === stepId;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Get your property insured in 5 simple steps. Tap each step to explore and see how easy it is to protect your property with BrickSure.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Play className="h-4 w-4" />
              <span>Interactive guide - tap to expand each step</span>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const isCompleted = isStepCompleted(step.id);
              const isExpanded = isStepExpanded(step.id);
              
              return (
                <Card 
                  key={step.id}
                  className={`overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-lg ${
                    isExpanded ? 'ring-2 ring-blue-500 shadow-xl' : ''
                  } ${isCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : ''}`}
                  style={{ 
                    animationDelay: `${index * 200}ms`,
                    transform: isExpanded ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div 
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                    onClick={() => toggleStep(step.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Step Icon */}
                        <div className={`relative p-3 rounded-full ${step.color} text-white transition-all duration-300 ${
                          isExpanded ? 'scale-110 shadow-lg' : ''
                        }`}>
                          <step.icon className="h-6 w-6" />
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Step Content */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Step {step.id}
                            </span>
                            {isCompleted && (
                              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 px-2 py-1 rounded-full">
                                Explored
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {step.subtitle}
                          </p>
                        </div>
                      </div>
                      
                      {/* Expand Icon */}
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="pt-6 space-y-4">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {step.expanded}
                        </p>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            💡 Pro Tips:
                          </h4>
                          <ul className="space-y-1">
                            {step.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Progress Indicator */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isStepCompleted(step.id) 
                      ? 'bg-green-500 scale-110' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {completedSteps.length} of {steps.length} steps explored
            </p>
          </div>
        </div>
      </section>

      {/* Underwriter Notice */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              <strong>All policies are underwritten by Sovereign Trust Insurance PLC</strong>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Licensed and regulated by NAICOM, ensuring your coverage is backed by a trusted Nigerian insurer.
            </p>
          </Card>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Insurance doesn't have to feel complicated. Chat with our assistant anytime or contact an agent who can guide you through the process.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
              <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Chat Assistant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get instant answers to common questions
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <button onClick={() => setChatOpen(true)} className="w-full">
                  Start Chat
                </button>
              </Button>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
              <Phone className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Contact Agent
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Speak with a human expert
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of Nigerians protecting their properties with BrickSure
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/register">
              Create Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Live Chat Component */}
      <LiveChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </Layout>
  );
}