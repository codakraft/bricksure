import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  MessageCircle,
  Calendar,
  DollarSign,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';

export function Claims() {
  const [claims, setClaims] = useState([
    {
      id: 'CLM-2024-001',
      claimRef: 'CLM-01H2K3M4P5Q6R7S8T9U0V',
      policyNumber: 'BS-2024-001234',
      claimType: 'HOME',
      causeOfLoss: 'FIRE',
      lossDate: '2024-01-15T14:30:00+01:00',
      estimate: 150000,
      status: 'ASSESSMENT',
      adjusterName: 'Sarah Johnson',
      sla: { targetHrs: 72, elapsedHrs: 48 },
      lastUpdate: '2024-01-16T10:00:00+01:00'
    },
    {
      id: 'CLM-2024-002',
      claimRef: 'CLM-01H2K3M4P5Q6R7S8T9U0W',
      policyNumber: 'BS-2024-001235',
      claimType: 'HOME',
      causeOfLoss: 'FLOOD',
      lossDate: '2024-01-10T08:15:00+01:00',
      estimate: 75000,
      status: 'APPROVED',
      adjusterName: 'Michael Chen',
      approvedAmount: 65000,
      sla: { targetHrs: 72, elapsedHrs: 68 },
      lastUpdate: '2024-01-12T16:30:00+01:00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      case 'TRIAGE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'ASSIGNED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400';
      case 'ASSESSMENT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'DECLINED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      case 'PAYOUT':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-400';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FILED':
        return <FileText className="h-4 w-4" />;
      case 'TRIAGE':
      case 'ASSIGNED':
      case 'ASSESSMENT':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
      case 'PAYOUT':
      case 'CLOSED':
        return <CheckCircle className="h-4 w-4" />;
      case 'DECLINED':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSLAColor = (sla: { targetHrs: number; elapsedHrs: number }) => {
    const percentage = (sla.elapsedHrs / sla.targetHrs) * 100;
    if (percentage >= 100) return 'text-red-600 dark:text-red-400';
    if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
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

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claimRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.causeOfLoss.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || claim.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: claims.length,
    pending: claims.filter(c => ['FILED', 'TRIAGE', 'ASSIGNED', 'ASSESSMENT'].includes(c.status)).length,
    approved: claims.filter(c => c.status === 'APPROVED').length,
    closed: claims.filter(c => c.status === 'CLOSED').length
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                My Claims
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                File and track your insurance claims
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild>
                <Link to="/dashboard/claims/new">
                  <Plus className="h-4 w-4 mr-2" />
                  File New Claim
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 mr-4">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Claims</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-700 mr-4">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '450ms' }}>
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mr-4">
                  <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Closed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.closed}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search claims..."
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
                  <option value="FILED">Filed</option>
                  <option value="TRIAGE">Triage</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="ASSESSMENT">Assessment</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DECLINED">Declined</option>
                  <option value="PAYOUT">Payout</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Claims List */}
          {filteredClaims.length === 0 ? (
            <Card className="p-12 text-center animate-fade-in">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No claims found' : 'No claims yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'File your first claim to get started'}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/dashboard/claims/new">File Your First Claim</Link>
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredClaims.map((claim, index) => (
                <Card 
                  key={claim.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Claim #{claim.claimRef.slice(-8)}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                            {getStatusIcon(claim.status)}
                            <span className="ml-1">{claim.status.charAt(0).toUpperCase() + claim.status.slice(1).toLowerCase()}</span>
                          </span>
                          <span className={`text-xs font-medium ${getSLAColor(claim.sla)}`}>
                            SLA: {claim.sla.elapsedHrs}h / {claim.sla.targetHrs}h
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Policy: {claim.policyNumber} • {claim.causeOfLoss.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Loss Date: {formatDate(claim.lossDate)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estimated Loss</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(claim.estimate)}
                        </p>
                      </div>
                      
                      {claim.approvedAmount && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Approved Amount</p>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(claim.approvedAmount)}
                          </p>
                        </div>
                      )}
                      
                      {claim.adjusterName && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Adjuster</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {claim.adjusterName}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/dashboard/claims/${claim.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Documents
                        </Button>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Updated: {formatDate(claim.lastUpdate)}
                      </p>
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