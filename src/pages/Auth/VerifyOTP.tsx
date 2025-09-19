import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { Layout } from "../../components/Layout/Layout";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
// import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/UI/Toast";
import {
  useLazyResendVerifyEmailQuery,
  useVerifyEmailMutation,
} from "../../services/authService";

export function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [verifyEmail] = useVerifyEmailMutation();
  const [resendVerifyEmail] = useLazyResendVerifyEmailQuery();
  const { pageName } = useParams<{ pageName?: string }>();

  // const { verifyOTP } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    async function handleResendIfLogin() {
      if (pageName === "login") {
        await resendVerifyEmail();
      }
    }
    handleResendIfLogin();
  }, [pageName]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleBackNavigation = () => {
    if (pageName === "login") {
      navigate("/login");
    } else {
      navigate("/register");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      addToast({
        type: "error",
        title: "Invalid OTP",
        message: "Please enter the complete 6-digit code",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmail({ otp: otpCode }).unwrap();
      if (res.message) {
        addToast({
          type: "success",
          title: "Verification Successful!",
          message: "Welcome to BrickSure",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Verification Failed",
        message: error instanceof Error ? error.message : "Invalid OTP code",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      // Simulate resend API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCountdown(60);
      addToast({
        type: "success",
        title: "OTP Resent",
        message: "A new verification code has been sent",
      });
    } catch {
      addToast({
        type: "error",
        title: "Resend Failed",
        message: "Please try again",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="p-8">
            <div className="text-center mb-8">
              <button
                onClick={handleBackNavigation}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {pageName === "login" ? "Login" : "Registration"}
              </button>

              <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Verify Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Enter the 6-digit code sent to your email
                {pageName === "login" && " to complete sign in"}
              </p>

              {/* Demo hint */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                  Use OTP code{" "}
                  <span className="font-mono font-bold">099887</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    maxLength={1}
                  />
                ))}
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Verify & Continue
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Didn't receive the code?
              </p>
              {countdown > 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Resend code in {countdown}s
                </p>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleResend}
                  loading={resendLoading}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Resend Code
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
