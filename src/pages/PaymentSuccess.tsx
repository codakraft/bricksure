import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Layout } from "../components/Layout/Layout";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useToast } from "../components/UI/Toast";
import { useState } from "react";
import { useQuotePaymentMutation } from "../services/quotesService";

export function PaymentSuccess() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [quotePayment] = useQuotePaymentMutation();
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    // if (isAuthenticated) {
    navigate("/dashboard/wallet");
    // } else {
    //   navigate("/login");
    // }
  };

  // const paymentData = JSON.parse(localStorage.getItem("quoteData") || "{}");
  console.log("status", isAuthenticated);
  const savedQuoteId = localStorage.getItem("currentQuoteId");
  console.log("paymentData", savedQuoteId);

  const handleGetQuote = async () => {
    console.log("Payment Data:", savedQuoteId);
    setLoading(true);
    try {
      // const res = await createQuote(paymentData).unwrap();
      // console.log("Create Quote Response:", res);
      const paymentRes = await quotePayment({
        quoteId: savedQuoteId as string,
      }).unwrap();

      console.log("Payment Response:", paymentRes);
      if (paymentRes?.data) {
        addToast({
          type: "success",
          title: "Application Submitted Successfully!",
          message:
            "Your policy application has been submitted and payment processed. You will be notified of the approval status.",
        });
        // Navigate to dashboard with success state
        navigate("/dashboard?success=quote-submitted");
      }

      // await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch {
      addToast({
        type: "error",
        title: "Submission Failed",
        message: "Please try again or contact support",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center animate-fade-in">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your payment has been processed successfully
            </p>
          </div>

          <Button
            className="w-full"
            onClick={savedQuoteId ? handleGetQuote : handleGoBack}
            loading={loading}
          >
            {isAuthenticated
              ? savedQuoteId
                ? "Continue with Quote"
                : "Go to Wallet"
              : "Go to Login"}
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
