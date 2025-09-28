// Export all API hooks from one place for easy importing
export { 
  useSignUpMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useLazyResendVerifyEmailQuery,
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

// Export auth slice
export { default as authReducer } from './authSlice';
export * from './authSlice';