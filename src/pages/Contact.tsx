import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', formData);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      value: '+234 800 BRICK (27425)',
      description: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
      color: 'bg-green-500',
      action: 'tel:+2348002742425'
    },
    {
      icon: Mail,
      title: 'Email Us',
      value: 'hello@bricksure.ng',
      description: 'We respond within 2 hours',
      color: 'bg-blue-500',
      action: 'mailto:hello@bricksure.ng'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      value: 'Chat with Sarah',
      description: 'Available 24/7 for instant help',
      color: 'bg-purple-500',
      action: '#'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'Lagos, Nigeria',
      description: '15 Admiralty Way, Lekki Phase 1',
      color: 'bg-orange-500',
      action: '#'
    }
  ];

  const socialMedia = [
    {
      icon: Facebook,
      name: 'Facebook',
      handle: '@BrickSureNG',
      url: 'https://facebook.com/bricksureng',
      color: 'hover:text-blue-600'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      handle: '@BrickSureNG',
      url: 'https://twitter.com/bricksureng',
      color: 'hover:text-blue-400'
    },
    {
      icon: Instagram,
      name: 'Instagram',
      handle: '@bricksure.ng',
      url: 'https://instagram.com/bricksure.ng',
      color: 'hover:text-pink-500'
    },
    {
      icon: Linkedin,
      name: 'LinkedIn',
      handle: 'BrickSure Nigeria',
      url: 'https://linkedin.com/company/bricksure',
      color: 'hover:text-blue-700'
    }
  ];

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 2:00 PM' },
    { day: 'Sunday', hours: 'Closed (Emergency support available)' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Contact Support
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Need help? We're here for you. Reach out through any of these channels and our friendly team will assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose the method that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <Card 
                key={index}
                className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => {
                  if (method.action.startsWith('tel:') || method.action.startsWith('mailto:')) {
                    window.location.href = method.action;
                  }
                }}
              >
                <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110`}>
                  <method.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {method.title}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {method.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {method.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Office Hours */}
          <Card className="p-8 mb-16 animate-fade-in">
            <div className="text-center mb-8">
              <Clock className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Office Hours
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our support team is available during these hours
              </p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              {officeHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {schedule.day}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Social Media */}
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Follow Us
            </h3>
            <div className="flex justify-center space-x-6">
              {socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 ${social.color}`}
                >
                  <social.icon className="h-8 w-8 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                    {social.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {social.handle}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Send Us a Message
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Prefer to write? Fill out the form below and we'll get back to you within 2 hours.
            </p>
          </div>

          <Card className="p-8 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <Input
                label="Subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What can we help you with?"
                required
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Tell us more about how we can help you..."
                  required
                />
              </div>
              
              <Button type="submit" size="lg" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-12 bg-red-50 dark:bg-red-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">
              Emergency Claims Support
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              For urgent claims or emergencies outside office hours
            </p>
            <a
              href="tel:+2348001234567"
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Phone className="h-4 w-4 mr-2" />
              +234 800 123 4567
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}