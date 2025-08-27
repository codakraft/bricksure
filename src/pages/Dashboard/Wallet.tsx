import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Download, 
  Eye, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  X,
  Smartphone,
  Building2
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useToast } from '../../components/UI/Toast';

export function WalletPage() {
  const [showFundModal, setShowFundModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { addToast } = useToast();

  // Mock wallet data
  const walletBalance = 45750;
  const pendingBalance = 2500;

  const transactions = [
    {
      id: 'TXN-2024-001',
      type: 'fund',
      amount: 25000,
      description: 'Wallet funding via Debit Card',
      date: '2024-01-15T10:30:00Z',
      status: 'completed',
      reference: 'REF-001234567'
    },
    {
      id: 'TXN-2024-002',
      type: 'debit',
      amount: -15000,
      description: 'Premium payment - Lekki Property',
      date: '2024-01-15T11:00:00Z',
      status: 'completed',
      reference: 'POL-2024-001234'
    },
    {
      id: 'TXN-2024-003',
      type: 'fund',
      amount: 50000,
      description: 'Bank transfer funding',
      date: '2024-01-10T14:20:00Z',
      status: 'completed',
      reference: 'REF-001234568'
    },
    {
      id: 'TXN-2024-004',
      type: 'debit',
      amount: -12500,
      description: 'Premium payment - Ikeja Property',
      date: '2024-01-08T09:15:00Z',
      status: 'completed',
      reference: 'POL-2024-001235'
    },
    {
      id: 'TXN-2024-005',
      type: 'fund',
      amount: 2500,
      description: 'USSD funding',
      date: '2024-01-05T16:45:00Z',
      status: 'pending',
      reference: 'REF-001234569'
    }
  ];

  const paymentMethods = [
    {
      id: 'card',
      name: 'Debit/Credit Card',
      icon: CreditCard,
      description: 'Instant funding with your card',
      fee: '1.5% + ₦100'
    },
    {
      id: 'transfer',
      name: 'Bank Transfer',
      icon: Building2,
      description: 'Direct bank transfer',
      fee: 'Free'
    },
    {
      id: 'ussd',
      name: 'USSD',
      icon: Smartphone,
      description: 'Fund via USSD code',
      fee: '₦50'
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'fund':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'debit':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <ArrowDownLeft className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleFundWallet = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount to fund your wallet'
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      addToast({
        type: 'success',
        title: 'Wallet Funded Successfully!',
        message: `₦${parseFloat(fundAmount).toLocaleString()} has been added to your wallet`
      });
      setShowFundModal(false);
      setFundAmount('');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Funding Failed',
        message: 'Please try again or contact support'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadStatement = (period: string) => {
    if (period === 'custom') {
      setShowStatementModal(false);
      setShowDateFilterModal(true);
      return;
    }

    // Simulate statement download
    const element = document.createElement('a');
    const statementData = `
BRICKSURE WALLET STATEMENT
${period}

Account Holder: John Doe
Account Number: WAL-2024-001234
Statement Period: ${period}

TRANSACTION SUMMARY
Opening Balance: ₦25,000.00
Total Credits: ₦77,500.00
Total Debits: ₦27,500.00
Closing Balance: ₦45,750.00

TRANSACTION DETAILS
${transactions.map(t => `
${new Date(t.date).toLocaleDateString()} | ${t.description} | ${t.amount > 0 ? '+' : ''}₦${Math.abs(t.amount).toLocaleString()} | ${t.status.toUpperCase()}
Ref: ${t.reference}
`).join('')}

Generated on: ${new Date().toLocaleDateString()}
This is a computer-generated statement.
    `;
    
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(statementData);
    element.download = `wallet-statement-${period.toLowerCase().replace(' ', '-')}.txt`;
    element.click();
    
    addToast({
      type: 'success',
      title: 'Statement Downloaded',
      message: `Your ${period} statement has been downloaded`
    });
  };

  const downloadCustomStatement = () => {
    if (!dateFrom || !dateTo) {
      addToast({
        type: 'error',
        title: 'Invalid Date Range',
        message: 'Please select both start and end dates'
      });
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      addToast({
        type: 'error',
        title: 'Invalid Date Range',
        message: 'Start date must be before end date'
      });
      return;
    }

    const customPeriod = `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`;
    
    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= new Date(dateFrom) && transactionDate <= new Date(dateTo);
    });

    const statementData = `
BRICKSURE WALLET STATEMENT
${customPeriod}

Account Holder: John Doe
Account Number: WAL-2024-001234
Statement Period: ${customPeriod}

TRANSACTION SUMMARY
${filteredTransactions.map(t => `
${new Date(t.date).toLocaleDateString()} | ${t.description} | ${t.amount > 0 ? '+' : ''}₦${Math.abs(t.amount).toLocaleString()} | ${t.status.toUpperCase()}
Ref: ${t.reference}
`).join('')}

Generated on: ${new Date().toLocaleDateString()}
This is a computer-generated statement.
    `;
    
    const element = document.createElement('a');
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(statementData);
    element.download = `wallet-statement-custom-${dateFrom}-to-${dateTo}.txt`;
    element.click();
    
    addToast({
      type: 'success',
      title: 'Statement Downloaded',
      message: `Your custom statement has been downloaded`
    });
    
    setShowDateFilterModal(false);
    setDateFrom('');
    setDateTo('');
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">
                My Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your wallet balance and transactions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setShowStatementModal(true)}>
                <Download className="h-4 w-4 mr-2" />
                Download Statement
              </Button>
              <Button onClick={() => setShowFundModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Fund Wallet
              </Button>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 transition-transform duration-300 hover:rotate-6">
                  <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₦{walletBalance.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +12.5% from last month
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-700 transition-transform duration-300 hover:rotate-6">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{pendingBalance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Processing transactions
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 transition-transform duration-300 hover:rotate-6">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Funded</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{transactions.filter(t => t.type === 'fund' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lifetime funding
                </p>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 mb-8 animate-fade-in" style={{ animationDelay: '450ms' }}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:scale-105 transition-transform duration-200"
                onClick={() => setShowFundModal(true)}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm">Add Funds</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:scale-105 transition-transform duration-200"
                onClick={() => downloadStatement('Current Month')}
              >
                <Download className="h-6 w-6" />
                <span className="text-sm">Download Statement</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:scale-105 transition-transform duration-200"
              >
                <Eye className="h-6 w-6" />
                <span className="text-sm">View History</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:scale-105 transition-transform duration-200"
              >
                <RefreshCw className="h-6 w-6" />
                <span className="text-sm">Refresh Balance</span>
              </Button>
            </div>
          </Card>

          {/* Transactions */}
          <Card className="animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Transactions</option>
                    <option value="fund">Credits</option>
                    <option value="debit">Debits</option>
                    <option value="refund">Refunds</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString('en-NG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Ref: {transaction.reference}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        transaction.amount > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fund Wallet</h3>
                <button
                  onClick={() => setShowFundModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-6">
                <Input
                  label="Amount (₦)"
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount to fund"
                  min="100"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <method.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{method.fee}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowFundModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleFundWallet}
                    loading={loading}
                  >
                    {loading ? 'Processing...' : 'Fund Wallet'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Download Statement Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Download Statement</h3>
                <button
                  onClick={() => setShowStatementModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Select the period for your wallet statement:
                </p>
                
                <div className="space-y-3">
                  {[
                    'Current Month',
                    'Last Month', 
                    'Last 3 Months',
                    'Last 6 Months',
                    'Current Year',
                    'All Time',
                    'Custom Date Range'
                  ].map((period) => (
                    <Button
                      key={period}
                      variant="outline"
                      className="w-full justify-start hover:scale-105 transition-transform duration-200"
                      onClick={() => {
                        if (period === 'Custom Date Range') {
                          downloadStatement('custom');
                        } else {
                          downloadStatement(period);
                          setShowStatementModal(false);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {period === 'Custom Date Range' ? 'Custom Date Range' : period}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Custom Date Filter Modal */}
      {showDateFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Date Range</h3>
                <button
                  onClick={() => {
                    setShowDateFilterModal(false);
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <Input
                  label="From Date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                
                <Input
                  label="To Date"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom}
                  max={new Date().toISOString().split('T')[0]}
                />
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 Select a date range to generate a custom wallet statement with transactions from that period.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowDateFilterModal(false);
                      setDateFrom('');
                      setDateTo('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={downloadCustomStatement}
                    disabled={!dateFrom || !dateTo}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
}