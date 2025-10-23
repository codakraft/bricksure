import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  MessageCircle, 
  Download, 
  Eye, 
  Phone,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Upload,
  Send,
  Paperclip
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useToast } from '../../components/UI/Toast';

export function ClaimTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'timeline' | 'messages'>('timeline');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock claim data
  const claim = {
    id: id,
    claimRef: 'CLM-01H2K3M4P5Q6R7S8T9U0V',
    policyNumber: 'BS-2024-001234',
    claimType: 'HOME',
    causeOfLoss: 'FIRE',
    lossDate: '2024-01-15T14:30:00+01:00',
    address: '15 Admiralty Way, Lekki Phase 1, Lagos',
    description: 'Kitchen fire caused by electrical fault in the oven. Fire spread to adjacent cabinets and caused smoke damage to the living room.',
    estimate: 150000,
    assessedLoss: 135000,
    approvedAmount: 125000,
    status: 'APPROVED',
    adjusterName: 'Sarah Johnson',
    adjusterPhone: '+234 801 234 5678',
    adjusterEmail: 'sarah.johnson@bricksure.ng',
    sla: { targetHrs: 72, elapsedHrs: 48 },
    createdAt: '2024-01-15T15:00:00+01:00',
    lastUpdate: '2024-01-18T10:00:00+01:00'
  };

  const timeline = [
    {
      id: 1,
      status: 'FILED',
      title: 'Claim Filed',
      description: 'Your claim has been successfully submitted and assigned reference number.',
      timestamp: '2024-01-15T15:00:00+01:00',
      completed: true,
      actor: 'System',
      details: 'Claim automatically assigned to triage queue'
    },
    {
      id: 2,
      status: 'TRIAGE',
      title: 'Initial Review',
      description: 'Claim reviewed and categorized for processing.',
      timestamp: '2024-01-15T16:30:00+01:00',
      completed: true,
      actor: 'Claims Team',
      details: 'Claim categorized as standard fire damage case'
    },
    {
      id: 3,
      status: 'ASSIGNED',
      title: 'Adjuster Assigned',
      description: 'Sarah Johnson has been assigned as your claims adjuster.',
      timestamp: '2024-01-16T09:00:00+01:00',
      completed: true,
      actor: 'Sarah Johnson',
      details: 'Adjuster will contact you within 24 hours'
    },
    {
      id: 4,
      status: 'ASSESSMENT',
      title: 'Assessment Complete',
      description: 'Property assessment completed and damage evaluated.',
      timestamp: '2024-01-17T14:00:00+01:00',
      completed: true,
      actor: 'Sarah Johnson',
      details: 'Site visit completed, photos and measurements taken'
    },
    {
      id: 5,
      status: 'APPROVED',
      title: 'Claim Approved',
      description: 'Your claim has been approved for ₦125,000.',
      timestamp: '2024-01-18T10:00:00+01:00',
      completed: true,
      actor: 'Claims Manager',
      details: 'Approved amount: ₦125,000 (after ₦10,000 deductible)'
    },
    {
      id: 6,
      status: 'PAYOUT',
      title: 'Payout Processing',
      description: 'Payment is being processed to your bank account.',
      timestamp: null,
      completed: false,
      actor: 'Finance Team',
      details: 'Expected completion: 2-3 business days'
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'adjuster',
      senderName: 'Sarah Johnson',
      message: 'Hello! I\'ve been assigned to your claim. I\'ll be conducting a site visit tomorrow at 2 PM. Please ensure someone is available to provide access.',
      timestamp: '2024-01-16T10:30:00+01:00',
      attachments: []
    },
    {
      id: 2,
      sender: 'user',
      senderName: 'You',
      message: 'Thank you Sarah. I\'ll be available at 2 PM tomorrow. The main entrance will be unlocked.',
      timestamp: '2024-01-16T11:00:00+01:00',
      attachments: []
    },
    {
      id: 3,
      sender: 'adjuster',
      senderName: 'Sarah Johnson',
      message: 'Site visit completed. I\'ve taken photos and measurements. Could you please provide receipts for the damaged appliances if you have them?',
      timestamp: '2024-01-17T15:30:00+01:00',
      attachments: [
        { name: 'site_photos.zip', size: '2.3 MB' },
        { name: 'assessment_report.pdf', size: '156 KB' }
      ]
    },
    {
      id: 4,
      sender: 'user',
      senderName: 'You',
      message: 'I\'ve attached the receipts for the oven and microwave that were damaged.',
      timestamp: '2024-01-17T18:00:00+01:00',
      attachments: [
        { name: 'oven_receipt.pdf', size: '89 KB' },
        { name: 'microwave_receipt.jpg', size: '234 KB' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILED':
        return 'bg-blue-500';
      case 'TRIAGE':
        return 'bg-yellow-500';
      case 'ASSIGNED':
        return 'bg-purple-500';
      case 'ASSESSMENT':
        return 'bg-orange-500';
      case 'APPROVED':
        return 'bg-green-500';
      case 'DECLINED':
        return 'bg-red-500';
      case 'PAYOUT':
        return 'bg-indigo-500';
      case 'CLOSED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addToast({
        type: 'success',
        title: 'Message Sent',
        message: 'Your message has been sent to the adjuster'
      });
      
      setNewMessage('');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Send',
        message: 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = (filename: string) => {
    addToast({
      type: 'success',
      title: 'Download Started',
      message: `Downloading ${filename}...`
    });
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard/claims')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Claims
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Claim #{claim.claimRef.slice(-8)}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Policy: {claim.policyNumber} • Filed {formatDate(claim.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  claim.status === 'APPROVED' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                }`}>
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Claim Summary */}
              <Card className="p-6 animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Claim Summary
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">Incident Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Cause of Loss</p>
                          <p className="font-medium text-gray-900 dark:text-white">{claim.causeOfLoss}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Date of Loss</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatDate(claim.lossDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                          <p className="font-medium text-gray-900 dark:text-white">{claim.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">Financial Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Initial Estimate</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(claim.estimate)}</p>
                        </div>
                      </div>
                      {claim.assessedLoss && (
                        <div className="flex items-start space-x-3">
                          <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Assessed Loss</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(claim.assessedLoss)}</p>
                          </div>
                        </div>
                      )}
                      {claim.approvedAmount && (
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Approved Amount</p>
                            <p className="font-medium text-green-600 dark:text-green-400 text-lg">
                              {formatCurrency(claim.approvedAmount)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {claim.description}
                  </p>
                </div>
              </Card>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'timeline'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'messages'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Messages ({messages.length})
                  </button>
                </nav>
              </div>

              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <Card className="p-6 animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Claim Progress
                  </h3>
                  
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    
                    <div className="space-y-8">
                      {timeline.map((event, index) => (
                        <div key={event.id} className="relative flex items-start space-x-4">
                          {/* Timeline Dot */}
                          <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${
                            event.completed 
                              ? `${getStatusColor(event.status)} text-white shadow-lg` 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                          }`}>
                            {event.completed ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <Clock className="h-6 w-6" />
                            )}
                          </div>
                          
                          {/* Event Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-medium ${
                                event.completed 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {event.title}
                              </h4>
                              {event.timestamp && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(event.timestamp)}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${
                              event.completed 
                                ? 'text-gray-600 dark:text-gray-300' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {event.description}
                            </p>
                            {event.details && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {event.details}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              By: {event.actor}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <Card className="p-6 animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Messages with Adjuster
                  </h3>
                  
                  {/* Messages List */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium">
                              {message.senderName}
                            </span>
                            <span className={`text-xs ${
                              message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                          
                          {message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <button
                                  key={index}
                                  onClick={() => downloadDocument(attachment.name)}
                                  className={`flex items-center space-x-2 text-xs p-2 rounded ${
                                    message.sender === 'user'
                                      ? 'bg-blue-400 hover:bg-blue-300'
                                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                  } transition-colors`}
                                >
                                  <Paperclip className="h-3 w-3" />
                                  <span>{attachment.name}</span>
                                  <span className="text-xs opacity-75">({attachment.size})</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Message Input */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message to the adjuster..."
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleSendMessage}
                          loading={loading}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Adjuster Info */}
              <Card className="p-6 animate-fade-in">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Adjuster</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{claim.adjusterName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Claims Adjuster</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Adjuster
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </Card>

              {/* SLA Status */}
              <Card className="p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Processing Time</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Elapsed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{claim.sla.elapsedHrs}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Target:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{claim.sla.targetHrs}h</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (claim.sla.elapsedHrs / claim.sla.targetHrs) >= 1 ? 'bg-red-500' :
                        (claim.sla.elapsedHrs / claim.sla.targetHrs) >= 0.8 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((claim.sla.elapsedHrs / claim.sla.targetHrs) * 100, 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs ${
                    (claim.sla.elapsedHrs / claim.sla.targetHrs) >= 1 ? 'text-red-600 dark:text-red-400' :
                    (claim.sla.elapsedHrs / claim.sla.targetHrs) >= 0.8 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {claim.status === 'APPROVED' ? 'Processing completed on time' : 
                     (claim.sla.elapsedHrs / claim.sla.targetHrs) >= 1 ? 'Processing time exceeded' :
                     `${claim.sla.targetHrs - claim.sla.elapsedHrs}h remaining`}
                  </p>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Acknowledgment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Evidence
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Assessment Report
                  </Button>
                  {claim.status === 'APPROVED' && (
                    <Button className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Settlement Letter
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}