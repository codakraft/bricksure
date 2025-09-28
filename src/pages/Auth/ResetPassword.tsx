import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout/Layout";
import { Card } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { Button } from "../../components/UI/Button";
import { useToast } from "../../components/UI/Toast";
import { useResetPasswordMutation } from "../../services";

interface LocationState {
  email?: string;
}

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const initialEmail = useMemo(() => {
    const state = (location.state || {}) as LocationState;
    if (state.email) return state.email;

    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("email") || "";
  }, [location.search, location.state]);

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const getPasswordRuleError = (value: string) => {
    if (!value) {
      return "New password is required";
    }
    if (value.length < 8) {
      return "Password should be at least 8 characters";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must include at least one uppercase letter";
    }
    if (!/\d/.test(value)) {
      return "Password must include at least one number";
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Password must include at least one special character";
    }
    return null;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.otp.trim()) {
      newErrors.otp = "Verification code is required";
    } else if (formData.otp.trim().length < 4) {
      newErrors.otp = "Code must be at least 4 characters";
    }

    const passwordRuleError = getPasswordRuleError(formData.password);
    if (passwordRuleError) {
      newErrors.password = passwordRuleError;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm your new password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    } else {
      const confirmRuleError = getPasswordRuleError(formData.confirmPassword);
      if (confirmRuleError) {
        newErrors.confirmPassword = confirmRuleError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      await resetPassword({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        password: formData.password,
      }).unwrap();

      addToast({
        type: "success",
        title: "Password reset",
        message: "Your password has been updated. Please sign in.",
      });

      navigate("/login", {
        replace: true,
      });
    } catch (err) {
      addToast({
        type: "error",
        title: "Reset failed",
        message:
          err instanceof Error
            ? err.message
            : "We couldn't reset your password. Please verify the details.",
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
                Reset Password
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Enter the verification code sent to your email along with your
                new password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email"
                required
              />

              <Input
                label="Verification Code"
                name="otp"
                type="number"
                value={formData.otp}
                onChange={handleChange}
                error={errors.otp}
                placeholder="Enter the code you received"
                required
              />

              <Input
                label="New Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create a new password"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Password must be at least 8 characters and include one uppercase
                letter, one number, and one special character.
              </p>

              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Re-enter new password"
                required
              />

              <Button type="submit" className="w-full" loading={isLoading}>
                Reset Password
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Didn't receive a code?
              </Link>
              <Link
                to="/login"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to Sign in
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
