import React from 'react';
import { CheckCircle, Clock, FileText, Shield, AlertCircle } from 'lucide-react';
import { Card } from '../../components/UI/Card';

interface ApplicationTrackerProps {
  status: 'pending-review' | 'underwriting' | 'approval' | 'approved';
  applicationId: string;
  submittedDate: string;
  propertyAddress: string;
}

export function ApplicationTracker({ 
  status, 
  applicationId, 
  submittedDate, 
  propertyAddress 
}: ApplicationTrackerProps) {
  const stages = [
    {
      id: 'pending-review',
      title: 'Pending Review',
      description: 'Application submitted and awaiting initial review',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      estimatedTime: '1-2 hours'
    },
    {
      id: 'underwriting',
      title: 'Underwriting Ongoing',
      description: 'Risk assessment and property evaluation in progress',
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50',
      estimatedTime: '2-4 hours'
    },
    {
      id: 'approval',
      title: 'Approval Ongoing',
      description: 'Final approval and certificate generation',
      icon: Shield,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
      estimatedTime: '30 minutes'
    },
    {
      id: 'approved',
      title: 'Approved',
      description: 'Certificate ready for download',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/50',
      estimatedTime: 'Complete'
    }
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.id === status);
  };

  const currentStageIndex = getCurrentStageIndex();
  const currentStage = stages[currentStageIndex];

  const getStageStatus = (index: number) => {
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'current';
    return 'pending';
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending-review':
        return 'Your application is in queue for review. We\'ll notify you once the review begins.';
      case 'underwriting':
        return 'Our underwriters are evaluating your property and assessing risk factors.';
      case 'approval':
        return 'Almost there! Final approval is in progress and your certificate is being prepared.';
      case 'approved':
        return 'Congratulations! Your property is now insured. Download your certificate below.';
      default:
        return 'Processing your application...';
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Application Status
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ID: {applicationId}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {propertyAddress}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Submitted: {new Date(submittedDate).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Current Status Banner */}
      <div className={`p-4 rounded-lg mb-6 ${currentStage.bgColor} border border-opacity-20`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full bg-white dark:bg-gray-800 ${
            status === 'underwriting' ? 'animate-pulse' : ''
          }`}>
            <currentStage.icon className={`h-5 w-5 ${currentStage.color}`} />
          </div>
          <div>
            <h4 className={`font-semibold ${currentStage.color}`}>
              {currentStage.title}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {getStatusMessage()}
            </p>
            {status !== 'approved' && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Estimated time: {currentStage.estimatedTime}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-start justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>
        
        {stages.map((stage, index) => {
          const stageStatus = getStageStatus(index);
          const isCompleted = stageStatus === 'completed';
          const isCurrent = stageStatus === 'current';
          const isPending = stageStatus === 'pending';

          return (
            <div key={stage.id} className="flex flex-col items-center text-center flex-1 relative">
              {/* Step Indicator */}
              <div className="flex flex-col items-center mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                  isCompleted 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : isCurrent 
                    ? `${stage.bgColor} ${stage.color} ring-2 ring-offset-2 ring-current shadow-lg ${
                        stage.id === 'underwriting' ? 'animate-pulse' : ''
                      }`
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <stage.icon className="h-5 w-5" />
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="max-w-xs">
                <h4 className={`font-medium text-sm transition-colors duration-300 mb-2 ${
                  isCompleted 
                    ? 'text-green-600 dark:text-green-400' 
                    : isCurrent 
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {stage.title}
                </h4>
                <p className={`text-xs transition-colors duration-300 mb-2 ${
                  isCurrent 
                    ? 'text-gray-600 dark:text-gray-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {stage.description}
                </p>
                
                {/* Status Badges */}
                {isCompleted && (
                  <span className="inline-block text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">
                    Complete
                  </span>
                )}
                {isCurrent && (
                  <span className="inline-block text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full animate-pulse">
                    In Progress
                  </span>
                )}
                
                {isCurrent && stage.estimatedTime !== 'Complete' && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    ⏱️ Estimated time: {stage.estimatedTime}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p className="font-medium mb-1">What happens next?</p>
            {status === 'approved' ? (
              <p>Your certificate is ready! You can download it from your policies section or we'll email it to you.</p>
            ) : (
              <p>We'll send you real-time notifications as your application progresses. No action needed from your side.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}