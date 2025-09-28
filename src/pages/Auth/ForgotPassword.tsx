import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout/Layout";
import { Card } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { Button } from "../../components/UI/Button";
import { useToast } from "../../components/UI/Toast";
import { useForgotPasswordMutation } from "../../services";

export function ForgotPassword() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      await forgotPassword({ email }).unwrap();

      addToast({
        type: "success",
        title: "Check your email",
        message: "We've sent a verification code to reset your password.",
      });

      navigate("/reset-password", {
        state: { email },
      });
    } catch (err) {
      addToast({
        type: "error",
        title: "Request failed",
        message:
          err instanceof Error
            ? err.message
            : "We couldn't process your request. Please try again.",
      });
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Forgot Password
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Enter the email associated with your BrickSure account and we'll
                send you a verification code.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) {
                    setError(null);
                  }
                }}
                error={error || undefined}
                placeholder="Enter your email"
                required
              />

              <Button type="submit" className="w-full" loading={isLoading}>
                Send Reset Code
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Remembered your password? Sign in
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
