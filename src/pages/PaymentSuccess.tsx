import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Layout } from "../components/Layout/Layout";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";

export function PaymentSuccess() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/dashboard/wallet");
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

          <Button className="w-full" onClick={handleGoBack}>
            Ok, got it
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
