import {
  AuthResponse,
  AuthUserResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  SignUpRequest,
  VerifyEmailResponse,
  VerifyOtpRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../types";
import { api } from "./api";

// Auth API endpoints
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation<AuthResponse, SignUpRequest>({
      query: (body) => ({
        url: "/api/v1/auth/sign-up",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "/api/v1/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (body) => ({
        url: "/api/v1/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: "/api/v1/auth/verify-email",
        method: "POST",
        body,
      }),
    }),
    resendVerifyEmail: builder.query<VerifyEmailResponse, void>({
      query: () => ({
        url: "/api/v1/auth/resend-email-otp",
        method: "GET",
      }),
    }),
    getUser: builder.query<AuthUserResponse, void>({
      query: () => ({
        url: "/api/v1/auth/user",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSignUpMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useLazyResendVerifyEmailQuery,
  useGetUserQuery,
} = authApi;
