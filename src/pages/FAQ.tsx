import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, Phone } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Link } from 'react-router-dom';

export function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    },
    {
      question: 'What is the claims process like?',
      answer: 'Report claims through your dashboard or call our 24/7 claims hotline. Upload supporting documents and photos. Our claims team will guide you through the entire process.'
    },
    {
      question: 'Are there any property types you don\'t cover?',
      answer: 'We cover most residential and commercial properties. Some high-risk properties may require special assessment. Contact us for specific cases.'
    },
    {
      question: 'Can I cancel my policy anytime?',
      answer: 'Yes, you can cancel your policy. Refunds are calculated based on the unused portion of your premium, minus any applicable fees.'
    },
    {
      question: 'How do I update my property information?',
      answer: 'Log into your dashboard and update property details. Major changes may require re-underwriting and could affect your premium.'
    },
    {
      question: 'What happens if I miss a premium payment?',
      answer: 'You\'ll receive reminders before your policy lapses. There\'s usually a grace period, but coverage may be suspended until payment is made.'
    },
    {
      question: 'Do you offer discounts for multiple properties?',
      answer: 'Yes, we offer portfolio discounts for customers with multiple properties. The discount increases with the number of properties insured.'
    },
    {
      question: 'How secure is my personal and financial information?',
      answer: 'We use bank-level encryption and comply with Nigerian data protection laws. Your information is never shared without your consent.'
    },
    {
      question: 'Can I transfer my policy to a new property owner?',
      answer: 'Policies can be transferred with proper documentation. The new owner must meet our underwriting requirements and may face premium adjustments.'
    },
    {
      question: 'What is not covered by my policy?',
      answer: 'Common exclusions include war, nuclear risks, wear and tear, and pre-existing damage. Your policy document contains the complete list of exclusions.'
    }
  ];

  const categories = [
    {
      title: 'Getting Started',
      faqs: faqs.slice(0, 4)
    },
    {
      title: 'Payments & Policies',
      faqs: faqs.slice(4, 8)
    },
    {
      title: 'Support & Claims',
      faqs: faqs.slice(8, 12)
    },
    {
      title: 'Advanced Topics',
      faqs: faqs.slice(12)
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <HelpCircle className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Find answers to common questions about BrickSure property insurance. Can't find what you're looking for? Contact our support team.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                {category.title}
              </h2>
              
              <div className="space-y-4">
                {category.faqs.map((faq, index) => {
                  const globalIndex = categoryIndex * 10 + index; // Unique index across all FAQs
                  return (
                    <Card 
                      key={globalIndex} 
                      className="overflow-hidden animate-fade-in hover:shadow-lg transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <button
                        className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                        onClick={() => setOpenFaq(openFaq === globalIndex ? null : globalIndex)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                            {faq.question}
                          </h3>
                          <ChevronDown 
                            className={`h-5 w-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                              openFaq === globalIndex ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openFaq === globalIndex ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-4">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Our support team is here to help. Get in touch through any of these channels and we'll get back to you quickly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
              <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Live Chat
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Chat with our support team in real-time
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Start Chat
              </Button>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
              <Phone className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Contact Support
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get help via phone, email, or contact form
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
            <Link to="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}