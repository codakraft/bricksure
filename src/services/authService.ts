import { AuthResponse, LoginRequest, SignUpRequest, VerifyOtpRequest } from "../types";
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
    register: builder.mutation<AuthResponse, SignUpRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: "/auth/otp/verify",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSignUpMutation,
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
} = authApi;
