// Export all API hooks from one place for easy importing
export { 
  useSignUpMutation,
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
} from './authService';

export { 
  useGetProfileQuery,
} from './profileService';

export { 
  useGetPropertiesQuery,
  useCreatePropertyMutation,
} from './propertiesService';

export { 
  useCreateQuoteMutation,
} from './quotesService';

export { 
  useGetPoliciesQuery,
} from './policiesService';

export { 
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
} from './walletService';

export { 
  useGetNotificationsQuery,
} from './notificationsService';